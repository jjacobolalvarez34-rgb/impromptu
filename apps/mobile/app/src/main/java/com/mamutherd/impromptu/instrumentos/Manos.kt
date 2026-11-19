package com.mamutherd.impromptu.instrumentos

import com.mamutherd.impromptu.datos.Nota
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.round

/**
 * Qué mano toca cada nota del piano (pedido 36), igual que packages/practice/src/hands.ts:
 * búsqueda en haz que compara caminos completos; cuenta las notas que cada mano sigue
 * sosteniendo, abarata los saltos tras un silencio y mantiene una línea melódica en una mano.
 * Las notas con mano ya puesta se respetan.
 */
object Manos {
    private const val ACORDE = 0.035
    private const val HAZ = 24
    private const val APERTURA = 14
    private const val CORTE = 60

    private class Estado(
        val izq: Double,
        val der: Double,
        val tIzq: Double,
        val tDer: Double,
        val sostIzq: List<Nota>,
        val sostDer: List<Nota>,
        val linea: Pair<Int, String>?,
        val costo: Double,
        val corte: Int,
        val previo: Estado?,
    )

    fun separar(notas: List<Nota>): List<Nota> {
        if (notas.isEmpty()) return notas
        val ordenadas = notas.sortedWith(compareBy({ it.inicio }, { it.tecla }))
        val acordes = ArrayList<List<Nota>>()
        var i = 0
        while (i < ordenadas.size) {
            var j = i + 1
            while (j < ordenadas.size && ordenadas[j].inicio - ordenadas[i].inicio < ACORDE) j++
            acordes += ordenadas.subList(i, j).sortedBy { it.tecla }
            i = j
        }
        var haz = listOf(Estado(CORTE - 12.0, CORTE + 7.0, Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY, emptyList(), emptyList(), null, 0.0, 0, null))
        for (acorde in acordes) {
            val t = acorde[0].inicio
            val siguientes = ArrayList<Estado>()
            for (e in haz) {
                val sostI = e.sostIzq.filter { it.fin > t + 0.02 }
                val sostD = e.sostDer.filter { it.fin > t + 0.02 }
                for (cut in 0..acorde.size) {
                    val bajas = acorde.subList(0, cut)
                    val altas = acorde.subList(cut, acorde.size)
                    // Respetar las manos ya puestas.
                    if (acorde.withIndex().any { (k, n) -> n.mano != null && n.mano != (if (k < cut) "L" else "R") }) continue
                    var costo = 0.0
                    if (bajas.isNotEmpty()) {
                        val libre = 1 / (1 + max(0.0, t - e.tIzq) / 0.6)
                        costo += abs((bajas.first().tecla + bajas.last().tecla) / 2.0 - e.izq) * (0.15 + 0.2 * libre)
                        costo += max(0, alcance(bajas, sostI) - APERTURA) * 3.0
                        costo += max(0, bajas.last().tecla - CORTE - 5) * 0.25
                    }
                    if (altas.isNotEmpty()) {
                        val libre = 1 / (1 + max(0.0, t - e.tDer) / 0.6)
                        costo += abs((altas.first().tecla + altas.last().tecla) / 2.0 - e.der) * (0.15 + 0.2 * libre)
                        costo += max(0, alcance(altas, sostD) - APERTURA) * 3.0
                        costo += max(0, CORTE - 5 - altas.first().tecla) * 0.25
                    }
                    val suelta = if (acorde.size == 1) acorde[0] else null
                    val manoSuelta = if (cut == 1) "L" else "R"
                    if (suelta != null && e.linea != null && abs(suelta.tecla - e.linea.first) <= 4 && manoSuelta != e.linea.second) costo += 4.0
                    if (bajas.isNotEmpty() && altas.isEmpty()) costo += max(0.0, bajas.last().tecla - e.der) * 0.6
                    if (altas.isNotEmpty() && bajas.isEmpty()) costo += max(0.0, e.izq - altas.first().tecla) * 0.6
                    siguientes += Estado(
                        izq = if (bajas.isNotEmpty()) e.izq * 0.6 + bajas.map { it.tecla }.average() * 0.4 else e.izq,
                        der = if (altas.isNotEmpty()) e.der * 0.6 + altas.map { it.tecla }.average() * 0.4 else e.der,
                        tIzq = if (bajas.isNotEmpty()) t else e.tIzq,
                        tDer = if (altas.isNotEmpty()) t else e.tDer,
                        sostIzq = if (bajas.isNotEmpty()) sostI + bajas else sostI,
                        sostDer = if (altas.isNotEmpty()) sostD + altas else sostD,
                        linea = suelta?.let { it.tecla to manoSuelta },
                        costo = e.costo + costo,
                        corte = cut,
                        previo = e,
                    )
                }
            }
            siguientes.sortBy { it.costo }
            val vistos = HashSet<String>()
            val nuevo = ArrayList<Estado>()
            for (e in siguientes) {
                if (!vistos.add("${round(e.izq)}:${round(e.der)}:${e.sostIzq.size}:${e.sostDer.size}")) continue
                nuevo += e
                if (nuevo.size >= HAZ) break
            }
            if (nuevo.isNotEmpty()) haz = nuevo
        }
        val cortes = ArrayList<Int>()
        var e: Estado? = haz.first()
        while (e?.previo != null) { cortes += e.corte; e = e.previo }
        cortes.reverse()
        val manos = HashMap<Nota, String>()
        acordes.forEachIndexed { k, acorde ->
            val cut = cortes.getOrElse(k) { 0 }
            acorde.forEachIndexed { idx, n -> manos[n] = n.mano ?: if (idx < cut) "L" else "R" }
        }
        return notas.map { n -> manos[n]?.let { n.copy(mano = it) } ?: n }
    }

    private fun alcance(nuevas: List<Nota>, sostenidas: List<Nota>): Int {
        var lo = Int.MAX_VALUE
        var hi = Int.MIN_VALUE
        for (n in nuevas) { lo = minOf(lo, n.tecla); hi = maxOf(hi, n.tecla) }
        for (n in sostenidas) { lo = minOf(lo, n.tecla); hi = maxOf(hi, n.tecla) }
        return hi - lo
    }
}
