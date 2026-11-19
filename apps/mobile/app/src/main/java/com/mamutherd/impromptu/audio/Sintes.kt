package com.mamutherd.impromptu.audio

import com.mamutherd.impromptu.instrumentos.Bateria
import com.mamutherd.impromptu.instrumentos.Instrumento
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.pow

/**
 * Guitarra, bajo y batería (fase 9), igual que packages/audio/src/sintes.ts: la cuerda con
 * Karplus-Strong (sin descargas ni licencias) y la batería con grabaciones de Sonic Pi (CC0),
 * golpe suave o fuerte según la fuerza. No es seguro entre hilos: lo usa el hilo de audio (o el
 * de exportar), como el Sampler.
 */
class Sintes(val tasa: Int, private val bateria: Map<String, FloatArray> = emptyMap()) {
    enum class Timbre { Nylon, Acero, Electrica, Bajo }

    private class Voz(val datos: FloatArray, val nivel: Float, val tecla: Int, val bateria: Boolean) {
        var pos = 0
        var g = nivel
        var soltando = false
        var caida = 1f
        var viva = true
    }

    private val voces = ArrayList<Voz>()
    private val cache = HashMap<String, FloatArray>()
    var timbreGuitarra = Timbre.Acero
    var volumen = 0.8f

    /** Cuerda pulsada (Karplus-Strong con retardo fraccionario), como `cuerda` de la web. */
    fun cuerda(tecla: Int, fuerza: Int, timbre: Timbre): FloatArray {
        val clave = "$timbre:$tecla:$fuerza"
        cache[clave]?.let { return it }
        val f = 440.0 * 2.0.pow((tecla - 69) / 12.0)
        val graves = ((64 - tecla) / 30.0).coerceIn(0.0, 1.0)
        val base = when (timbre) { Timbre.Nylon -> 2.2; Timbre.Acero -> 3.0; Timbre.Electrica -> 4.0; Timbre.Bajo -> 3.5 }
        val seg = base * (0.7 + 0.6 * graves)
        val n = ceil(seg * tasa).toInt()
        val out = FloatArray(n)
        val retardo = tasa / f - 0.5
        val inicio = ceil(retardo).toInt() + 1
        val brillo = 0.25 + 0.75 * (fuerza / 127.0)
        var semilla = (tecla * 131 + fuerza).let { if (it == 0) 1 else it }
        fun azar(): Double {
            semilla = semilla xor (semilla shl 13)
            semilla = semilla xor (semilla ushr 17)
            semilla = semilla xor (semilla shl 5)
            return (semilla.toLong() and 0xFFFFFFFFL).toDouble() / 4294967296.0 * 2 - 1
        }
        val suave = when (timbre) { Timbre.Nylon -> 0.55; Timbre.Acero -> 0.8; Timbre.Electrica -> 0.7; Timbre.Bajo -> 0.35 } * brillo
        var previo = 0.0
        for (i in 0 until minOf(inicio, n)) {
            previo += suave * (azar() - previo)
            out[i] = previo.toFloat()
        }
        val caida = 0.001.pow(1.0 / maxOf(1.0, seg * f))
        fun leer(p: Double): Double {
            val k = floor(p).toInt()
            val fr = p - k
            return out[k] * (1 - fr) + out[k + 1] * fr
        }
        for (i in inicio until n) {
            val d = i - retardo
            out[i] = (caida * 0.5 * (leer(d) + leer(d - 1))).toFloat()
        }
        val corte = when (timbre) { Timbre.Nylon -> 0.35f; Timbre.Acero -> 0.55f; Timbre.Electrica -> 0.6f; Timbre.Bajo -> 0.25f }
        var lp = 0f
        val nivel = 0.5f * (0.35f + 0.65f * (fuerza / 127f))
        for (i in 0 until n) {
            lp += corte * (out[i] - lp)
            val entrada = minOf(1f, i / (tasa * 0.002f))
            val salida = minOf(1f, (n - i) / (tasa * 0.05f))
            out[i] = lp * nivel * entrada * salida
        }
        cache[clave] = out
        return out
    }

    fun notaOn(instrumento: Instrumento, tecla: Int, fuerza: Int) {
        if (instrumento == Instrumento.Bateria) {
            val (fuerte, suave) = Bateria.MUESTRAS[tecla] ?: return
            val datos = muestra(if (fuerza < 64 && suave != null) suave else fuerte) ?: return
            if (tecla == 42 || tecla == 44) {
                // El hi-hat cerrado (o el pie) calla al abierto.
                for (v in voces) if (v.bateria && v.tecla == Bateria.HIHAT_ABIERTO) { v.soltando = true; v.caida = factor(0.015) }
            }
            voces += Voz(datos, (0.35f + 0.65f * fuerza / 127f) * 1.4f, tecla, true)
            return
        }
        for (v in voces) if (!v.bateria && v.tecla == tecla && !v.soltando) { v.soltando = true; v.caida = factor(0.03) }
        val fuerzaGrupo = ((fuerza / 16.0).toInt() * 16).coerceIn(8, 127)
        val timbre = if (instrumento == Instrumento.Bajo) Timbre.Bajo else timbreGuitarra
        voces += Voz(cuerda(tecla, fuerzaGrupo, timbre), 1f, tecla, false)
    }

    /** Soltar una cuerda la apaga rápido; la batería suena entera. */
    fun notaOff(tecla: Int) {
        for (v in voces) if (!v.bateria && v.tecla == tecla && !v.soltando) { v.soltando = true; v.caida = factor(0.04) }
    }

    fun silencio() {
        for (v in voces) { v.soltando = true; v.caida = factor(0.008) }
    }

    /** Grabación a la frecuencia de salida (vienen a 44,1 kHz; se convierten una vez). */
    private fun muestra(nombre: String): FloatArray? {
        cache["bateria:$nombre"]?.let { return it }
        val x = bateria[nombre] ?: return null
        return Decodificar.remuestrear(x, 44_100, tasa).also { cache["bateria:$nombre"] = it }
    }

    private fun factor(tau: Double) = kotlin.math.exp(-1.0 / (tau * tasa)).toFloat()

    /** Suma `frames` cuadros estéreo en `out` (que ya trae el piano). */
    fun render(out: FloatArray, frames: Int, offset: Int = 0) {
        val it = voces.iterator()
        while (it.hasNext()) {
            val v = it.next()
            var i = 0
            while (i < frames) {
                if (v.pos >= v.datos.size) { v.viva = false; break }
                if (v.soltando) {
                    v.g *= v.caida
                    if (v.g < 1e-4f) { v.viva = false; break }
                }
                val x = v.datos[v.pos] * v.g * volumen
                val o = (offset + i) * 2
                out[o] += x
                out[o + 1] += x
                v.pos++
                i++
            }
            if (!v.viva) it.remove()
        }
    }
}
