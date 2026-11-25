package com.mamutherd.impromptu

import com.mamutherd.impromptu.transcribir.Volumen
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.sin

/** Pedido 55: la guitarra bajita del micrófono sube de volumen antes de la IA. */
class VolumenTest {
    private fun tono(amplitud: Float, n: Int = 22_050) =
        FloatArray(n) { i -> amplitud * sin(2 * PI * 196.0 * i / 22_050).toFloat() }

    @Test
    fun subeUnaGrabacionBajita() {
        val x = tono(0.05f)
        val g = Volumen.normalizar(x)
        assertEquals(18f, g, 0.5f)
        assertTrue(x.maxOf { abs(it) } in 0.85f..0.95f)
    }

    @Test
    fun noTocaLoQueYaSuenaFuerte() {
        val x = tono(0.95f)
        assertEquals(1f, Volumen.normalizar(x), 0f)
    }

    @Test
    fun noSubeMasDeTreintaVecesNiElSilencio() {
        assertEquals(30f, Volumen.normalizar(tono(0.001f)), 0f)
        assertEquals(1f, Volumen.normalizar(FloatArray(1000)), 0f)
    }

    @Test
    fun unClicSueltoNoImpideSubirlo() {
        val x = tono(0.05f, 44_100)
        x[100] = 1f
        assertTrue(Volumen.normalizar(x) > 10f)
    }
}
