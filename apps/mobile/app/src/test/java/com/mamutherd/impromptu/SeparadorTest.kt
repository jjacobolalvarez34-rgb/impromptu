package com.mamutherd.impromptu

import com.mamutherd.impromptu.transcribir.Separador
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * Separador de instrumentos (pedido 35) con las redes reales de D:/.cache/models (si no están,
 * la prueba se salta): en una "canción" con bombo y un acorde, la parte "otros" se queda con el
 * acorde y la batería casi sin él.
 */
class SeparadorTest {
    private val carpeta = File(System.getenv("IMPROMPTU_MODELOS_SPLEETER") ?: "D:/.cache/models")

    /** Energía de una frecuencia (Goertzel) en la señal. */
    private fun energia(x: FloatArray, hz: Double, tasa: Int): Double {
        val w = 2 * PI * hz / tasa
        val c = 2 * cos(w)
        var s1 = 0.0
        var s2 = 0.0
        for (v in x) {
            val s = v + c * s1 - s2
            s2 = s1
            s1 = s
        }
        return sqrt(s1 * s1 + s2 * s2 - c * s1 * s2) / x.size
    }

    @Test
    fun separaElAcordeDeLaBateria() {
        val archivos = Separador.PARTES.map { File(carpeta, "spleeter-$it.fp16.onnx") }
        assumeTrue("Faltan las redes de Spleeter", archivos.all { it.exists() })
        val tasa = Separador.TASA
        val n = tasa * 6
        val x = FloatArray(n) { i ->
            val t = i.toDouble() / tasa
            val b = t % 0.5
            val bombo = if (b < 0.2) sin(2 * PI * (55 + 60 * exp(-b * 30)) * b) * exp(-b * 12) else 0.0
            val acorde = (sin(2 * PI * 220 * t) + sin(2 * PI * 277.2 * t) + sin(2 * PI * 329.6 * t)) * 0.08
            (bombo * 0.8 + acorde).toFloat()
        }
        Separador.desdeArchivos(archivos).use { sep ->
            val bateria = sep.separar(x, "drums")
            val otros = sep.separar(x, "other")
            val acordeEnOtros = energia(otros, 277.2, tasa)
            val acordeEnBateria = energia(bateria, 277.2, tasa)
            println("Acorde: en otros $acordeEnOtros, en batería $acordeEnBateria")
            assertTrue("El acorde debería quedar en 'otros'", acordeEnOtros > acordeEnBateria * 3)
        }
    }
}
