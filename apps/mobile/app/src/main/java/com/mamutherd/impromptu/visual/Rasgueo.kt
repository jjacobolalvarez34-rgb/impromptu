package com.mamutherd.impromptu.visual

import com.mamutherd.impromptu.datos.Nota

/**
 * Cómo rasguear (fase 11), como packages/render/src/rasgueo.ts: cada acorde de 3 cuerdas o más
 * que suenan casi juntas es un rasgueo, hacia abajo (de la 6.ª a la 1.ª cuerda) o hacia arriba.
 * Si las cuerdas suenan escalonadas, la dirección sale del orden; si suenan a la vez (en el
 * celular la pieza no guarda el tempo), se alterna: tras uno hacia abajo reciente, va arriba.
 */
object Rasgueo {
    data class Golpe(val tiempo: Double, val abajo: Boolean)

    private const val ENTRE = 0.05
    private const val MAXIMO = 0.25
    private const val A_LA_VEZ = 0.008

    fun detectar(notas: List<Nota>): List<Golpe> {
        val con = notas.filter { it.cuerda != null }.sortedBy { it.inicio }
        val salida = ArrayList<Golpe>()
        var i = 0
        while (i < con.size) {
            val inicio = con[i].inicio
            var j = i + 1
            while (j < con.size && con[j].inicio - con[j - 1].inicio <= ENTRE && con[j].inicio - inicio <= MAXIMO) j++
            val grupo = con.subList(i, j)
            i = j
            if (grupo.map { it.cuerda }.toSet().size < 3) continue
            val abajo = if (grupo.last().inicio - inicio > A_LA_VEZ) {
                // Las graves (número de cuerda alto) primero → abajo.
                val mt = grupo.sumOf { it.inicio } / grupo.size
                val mc = grupo.sumOf { it.cuerda!!.toDouble() } / grupo.size
                grupo.sumOf { (it.inicio - mt) * (it.cuerda!! - mc) } <= 0
            } else {
                val previo = salida.lastOrNull()
                !(previo != null && previo.abajo && inicio - previo.tiempo < 0.4)
            }
            salida += Golpe(inicio, abajo)
        }
        return salida
    }
}
