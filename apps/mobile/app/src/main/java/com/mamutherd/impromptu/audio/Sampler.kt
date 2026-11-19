package com.mamutherd.impromptu.audio

import java.io.File
import java.io.RandomAccessFile
import java.nio.ByteOrder
import java.nio.ShortBuffer
import java.nio.channels.FileChannel
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.exp
import kotlin.math.pow

/**
 * Muestras del Salamander Grand Piano (Alexander Holm, CC-BY 3.0; docs/LICENCIAS.md): una cada 3
 * semitonos (A0 a C8) y 5 capas de fuerza. Mismas reglas que packages/audio/src/salamander.ts.
 */
object Salamander {
    /** PROVISIONAL(P15): copia pública del Salamander en MP3. Mover a un espejo propio antes de v0.1. */
    const val BASE = "https://tambien.github.io/Piano/audio/"
    val CAPAS = intArrayOf(1, 5, 9, 13, 16)
    val TECLAS = IntArray(30) { 21 + it * 3 }
    private val NOMBRES = mapOf(0 to "C", 3 to "Ds", 6 to "Fs", 9 to "A")

    fun nombre(tecla: Int, capa: Int) = "${NOMBRES.getValue(tecla % 12)}${tecla / 12 - 1}v$capa"
    fun todas() = TECLAS.flatMap { t -> CAPAS.map { c -> nombre(t, c) } }

    fun cercana(tecla: Int) = 21 + Math.round((tecla.coerceIn(21, 108) - 21) / 3.0).toInt() * 3

    fun capa(fuerza: Int): Int {
        val objetivo = ceil(fuerza.coerceIn(1, 127) / 127.0 * 16).toInt()
        return CAPAS.minBy { abs(it - objetivo) }
    }

    fun gananciaCapa(fuerza: Int, capa: Int): Float {
        val buscada = fuerza.coerceIn(1, 127) / 127.0
        return (buscada / (capa / 16.0)).pow(0.8).coerceIn(0.35, 1.6).toFloat()
    }

    /** Segundos que se guardan de cada muestra: las graves suenan más (el resto ya es inaudible). */
    fun largo(tecla: Int) = when {
        tecla <= 40 -> 10.0
        tecla <= 60 -> 8.0
        tecla <= 80 -> 6.0
        else -> 4.0
    }
}

/** Banco de muestras ya decodificadas (PCM 16 bits mono a 44,1 kHz), mapeadas desde el disco. */
class Banco(carpeta: File) {
    private val datos = HashMap<String, ShortBuffer>()

    init {
        for (n in Salamander.todas()) {
            val f = File(carpeta, "$n.pcm")
            if (!f.exists()) continue
            RandomAccessFile(f, "r").use { raf ->
                val map = raf.channel.map(FileChannel.MapMode.READ_ONLY, 0, raf.length())
                datos[n] = map.order(ByteOrder.LITTLE_ENDIAN).asShortBuffer()
            }
        }
    }

    val completo get() = datos.size == Salamander.TECLAS.size * Salamander.CAPAS.size
    operator fun get(nombre: String) = datos[nombre]
}

/**
 * Sintetizador de piano por muestras, con la lógica de los pedales de un piano real. No es
 * seguro entre hilos: lo usa un solo hilo (el de audio, o el de exportar).
 */
class Sampler(private val banco: Banco, val tasa: Int = 44_100) {
    private class Voz(
        val tecla: Int,
        val datos: ShortBuffer,
        val paso: Double,
        var pos: Double,
        var nivel: Float,
        val izq: Float,
        val der: Float,
    ) {
        var objetivo = nivel
        var entrada = 0f // muestras de rampa de entrada restantes
        var soltando = false
        var caida = 1f
        var abajo = true // la tecla sigue apretada
        var sostenida = false // el sostenuto la retiene
        var viva = true
    }

    private val voces = ArrayList<Voz>(MAX_VOCES + 8)
    private val sustain get() = pedalSustain
    private var pedalSustain = false
    private var pedalSostenuto = false
    private var unaCorda = false

    /** Sustain de panel (s), como el botón SUSTAIN del PSR-E343. 0 = apagado. */
    var panelSustain = 0.0
    var volumen = 0.6f

    private fun factorCaida(segundos: Double) = exp(-1.0 / (segundos * tasa)).toFloat()

    fun notaOn(tecla: Int, fuerza: Int, entradaSuave: Boolean = false) {
        // Repetir la tecla apaga rápido la voz anterior, como el macillo que vuelve a golpear.
        for (v in voces) if (v.tecla == tecla && !v.soltando) soltar(v, rapido = true)
        val muestra = Salamander.cercana(tecla)
        val capa = Salamander.capa(fuerza)
        val datos = banco[Salamander.nombre(muestra, capa)] ?: return
        val nivel = Salamander.gananciaCapa(fuerza, capa) * (if (unaCorda) 0.7f else 1f)
        val pan = ((tecla - 64) / 64f).coerceIn(-1f, 1f) * 0.35f
        val v = Voz(tecla, datos, 2.0.pow((tecla - muestra) / 12.0) * FUENTE / tasa, 0.0, nivel, 1f - maxOf(0f, pan), 1f + minOf(0f, pan))
        if (entradaSuave) {
            v.entrada = tasa * 0.012f
            v.nivel = 0f
        }
        while (voces.count { it.viva && !it.soltando } >= MAX_VOCES) {
            voces.firstOrNull { it.viva && !it.soltando }?.let { soltar(it, rapido = true, robo = true) }
        }
        voces += v
    }

    fun notaOff(tecla: Int) {
        for (v in voces) {
            if (v.tecla != tecla || !v.abajo || v.soltando) continue
            v.abajo = false
            if (!pedalSustain && !v.sostenida) soltar(v)
        }
    }

    fun pedal(cc: Int, valor: Int) {
        val abajo = valor >= 64
        when (cc) {
            64 -> {
                pedalSustain = abajo
                if (!abajo) for (v in voces) if (!v.abajo && !v.sostenida && !v.soltando) soltar(v)
            }
            66 -> {
                if (abajo && !pedalSostenuto) for (v in voces) if (v.abajo && !v.soltando) v.sostenida = true
                pedalSostenuto = abajo
                if (!abajo) for (v in voces) {
                    v.sostenida = false
                    if (!v.abajo && !sustain && !v.soltando) soltar(v)
                }
            }
            67 -> unaCorda = abajo
        }
    }

    private fun soltar(v: Voz, rapido: Boolean = false, robo: Boolean = false) {
        v.soltando = true
        val seg = when {
            robo -> 0.008
            rapido || panelSustain <= 0 -> DAMPER / 3
            else -> panelSustain / 4
        }
        v.caida = factorCaida(seg)
    }

    /** Corta todo (pausar, buscar). */
    fun silencio() {
        for (v in voces) soltar(v, robo = true)
        pedalSustain = false
        pedalSostenuto = false
        unaCorda = false
    }

    val sonando get() = voces.size

    /** Suma `frames` cuadros estéreo intercalados en `out` (que ya debe estar en cero). */
    fun render(out: FloatArray, frames: Int, offset: Int = 0) {
        val it = voces.iterator()
        while (it.hasNext()) {
            val v = it.next()
            val n = v.datos.limit()
            var i = 0
            while (i < frames) {
                val p = v.pos
                val k = p.toInt()
                if (k + 1 >= n) { v.viva = false; break }
                val f = (p - k).toFloat()
                val s = (v.datos.get(k) * (1 - f) + v.datos.get(k + 1) * f) / 32768f
                if (v.entrada > 0) {
                    v.nivel += (v.objetivo - v.nivel) / v.entrada
                    v.entrada -= 1f
                }
                if (v.soltando) {
                    v.nivel *= v.caida
                    if (v.nivel < 1e-4f) { v.viva = false; break }
                }
                val x = s * v.nivel * volumen
                val o = (offset + i) * 2
                out[o] += x * v.izq
                out[o + 1] += x * v.der
                v.pos = p + v.paso
                i++
            }
            if (!v.viva) it.remove()
        }
    }

    companion object {
        /** Polifonía máxima, como un piano digital. */
        const val MAX_VOCES = 64
        /** Frecuencia de las muestras guardadas. */
        const val FUENTE = 44_100.0
        /** Caída del apagador (s). */
        const val DAMPER = 0.12
    }
}

/** Limitador suave para que muchas notas con pedal nunca saturen. */
/**
 * Cadena maestra de salida (pedido 32, igual que packages/audio/src/maestro.ts): compresor suave
 * (sobre -20 dB, razón 3), +6 dB y un limitador de picos para que nada recorte. Las muestras
 * vienen intercaladas (estéreo).
 */
class Limitador(tasa: Int = 48_000) {
    private var ganancia = 1f
    private var envolvente = 0f
    private val ataque = kotlin.math.exp(-1.0 / (0.01 * tasa * 2)).toFloat()
    private val suelta = kotlin.math.exp(-1.0 / (0.25 * tasa * 2)).toFloat()

    fun procesar(buf: FloatArray, muestras: Int) {
        for (i in 0 until muestras) {
            val entrada = buf[i]
            val a0 = abs(entrada)
            envolvente = if (a0 > envolvente) ataque * envolvente + (1 - ataque) * a0 else suelta * envolvente + (1 - suelta) * a0
            val comp = if (envolvente > UMBRAL) UMBRAL * (envolvente / UMBRAL).pow(1f / 3f) / envolvente else 1f
            val x = entrada * comp * VOLUMEN_EXTRA * ganancia
            val a = abs(x)
            if (a > 0.9f) ganancia *= 0.9f / a
            else if (ganancia < 1f) ganancia = minOf(1f, ganancia + 0.00002f)
            buf[i] = (entrada * comp * VOLUMEN_EXTRA * ganancia).coerceIn(-1f, 1f)
        }
    }

    private companion object {
        const val UMBRAL = 0.1f // -20 dB
        const val VOLUMEN_EXTRA = 2f // ≈ +6 dB
    }
}
