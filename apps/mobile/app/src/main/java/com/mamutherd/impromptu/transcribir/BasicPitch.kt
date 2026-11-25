package com.mamutherd.impromptu.transcribir

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import com.mamutherd.impromptu.datos.Nota
import java.nio.FloatBuffer
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Basic Pitch (Spotify, Apache-2.0) nativo: audio a notas de cualquier instrumento con altura
 * (guitarra y bajo, fase 9). Mismo corte en ventanas, empalme y extracción de notas que la
 * versión de la web (@spotify/basic-pitch) y la de Python (note_creation.py), con los umbrales
 * de packages/transcribe (DEFAULT_PARAMS).
 */
/**
 * Qué tan seguro debe estar el modelo para dar una nota. El piano usa los que se ajustaron con
 * las grabaciones de Jacobo (fase 5); guitarra y bajo, los de Spotify, porque con el micrófono
 * del teléfono una guitarra acústica no pasaba los del piano y no salía nada (pedido 55).
 */
data class Umbrales(val inicio: Float, val cuadro: Float) {
    companion object {
        val PIANO = Umbrales(0.6f, 0.4f)
        val CUERDAS = Umbrales(0.5f, 0.3f)
    }
}

class BasicPitch(private val sesion: OrtSession, private val env: OrtEnvironment = OrtEnvironment.getEnvironment()) : AutoCloseable {
    @Volatile private var cancelada = false

    fun cancelar() {
        cancelada = true
    }

    override fun close() {
        runCatching { sesion.close() }
    }

    /** Notas de un audio mono a 22 050 Hz. `progreso` recibe 0 a 1 por ventana. */
    fun transcribir(
        x: FloatArray,
        umbrales: Umbrales = Umbrales.PIANO,
        progreso: (Float) -> Unit = {},
    ): List<Nota> {
        cancelada = false
        val relleno = FloatArray(SOLAPE / 2 + x.size).also { System.arraycopy(x, 0, it, SOLAPE / 2, x.size) }
        val ventanas = maxOf(1, (relleno.size + SALTO - 1) / SALTO)
        val totalCuadros = floor(x.size * (FPS.toDouble() / TASA)).toInt()
        val notas = ArrayList<FloatArray>()
        val inicios = ArrayList<FloatArray>()
        val entrada = FloatArray(MUESTRAS)
        var cuadros = 0
        for (w in 0 until ventanas) {
            if (cancelada) throw Transkun.Cancelada()
            entrada.fill(0f)
            val desde = w * SALTO
            System.arraycopy(relleno, desde, entrada, 0, min(MUESTRAS, relleno.size - desde).coerceAtLeast(0))
            OnnxTensor.createTensor(env, FloatBuffer.wrap(entrada), longArrayOf(1, MUESTRAS.toLong(), 1)).use { t ->
                sesion.run(mapOf(ENTRADA to t)).use { r ->
                    val nota = (r.get(SALIDA_NOTA).get() as OnnxTensor).floatBuffer
                    val inicio = (r.get(SALIDA_INICIO).get() as OnnxTensor).floatBuffer
                    // Se quitan 15 cuadros de cada lado (los que se solapan con la ventana vecina).
                    for (f in MEDIO_SOLAPE until CUADROS_VENTANA - MEDIO_SOLAPE) {
                        if (cuadros >= totalCuadros) break
                        notas += FloatArray(NOTAS) { k -> nota.get(f * NOTAS + k) }
                        inicios += FloatArray(NOTAS) { k -> inicio.get(f * NOTAS + k) }
                        cuadros++
                    }
                }
            }
            progreso((w + 1).toFloat() / ventanas)
        }
        return aNotas(notas, inicios, umbrales)
    }

    companion object {
        const val TASA = 22_050
        private const val SALTO_FFT = 256
        private const val MUESTRAS = TASA * 2 - SALTO_FFT // 43 844
        private const val CUADROS_VENTANA = 172
        private const val SOLAPE = 30 * SALTO_FFT
        private const val MEDIO_SOLAPE = 15
        private const val SALTO = MUESTRAS - SOLAPE
        private const val FPS = TASA / SALTO_FFT // 86
        private const val NOTAS = 88
        private const val ENTRADA = "serving_default_input_2:0"
        private const val SALIDA_NOTA = "StatefulPartitionedCall:1"
        private const val SALIDA_INICIO = "StatefulPartitionedCall:2"
        private const val LARGO_MINIMO = 8
        private const val TOLERANCIA = 11
        private val CORRIMIENTO_VENTANA = (SALTO_FFT.toDouble() / TASA) * (CUADROS_VENTANA - MUESTRAS.toDouble() / SALTO_FFT) + 0.0018

        private fun tiempo(cuadro: Int) = cuadro * SALTO_FFT.toDouble() / TASA - CORRIMIENTO_VENTANA * (cuadro / CUADROS_VENTANA)

        /** Inicios inferidos de los saltos de energía (get_infered_onsets): el máximo con los predichos. */
        private fun iniciosInferidos(inicios: List<FloatArray>, cuadros: List<FloatArray>): List<FloatArray> {
            val n = cuadros.size
            val dif = List(n) { FloatArray(NOTAS) }
            var maxDif = 0f
            var maxIni = 0f
            for (t in 0 until n) for (k in 0 until NOTAS) {
                maxIni = max(maxIni, inicios[t][k])
                if (t < 2) continue
                val d1 = cuadros[t][k] - cuadros[t - 1][k]
                val d2 = cuadros[t][k] - cuadros[t - 2][k]
                val d = max(0f, min(d1, d2))
                dif[t][k] = d
                maxDif = max(maxDif, d)
            }
            if (maxDif <= 0f) return inicios
            return List(n) { t -> FloatArray(NOTAS) { k -> max(inicios[t][k], maxIni * dif[t][k] / maxDif) } }
        }

        /** output_to_notes_polyphonic con el truco de melodía; después, a notas con fuerza. */
        fun aNotas(
            cuadros: List<FloatArray>,
            iniciosModelo: List<FloatArray>,
            umbrales: Umbrales = Umbrales.PIANO,
        ): List<Nota> {
            val UMBRAL_INICIO = umbrales.inicio
            val UMBRAL_CUADRO = umbrales.cuadro
            val n = cuadros.size
            if (n < 3) return emptyList()
            val inicios = iniciosInferidos(iniciosModelo, cuadros)
            val resto = List(n) { cuadros[it].copyOf() }
            val eventos = ArrayList<IntArray>() // inicio, fin, nota
            val amplitudes = ArrayList<Float>()
            // Picos de inicio por encima del umbral, del final hacia el comienzo (como el original).
            val picos = ArrayList<Long>()
            for (t in 1 until n - 1) for (k in 0 until NOTAS) {
                val v = inicios[t][k]
                if (v >= UMBRAL_INICIO && v > inicios[t - 1][k] && v > inicios[t + 1][k]) picos += t.toLong() * NOTAS + k
            }
            fun limpiar(t: Int, k: Int) {
                resto[t][k] = 0f
                if (k < NOTAS - 1) resto[t][k + 1] = 0f
                if (k > 0) resto[t][k - 1] = 0f
            }
            for (p in picos.asReversed()) {
                val t0 = (p / NOTAS).toInt()
                val k = (p % NOTAS).toInt()
                if (t0 >= n - 1) continue
                var i = t0 + 1
                var c = 0
                while (i < n - 1 && c < TOLERANCIA) {
                    if (resto[i][k] < UMBRAL_CUADRO) c++ else c = 0
                    i++
                }
                i -= c
                if (i - t0 <= LARGO_MINIMO) continue
                for (t in t0 until i) limpiar(t, k)
                var suma = 0f
                for (t in t0 until i) suma += cuadros[t][k]
                eventos += intArrayOf(t0, i, k + 21)
                amplitudes += suma / (i - t0)
            }
            // Truco de melodía: lo que sigue sonando sin un inicio claro, del valor más alto al más
            // bajo (se ordena una vez: los valores solo bajan a cero, así que es lo mismo que
            // buscar el máximo en cada vuelta, pero rápido).
            val altos = ArrayList<Long>()
            for (t in 0 until n) for (k in 0 until NOTAS) if (resto[t][k] > UMBRAL_CUADRO) altos += t.toLong() * NOTAS + k
            val orden = altos.sortedWith(compareByDescending<Long> { resto[(it / NOTAS).toInt()][(it % NOTAS).toInt()] }.thenBy { it })
            for (p in orden) {
                val tm = (p / NOTAS).toInt()
                val k = (p % NOTAS).toInt()
                if (resto[tm][k] <= UMBRAL_CUADRO) continue
                resto[tm][k] = 0f
                var i = tm + 1
                var c = 0
                while (i < n - 1 && c < TOLERANCIA) {
                    if (resto[i][k] < UMBRAL_CUADRO) c++ else c = 0
                    limpiar(i, k)
                    i++
                }
                val fin = i - 1 - c
                i = tm - 1
                c = 0
                while (i > 0 && c < TOLERANCIA) {
                    if (resto[i][k] < UMBRAL_CUADRO) c++ else c = 0
                    limpiar(i, k)
                    i--
                }
                val ini = i + 1 + c
                if (fin - ini <= LARGO_MINIMO) continue
                var suma = 0f
                for (t in ini until fin) suma += cuadros[t][k]
                eventos += intArrayOf(ini, fin, k + 21)
                amplitudes += suma / (fin - ini)
            }
            // A notas (rawToNotes de la web): fuera las muy cortas o muy suaves.
            return eventos.indices.mapNotNull { e ->
                val (a, b, tecla) = eventos[e]
                val inicio = max(0.0, tiempo(a))
                val dur = tiempo(b) - tiempo(a)
                val amp = amplitudes[e]
                if (dur < 0.04 || amp < 0.08f) null
                else Nota(tecla, inicio, inicio + dur, (20 + amp * 107).roundToInt().coerceIn(1, 127))
            }.sortedWith(compareBy({ it.inicio }, { it.tecla }))
        }
    }
}
