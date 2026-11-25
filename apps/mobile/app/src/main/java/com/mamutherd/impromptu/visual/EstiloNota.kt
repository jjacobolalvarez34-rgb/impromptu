package com.mamutherd.impromptu.visual

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.sin

/**
 * Estilos de nota con volumen (pedido 64), los mismos que aprobó Jacobo para la web
 * (packages/render/src/estilos-nota.ts), dibujados con el Canvas de Android. El color lo pone el
 * usuario aparte; el estilo solo decide la forma, la luz y el material.
 */
enum class EstiloNota(val clave: String, val texto: String, val delgadez: Float) {
    Vidrio("vidrio", "Vidrio", 1f),
    Bloque("bloque", "Bloques", 1f),
    Gema("gema", "Gemas", 0.6f),
    Oro("oro", "Oro", 1f),
    Diamante("diamante", "Diamantes", 0.6f),
    Luz("luz", "Luz", 1f),
    Claro("claro", "Claro", 0.62f),
    Chispa("chispa", "Chispa", 0.7f),
    Plano("plano", "Plano", 1f);

    companion object {
        fun deClave(c: String?) = entries.firstOrNull { it.clave == c } ?: Vidrio
    }
}

/** Colores listos (los mismos de la web, packages/render/src/paletas.ts). */
data class Paleta(val nombre: String, val derecha: Int, val izquierda: Int)

val PALETAS = listOf(
    Paleta("Ámbar", 0xFFFF9F1C.toInt(), 0xFFE8E4DC.toInt()),
    Paleta("Hielo", 0xFF6E9BEA.toInt(), 0xFFBFD8FF.toInt()),
    Paleta("Neón", 0xFFB15CFF.toInt(), 0xFF2EE6FF.toInt()),
    Paleta("Fuego", 0xFFFF5A36.toInt(), 0xFFFFC247.toInt()),
    Paleta("Menta", 0xFF2FD98F.toInt(), 0xFFB9F5DA.toInt()),
    Paleta("Rosa", 0xFFFF5FA2.toInt(), 0xFFFFD0E6.toInt()),
)

/** Tema claro (captura de Westworld): fondo gris, notas oscuras, teclas en rojo y azul. */
const val FONDO_CLARO = 0xFFC9C9C9.toInt()
const val NOTA_CLARO = 0xFF262626.toInt()
const val DERECHA_CLARO = 0xFFE0241C.toInt()
const val IZQUIERDA_CLARO = 0xFF2434E0.toInt()

fun aclarar(c: Int, k: Float): Int {
    val f = { v: Int -> (v + (255 - v) * k).toInt().coerceIn(0, 255) }
    return Color.argb(Color.alpha(c), f(Color.red(c)), f(Color.green(c)), f(Color.blue(c)))
}

fun oscurecer(c: Int, k: Float): Int {
    val f = { v: Int -> (v * (1 - k)).toInt().coerceIn(0, 255) }
    return Color.argb(Color.alpha(c), f(Color.red(c)), f(Color.green(c)), f(Color.blue(c)))
}

fun conAlfa(c: Int, a: Float): Int = (c and 0x00FFFFFF) or ((a.coerceIn(0f, 1f) * 255).toInt() shl 24)

private fun frac(v: Double) = (v - floor(v)).toFloat()

/** Franjas del oro pulido (luz del entorno): [posición, brillo]. */
private val FRANJAS_ORO = floatArrayOf(
    0f, 0.18f, 0.12f, 0.45f, 0.16f, 0.95f, 0.2f, 1f, 0.24f, 0.72f, 0.38f, 0.5f, 0.42f, 0.1f,
    0.5f, 0.16f, 0.53f, 0.62f, 0.6f, 0.92f, 0.63f, 1f, 0.66f, 0.68f, 0.8f, 0.38f, 0.84f, 0.06f,
    0.92f, 0.55f, 1f, 0.95f,
)

/** Pinta las notas con los estilos nuevos sin crear objetos por nota (salvo el oro, por color). */
class PintorNotas {
    private val relleno = Paint(Paint.ANTI_ALIAS_FLAG)
    private val trazo = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.STROKE }
    private val camino = Path()
    private val r2 = RectF()
    private val oros = HashMap<Long, Shader>()

    /**
     * `r` ya viene con la delgadez del estilo. `t`: segundos; `semilla`: un número por nota;
     * `tope`: línea de golpe; `centro`: mitad del ancho (los bloques muestran su costado hacia ahí).
     */
    fun nota(
        c: Canvas,
        r: RectF,
        color: Int,
        estilo: EstiloNota,
        t: Double,
        semilla: Int,
        tope: Float,
        redondeo: Float,
        escala: Float,
        centro: Float,
    ) {
        val w = r.width()
        val h = r.height()
        if (w < 1f || h < 1f) return
        val m = min(w, h)
        relleno.shader = null
        when (estilo) {
            EstiloNota.Plano -> {
                val rad = min(m / 2, 2f + redondeo * 14f * escala)
                relleno.color = color
                c.drawRoundRect(r, rad, rad, relleno)
            }
            EstiloNota.Vidrio -> {
                val rad = max(2f, min(12f * escala, m * 0.42f))
                halo(c, r, rad, color, 0.3f, 5f * escala)
                relleno.color = conAlfa(color, 0.24f)
                c.drawRoundRect(r, rad, rad, relleno)
                trazo.strokeWidth = 2.2f * escala
                trazo.color = aclarar(color, 0.72f)
                adentro(r, 1.1f * escala)
                c.drawRoundRect(r2, rad, rad, trazo)
                if (w > 8 && h > 8) {
                    trazo.strokeWidth = escala
                    trazo.color = conAlfa(Color.WHITE, 0.4f)
                    adentro(r, 3.5f * escala)
                    c.drawRoundRect(r2, max(1f, rad - 3), max(1f, rad - 3), trazo)
                }
                // Brillo que recorre la pieza al caer.
                val k = frac(t * 0.6 + r.top / (260f * escala) + semilla * 0.37)
                val largo = max(3f, h * 0.28f)
                val y = r.top + 2 + (h - 4 - largo) * k
                relleno.color = conAlfa(Color.WHITE, 0.8f)
                c.drawRect(r.left + w * 0.24f, y, r.left + w * 0.24f + 1.6f * escala, y + largo, relleno)
            }
            EstiloNota.Bloque -> {
                val rad = min(4f * escala, m / 2)
                val dx = ((centro - (r.left + w / 2)) * 0.012f).coerceIn(-4f, 4f) * escala
                relleno.color = oscurecer(color, 0.55f)
                r2.set(r.left + dx, r.top - 3 * escala, r.right + dx, r.bottom - 3 * escala)
                c.drawRoundRect(r2, rad, rad, relleno)
                halo(c, r, rad, color, 0.25f, 4f * escala)
                relleno.color = color
                c.drawRoundRect(r, rad, rad, relleno)
                // Reflejo diagonal a media altura, que se corre mientras baja.
                c.save()
                c.clipRect(r)
                val p = frac(r.top / (tope * 0.9) + semilla * 0.21)
                val bx = r.left - w + p * w * 3
                val cy = r.top + h / 2
                relleno.color = conAlfa(Color.WHITE, 0.45f)
                camino.reset()
                camino.moveTo(bx, cy + w * 0.5f)
                camino.lineTo(bx + w * 0.3f, cy + w * 0.5f)
                camino.lineTo(bx + w * 1.3f, cy - w * 0.5f)
                camino.lineTo(bx + w, cy - w * 0.5f)
                camino.close()
                c.drawPath(camino, relleno)
                c.restore()
                trazo.strokeWidth = escala
                trazo.color = aclarar(color, 0.55f)
                c.drawRoundRect(r, rad, rad, trazo)
            }
            EstiloNota.Gema -> {
                val k = min(3f * escala, m * 0.2f)
                val b = min(4f * escala, m * 0.28f)
                halo(c, r, k, color, 0.3f, 5f * escala)
                octagono(r, k)
                relleno.color = oscurecer(color, 0.15f)
                c.drawPath(camino, relleno)
                cara(c, r.left + k, r.top, r.right - k, r.top, r.right - b, r.top + b, r.left + b, r.top + b, aclarar(color, 0.55f))
                cara(c, r.left, r.top + k, r.left + b, r.top + b, r.left + b, r.bottom - b, r.left, r.bottom - k, aclarar(color, 0.2f))
                cara(c, r.right, r.top + k, r.right, r.bottom - k, r.right - b, r.bottom - b, r.right - b, r.top + b, oscurecer(color, 0.3f))
                cara(c, r.left + k, r.bottom, r.right - k, r.bottom, r.right - b, r.bottom - b, r.left + b, r.bottom - b, oscurecer(color, 0.5f))
                relleno.color = aclarar(color, 0.15f)
                c.drawRect(r.left + b, r.top + b, r.right - b, r.bottom - b, relleno)
                if (h > 8 * escala) {
                    val f = frac(r.top / (180.0 * escala) + semilla * 0.43)
                    val gx = r.left + b + (w - 2 * b) * f
                    val gy = r.top + b + min(4f * escala, (h - 2 * b) * 0.3f)
                    cara(c, gx, gy - 2.5f * escala, gx + 1.5f * escala, gy, gx, gy + 2.5f * escala, gx - 1.5f * escala, gy, Color.WHITE)
                }
            }
            EstiloNota.Oro -> {
                val rad = min(4f * escala, min(w * 0.28f, h / 2))
                halo(c, r, rad, color, 0.18f, 4f * escala)
                // Franjas fijas en la pantalla: al bajar se deslizan por la barra.
                relleno.shader = oro(color, tope)
                c.drawRoundRect(r, rad, rad, relleno)
                relleno.shader = null
                c.save()
                c.clipRect(r)
                relleno.color = conAlfa(Color.BLACK, 0.35f)
                c.drawRect(r.left, r.top, r.left + w * 0.18f, r.bottom, relleno)
                c.drawRect(r.right - w * 0.25f, r.top, r.right, r.bottom, relleno)
                // La punta se enciende al acercarse al teclado.
                val cerca = 1f - ((tope - r.bottom) / (70f * escala)).coerceIn(0f, 1f)
                if (cerca > 0f) {
                    relleno.color = conAlfa(aclarar(color, 0.85f), 0.7f * cerca)
                    c.drawRect(r.left, max(r.top, r.bottom - 30f * escala), r.right, r.bottom, relleno)
                }
                c.restore()
                trazo.strokeWidth = escala
                trazo.color = conAlfa(aclarar(color, 0.7f), 0.6f)
                c.drawRoundRect(r, rad, rad, trazo)
            }
            EstiloNota.Diamante -> {
                val rad = 1.5f * escala
                halo(c, r, rad, color, 0.25f, 4f * escala)
                relleno.color = aclarar(color, 0.35f)
                c.drawRoundRect(r, rad, rad, relleno)
                val mm = m * 0.3f
                val vuelta = floor(frac(r.top / (140.0 * escala) + semilla * 0.29) * 4).toInt()
                val tonos = intArrayOf(conAlfa(Color.WHITE, 0.55f), conAlfa(0x28374F, 0.18f), conAlfa(0x28374F, 0.32f), conAlfa(Color.WHITE, 0.2f))
                val tono = { i: Int -> tonos[(i + vuelta) % 4] }
                cara(c, r.left, r.top, r.right, r.top, r.right - mm, r.top + mm, r.left + mm, r.top + mm, tono(0))
                cara(c, r.right, r.top, r.right, r.bottom, r.right - mm, r.bottom - mm, r.right - mm, r.top + mm, tono(1))
                cara(c, r.right, r.bottom, r.left, r.bottom, r.left + mm, r.bottom - mm, r.right - mm, r.bottom - mm, tono(2))
                cara(c, r.left, r.bottom, r.left, r.top, r.left + mm, r.top + mm, r.left + mm, r.bottom - mm, tono(3))
                // Titileo.
                val brillo = max(0.0, sin(t * 3 + semilla * 1.7)).pow(10.0).toFloat()
                if (brillo > 0.02f) {
                    val l = (5f + 7f * brillo) * escala
                    val cx = r.centerX()
                    val cy = r.top + h * 0.35f
                    trazo.strokeWidth = 1.2f * escala
                    trazo.color = conAlfa(Color.WHITE, brillo)
                    c.drawLine(cx - l, cy, cx + l, cy, trazo)
                    c.drawLine(cx, cy - l, cx, cy + l, trazo)
                }
            }
            EstiloNota.Luz -> {
                val rad = max(2f, min(12f * escala, m * 0.45f))
                val lat = (sin(t * 4 + semilla) * 0.8 * escala).toFloat()
                halo(c, r, rad, color, 0.4f, 9f * escala)
                r2.set(r.left - lat, r.top - lat, r.right + lat, r.bottom + lat)
                relleno.color = conAlfa(color, 0.8f)
                c.drawRoundRect(r2, rad, rad, relleno)
                if (w > 5 && h > 5) {
                    adentro(r, 2.5f * escala)
                    relleno.color = conAlfa(aclarar(color, 0.82f), 0.9f)
                    c.drawRoundRect(r2, max(1f, rad - 2), max(1f, rad - 2), relleno)
                }
            }
            EstiloNota.Claro -> {
                val rad = max(1f, min(8f * escala, m * 0.22f))
                relleno.color = conAlfa(NOTA_CLARO, 0.12f)
                r2.set(r.left, r.top - 5 * escala, r.right, r.bottom)
                c.drawRoundRect(r2, rad, rad, relleno)
                relleno.color = conAlfa(NOTA_CLARO, 0.18f)
                r2.set(r.left, r.top - 2 * escala, r.right, r.bottom)
                c.drawRoundRect(r2, rad, rad, relleno)
                relleno.color = conAlfa(NOTA_CLARO, 0.88f)
                c.drawRoundRect(r, rad, rad, relleno)
            }
            EstiloNota.Chispa -> {
                val rad = max(1f, min(10f * escala, m * 0.32f))
                halo(c, r, rad, color, 0.35f, 6f * escala)
                relleno.color = conAlfa(color, 0.9f)
                c.drawRoundRect(r, rad, rad, relleno)
                if (w > 4 && h > 4) {
                    relleno.color = conAlfa(aclarar(color, 0.75f), 0.55f)
                    r2.set(r.left + w * 0.3f, r.top + rad * 0.6f, r.right - w * 0.3f, r.bottom - rad * 0.6f)
                    c.drawRoundRect(r2, rad * 0.5f, rad * 0.5f, relleno)
                }
            }
        }
    }

    /** Halo sencillo: dos capas más grandes y transparentes. */
    private fun halo(c: Canvas, r: RectF, rad: Float, color: Int, alfa: Float, pad: Float) {
        capaHalo(c, r, rad, color, alfa * 0.35f, pad)
        capaHalo(c, r, rad, color, alfa * 0.6f, pad * 0.5f)
    }

    private fun capaHalo(c: Canvas, r: RectF, rad: Float, color: Int, a: Float, p: Float) {
        r2.set(r.left - p, r.top - p, r.right + p, r.bottom + p)
        relleno.color = conAlfa(color, a)
        c.drawRoundRect(r2, rad + p, rad + p, relleno)
    }

    private fun adentro(r: RectF, d: Float) = r2.set(r.left + d, r.top + d, r.right - d, r.bottom - d)

    private fun octagono(r: RectF, k: Float) {
        camino.reset()
        camino.moveTo(r.left + k, r.top)
        camino.lineTo(r.right - k, r.top)
        camino.lineTo(r.right, r.top + k)
        camino.lineTo(r.right, r.bottom - k)
        camino.lineTo(r.right - k, r.bottom)
        camino.lineTo(r.left + k, r.bottom)
        camino.lineTo(r.left, r.bottom - k)
        camino.lineTo(r.left, r.top + k)
        camino.close()
    }

    private fun cara(c: Canvas, x0: Float, y0: Float, x1: Float, y1: Float, x2: Float, y2: Float, x3: Float, y3: Float, color: Int) {
        camino.reset()
        camino.moveTo(x0, y0)
        camino.lineTo(x1, y1)
        camino.lineTo(x2, y2)
        camino.lineTo(x3, y3)
        camino.close()
        relleno.color = color
        c.drawPath(camino, relleno)
    }

    /** Degradado de franjas del oro para un color y una altura (se hace una vez y se guarda). */
    private fun oro(color: Int, tope: Float): Shader {
        val clave = (color.toLong() shl 32) or tope.toInt().toLong()
        return oros.getOrPut(clave) {
            val n = FRANJAS_ORO.size / 2
            val pos = FloatArray(n) { FRANJAS_ORO[it * 2] }
            val cols = IntArray(n) {
                val v = FRANJAS_ORO[it * 2 + 1]
                val base = oscurecer(color, 1 - v)
                if (v > 0.85f) aclarar(color, (v - 0.85f) / 0.15f * 0.75f) else base
            }
            LinearGradient(0f, -tope * 0.15f, 0f, tope * 0.75f, cols, pos, Shader.TileMode.MIRROR)
        }
    }
}
