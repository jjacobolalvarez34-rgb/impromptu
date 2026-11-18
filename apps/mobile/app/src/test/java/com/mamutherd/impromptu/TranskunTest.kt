package com.mamutherd.impromptu

import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import com.mamutherd.impromptu.transcribir.Decodificacion
import com.mamutherd.impromptu.transcribir.Transkun
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File
import java.io.RandomAccessFile
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.channels.FileChannel
import kotlin.math.abs

/**
 * El port de Transkun a Kotlin contra el original de Python (referencias en
 * D:/.cache/models/golden-transkun, fuera del repositorio). Sin esos archivos, se omiten.
 */
class TranskunTest {
    private val modelos = File(System.getenv("IMPROMPTU_MODELOS") ?: "D:/.cache/models")
    private val golden = File(modelos, "golden-transkun")
    /** Modelo para celular (atención por partes y puntuador aparte), el que va en la app. */
    private val movil = File(modelos, "movil")

    private fun mapa(f: File): FloatBuffer = RandomAccessFile(f, "r").use { raf ->
        raf.channel.map(FileChannel.MapMode.READ_ONLY, 0, raf.length()).order(ByteOrder.LITTLE_ENDIAN).asFloatBuffer()
    }

    private fun floats(f: File): FloatArray = mapa(f).let { b -> FloatArray(b.remaining()).also { b.get(it) } }

    @Test
    fun viterbiDaLaMismaRutaQuePython() {
        assumeTrue(File(golden, "meta.json").exists())
        val meta = JSONObject(File(golden, "meta.json").readText())
        val forma = meta.getJSONArray("S")
        val t = forma.getInt(0)
        val nSym = forma.getInt(2)
        val forzado = meta.getJSONArray("forcedStartPos").let { a -> IntArray(a.length()) { a.getInt(it) } }
        val ruta = Decodificacion.viterbi(mapa(File(golden, "S.f32")), mapa(File(golden, "S_skip.f32")), t, nSym, forzado)
        val esperada = meta.getJSONArray("path")
        assertEquals(esperada.length(), ruta.size)
        for (s in ruta.indices) {
            val e = esperada.getJSONArray(s)
            assertEquals("símbolo $s", e.length(), ruta[s].size)
            for (k in ruta[s].indices) {
                assertEquals(e.getJSONArray(k).getInt(0), ruta[s][k].first)
                assertEquals(e.getJSONArray(k).getInt(1), ruta[s][k].second)
            }
        }
    }

    @Test
    fun transcribeComoPython() {
        assumeTrue(File(golden, "notes-mono.json").exists() && File(movil, "transkun-red.onnx").exists())
        val env = OrtEnvironment.getEnvironment()
        val opciones = OrtSession.SessionOptions().apply {
            setOptimizationLevel(OrtSession.SessionOptions.OptLevel.EXTENDED_OPT)
            setCPUArenaAllocator(false)
            setMemoryPatternOptimization(false)
        }
        val tk = Transkun(
            env,
            env.createSession(File(movil, "transkun-red.onnx").absolutePath, opciones),
            env.createSession(File(movil, "transkun-puntuador.onnx").absolutePath, opciones),
            env.createSession(File(movil, "transkun-cabezas.onnx").absolutePath, opciones),
            Transkun.constantes(
                JSONObject(File(modelos, "transkun-espectro.json").readText()),
                floats(File(modelos, "transkun-ventanas.f32")),
                floats(File(modelos, "transkun-mel.f32")),
            ),
        )
        val audio = floats(File(golden, "audio-mono.f32"))
        // Memoria del proceso (privada, incluye la nativa de ONNX Runtime) mientras transcribe.
        // (Por reflexión: las pruebas compilan contra android.jar, que no trae java.lang.management.)
        val os = Class.forName("java.lang.management.ManagementFactory").getMethod("getOperatingSystemMXBean").invoke(null)
        val leer = Class.forName("com.sun.management.OperatingSystemMXBean").getMethod("getCommittedVirtualMemorySize")
        fun memoria() = leer.invoke(os) as Long
        val base = memoria()
        var pico = base
        val vigia = Thread {
            while (!Thread.currentThread().isInterrupted) {
                pico = maxOf(pico, memoria())
                try { Thread.sleep(100) } catch (e: InterruptedException) { break }
            }
        }.apply { isDaemon = true; start() }
        val inicio = System.nanoTime()
        val eventos = tk.use { it.transcribir(audio) { _, _ -> } }
        val segundos = (System.nanoTime() - inicio) / 1e9
        vigia.interrupt()
        println("Memoria: antes %d MB, pico %d MB (+%d MB)".format(base shr 20, pico shr 20, (pico - base) shr 20))
        val esperadas = JSONArray(File(golden, "notes-mono.json").readText())
        val ref = List(esperadas.length()) { esperadas.getJSONObject(it) }

        // F1 de notas (tecla igual, inicio a menos de 50 ms), como scripts/local/midi-f1.mjs.
        val usadas = BooleanArray(ref.size)
        var aciertos = 0
        var fuerzaMax = 0
        for (e in eventos) {
            val i = ref.indices.firstOrNull { !usadas[it] && ref[it].getInt("pitch") == e.tecla && abs(ref[it].getDouble("start") - e.inicio) < 0.05 }
                ?: continue
            usadas[i] = true
            aciertos++
            fuerzaMax = maxOf(fuerzaMax, abs(ref[i].getInt("velocity") - e.fuerza))
        }
        val precision = aciertos.toDouble() / eventos.size
        val recall = aciertos.toDouble() / ref.size
        val f1 = 2 * precision * recall / (precision + recall)
        println("Transkun Kotlin: ${eventos.size} eventos, Python ${ref.size}; F1 %.4f; fuerza máx. dif. %d; %.1f s".format(f1, fuerzaMax, segundos))
        assertTrue("F1 = $f1", f1 > 0.98)
        assertTrue("fuerza difiere $fuerzaMax", fuerzaMax <= 2)
    }
}
