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
}
