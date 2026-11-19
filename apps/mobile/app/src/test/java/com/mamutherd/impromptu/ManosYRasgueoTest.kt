package com.mamutherd.impromptu

import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.instrumentos.Manos
import com.mamutherd.impromptu.visual.Rasgueo
import org.junit.Assert.assertEquals
import org.junit.Test

/** Mismos casos que packages/practice (manos) y packages/render (rasgueo). */
class ManosYRasgueoTest {
    private fun nota(tecla: Int, inicio: Double, largo: Double = 0.4) = Nota(tecla, inicio, inicio + largo, 80)

    @Test
    fun registroBasico() {
        val out = Manos.separar(listOf(nota(40, 0.0), nota(47, 0.0), nota(64, 0.0), nota(67, 0.0), nota(72, 0.0)))
        assertEquals(listOf("L", "L", "R", "R", "R"), out.map { it.mano })
    }

    @Test
    fun unaManoQueSostieneNoAlcanzaUnaNotaLejana() {
        val out = Manos.separar(listOf(nota(72, 0.0, 2.0), nota(76, 0.0, 2.0), nota(48, 0.0, 2.0), nota(61, 0.5)))
        assertEquals("L", out.last().mano)
    }

    @Test
    fun unaEscalaQueBajaSigueEnUnaMano() {
        val escala = listOf(72, 71, 69, 67, 65, 64, 62, 60, 59, 57, 55).mapIndexed { i, p -> nota(p, i * 0.25, 0.25) }
        assertEquals(1, Manos.separar(escala).map { it.mano }.toSet().size)
    }

    @Test
    fun rasgueoAbajoYArriba() {
        val abajo = (6 downTo 1).mapIndexed { i, c -> Nota(40 + (6 - c) * 5, 1 + i * 0.008, 1.4, 90, cuerda = c, traste = 0) }
        val arriba = (1..4).mapIndexed { i, c -> Nota(40 + (6 - c) * 5, 2 + i * 0.01, 2.4, 90, cuerda = c, traste = 0) }
        assertEquals(listOf(true, false), Rasgueo.detectar(abajo + arriba).map { it.abajo })
    }
}
