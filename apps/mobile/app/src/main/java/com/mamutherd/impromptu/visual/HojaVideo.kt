package com.mamutherd.impromptu.visual

import android.graphics.Bitmap
import android.graphics.BlurMaskFilter
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

/**
 * Video de la partitura en el celular (fase 10, como `packages/export/src/partitura.ts`): la
 * hoja ocupa casi todo el ancho y se desplaza con suavidad para que el renglón que suena quede
 * a un tercio; la línea ámbar avanza al compás. La hoja y la posición de la línea en cada
 * cuadro las prepara la página de la partitura (OpenSheetMusicDisplay).
 *
 * Se dibuja cuadro por cuadro en orden (el desplazamiento suave guarda estado).
 */
class HojaVideo(
    /** La hoja dibujada (px de la imagen). */
    private val hoja: Bitmap,
    /** Por cuadro: x, y, alto de la línea en px de la imagen; negativos = todavía no empieza. */
    private val cursor: FloatArray,
    private val fps: Int,
) {
    private val fuente = Rect(0, 0, hoja.width, hoja.height)
    private val destino = RectF()
    private val pintura = Paint(Paint.FILTER_BITMAP_FLAG or Paint.ANTI_ALIAS_FLAG)
    private val fondo = Paint().apply { color = FONDO }
    private val papel = Paint().apply { color = PAPEL }
    private val ambar = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = AMBAR }
    private val brillo = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = AMBAR_SUAVE }
    private var desplazado = 0f
    private var primero = true

    fun dibujar(c: Canvas, ancho: Float, alto: Float, t: Double) {
        val margen = (ancho * 0.03f).toInt().toFloat()
        val escala = (ancho - margen * 2) / hoja.width
        val altoEscalado = hoja.height * escala
        val suavizado = 1 - 0.85.pow(30.0 / fps).toFloat()
        val i = min(cursor.size / 3 - 1, max(0, Math.round(t * fps).toInt()))
        val cx = cursor[i * 3]
        val cy = cursor[i * 3 + 1]
        val ca = cursor[i * 3 + 2]
        val hay = cx >= 0 && cy >= 0
        if (hay) {
            val objetivo = min(max(0f, cy * escala - alto * 0.3f), max(0f, altoEscalado - alto + margen))
            desplazado = if (primero) objetivo else desplazado + (objetivo - desplazado) * suavizado
            primero = false
        }
        c.drawRect(0f, 0f, ancho, alto, fondo)
        c.drawRect(margen / 2, margen / 2 - desplazado, ancho - margen / 2, margen / 2 - desplazado + altoEscalado + margen, papel)
        destino.set(margen, margen - desplazado, margen + hoja.width * escala, margen - desplazado + altoEscalado)
        c.drawBitmap(hoja, fuente, destino, pintura)
        if (hay) {
            val k = ancho / 1920f
            val x = margen + cx * escala
            val y = margen + cy * escala - desplazado
            val grosor = max(3f, 4 * k)
            brillo.maskFilter = BlurMaskFilter(max(1f, 14 * k), BlurMaskFilter.Blur.NORMAL)
            c.drawRect(x - 2 * k - 3 * k, y, x - 2 * k + grosor + 3 * k, y + ca * escala, brillo)
            c.drawRect(x - 2 * k, y, x - 2 * k + grosor, y + ca * escala, ambar)
        }
    }

    fun soltar() = hoja.recycle()

    companion object {
        private const val PAPEL = 0xFFF7F3EA.toInt()
        private const val FONDO = 0xFF1C1C1A.toInt()
        private const val AMBAR = 0xFFFF9F1C.toInt()
        private const val AMBAR_SUAVE = 0xB3FF9F1C.toInt()
    }
}
