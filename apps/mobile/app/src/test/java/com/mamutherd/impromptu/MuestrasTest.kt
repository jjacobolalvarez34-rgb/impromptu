package com.mamutherd.impromptu

import com.mamutherd.impromptu.audio.Muestras
import com.mamutherd.impromptu.audio.Sintes
import com.mamutherd.impromptu.instrumentos.Instrumento
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import kotlin.math.pow

/** Mismas reglas que packages/audio/src/muestras.test.ts, con los manifiestos reales. */
class MuestrasTest {
    private val zonas = listOf(
        Muestras.Zona(40, 82, "E2-suave.flac"),
        Muestras.Zona(40, 127, "E2-fuerte.flac"),
        Muestras.Zona(43, 127, "G2.flac"),
    )

    @Test
    fun cadaInstrumentoUsaSuBanco() {
        assertEquals("bateria", Muestras.bancoDe(Instrumento.Bateria, Sintes.Timbre.Nylon))
        assertEquals("bajo", Muestras.bancoDe(Instrumento.Bajo, Sintes.Timbre.Nylon))
        assertEquals("electrica", Muestras.bancoDe(Instrumento.Guitarra, Sintes.Timbre.Electrica))
        assertNull(Muestras.bancoDe(Instrumento.Piano, Sintes.Timbre.Acero))
    }

    @Test
    fun laCuerdaUsaLaNotaMasCercanaYSuCapa() {
        val (exacta, r1) = Muestras.zonaCuerda(zonas, 43, 100)!!
        assertEquals("G2.flac", exacta.archivo)
        assertEquals(1.0, r1, 1e-9)
        val (arriba, r2) = Muestras.zonaCuerda(zonas, 41, 100)!!
        assertEquals(40, arriba.nota)
        assertEquals(2.0.pow(1 / 12.0), r2, 1e-9)
        assertEquals(43, Muestras.zonaCuerda(zonas, 42, 100)!!.first.nota)
        assertEquals("E2-suave.flac", Muestras.zonaCuerda(zonas, 40, 82)!!.first.archivo)
        assertEquals("E2-fuerte.flac", Muestras.zonaCuerda(zonas, 40, 83)!!.first.archivo)
    }

    @Test
    fun losManifiestosRealesSeLeenYTienenSusArchivos() {
        val raiz = File("../../web/public/instrumentos")
        for (b in listOf("nylon", "acero", "electrica", "bajo", "bateria")) {
            val m = Muestras.Manifiesto.leer(File(raiz, "$b/manifiesto.json").readText())
            assertTrue("$b sin archivos", m.archivos.isNotEmpty())
            for (a in m.archivos) assertTrue("$b/$a no existe", File(raiz, "$b/$a").exists())
        }
        val bateria = Muestras.Manifiesto.leer(File(raiz, "bateria/manifiesto.json").readText())
        // La caja: golpes seguidos turnan variaciones; suave y fuerte son grabaciones distintas.
        val a = Muestras.golpe(bateria.piezas, 38, 100, 0)
        val b = Muestras.golpe(bateria.piezas, 38, 100, 1)
        assertTrue(a != null && b != null && a != b)
        assertTrue(Muestras.golpe(bateria.piezas, 38, 30, 0) != Muestras.golpe(bateria.piezas, 38, 127, 0))
    }
}
