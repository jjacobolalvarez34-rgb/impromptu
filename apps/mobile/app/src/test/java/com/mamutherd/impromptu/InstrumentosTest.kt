package com.mamutherd.impromptu

import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import com.mamutherd.impromptu.audio.Sintes
import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.instrumentos.Bateria
import com.mamutherd.impromptu.instrumentos.Guitarra
import com.mamutherd.impromptu.transcribir.BasicPitch
import com.mamutherd.impromptu.transcribir.DetectorBateria
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.sin
import kotlin.random.Random

class InstrumentosTest {
    @Test
    fun miMayorAbiertoEnSuFormaDeSiempre() {
        val acorde = listOf(40, 47, 52, 56, 59, 64).map { Nota(it, 0.0, 0.5, 90) }
        val r = Guitarra.asignar(acorde)
        assertEquals(listOf(6 to 0, 5 to 2, 4 to 2, 3 to 1, 2 to 0, 1 to 0), r.map { it.cuerda to it.traste })
    }

    @Test
    fun laMelodiaSeQuedaEnUnaPosicion() {
        val melodia = listOf(67, 69, 71, 72, 74).mapIndexed { i, p -> Nota(p, i * 0.5, i * 0.5 + 0.4, 90) }
        val trastes = Guitarra.asignar(melodia).map { it.traste!! }.filter { it > 0 }
        assertTrue("trastes $trastes", trastes.max() - trastes.min() <= 4)
    }

    @Test
    fun carrilesDeLaBateria() {
        assertEquals("bombo", Bateria.PIEZAS[Bateria.carril(36)].id)
        assertEquals("hihat", Bateria.PIEZAS[Bateria.carril(46)].id)
        assertEquals(-1, Bateria.carril(60))
    }

    @Test
    fun detectaBomboCajaYHiHat() {
        val tasa = 44_100
        val x = FloatArray(4 * tasa)
        val azar = Random(7)
        fun golpe(t: Double, tipo: Int) {
            val i0 = (t * tasa).toInt()
            var fase = 0.0
            var prev = 0f
            for (i in 0 until (0.5 * tasa).toInt()) {
                if (i0 + i >= x.size) break
                val s = when (tipo) {
                    // Bombo: tono que baja de 160 a 48 Hz.
                    36 -> { fase += 2 * PI * (48 + 112 * exp(-i / (0.03 * tasa))) / tasa; sin(fase) * exp(-i / (0.22 * tasa)) }
                    // Caja: tono y mucho ruido.
                    38 -> sin(2 * PI * 190 * i / tasa) * exp(-i / (0.06 * tasa)) * 0.6 + (azar.nextDouble() * 2 - 1) * exp(-i / (0.12 * tasa)) * 0.8
                    // Hi-hat: ruido agudo y corto (paso alto).
                    else -> { val r = (azar.nextDouble() * 2 - 1).toFloat(); val h = r - prev; prev = r; h * exp(-i / (0.045 * tasa)) * 0.6 }
                }
                x[i0 + i] += s.toFloat()
            }
        }
        val reales = listOf(0.5 to 36, 1.0 to 42, 1.5 to 38, 2.0 to 42, 2.5 to 36, 3.0 to 38)
        for ((t, n) in reales) golpe(t, n)
        val g = DetectorBateria.detectar(x, tasa)
        for ((t, n) in reales) assertTrue("falta $n en $t: ${g.map { it.tecla to it.inicio }}", g.any { it.tecla == n && abs(it.inicio - t) < 0.06 })
    }

    @Test
    fun basicPitchEscuchaLaGuitarraSintetizada() {
        val modelo = File(System.getenv("IMPROMPTU_MODELOS") ?: "D:/.cache/models", "movil/basic-pitch.onnx")
        assumeTrue(modelo.exists())
        val tasa = BasicPitch.TASA
        val s = Sintes(tasa)
        val melodia = listOf(52, 55, 57, 59, 62, 64)
        val x = FloatArray(4 * tasa)
        melodia.forEachIndexed { i, p ->
            val c = s.cuerda(p, 100, Sintes.Timbre.Acero)
            val i0 = (0.2 + i * 0.6) * tasa
            for (k in c.indices) if (i0.toInt() + k < x.size) x[i0.toInt() + k] += c[k] * 2
        }
        val env = OrtEnvironment.getEnvironment()
        val notas = BasicPitch(env.createSession(modelo.absolutePath, OrtSession.SessionOptions())).use { it.transcribir(x) }
        for ((i, p) in melodia.withIndex()) {
            val t = 0.2 + i * 0.6
            assertTrue("falta $p en $t: ${notas.map { it.tecla to "%.2f".format(it.inicio) }}", notas.any { it.tecla == p && abs(it.inicio - t) < 0.08 })
        }
    }
}
