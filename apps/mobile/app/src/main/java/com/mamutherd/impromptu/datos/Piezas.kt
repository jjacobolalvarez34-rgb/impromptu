package com.mamutherd.impromptu.datos

import android.content.Context
import androidx.compose.runtime.mutableStateListOf
import org.json.JSONObject
import java.io.File
import java.util.UUID

/**
 * Las piezas guardadas, una por archivo JSON en la memoria interna de la app. La lista es un
 * estado de Compose: las pantallas se actualizan solas al guardar o borrar.
 */
class Piezas(context: Context) {
    private val carpeta = File(context.filesDir, "piezas").apply { mkdirs() }
    private val prefs = context.getSharedPreferences("piezas", Context.MODE_PRIVATE)

    val lista = mutableStateListOf<Pieza>()

    init {
        val leidas = carpeta.listFiles { f -> f.extension == "json" }.orEmpty().mapNotNull { f ->
            runCatching { Pieza.deJson(JSONObject(f.readText())) }.getOrNull()
        }
        lista.addAll(leidas.sortedByDescending { it.creada })
    }

    fun buscar(id: String) = lista.firstOrNull { it.id == id }

    fun guardar(pieza: Pieza) {
        val tmp = File(carpeta, "${pieza.id}.json.tmp")
        tmp.writeText(pieza.aJson().toString())
        tmp.renameTo(File(carpeta, "${pieza.id}.json"))
        val i = lista.indexOfFirst { it.id == pieza.id }
        if (i >= 0) lista[i] = pieza else lista.add(0, pieza)
    }

    fun borrar(id: String) {
        File(carpeta, "$id.json").delete()
        lista.removeAll { it.id == id }
    }

    fun renombrar(id: String, titulo: String) {
        val p = buscar(id) ?: return
        guardar(p.copy(titulo = titulo.trim().ifEmpty { p.titulo }))
    }

    /** "Grabación 3", "Micrófono 2"…: numeración propia de cada origen. */
    fun siguienteTitulo(base: String): String {
        val n = prefs.getInt(base, 0) + 1
        prefs.edit().putInt(base, n).apply()
        return "$base $n"
    }

    fun nueva(titulo: String, origen: Origen, notas: List<Nota>, pedales: List<Pedal>, instrumento: String = "piano") = Pieza(
        id = UUID.randomUUID().toString(),
        titulo = titulo,
        creada = System.currentTimeMillis(),
        origen = origen,
        notas = notas.sortedWith(compareBy({ it.inicio }, { it.tecla })),
        pedales = pedales.sortedBy { it.tiempo },
        instrumento = instrumento,
    )
}
