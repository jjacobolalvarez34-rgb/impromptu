package com.mamutherd.impromptu.transcribir

import com.mamutherd.impromptu.datos.Nota
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.log10
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * Batería desde el micrófono o un audio (fase 9): detector propio por bandas (graves, medios y
 * agudos), igual que packages/transcribe/src/bateria.ts. Cada golpe sale como una nota General
 * MIDI (36 bombo, 38 caja, 42/46 hi-hat, 49 crash, 51 ride, 47/50 toms).
 */
object DetectorBateria {
    private const val VENTANA = 1024
    private const val SALTO = 256

    private class Bandas(val graves: DoubleArray, val medios: DoubleArray, val agudos: DoubleArray, val centroide: DoubleArray)

    private fun fft(re: DoubleArray, im: DoubleArray) {
        val n = re.size
        var j = 0
        for (i in 1 until n) {
            var bit = n shr 1
            while (j and bit != 0) { j = j xor bit; bit = bit shr 1 }
            j = j xor bit
            if (i < j) {
                var x = re[i]; re[i] = re[j]; re[j] = x
                x = im[i]; im[i] = im[j]; im[j] = x
            }
        }
        var size = 2
        while (size <= n) {
            val half = size shr 1
            val ang = -2 * PI / size
            var start = 0
            while (start < n) {
                for (k in 0 until half) {
                    val c = cos(ang * k)
                    val s = sin(ang * k)
                    val a = start + k
                    val b = a + half
                    val tr = re[b] * c - im[b] * s
                    val ti = re[b] * s + im[b] * c
                    re[b] = re[a] - tr; im[b] = im[a] - ti
                    re[a] += tr; im[a] += ti
                }
                start += size
            }
            size = size shl 1
        }
    }

    private fun bandas(x: FloatArray, tasa: Int): Bandas {
        val cuadros = max(0, (x.size - VENTANA) / SALTO + 1)
        val g = DoubleArray(cuadros)
        val m = DoubleArray(cuadros)
        val a = DoubleArray(cuadros)
        val cen = DoubleArray(cuadros)
        val hann = DoubleArray(VENTANA) { 0.5 - 0.5 * cos(2 * PI * it / VENTANA) }
        val re = DoubleArray(VENTANA)
        val im = DoubleArray(VENTANA)
        val hz = tasa.toDouble() / VENTANA
        for (c in 0 until cuadros) {
            for (i in 0 until VENTANA) { re[i] = x[c * SALTO + i] * hann[i]; im[i] = 0.0 }
            fft(re, im)
            var sg = 0.0; var sm = 0.0; var sa = 0.0; var suma = 0.0; var pond = 0.0
            for (k in 1 until VENTANA / 2) {
                val p = re[k] * re[k] + im[k] * im[k]
                val f = k * hz
                when {
                    f < 150 -> sg += p
                    f < 2500 -> sm += p
                    else -> sa += p
                }
                suma += p
                pond += p * f
            }
            g[c] = log10(1e-9 + sg); m[c] = log10(1e-9 + sm); a[c] = log10(1e-9 + sa)
            cen[c] = if (suma > 0) pond / suma else 0.0
        }
        return Bandas(g, m, a, cen)
    }

    private class Golpe(val cuadro: Int, val fuerza: Double)

    private fun golpesEnBanda(e: DoubleArray, tasa: Int, sensibilidad: Double): List<Golpe> {
        val n = e.size
        val flujo = DoubleArray(n)
        for (i in 1 until n) flujo[i] = max(0.0, e[i] - e[i - 1]) + max(0.0, (if (i + 1 < n) e[i + 1] else e[i]) - e[i - 1]) * 0.5
        val out = ArrayList<Golpe>()
        val radio = (0.15 * tasa / SALTO).roundToInt()
        val separacion = (0.05 * tasa / SALTO).roundToInt()
        val maximo = flujo.maxOrNull() ?: 0.0
        val piso = (e.maxOrNull() ?: 0.0) - 3
        for (i in 1 until n - 1) {
            val v = flujo[i]
            if (v < flujo[i - 1] || v < flujo[i + 1]) continue
            if (max(e[i], e[i + 1]) < piso) continue
            var suma = 0.0
            var cuenta = 0
            for (j in max(0, i - radio) until min(n, i + radio)) { suma += flujo[j]; cuenta++ }
            val umbral = suma / cuenta * 1.6 + 0.12 * sensibilidad + maximo * 0.06
            if (v < umbral) continue
            val ultimo = out.lastOrNull()
            if (ultimo != null && i - ultimo.cuadro < separacion) {
                if (v > ultimo.fuerza) out[out.lastIndex] = Golpe(i, v)
                continue
            }
            out += Golpe(i, v)
        }
        return out
    }

    private fun caida(e: DoubleArray, desde: Int, tasa: Int): Double {
        val pico = maxOf(e[desde], e.getOrElse(desde + 1) { Double.NEGATIVE_INFINITY }, e.getOrElse(desde + 2) { Double.NEGATIVE_INFINITY })
        var i = desde
        while (i < e.size && e[i] > pico - 1.2) i++
        return (i - desde) * SALTO.toDouble() / tasa
    }

    /** Golpes de un audio mono, como notas General MIDI. */
    fun detectar(x: FloatArray, tasa: Int, sensibilidad: Double = 1.0): List<Nota> {
        val b = bandas(x, tasa)
        val t = { c: Int -> (c * SALTO + VENTANA / 4).toDouble() / tasa }
        val g = golpesEnBanda(b.graves, tasa, sensibilidad)
        val m = golpesEnBanda(b.medios, tasa, sensibilidad)
        val a = golpesEnBanda(b.agudos, tasa, sensibilidad)
        val maxG = g.maxOfOrNull { it.fuerza } ?: 0.0
        val maxM = m.maxOfOrNull { it.fuerza } ?: 0.0
        val maxA = a.maxOfOrNull { it.fuerza } ?: 0.0
        fun fuerza(f: Double, mx: Double) = (30 + 97 * f / max(1e-6, mx)).roundToInt().coerceIn(20, 127)
        fun cerca(lista: List<Golpe>, c: Int, r: Int = 3) = lista.any { abs(it.cuadro - c) <= r }
        fun pico(e: DoubleArray, c: Int) = maxOf(e[c], e.getOrElse(c + 1) { Double.NEGATIVE_INFINITY }, e.getOrElse(c + 2) { Double.NEGATIVE_INFINITY })
        val out = ArrayList<Nota>()
        fun golpe(nota: Int, c: Int, f: Int) { out += Nota(nota, t(c), t(c) + 0.1, f) }
        for (o in g) {
            if (pico(b.medios, o.cuadro) > pico(b.graves, o.cuadro) + 0.3) continue
            golpe(36, o.cuadro, fuerza(o.fuerza, maxG))
        }
        for (o in m) {
            if (cerca(g, o.cuadro) && pico(b.medios, o.cuadro) < pico(b.graves, o.cuadro)) continue
            if (pico(b.agudos, o.cuadro) > pico(b.medios, o.cuadro) + 0.5) continue
            val brillante = cerca(a, o.cuadro) && pico(b.agudos, o.cuadro) > pico(b.medios, o.cuadro) - 1.5
            golpe(if (brillante) 38 else if (b.centroide[o.cuadro] > 400) 50 else 47, o.cuadro, fuerza(o.fuerza, maxM))
        }
        for (o in a) {
            if (cerca(m, o.cuadro, 2) && pico(b.agudos, o.cuadro) < pico(b.medios, o.cuadro) + 0.5) continue
            val dura = caida(b.agudos, o.cuadro, tasa)
            val nota = if (dura < 0.12) 42 else if (dura < 0.45) 46 else if (o.fuerza > maxA * 0.6) 49 else 51
            golpe(nota, o.cuadro, fuerza(o.fuerza, maxA))
        }
        return out.sortedWith(compareBy({ it.inicio }, { it.tecla }))
    }
}
