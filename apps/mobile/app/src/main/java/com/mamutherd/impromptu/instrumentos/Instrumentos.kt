package com.mamutherd.impromptu.instrumentos

import com.mamutherd.impromptu.datos.Nota
import kotlin.math.abs

/** Instrumentos de la app (fase 9). La clave es la misma de la web (Track.instrument). */
enum class Instrumento(val clave: String, val texto: String) {
    Piano("piano", "Piano"),
    Guitarra("guitar", "Guitarra"),
    Bajo("bass", "Bajo"),
    Bateria("drums", "Batería");

    val cuerdas get() = this == Guitarra || this == Bajo

    companion object {
        fun deClave(c: String?) = entries.firstOrNull { it.clave == c } ?: Piano
    }
}

/**
 * Guitarra y bajo: afinaciones y cuerda y traste para cada nota. Mismo cálculo que
 * packages/core/src/guitar.ts: programación dinámica con la mano como estado (cubre 4 trastes;
 * solo cuesta cambiar de posición). Cuerda 1 = la más aguda.
 */
object Guitarra {
    val ESTANDAR = intArrayOf(64, 59, 55, 50, 45, 40)
    val DROP_D = intArrayOf(64, 59, 55, 50, 45, 38)
    val MEDIO_TONO = intArrayOf(63, 58, 54, 49, 44, 39)
    val BAJO = intArrayOf(43, 38, 33, 28)
    const val TRASTES = 22
    private const val ALCANCE = 3

    data class Posicion(val cuerda: Int, val traste: Int)

    fun afinacion(instrumento: Instrumento, nombre: String = "estandar") = when {
        instrumento == Instrumento.Bajo -> BAJO
        nombre == "drop-d" -> DROP_D
        nombre == "medio-tono-abajo" -> MEDIO_TONO
        else -> ESTANDAR
    }

    fun posiciones(tecla: Int, afinacion: IntArray = ESTANDAR): List<Posicion> =
        afinacion.withIndex().mapNotNull { (i, aire) ->
            val t = tecla - aire
            if (t in 0..TRASTES) Posicion(i + 1, t) else null
        }

    private class Forma(val pos: List<Posicion?>, val costo: Double, val pisados: List<Int>)

    private fun formas(grupo: List<Nota>, afinacion: IntArray, max: Int = 40): List<Forma> {
        val opciones = grupo.map { posiciones(it.tecla, afinacion) }
        val out = ArrayList<Forma>()
        val actual = ArrayList<Posicion?>()
        val usadas = HashSet<Int>()
        fun recorrer(i: Int) {
            if (out.size > 4000) return
            if (i == grupo.size) {
                val pisados = actual.filterNotNull().filter { it.traste > 0 }.map { it.traste }
                val sinLugar = actual.count { it == null }
                val abertura = if (pisados.isEmpty()) 0 else pisados.max() - pisados.min()
                val alto = if (pisados.isEmpty()) 0.0 else pisados.average()
                val costo = sinLugar * 100.0 + (if (abertura > ALCANCE) (abertura - ALCANCE) * 20.0 else 0.0) +
                    alto * 0.2 - actual.count { it?.traste == 0 } * 0.5
                out += Forma(ArrayList(actual), costo, pisados)
                return
            }
            var alguna = false
            for (p in opciones[i]) {
                if (p.cuerda in usadas) continue
                alguna = true
                usadas += p.cuerda
                actual += p
                recorrer(i + 1)
                actual.removeAt(actual.lastIndex)
                usadas -= p.cuerda
            }
            if (!alguna) {
                actual += null
                recorrer(i + 1)
                actual.removeAt(actual.lastIndex)
            }
        }
        recorrer(0)
        return out.sortedBy { it.costo }.take(max)
    }

    private fun manosPara(f: Forma): List<Int> {
        if (f.pisados.isEmpty()) return listOf(-1)
        val lo = maxOf(1, f.pisados.max() - ALCANCE)
        val hi = maxOf(1, f.pisados.min())
        return (lo..maxOf(lo, hi)).toList()
    }

    /** Notas que suenan juntas (inicio a menos de 35 ms), hasta 6. */
    private fun agrupar(notas: List<Nota>): List<List<Int>> {
        val orden = notas.indices.sortedWith(compareBy({ notas[it].inicio }, { notas[it].tecla }))
        val grupos = ArrayList<ArrayList<Int>>()
        for (i in orden) {
            val g = grupos.lastOrNull()
            if (g != null && notas[i].inicio - notas[g[0]].inicio < 0.035 && g.size < 6) g += i else grupos += arrayListOf(i)
        }
        return grupos
    }

    /** Devuelve las notas con cuerda y traste (las que ya los tenían se respetan). */
    fun asignar(notas: List<Nota>, afinacion: IntArray = ESTANDAR): List<Nota> {
        if (notas.isEmpty()) return notas
        val grupos = agrupar(notas)
        val candidatos = grupos.map { g ->
            val ns = g.map { notas[it] }
            if (ns.all { it.cuerda != null && it.traste != null }) {
                val pos = ns.map { Posicion(it.cuerda!!, it.traste!!) }
                listOf(Forma(pos, 0.0, pos.filter { it.traste > 0 }.map { it.traste }))
            } else formas(ns, afinacion)
        }
        data class Estado(val forma: Int, val mano: Int, val costo: Double, val previo: Int)
        val capas = ArrayList<List<Estado>>()
        capas += candidatos[0].flatMapIndexed { k, f -> manosPara(f).map { h -> Estado(k, h, f.costo, -1) } }
        for (i in 1 until grupos.size) {
            val anterior = capas[i - 1]
            val capa = ArrayList<Estado>()
            candidatos[i].forEachIndexed { k, f ->
                for (h in manosPara(f)) {
                    var mejor = Double.MAX_VALUE
                    var de = 0
                    var mano = h
                    anterior.forEachIndexed { j, e ->
                        val m = if (h == -1) e.mano else h
                        val mover = if (e.mano == -1 || m == -1) 0.0 else abs(e.mano - m) * 2.0
                        val v = e.costo + f.costo + mover
                        if (v < mejor) { mejor = v; de = j; mano = m }
                    }
                    capa += Estado(k, mano, mejor, de)
                }
            }
            capas += capa
        }
        var j = capas.last().indices.minBy { capas.last()[it].costo }
        val elegidas = arrayOfNulls<Forma>(grupos.size)
        for (i in grupos.indices.reversed()) {
            val e = capas[i][j]
            elegidas[i] = candidatos[i][e.forma]
            j = e.previo
        }
        val out = notas.toMutableList()
        grupos.forEachIndexed { gi, g ->
            g.forEachIndexed { k, idx ->
                val p = elegidas[gi]!!.pos.getOrNull(k)
                if (p != null) out[idx] = out[idx].copy(cuerda = p.cuerda, traste = p.traste)
            }
        }
        return out
    }
}

/** Batería: piezas del kit con su nota General MIDI (canal 10). Mismo cuadro que packages/core/src/drums.ts. */
object Bateria {
    data class Pieza(val id: String, val nombre: String, val nota: Int, val otras: IntArray, val color: Long)

    val PIEZAS = listOf(
        Pieza("hihat-pie", "Hi-hat (pie)", 44, intArrayOf(), 0xFF9A968C),
        Pieza("bombo", "Bombo", 36, intArrayOf(35), 0xFFFF9F1C),
        Pieza("tom-piso", "Tom de piso", 43, intArrayOf(41), 0xFFC58BFF),
        Pieza("caja", "Caja", 38, intArrayOf(37, 39, 40), 0xFFE8E4DC),
        Pieza("tom-medio", "Tom medio", 47, intArrayOf(45), 0xFF6FA8FF),
        Pieza("tom-agudo", "Tom agudo", 50, intArrayOf(48), 0xFF7FD1B9),
        Pieza("hihat", "Hi-hat", 42, intArrayOf(46), 0xFFFFD27A),
        Pieza("ride", "Ride", 51, intArrayOf(53, 59), 0xFFF2C14E),
        Pieza("crash", "Crash", 49, intArrayOf(52, 55, 57), 0xFFFF6B3D),
    )
    const val HIHAT_ABIERTO = 46

    private val porNota = HashMap<Int, Int>().apply {
        PIEZAS.forEachIndexed { i, p -> put(p.nota, i); for (n in p.otras) put(n, i) }
    }

    /** Carril (índice en PIEZAS) de una nota General MIDI, o -1. */
    fun carril(nota: Int) = porNota[nota] ?: -1

    /**
     * Grabaciones (Sonic Pi, CC0) por nota: la fuerte y, si hay, la suave. Mismo cuadro que
     * packages/audio/src/sintes.ts.
     */
    val MUESTRAS: Map<Int, Pair<String, String?>> = mapOf(
        35 to ("drum_bass_hard" to "drum_bass_soft"), 36 to ("drum_bass_hard" to "drum_bass_soft"),
        37 to ("drum_snare_soft" to null), 38 to ("drum_snare_hard" to "drum_snare_soft"),
        39 to ("drum_snare_hard" to null), 40 to ("drum_snare_hard" to "drum_snare_soft"),
        41 to ("drum_tom_lo_hard" to "drum_tom_lo_soft"), 43 to ("drum_tom_lo_hard" to "drum_tom_lo_soft"),
        42 to ("drum_cymbal_closed" to null), 44 to ("drum_cymbal_pedal" to null),
        45 to ("drum_tom_mid_hard" to "drum_tom_mid_soft"), 46 to ("drum_cymbal_open" to null),
        47 to ("drum_tom_mid_hard" to "drum_tom_mid_soft"), 48 to ("drum_tom_hi_hard" to "drum_tom_hi_soft"),
        49 to ("drum_cymbal_hard" to null), 50 to ("drum_tom_hi_hard" to "drum_tom_hi_soft"),
        51 to ("drum_cymbal_soft" to null), 52 to ("drum_cymbal_hard" to null), 53 to ("drum_cymbal_soft" to null),
        55 to ("drum_splash_hard" to null), 56 to ("drum_cowbell" to null), 57 to ("drum_cymbal_hard" to null),
        59 to ("drum_cymbal_soft" to null),
    )
}
