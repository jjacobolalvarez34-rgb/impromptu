package com.mamutherd.impromptu.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Process
import com.mamutherd.impromptu.datos.Pieza
import java.util.concurrent.ConcurrentLinkedQueue

/**
 * Eventos de una pieza ordenados en el tiempo, listos para el sampler: tipo 0 = soltar,
 * 1 = tocar, 2 = control (pedal). Al mismo instante, primero se suelta y después se toca.
 */
class Secuencia(pieza: Pieza) {
    val n: Int
    val t: DoubleArray
    val tipo: IntArray
    val a: IntArray
    val b: IntArray
    val duracion = pieza.duracion

    init {
        data class E(val t: Double, val tipo: Int, val a: Int, val b: Int)
        val es = ArrayList<E>(pieza.notas.size * 2 + pieza.pedales.size)
        for (x in pieza.notas) {
            es += E(x.inicio, 1, x.tecla, x.fuerza)
            es += E(x.fin, 0, x.tecla, 0)
        }
        for (p in pieza.pedales) es += E(p.tiempo, 2, p.tipo.cc, p.valor)
        es.sortWith(compareBy({ it.t }, { if (it.tipo == 0) 0 else if (it.tipo == 2) 1 else 2 }))
        n = es.size
        t = DoubleArray(n) { es[it].t }
        tipo = IntArray(n) { es[it].tipo }
        a = IntArray(n) { es[it].a }
        b = IntArray(n) { es[it].b }
    }

    /** Primer evento en o después de `seg`. */
    fun indice(seg: Double): Int {
        var lo = 0
        var hi = n
        while (lo < hi) {
            val m = (lo + hi) ushr 1
            if (t[m] < seg) lo = m + 1 else hi = m
        }
        return lo
    }

    /** Lleva el sampler al estado de pedales que hay en `seg` (al buscar). */
    fun pedalesEn(seg: Double, sampler: Sampler) {
        val ultimo = HashMap<Int, Int>()
        for (i in 0 until indice(seg)) if (tipo[i] == 2) ultimo[a[i]] = b[i]
        for ((cc, v) in ultimo) sampler.pedal(cc, v)
    }

    /** Aplica al sampler los eventos de [desde, hasta). Devuelve el índice siguiente. */
    fun aplicar(desde: Int, hasta: Double, sampler: Sampler): Int {
        var i = desde
        while (i < n && t[i] < hasta) {
            when (tipo[i]) {
                0 -> sampler.notaOff(a[i])
                1 -> sampler.notaOn(a[i], b[i])
                else -> sampler.pedal(a[i], b[i])
            }
            i++
        }
        return i
    }
}

/**
 * Salida de audio en vivo: un hilo con prioridad de audio que rinde el sampler en bloques
 * cortos y los escribe en un AudioTrack de baja latencia. Las órdenes de otros hilos (MIDI,
 * interfaz) entran por una cola y se aplican al inicio de cada bloque.
 */
class Motor(context: Context, banco: Banco) {
    val tasa: Int = (context.getSystemService(Context.AUDIO_SERVICE) as AudioManager)
        .getProperty(AudioManager.PROPERTY_OUTPUT_SAMPLE_RATE)?.toIntOrNull()?.takeIf { it in 22_050..96_000 } ?: 48_000
    val sampler = Sampler(banco, tasa)
    private val cola = ConcurrentLinkedQueue<(Sampler) -> Unit>()
    private val limitador = Limitador()

    @Volatile private var secuencia: Secuencia? = null
    private var indice = 0

    /** Segundo de la pieza que se está rindiendo ahora. */
    @Volatile var posicion = 0.0
        private set
    @Volatile var reproduciendo = false
        private set
    @Volatile var velocidad = 1.0
    @Volatile private var hilo: Thread? = null
    @Volatile private var activo = false
    private var track: AudioTrack? = null

    /** Retardo de la salida (s), para que lo que se ve coincida con lo que se oye. */
    @Volatile var latencia = 0.05
        private set

    /** Posición para dibujar: lo que está sonando ahora en el parlante. */
    val posicionVisible get() = if (reproduciendo) maxOf(0.0, posicion - latencia * velocidad) else posicion

    fun orden(f: (Sampler) -> Unit) {
        cola.add(f)
    }

    fun notaOn(tecla: Int, fuerza: Int) = orden { it.notaOn(tecla, fuerza) }
    fun notaOff(tecla: Int) = orden { it.notaOff(tecla) }
    fun pedal(cc: Int, valor: Int) = orden { it.pedal(cc, valor) }

    /** Ficha de quien cargó la pieza: solo ese puede soltarla (las pantallas se cruzan al animar). */
    private var ficha = 0

    /** Carga una pieza para tocarla y devuelve su ficha. */
    fun cargar(pieza: Pieza?): Int {
        ordenCargar(pieza)
        return ++ficha
    }

    /** Suelta la pieza si nadie la cargó después (al salir de una pantalla). */
    fun soltar(f: Int) {
        if (f != ficha) return
        pausar()
        ordenCargar(null)
    }

    private fun ordenCargar(pieza: Pieza?) = orden {
        it.silencio()
        secuencia = pieza?.let(::Secuencia)
        reproduciendo = false
        posicion = 0.0
        indice = 0
    }

    fun tocar() = orden {
        val s = secuencia ?: return@orden
        if (posicion >= s.duracion) {
            posicion = 0.0
        }
        it.silencio()
        s.pedalesEn(posicion, it)
        indice = s.indice(posicion)
        reproduciendo = true
    }

    fun pausar() = orden {
        reproduciendo = false
        it.silencio()
    }

    fun buscar(seg: Double) = orden {
        val s = secuencia ?: return@orden
        posicion = seg.coerceIn(0.0, s.duracion)
        it.silencio()
        s.pedalesEn(posicion, it)
        indice = s.indice(posicion)
    }

    fun encender() {
        if (activo) return
        activo = true
        val minimo = AudioTrack.getMinBufferSize(tasa, AudioFormat.CHANNEL_OUT_STEREO, AudioFormat.ENCODING_PCM_FLOAT)
        val t = AudioTrack.Builder()
            .setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build(),
            )
            .setAudioFormat(
                AudioFormat.Builder()
                    .setSampleRate(tasa)
                    .setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                    .build(),
            )
            .setPerformanceMode(AudioTrack.PERFORMANCE_MODE_LOW_LATENCY)
            .setTransferMode(AudioTrack.MODE_STREAM)
            .setBufferSizeInBytes(minimo)
            .build()
        track = t
        latencia = t.bufferSizeInFrames.toDouble() / tasa + 0.01
        t.play()
        hilo = Thread({ bucle(t) }, "impromptu-audio").also { it.start() }
    }

    fun apagar() {
        activo = false
        hilo?.join(500)
        hilo = null
        track?.run {
            runCatching { stop() }
            release()
        }
        track = null
        reproduciendo = false
    }

    private fun bucle(t: AudioTrack) {
        Process.setThreadPriority(Process.THREAD_PRIORITY_URGENT_AUDIO)
        val buf = FloatArray(BLOQUE * 2)
        while (activo) {
            while (true) (cola.poll() ?: break).invoke(sampler)
            if (reproduciendo) {
                val s = secuencia
                if (s == null) reproduciendo = false
                else {
                    val fin = posicion + BLOQUE.toDouble() / tasa * velocidad
                    indice = s.aplicar(indice, fin, sampler)
                    posicion = fin
                    if (posicion >= s.duracion + 0.3) {
                        reproduciendo = false
                        posicion = s.duracion
                    }
                }
            }
            buf.fill(0f)
            sampler.render(buf, BLOQUE)
            limitador.procesar(buf, BLOQUE * 2)
            t.write(buf, 0, buf.size, AudioTrack.WRITE_BLOCKING)
        }
    }

    companion object {
        /** Cuadros por bloque: ~2 ms a 48 kHz, la resolución de los eventos. */
        const val BLOQUE = 96
    }
}
