package com.mamutherd.impromptu.visual

import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Shader
import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.datos.Pedal
import com.mamutherd.impromptu.datos.TipoPedal
import com.mamutherd.impromptu.datos.esNegra
import com.mamutherd.impromptu.instrumentos.Bateria
import com.mamutherd.impromptu.instrumentos.Instrumento

/**
 * Visualizador de notas cayendo, tema "Ámbar" (DESIGN §2): mano derecha ámbar, izquierda
 * chasis, fondo #111110. Dibuja sobre un Canvas de Android: el mismo código sirve para la
 * pantalla (Compose) y para exportar el video (superficie del codificador).
 */
class Renderizador {
    private val fondo = Paint().apply { color = 0xFF111110.toInt() }
    private val derecha = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFFF9F1C.toInt() }
    private val izquierda = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFE8E4DC.toInt() }
    private val blanca = Paint().apply { color = 0xFFE8E4DC.toInt() }
    private val negra = Paint().apply { color = 0xFF1C1C1A.toInt() }
    private val borde = Paint().apply { color = 0xFF9A968C.toInt() }
    private val linea = Paint().apply { color = 0xFF2A2A27.toInt() }
    private val ambar = Paint().apply { color = 0xFFFF9F1C.toInt() }
    private val ambarSuave = Paint().apply { color = 0x66FF9F1C }
    private val izqSuave = Paint().apply { color = 0x66E8E4DC }
    private val texto = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFFA39F95.toInt() }
    private val rect = RectF()
    private var brillo: Paint? = null
    private var brilloAlto = 0f

    /** Teclas visibles y su posición, recalculadas solo si cambia el tamaño o el rango. */
    private var cacheAncho = -1f
    private var cacheRango = IntRange.EMPTY
    private val x0 = FloatArray(128)
    private val x1 = FloatArray(128)

    private fun geometria(ancho: Float, rango: IntRange) {
        if (ancho == cacheAncho && rango == cacheRango) return
        cacheAncho = ancho
        cacheRango = rango
        val blancas = rango.count { !esNegra(it) }
        val w = ancho / blancas
        var i = 0
        for (t in rango) {
            if (!esNegra(t)) {
                x0[t] = i * w
                x1[t] = (i + 1) * w
                i++
            }
        }
        for (t in rango) {
            if (esNegra(t)) {
                val centro = x0[t + 1].takeIf { t + 1 in rango } ?: (i * w)
                x0[t] = centro - w * 0.31f
                x1[t] = centro + w * 0.31f
            }
        }
    }

    class Opciones(
        /** Segundos de notas que se ven sobre el teclado. */
        val ventana: Double = 3.0,
        /** En la grabación las notas suben (salen del teclado) en vez de caer. */
        val subiendo: Boolean = false,
        /** Pedal grande y visible (ADR-017). */
        val pedalGrande: Boolean = true,
        /** Guitarra, bajo o batería (fase 9): mástil o parches en vez del teclado. */
        val instrumento: Instrumento = Instrumento.Piano,
    )

    /**
     * `notas` ordenadas por inicio (una nota con fin < 0 sigue apretada). `abajo`: teclas
     * apretadas en vivo, o null para calcularlas de las notas.
     */
    fun dibujar(
        c: Canvas,
        ancho: Float,
        alto: Float,
        notas: List<Nota>,
        pedales: List<Pedal>,
        t: Double,
        rango: IntRange,
        abajo: BooleanArray? = null,
        sustainVivo: Boolean? = null,
        op: Opciones = Opciones(),
    ) {
        if (op.instrumento != Instrumento.Piano) {
            dibujarCarriles(c, ancho, alto, notas, t, op)
            return
        }
        geometria(ancho, rango)
        val altoTeclado = (alto * 0.18f).coerceIn(48f, ancho * 0.12f)
        val tope = alto - altoTeclado
        val pps = tope / op.ventana.toFloat() // píxeles por segundo
        c.drawRect(0f, 0f, ancho, alto, fondo)

        // Líneas de Do como guía.
        for (k in rango) if (k % 12 == 0) c.drawRect(x0[k], 0f, x0[k] + 1f, tope, linea)

        // Teclas encendidas por las notas que suenan ahora.
        val encendida = IntArray(128) // 0 no, 1 der, 2 izq
        val radio = (x1[rango.first] - x0[rango.first]) * 0.18f

        val desde = if (op.subiendo) t - op.ventana else t - 0.5
        val hasta = if (op.subiendo) t else t + op.ventana
        // Las notas están ordenadas por inicio: se busca la primera que podría verse.
        val primera = primeraVisible(notas, desde - 30)
        for (i in primera until notas.size) {
            val n = notas[i]
            if (n.inicio > hasta) break
            val fin = if (n.fin < 0) t else n.fin
            if (fin < desde || n.tecla !in rango) continue
            val der = (n.mano ?: if (n.tecla >= 60) "R" else "L") == "R"
            val p = if (der) derecha else izquierda
            val y0: Float
            val y1: Float
            if (op.subiendo) {
                y0 = tope - ((t - n.inicio) * pps).toFloat()
                y1 = tope - ((t - fin) * pps).toFloat()
                rect.set(x0[n.tecla] + 1.5f, minOf(y0, y1) , x1[n.tecla] - 1.5f, maxOf(y0, y1).coerceAtMost(tope))
            } else {
                y1 = tope - ((n.inicio - t) * pps).toFloat()
                y0 = tope - ((fin - t) * pps).toFloat()
                rect.set(x0[n.tecla] + 1.5f, y0, x1[n.tecla] - 1.5f, minOf(y1, tope))
            }
            if (rect.height() > 0.5f) c.drawRoundRect(rect, radio, radio, p)
            if (n.inicio <= t && fin > t) encendida[n.tecla] = if (der) 1 else 2
        }

        // Brillo sobre el teclado.
        if (brillo == null || brilloAlto != tope) {
            brilloAlto = tope
            brillo = Paint().apply {
                shader = LinearGradient(0f, tope - 24f, 0f, tope, 0x00FF9F1C, 0x55FF9F1C, Shader.TileMode.CLAMP)
            }
        }

        // Teclado.
        val yN = tope + altoTeclado * 0.62f
        c.drawRect(0f, tope, ancho, alto, negra)
        c.drawRect(0f, tope, ancho, tope + 3f, ambar)
        for (k in rango) {
            if (esNegra(k)) continue
            val on = abajo?.get(k) == true || encendida[k] != 0
            val p = when {
                !on -> blanca
                encendida[k] == 2 && abajo?.get(k) != true -> izquierda
                else -> derecha
            }
            c.drawRect(x0[k] + 1f, tope + 3f, x1[k] - 1f, alto, if (on) p else blanca)
            if (on) c.drawRect(x0[k], tope - 24f, x1[k], tope, brillo!!)
        }
        for (k in rango) {
            if (!esNegra(k)) continue
            val on = abajo?.get(k) == true || encendida[k] != 0
            c.drawRect(x0[k], tope + 3f, x1[k], yN, if (!on) negra else if (encendida[k] == 2) izquierda else ambar)
            if (!on) c.drawRect(x0[k] + 2f, yN - 5f, x1[k] - 2f, yN - 2f, borde.also { it.alpha = 90 })
        }

        // Pedal de sustain: una barra ámbar sobre el teclado mientras está pisado.
        val pisado = sustainVivo ?: pedalAbajo(pedales, t)
        if (pisado) {
            val grosor = if (op.pedalGrande) 6f else 3f
            c.drawRect(0f, tope - grosor, ancho, tope, ambar)
            if (op.pedalGrande) {
                texto.textSize = (altoTeclado * 0.18f).coerceIn(10f, 22f)
                c.drawText("PEDAL", 12f, tope - grosor - 8f, texto.also { it.color = 0xFFFF9F1C.toInt() })
            }
        } else {
            c.drawRect(0f, tope - 1f, ancho, tope, ambarSuave)
        }
    }

    private fun primeraVisible(notas: List<Nota>, desde: Double): Int {
        var lo = 0
        var hi = notas.size
        while (lo < hi) {
            val m = (lo + hi) ushr 1
            if (notas[m].inicio < desde) lo = m + 1 else hi = m
        }
        return lo
    }

    private fun pedalAbajo(pedales: List<Pedal>, t: Double): Boolean {
        var abajo = false
        for (p in pedales) {
            if (p.tiempo > t) break
            if (p.tipo == TipoPedal.Sustain) abajo = p.abajo
        }
        return abajo
    }

    // ---- Guitarra, bajo y batería (fase 9), como packages/render/src/instrumentos.ts ----

    private val pinta = Paint(Paint.ANTI_ALIAS_FLAG)
    private val textoCarril = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER }
    private var notasTrastes: List<Nota>? = null
    private var maxTraste = 12

    private val colorCuerda = longArrayOf(0xFFFF9F1C, 0xFFFFD27A, 0xFFE8E4DC, 0xFF7FD1B9, 0xFF6FA8FF, 0xFFC58BFF)

    private fun dibujarCarriles(c: Canvas, ancho: Float, alto: Float, notas: List<Nota>, t: Double, op: Opciones) {
        val altoBase = (alto * 0.2f).coerceIn(56f, ancho * 0.16f)
        val tope = alto - altoBase
        val pps = tope / op.ventana.toFloat()
        c.drawRect(0f, 0f, ancho, alto, fondo)
        val bateria = op.instrumento == Instrumento.Bateria
        val cuerdas = if (op.instrumento == Instrumento.Bajo) 4 else 6
        if (!bateria && notasTrastes !== notas) {
            notasTrastes = notas
            maxTraste = notas.maxOfOrNull { it.traste ?: 0 } ?: 0
        }
        val columnas = if (bateria) Bateria.PIEZAS.size else minOf(22, maxOf(12, maxTraste + 2)) + 1
        val col = ancho / columnas
        val sub = col / cuerdas
        val activas = HashMap<Int, Long>() // carril o traste*cuerdas+cuerda → color
        val desde = if (op.subiendo) t - op.ventana else t - 0.5
        val hasta = if (op.subiendo) t else t + op.ventana
        for (k in 0..columnas) c.drawRect(k * col, 0f, k * col + 1f, tope, linea)
        for (n in notas) {
            if (n.inicio > hasta) break
            val fin0 = if (n.fin < 0) t else n.fin
            val fin = if (bateria) maxOf(fin0, n.inicio + 0.12) else fin0
            if (fin < desde) continue
            val x: Float
            val w: Float
            val color: Long
            val etiqueta: String
            val clave: Int
            if (bateria) {
                val carril = Bateria.carril(n.tecla)
                if (carril < 0) continue
                x = carril * col + col * 0.12f
                w = col * 0.76f
                color = Bateria.PIEZAS[carril].color
                etiqueta = Bateria.PIEZAS[carril].nombre.take(1)
                clave = carril
            } else {
                val cuerda = n.cuerda ?: continue
                val traste = n.traste ?: continue
                if (traste >= columnas) continue
                x = traste * col + (cuerdas - cuerda) * sub + 1f
                w = maxOf(2f, sub - 2f)
                color = colorCuerda[(cuerda - 1) % 6]
                etiqueta = traste.toString()
                clave = traste * cuerdas + (cuerda - 1)
            }
            val yInicio = if (op.subiendo) tope - ((t - n.inicio) * pps).toFloat() else tope - ((n.inicio - t) * pps).toFloat()
            val yFin = if (op.subiendo) tope - ((t - fin) * pps).toFloat() else tope - ((fin - t) * pps).toFloat()
            rect.set(x, minOf(yInicio, yFin), x + w, maxOf(yInicio, yFin).coerceAtMost(tope))
            if (rect.height() > 0.5f) {
                pinta.color = color.toInt()
                c.drawRoundRect(rect, minOf(w, 8f) * 0.4f, minOf(w, 8f) * 0.4f, pinta)
                if (w >= 14f && rect.height() >= 14f) {
                    textoCarril.textSize = minOf(w * 0.7f, 22f)
                    textoCarril.color = 0xFF1C1C1A.toInt()
                    c.drawText(etiqueta, rect.centerX(), rect.bottom - 4f, textoCarril)
                }
            }
            if (n.inicio <= t && fin > t) activas[clave] = color
        }
        // Base: mástil o parches.
        c.drawRect(0f, tope, ancho, alto, negra)
        if (bateria) {
            for ((i, p) in Bateria.PIEZAS.withIndex()) {
                val cx = (i + 0.5f) * col
                val cy = tope + altoBase * 0.5f
                val r = minOf(col * 0.42f, altoBase * 0.4f) * (if (i in activas) 1.08f else 1f)
                pinta.color = if (i in activas) p.color.toInt() else 0xFF2E2E2B.toInt()
                pinta.style = Paint.Style.FILL
                c.drawOval(cx - r, cy - r * 0.8f, cx + r, cy + r * 0.8f, pinta)
                pinta.color = p.color.toInt()
                pinta.style = Paint.Style.STROKE
                pinta.strokeWidth = maxOf(2f, altoBase * 0.03f)
                c.drawOval(cx - r, cy - r * 0.8f, cx + r, cy + r * 0.8f, pinta)
                pinta.style = Paint.Style.FILL
                textoCarril.textSize = minOf(col * 0.13f, altoBase * 0.14f).coerceAtLeast(9f)
                textoCarril.color = (if (i in activas) 0xFF1C1C1A else 0xFFE8E4DC).toInt()
                c.drawText(p.nombre, cx, cy + textoCarril.textSize * 0.35f, textoCarril)
            }
        } else {
            pinta.color = 0xFF2B2017.toInt()
            c.drawRect(0f, tope, ancho, alto, pinta)
            pinta.color = 0xFF5A4A3A.toInt()
            for (f in intArrayOf(3, 5, 7, 9, 12, 15, 17, 19, 21)) {
                if (f >= columnas) continue
                val x = (f + 0.5f) * col
                val r = minOf(col, altoBase) * 0.07f
                if (f == 12) {
                    c.drawCircle(x, tope + altoBase * 0.3f, r, pinta)
                    c.drawCircle(x, tope + altoBase * 0.7f, r, pinta)
                } else c.drawCircle(x, tope + altoBase * 0.5f, r, pinta)
            }
            for (f in 1 until columnas) {
                val g = if (f == 1) maxOf(4f, col * 0.08f) else maxOf(2f, col * 0.04f)
                pinta.color = (if (f == 1) 0xFFE8E4DC else 0xFF9A968C).toInt()
                c.drawRect(f * col - g / 2, tope, f * col + g / 2, alto, pinta)
            }
            fun fila(cuerda: Int) = tope + altoBase * (cuerda - 0.5f) / cuerdas
            pinta.color = 0xFFD8D4CC.toInt()
            for (s in 1..cuerdas) {
                val g = maxOf(1f, (0.6f + s * 0.35f) * (altoBase / 160f))
                c.drawRect(0f, fila(s) - g / 2, ancho, fila(s) + g / 2, pinta)
            }
            for ((clave, color) in activas) {
                val traste = clave / cuerdas
                val cuerda = clave % cuerdas + 1
                pinta.color = color.toInt()
                c.drawCircle((traste + 0.5f) * col, fila(cuerda), minOf(col * 0.38f, altoBase / cuerdas * 0.42f), pinta)
            }
        }
        c.drawRect(0f, tope, ancho, tope + 3f, ambar)
    }
}
