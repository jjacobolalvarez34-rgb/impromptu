package com.mamutherd.impromptu.transcribir

import kotlin.math.abs
import kotlin.math.min

/**
 * Pedido 55: una guitarra acústica grabada con el micrófono del teléfono llega muy bajita y la IA
 * no encuentra notas. Antes de transcribir se sube el volumen hasta que lo más fuerte quede cerca
 * del máximo (sin pasar de 30 veces, para no levantar puro ruido). Se mide el pico ignorando el
 * 0,05 % más alto, así un golpe o un clic suelto no impide subirlo.
 */
object Volumen {
    const val OBJETIVO = 0.9f
    const val GANANCIA_MAXIMA = 30f

    /** Pico "robusto": el valor por debajo del cual queda el 99,95 % de las muestras. */
    fun pico(x: FloatArray): Float {
        if (x.isEmpty()) return 0f
        val paso = maxOf(1, x.size / 200_000)
        val muestra = FloatArray((x.size + paso - 1) / paso) { i -> abs(x[i * paso]) }
        muestra.sort()
        return muestra[min(muestra.size - 1, (muestra.size * 0.9995).toInt())]
    }

    /** Sube el volumen en el mismo arreglo y devuelve la ganancia usada. */
    fun normalizar(x: FloatArray): Float {
        val p = pico(x)
        if (p < 1e-4f || p >= OBJETIVO) return 1f
        val g = min(GANANCIA_MAXIMA, OBJETIVO / p)
        for (i in x.indices) x[i] = (x[i] * g).coerceIn(-1f, 1f)
        return g
    }
}
