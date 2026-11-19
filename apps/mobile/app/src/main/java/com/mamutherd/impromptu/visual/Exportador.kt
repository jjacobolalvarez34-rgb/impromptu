package com.mamutherd.impromptu.visual

import com.mamutherd.impromptu.audio.Sintes
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.opengl.EGL14
import android.opengl.EGLConfig
import android.opengl.EGLContext
import android.opengl.EGLExt
import android.opengl.EGLSurface
import android.opengl.GLES20
import android.opengl.GLUtils
import android.view.Surface
import java.nio.FloatBuffer
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
    /** Video de la partitura (fase 10): dibuja la hoja en vez del visualizador. */
    private val hoja: HojaVideo? = null,
) {
    private val tasa = 44_100
    /** Antes de la primera nota, para que se vea caer. */
    private val inicio =
        if (hoja != null) 0.0
        else minOf(0.0, (pieza.notas.firstOrNull()?.inicio ?: 0.0) - 2.0).coerceAtLeast(-3.0)
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
            // OpenGL con la hora exacta de cada cuadro (BUG-005): con el lienzo directo sobre la
            // superficie, el codificador podía saltarse cuadros y el sonido quedaba corrido.
            val gl = SuperficieGl(superficie)
            val lienzo = Bitmap.createBitmap(ancho, alto, Bitmap.Config.ARGB_8888)
            val c = Canvas(lienzo)
            val m = MediaMuxer(salida.absolutePath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
            muxer = m
            var pistaVideo = -1
            var pistaAudio = -1
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
                if (hoja != null) hoja.dibujar(c, ancho.toFloat(), alto.toFloat(), t)
                else r.dibujar(c, ancho.toFloat(), alto.toFloat(), pieza.notas, pieza.pedales, t, rango, op = op)
                val restante = fin - t
                if (restante < FUNDIDO) {
                    negro.alpha = ((1 - restante / FUNDIDO) * 255).toInt().coerceIn(0, 255)
                    c.drawRect(0f, 0f, ancho.toFloat(), alto.toFloat(), negro)
                }
                // Antes de entregar el cuadro se vacía la salida, para que el codificador no se trabe.
                drenar(false)
                gl.dibujar(lienzo, k * 1_000_000_000L / fps)
                if (k % 5 == 0) avance(0.1f + 0.9f * k / cuadros)
            }
            v.signalEndOfInputStream()
            drenar(true)
            gl.soltar()
            lienzo.recycle()
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

/**
 * Superficie del codificador con OpenGL ES 2: cada cuadro (dibujado en un Bitmap con el mismo
 * Renderizador) se sube como textura y se entrega con su hora exacta
 * (eglPresentationTimeANDROID). Así no se pierde ningún cuadro y el sonido queda en su lugar.
 */
private class SuperficieGl(superficie: Surface) {
    private val display = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
    private val contexto: EGLContext
    private val egl: EGLSurface
    private val programa: Int
    private val textura: Int
    private var subida = false
    private val vertices: FloatBuffer = ByteBuffer.allocateDirect(16 * 4).order(ByteOrder.nativeOrder()).asFloatBuffer().apply {
        // x, y, s, t: la fila de arriba del Bitmap queda arriba en el video.
        put(floatArrayOf(-1f, -1f, 0f, 1f, 1f, -1f, 1f, 1f, -1f, 1f, 0f, 0f, 1f, 1f, 1f, 0f))
        position(0)
    }

    init {
        val v = IntArray(2)
        EGL14.eglInitialize(display, v, 0, v, 1)
        val atributos = intArrayOf(
            EGL14.EGL_RED_SIZE, 8, EGL14.EGL_GREEN_SIZE, 8, EGL14.EGL_BLUE_SIZE, 8, EGL14.EGL_ALPHA_SIZE, 8,
            EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT, EGL_RECORDABLE_ANDROID, 1, EGL14.EGL_NONE,
        )
        val configs = arrayOfNulls<EGLConfig>(1)
        val n = IntArray(1)
        EGL14.eglChooseConfig(display, atributos, 0, configs, 0, 1, n, 0)
        contexto = EGL14.eglCreateContext(display, configs[0], EGL14.EGL_NO_CONTEXT, intArrayOf(EGL14.EGL_CONTEXT_CLIENT_VERSION, 2, EGL14.EGL_NONE), 0)
        egl = EGL14.eglCreateWindowSurface(display, configs[0], superficie, intArrayOf(EGL14.EGL_NONE), 0)
        EGL14.eglMakeCurrent(display, egl, egl, contexto)
        programa = crearPrograma(
            "attribute vec4 p; attribute vec2 t; varying vec2 v; void main() { gl_Position = p; v = t; }",
            "precision mediump float; varying vec2 v; uniform sampler2D s; void main() { gl_FragColor = texture2D(s, v); }",
        )
        val tex = IntArray(1)
        GLES20.glGenTextures(1, tex, 0)
        textura = tex[0]
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textura)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES20.GL_TEXTURE_2D, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
    }

    private fun crearPrograma(vs: String, fs: String): Int {
        fun sombreador(tipo: Int, codigo: String) = GLES20.glCreateShader(tipo).also {
            GLES20.glShaderSource(it, codigo)
            GLES20.glCompileShader(it)
        }
        return GLES20.glCreateProgram().also {
            GLES20.glAttachShader(it, sombreador(GLES20.GL_VERTEX_SHADER, vs))
            GLES20.glAttachShader(it, sombreador(GLES20.GL_FRAGMENT_SHADER, fs))
            GLES20.glLinkProgram(it)
        }
    }

    fun dibujar(cuadro: Bitmap, ptsNs: Long) {
        GLES20.glViewport(0, 0, cuadro.width, cuadro.height)
        GLES20.glUseProgram(programa)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES20.GL_TEXTURE_2D, textura)
        if (!subida) {
            GLUtils.texImage2D(GLES20.GL_TEXTURE_2D, 0, cuadro, 0)
            subida = true
        } else {
            GLUtils.texSubImage2D(GLES20.GL_TEXTURE_2D, 0, 0, 0, cuadro)
        }
        val p = GLES20.glGetAttribLocation(programa, "p")
        val t = GLES20.glGetAttribLocation(programa, "t")
        vertices.position(0)
        GLES20.glVertexAttribPointer(p, 2, GLES20.GL_FLOAT, false, 16, vertices)
        GLES20.glEnableVertexAttribArray(p)
        vertices.position(2)
        GLES20.glVertexAttribPointer(t, 2, GLES20.GL_FLOAT, false, 16, vertices)
        GLES20.glEnableVertexAttribArray(t)
        GLES20.glUniform1i(GLES20.glGetUniformLocation(programa, "s"), 0)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        EGLExt.eglPresentationTimeANDROID(display, egl, ptsNs)
        EGL14.eglSwapBuffers(display, egl)
    }

    fun soltar() {
        EGL14.eglMakeCurrent(display, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
        EGL14.eglDestroySurface(display, egl)
        EGL14.eglDestroyContext(display, contexto)
        EGL14.eglReleaseThread()
        EGL14.eglTerminate(display)
    }

    companion object {
        private const val EGL_RECORDABLE_ANDROID = 0x3142
    }
}
