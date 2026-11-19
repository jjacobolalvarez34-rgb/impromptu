package com.mamutherd.impromptu.audio

import android.content.Context
import android.media.AudioFormat
import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.net.Uri
import java.io.File
import java.nio.ByteOrder
import kotlin.coroutines.cancellation.CancellationException

/** Arreglo de floats que crece (para audio de largo desconocido). */
class Floats(capacidad: Int = 1 shl 16) {
    var datos = FloatArray(capacidad)
        private set
    var largo = 0
        private set

    fun agregar(x: Float) {
        if (largo == datos.size) datos = datos.copyOf(datos.size * 2)
        datos[largo++] = x
    }

    fun recortado() = datos.copyOf(largo)
}

/** Decodifica audio (MP3, WAV, M4A, OGG, FLAC…) con los códecs del sistema. */
object Decodificar {
    class Pcm(val muestras: FloatArray, val tasa: Int) {
        val segundos get() = muestras.size.toDouble() / tasa
    }

    /**
     * Audio de un archivo o un `content://` a mono. `maxSeg` corta antes de leer todo.
     * `seguir()` se consulta a menudo: si devuelve false, se cancela.
     */
    fun aMono(
        context: Context,
        uri: Uri? = null,
        archivo: File? = null,
        /** Un archivo de los assets (sin comprimir en el APK). */
        asset: android.content.res.AssetFileDescriptor? = null,
        maxSeg: Double? = null,
        seguir: () -> Boolean = { true },
        progreso: (Float) -> Unit = {},
    ): Pcm {
        val ex = MediaExtractor()
        try {
            when {
                archivo != null -> ex.setDataSource(archivo.absolutePath)
                asset != null -> ex.setDataSource(asset.fileDescriptor, asset.startOffset, asset.declaredLength)
                else -> ex.setDataSource(context, uri!!, null)
            }
            val pista = (0 until ex.trackCount).firstOrNull {
                ex.getTrackFormat(it).getString(MediaFormat.KEY_MIME)?.startsWith("audio/") == true
            } ?: throw IllegalArgumentException("El archivo no tiene audio")
            ex.selectTrack(pista)
            val formato = ex.getTrackFormat(pista)
            val duracionUs = if (formato.containsKey(MediaFormat.KEY_DURATION)) formato.getLong(MediaFormat.KEY_DURATION) else 0L
            var tasa = formato.getInteger(MediaFormat.KEY_SAMPLE_RATE)
            var canales = formato.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
            val codec = MediaCodec.createDecoderByType(formato.getString(MediaFormat.KEY_MIME)!!)
            codec.configure(formato, null, null, 0)
            codec.start()
            val salida = Floats()
            var flotante = false
            val info = MediaCodec.BufferInfo()
            var finEntrada = false
            val limite = maxSeg?.let { (it * tasa).toInt() }
            try {
                loop@ while (true) {
                    if (!seguir()) throw CancellationException()
                    if (!finEntrada) {
                        val i = codec.dequeueInputBuffer(5_000)
                        if (i >= 0) {
                            val b = codec.getInputBuffer(i)!!
                            val n = ex.readSampleData(b, 0)
                            if (n < 0) {
                                codec.queueInputBuffer(i, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                                finEntrada = true
                            } else {
                                codec.queueInputBuffer(i, 0, n, ex.sampleTime, 0)
                                if (duracionUs > 0) progreso((ex.sampleTime.toDouble() / duracionUs).toFloat().coerceIn(0f, 1f))
                                ex.advance()
                            }
                        }
                    }
                    val o = codec.dequeueOutputBuffer(info, 5_000)
                    when {
                        o == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                            val f = codec.outputFormat
                            tasa = f.getInteger(MediaFormat.KEY_SAMPLE_RATE)
                            canales = f.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
                            flotante = f.containsKey(MediaFormat.KEY_PCM_ENCODING) &&
                                f.getInteger(MediaFormat.KEY_PCM_ENCODING) == AudioFormat.ENCODING_PCM_FLOAT
                        }
                        o >= 0 -> {
                            val b = codec.getOutputBuffer(o)!!.order(ByteOrder.nativeOrder())
                            b.position(info.offset)
                            b.limit(info.offset + info.size)
                            if (flotante) {
                                val fb = b.asFloatBuffer()
                                while (fb.remaining() >= canales) {
                                    var s = 0f
                                    repeat(canales) { s += fb.get() }
                                    salida.agregar(s / canales)
                                }
                            } else {
                                val sb = b.asShortBuffer()
                                while (sb.remaining() >= canales) {
                                    var s = 0f
                                    repeat(canales) { s += sb.get() }
                                    salida.agregar(s / canales / 32768f)
                                }
                            }
                            codec.releaseOutputBuffer(o, false)
                            if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) break@loop
                            if (limite != null && salida.largo >= limite) break@loop
                        }
                    }
                }
            } finally {
                runCatching { codec.stop() }
                codec.release()
            }
            progreso(1f)
            return Pcm(salida.recortado(), tasa)
        } finally {
            ex.release()
        }
    }

    /** Cambia la frecuencia con interpolación lineal y un filtro simple si se baja. */
    fun remuestrear(x: FloatArray, de: Int, a: Int): FloatArray {
        if (de == a) return x
        var fuente = x
        if (a < de) {
            // Paso bajo de un polo para no plegar agudos al bajar la frecuencia.
            val alfa = (a.toFloat() / de).coerceIn(0.1f, 1f)
            fuente = FloatArray(x.size)
            var y = 0f
            for (i in x.indices) {
                y += alfa * (x[i] - y)
                fuente[i] = y
            }
        }
        val n = (x.size.toLong() * a / de).toInt()
        val paso = de.toDouble() / a
        return FloatArray(n) { i ->
            val p = i * paso
            val k = p.toInt()
            if (k + 1 >= fuente.size) fuente[fuente.size - 1]
            else {
                val f = (p - k).toFloat()
                fuente[k] * (1 - f) + fuente[k + 1] * f
            }
        }
    }
}
