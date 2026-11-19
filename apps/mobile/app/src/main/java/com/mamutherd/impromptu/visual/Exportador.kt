package com.mamutherd.impromptu.visual

import com.mamutherd.impromptu.audio.Sintes
import android.graphics.Color
import android.graphics.Paint
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMuxer
import android.os.Build
import com.mamutherd.impromptu.audio.Banco
import com.mamutherd.impromptu.audio.Limitador
import com.mamutherd.impromptu.audio.Sampler
import com.mamutherd.impromptu.audio.Secuencia
import com.mamutherd.impromptu.datos.Pieza
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Exporta la pieza a MP4 (H.264 + AAC) en el celular: el mismo visualizador dibujado en la
 * superficie del codificador y el piano rendido sin tiempo real. Como en la web
 * (packages/export): 4 s de cola al final con fundido de 1 s, para editar con holgura.
 */
class Exportador(
    private val pieza: Pieza,
    private val banco: Banco,
    private val ancho: Int,
    private val alto: Int,
    private val fps: Int = 30,
    /** Batería grabada (para piezas de batería). */
    private val bateria: Map<String, FloatArray> = emptyMap(),
) {
    private val tasa = 44_100
    /** Antes de la primera nota, para que se vea caer. */
    private val inicio = minOf(0.0, (pieza.notas.firstOrNull()?.inicio ?: 0.0) - 2.0).coerceAtLeast(-3.0)
    private val fin = pieza.duracion + COLA
    private val total = fin - inicio

    private class Paquete(val datos: ByteArray, val pts: Long, val flags: Int)

    suspend fun exportar(salida: File, avance: (Float) -> Unit) {
        val audio = codificarAudio { avance(it * 0.1f) }
        var muxer: MediaMuxer? = null
        var video: MediaCodec? = null
        var iniciado = false
        try {
            val formato = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, ancho, alto).apply {
                setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
                setInteger(MediaFormat.KEY_BIT_RATE, (ancho * alto * fps * 0.17).toInt())
                setInteger(MediaFormat.KEY_FRAME_RATE, fps)
                setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1)
                if (Build.VERSION.SDK_INT >= 29) setInteger(MediaFormat.KEY_MAX_B_FRAMES, 0)
            }
            val v = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
            video = v
            v.configure(formato, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
            val superficie = v.createInputSurface()
            v.start()
            val m = MediaMuxer(salida.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            muxer = m
            var pistaVideo = -1
            var pistaAudio = -1
            var cuadroSalida = 0L
            val info = MediaCodec.BufferInfo()

            fun drenar(final: Boolean) {
                while (true) {
                    val i = v.dequeueOutputBuffer(info, if (final) 10_000 else 0)
                    when {
                        i == MediaCodec.INFO_TRY_AGAIN_LATER -> if (!final) return
                        i == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                            pistaVideo = m.addTrack(v.outputFormat)
                            pistaAudio = m.addTrack(audio.first)
                            m.start()
                            iniciado = true
                            val b = ByteBuffer.allocateDirect(audio.second.maxOfOrNull { it.datos.size } ?: 1)
                            val ai = MediaCodec.BufferInfo()
                            for (p in audio.second) {
                                b.clear()
                                b.put(p.datos)
                                b.flip()
                                ai.set(0, p.datos.size, p.pts, p.flags)
                                m.writeSampleData(pistaAudio, b, ai)
                            }
                        }
                        i >= 0 -> {
                            val b = v.getOutputBuffer(i)!!
                            if (info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG != 0) info.size = 0
                            if (info.size > 0 && iniciado) {
                                // La superficie pone la hora del reloj; se reemplaza por la del cuadro.
                                info.presentationTimeUs = cuadroSalida * 1_000_000L / fps
                                cuadroSalida++
                                b.position(info.offset)
                                b.limit(info.offset + info.size)
                                m.writeSampleData(pistaVideo, b, info)
                            }
                            v.releaseOutputBuffer(i, false)
                            if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) return
                        }
                    }
                }
            }

            val r = Renderizador()
            val rango = pieza.rango()
            val op = Renderizador.Opciones(instrumento = pieza.instr)
            val negro = Paint().apply { color = Color.BLACK }
            val cuadros = (total * fps).toInt()
            for (k in 0 until cuadros) {
                currentCoroutineContext().ensureActive()
                val t = inicio + k.toDouble() / fps
                val c = superficie.lockHardwareCanvas()
                try {
                    r.dibujar(c, ancho.toFloat(), alto.toFloat(), pieza.notas, pieza.pedales, t, rango, op = op)
                    val restante = fin - t
                    if (restante < FUNDIDO) {
                        negro.alpha = ((1 - restante / FUNDIDO) * 255).toInt().coerceIn(0, 255)
                        c.drawRect(0f, 0f, ancho.toFloat(), alto.toFloat(), negro)
                    }
                } finally {
                    superficie.unlockCanvasAndPost(c)
                }
                drenar(false)
                if (k % 5 == 0) avance(0.1f + 0.9f * k / cuadros)
            }
            v.signalEndOfInputStream()
            drenar(true)
            superficie.release()
            avance(1f)
        } finally {
            runCatching { video?.stop() }
            runCatching { video?.release() }
            runCatching { if (iniciado) muxer?.stop() }
            runCatching { muxer?.release() }
        }
    }

    /** Rinde el piano sin tiempo real y lo codifica en AAC (paquetes en memoria). */
    private suspend fun codificarAudio(avance: (Float) -> Unit): Pair<MediaFormat, List<Paquete>> {
        val sampler = Sampler(banco, tasa)
        val sintes = Sintes(tasa, bateria)
        val sec = Secuencia(pieza)
        val limitador = Limitador()
        val formato = MediaFormat.createAudioFormat(MediaFormat.MIMETYPE_AUDIO_AAC, tasa, 2).apply {
            setInteger(MediaFormat.KEY_AAC_PROFILE, MediaCodecInfo.CodecProfileLevel.AACObjectLC)
            setInteger(MediaFormat.KEY_BIT_RATE, 192_000)
            setInteger(MediaFormat.KEY_MAX_INPUT_SIZE, BLOQUE * 4 * 2)
        }
        val codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_AUDIO_AAC)
        codec.configure(formato, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        codec.start()
        val paquetes = ArrayList<Paquete>()
        var formatoSalida: MediaFormat? = null
        val info = MediaCodec.BufferInfo()
        val totalCuadros = (total * tasa).toLong()
        var hechos = 0L
        var indice = sec.indice(inicio)
        sec.pedalesEn(inicio, sampler)
        val buf = FloatArray(BLOQUE * 2)
        var finEntrada = false
        try {
            while (true) {
                currentCoroutineContext().ensureActive()
                if (!finEntrada) {
                    val i = codec.dequeueInputBuffer(10_000)
                    if (i >= 0) {
                        if (hechos >= totalCuadros) {
                            codec.queueInputBuffer(i, 0, 0, hechos * 1_000_000 / tasa, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            finEntrada = true
                        } else {
                            val n = minOf(BLOQUE.toLong(), totalCuadros - hechos).toInt()
                            val t0 = inicio + hechos.toDouble() / tasa
                            indice = sec.aplicar(indice, t0 + n.toDouble() / tasa, sampler, sintes)
                            buf.fill(0f)
                            sampler.render(buf, n)
                            sintes.render(buf, n)
                            limitador.procesar(buf, n * 2)
                            val entrada = codec.getInputBuffer(i)!!.order(ByteOrder.LITTLE_ENDIAN)
                            entrada.clear()
                            for (j in 0 until n * 2) {
                                val tt = t0 + (j / 2).toDouble() / tasa
                                val g = if (fin - tt < FUNDIDO) ((fin - tt) / FUNDIDO).toFloat().coerceIn(0f, 1f) else 1f
                                entrada.putShort((buf[j] * g * 32767).toInt().coerceIn(-32768, 32767).toShort())
                            }
                            codec.queueInputBuffer(i, 0, n * 4, hechos * 1_000_000 / tasa, 0)
                            hechos += n
                            avance(hechos.toFloat() / totalCuadros)
                        }
                    }
                }
                val o = codec.dequeueOutputBuffer(info, 10_000)
                if (o == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) formatoSalida = codec.outputFormat
                else if (o >= 0) {
                    if (info.size > 0 && info.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG == 0) {
                        val b = codec.getOutputBuffer(o)!!
                        b.position(info.offset)
                        b.limit(info.offset + info.size)
                        val d = ByteArray(info.size)
                        b.get(d)
                        paquetes += Paquete(d, info.presentationTimeUs, info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM.inv())
                    }
                    codec.releaseOutputBuffer(o, false)
                    if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) break
                }
            }
        } finally {
            runCatching { codec.stop() }
            codec.release()
        }
        return (formatoSalida ?: error("El codificador de audio no dio formato")) to paquetes
    }

    companion object {
        const val COLA = 4.0
        const val FUNDIDO = 1.0
        private const val BLOQUE = 1024
    }
}
