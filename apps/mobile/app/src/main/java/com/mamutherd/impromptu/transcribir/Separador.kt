package com.mamutherd.impromptu.transcribir

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import android.content.Context
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.nio.FloatBuffer
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.hypot
import kotlin.math.sin

/**
 * Separar el instrumento de una canción completa (pedido 35, como Moises), igual que
 * packages/transcribe/src/separar: Spleeter de Deezer (pesos MIT) en ONNX. Las cuatro redes
 * (~20 MB cada una) se bajan la primera vez del repositorio público (PROVISIONAL P21: pasar a la
 * copia de Mamut Herd) y quedan en el celular. El audio llega en mono: los dos canales son
 * iguales, así que se procesa uno solo.
 */
class Separador private constructor(private val redes: List<OrtSession>) : AutoCloseable {
    companion object {
        const val TASA = 44_100
        private const val N_FFT = 4096
        private const val HOP = 1024
        private const val PAD = N_FFT - HOP
        private const val T = 512
        private const val F = 1024
        private const val BINS = N_FFT / 2 + 1
        val PARTES = listOf("vocals", "drums", "bass", "other")
        private const val BASE = "https://huggingface.co/Best-Practice/spleeter-4stems-onnx/resolve/main/"

        private fun carpeta(context: Context) = File(context.filesDir, "modelos").apply { mkdirs() }

        /** ¿Ya están las cuatro redes en el celular? */
        fun bajado(context: Context) = PARTES.all { File(carpeta(context), "spleeter-$it.fp16.onnx").length() > 1_000_000 }

        /** Baja lo que falte (con avance de 0 a 1) y prepara las redes. */
        fun cargar(context: Context, avance: (Float) -> Unit = {}): Separador {
            val dir = carpeta(context)
            val faltan = PARTES.filter { File(dir, "spleeter-$it.fp16.onnx").length() <= 1_000_000 }
            faltan.forEachIndexed { i, p ->
                bajar(URL("$BASE$p.fp16.onnx"), File(dir, "spleeter-$p.fp16.onnx")) { v -> avance((i + v) / faltan.size) }
            }
            val env = OrtEnvironment.getEnvironment()
            val opciones = OrtSession.SessionOptions().apply {
                setOptimizationLevel(OrtSession.SessionOptions.OptLevel.EXTENDED_OPT)
                setCPUArenaAllocator(false)
                setMemoryPatternOptimization(false)
            }
            return Separador(PARTES.map { env.createSession(File(dir, "spleeter-$it.fp16.onnx").absolutePath, opciones) })
        }

        /** Para las pruebas: las cuatro redes desde archivos (en el orden de PARTES). */
        internal fun desdeArchivos(archivos: List<File>): Separador {
            val env = OrtEnvironment.getEnvironment()
            return Separador(archivos.map { env.createSession(it.absolutePath, OrtSession.SessionOptions()) })
        }

        private fun bajar(url: URL, destino: File, avance: (Float) -> Unit) {
            val temporal = File(destino.parentFile, destino.name + ".parcial")
            var conexion = url.openConnection() as HttpURLConnection
            // Hugging Face redirige a su servidor de descargas (otro dominio).
            var saltos = 0
            while (conexion.responseCode in 300..399 && saltos++ < 5) {
                val siguiente = URL(url, conexion.getHeaderField("Location"))
                conexion.disconnect()
                conexion = siguiente.openConnection() as HttpURLConnection
            }
            if (conexion.responseCode != 200) throw IllegalStateException("No se pudo bajar el separador (${conexion.responseCode}).")
            val total = conexion.contentLengthLong.coerceAtLeast(1)
            conexion.inputStream.use { entrada ->
                temporal.outputStream().use { salida ->
                    val buf = ByteArray(1 shl 16)
                    var leidos = 0L
                    while (true) {
                        val n = entrada.read(buf)
                        if (n < 0) break
                        salida.write(buf, 0, n)
                        leidos += n
                        avance((leidos.toFloat() / total).coerceAtMost(1f))
                    }
                }
            }
            conexion.disconnect()
            temporal.renameTo(destino)
        }

        private val VENTANA = FloatArray(N_FFT) { (0.5 - 0.5 * cos(2 * PI * it / N_FFT)).toFloat() }
    }

    /** FFT compleja radix 2 en el lugar (sin dividir por N en la inversa). */
    private class Fft(private val n: Int) {
        private val rev = IntArray(n)
        private val cs = DoubleArray(n / 2) { cos(2 * PI * it / n) }
        private val sn = DoubleArray(n / 2) { sin(2 * PI * it / n) }
        init {
            val bits = Integer.numberOfTrailingZeros(n)
            for (i in 0 until n) {
                var r = 0
                for (b in 0 until bits) r = r or (((i shr b) and 1) shl (bits - 1 - b))
                rev[i] = r
            }
        }
        fun transformar(re: DoubleArray, im: DoubleArray, inversa: Boolean = false) {
            for (i in 0 until n) {
                val j = rev[i]
                if (j > i) {
                    var t = re[i]; re[i] = re[j]; re[j] = t
                    t = im[i]; im[i] = im[j]; im[j] = t
                }
            }
            val signo = if (inversa) 1.0 else -1.0
            var largo = 2
            while (largo <= n) {
                val mitad = largo / 2
                val paso = n / largo
                var i = 0
                while (i < n) {
                    for (k in 0 until mitad) {
                        val wr = cs[k * paso]
                        val wi = signo * sn[k * paso]
                        val a = i + k
                        val b = a + mitad
                        val xr = re[b] * wr - im[b] * wi
                        val xi = re[b] * wi + im[b] * wr
                        re[b] = re[a] - xr; im[b] = im[a] - xi
                        re[a] += xr; im[a] += xi
                    }
                    i += largo
                }
                largo = largo shl 1
            }
        }
    }

    /** Devuelve solo la parte pedida ("drums", "bass" u "other"), mono a 44,1 kHz. */
    fun separar(x: FloatArray, parte: String, seguir: () -> Boolean = { true }, avance: (Float) -> Unit = {}): FloatArray {
        val indice = PARTES.indexOf(parte)
        val n = x.size
        val total = (PAD + n + HOP - 1) / HOP
        val bloques = (total + T - 1) / T
        val fft = Fft(N_FFT)
        val re = DoubleArray(N_FFT)
        val im = DoubleArray(N_FFT)
        val salida = FloatArray(n)
        val pesos = FloatArray(n)
        val especRe = FloatArray(T * BINS)
        val especIm = FloatArray(T * BINS)
        val env = OrtEnvironment.getEnvironment()
        for (b in 0 until bloques) {
            if (!seguir()) throw kotlinx.coroutines.CancellationException()
            val f0 = b * T
            val nf = minOf(T, total - f0)
            val entrada = FloatArray(2 * T * F)
            especRe.fill(0f); especIm.fill(0f)
            for (t in 0 until nf) {
                val desde = (f0 + t) * HOP - PAD
                for (k in 0 until N_FFT) {
                    val i = desde + k
                    re[k] = if (i in 0 until n) (x[i] * VENTANA[k]).toDouble() else 0.0
                    im[k] = 0.0
                }
                fft.transformar(re, im)
                for (k in 0 until BINS) { especRe[t * BINS + k] = re[k].toFloat(); especIm[t * BINS + k] = im[k].toFloat() }
                // Los dos canales son iguales (audio mono).
                for (k in 0 until F) {
                    val m = hypot(re[k], im[k]).toFloat()
                    entrada[t * F + k] = m
                    entrada[(T + t) * F + k] = m
                }
            }
            val estimaciones = OnnxTensor.createTensor(env, FloatBuffer.wrap(entrada), longArrayOf(2, 1, T.toLong(), F.toLong())).use { tensor ->
                redes.map { red ->
                    red.run(mapOf("x" to tensor)).use { r ->
                        val y = (r.get(0) as OnnxTensor).floatBuffer
                        FloatArray(T * F).also { y.get(it) } // canal izquierdo
                    }
                }
            }
            for (t in 0 until nf) {
                var suma = 0f
                val mascara = FloatArray(F)
                for (k in 0 until F) {
                    var tot = 1e-10f
                    for (e in estimaciones) tot += e[t * F + k] * e[t * F + k]
                    val v = estimaciones[indice][t * F + k]
                    mascara[k] = (v * v + 1e-10f / estimaciones.size) / tot
                    suma += mascara[k]
                }
                val promedio = suma / F
                for (k in 0 until BINS) {
                    val m = if (k < F) mascara[k] else promedio
                    re[k] = (especRe[t * BINS + k] * m).toDouble()
                    im[k] = (especIm[t * BINS + k] * m).toDouble()
                }
                for (k in 1 until N_FFT / 2) { re[N_FFT - k] = re[k]; im[N_FFT - k] = -im[k] }
                fft.transformar(re, im, inversa = true)
                val desde = (f0 + t) * HOP - PAD
                for (k in 0 until N_FFT) {
                    val i = desde + k
                    if (i < 0 || i >= n) continue
                    val w = VENTANA[k]
                    salida[i] += (re[k] / N_FFT).toFloat() * w
                    pesos[i] += w * w
                }
            }
            avance((b + 1f) / bloques)
        }
        for (i in 0 until n) salida[i] = if (pesos[i] > 1e-8f) salida[i] / pesos[i] else 0f
        return salida
    }

    override fun close() = redes.forEach { it.close() }
}
