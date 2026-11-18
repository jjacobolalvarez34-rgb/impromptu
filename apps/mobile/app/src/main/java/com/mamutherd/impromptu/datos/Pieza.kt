package com.mamutherd.impromptu.datos

import org.json.JSONArray
import org.json.JSONObject

/**
 * Modelo de datos de la app (docs/ARQUITECTURA.md): todo en segundos sobre un mismo reloj.
 * Mano, dedo e instrumento se guardan desde el día 1 aunque la V1 no los muestre.
 */
data class Nota(
    val tecla: Int,
    val inicio: Double,
    val fin: Double,
    val fuerza: Int,
    val mano: String? = null,
    val dedo: Int? = null,
)

enum class TipoPedal(val cc: Int, val clave: String) {
    Sustain(64, "sustain"),
    Sostenuto(66, "sostenuto"),
    UnaCorda(67, "soft");

    companion object {
        fun deCc(cc: Int) = entries.firstOrNull { it.cc == cc }
        fun deClave(c: String) = entries.firstOrNull { it.clave == c } ?: Sustain
    }
}

data class Pedal(val tipo: TipoPedal, val tiempo: Double, val valor: Int) {
    val abajo get() = valor >= 64
}

enum class Origen(val clave: String, val texto: String) {
    Teclado("teclado", "Teclado"),
    Microfono("microfono", "Micrófono"),
    Audio("audio", "Audio"),
    Midi("midi", "MIDI");

    companion object {
        fun deClave(c: String) = entries.firstOrNull { it.clave == c } ?: Midi
    }
}

data class Pieza(
    val id: String,
    val titulo: String,
    val creada: Long,
    val origen: Origen,
    val notas: List<Nota>,
    val pedales: List<Pedal>,
    val instrumento: String = "piano",
) {
    /** Fin de la última nota o pedal. */
    val duracion: Double =
        maxOf(notas.maxOfOrNull { it.fin } ?: 0.0, pedales.maxOfOrNull { it.tiempo } ?: 0.0)

    /** Rango de teclas a mostrar: el de la pieza, ampliado a un teclado razonable. */
    fun rango(): IntRange {
        if (notas.isEmpty()) return 36..96
        var bajo = notas.minOf { it.tecla }
        var alto = notas.maxOf { it.tecla }
        // Al menos 3 octavas, empezando y terminando en tecla blanca.
        while (alto - bajo < 36) {
            if (bajo > 21) bajo--
            if (alto < 108) alto++
        }
        while (esNegra(bajo) && bajo > 21) bajo--
        while (esNegra(alto) && alto < 108) alto++
        return bajo..alto
    }

    fun aJson(): JSONObject = JSONObject().apply {
        put("version", 1)
        put("id", id)
        put("titulo", titulo)
        put("creada", creada)
        put("origen", origen.clave)
        put("instrumento", instrumento)
        put("notas", JSONArray().apply {
            for (n in notas) put(JSONObject().apply {
                put("tecla", n.tecla)
                put("inicio", n.inicio)
                put("fin", n.fin)
                put("fuerza", n.fuerza)
                n.mano?.let { put("mano", it) }
                n.dedo?.let { put("dedo", it) }
            })
        })
        put("pedales", JSONArray().apply {
            for (p in pedales) put(JSONObject().apply {
                put("tipo", p.tipo.clave)
                put("tiempo", p.tiempo)
                put("valor", p.valor)
            })
        })
    }

    /** Formato que entiende el paquete de notación de la web (Take simplificada). */
    fun aJsonWeb(): JSONObject = JSONObject().apply {
        put("title", titulo)
        put("duration", duracion)
        put("notes", JSONArray().apply {
            for (n in notas) put(JSONObject().apply {
                put("pitch", n.tecla)
                put("start", n.inicio)
                put("end", n.fin)
                put("velocity", n.fuerza)
            })
        })
        put("pedals", JSONArray().apply {
            for (p in pedales) put(JSONObject().apply {
                put("kind", p.tipo.clave)
                put("time", p.tiempo)
                put("value", p.valor)
            })
        })
    }

    companion object {
        fun deJson(o: JSONObject): Pieza {
            val ns = o.getJSONArray("notas")
            val ps = o.getJSONArray("pedales")
            return Pieza(
                id = o.getString("id"),
                titulo = o.getString("titulo"),
                creada = o.getLong("creada"),
                origen = Origen.deClave(o.optString("origen")),
                instrumento = o.optString("instrumento", "piano"),
                notas = List(ns.length()) { i ->
                    val n = ns.getJSONObject(i)
                    Nota(
                        tecla = n.getInt("tecla"),
                        inicio = n.getDouble("inicio"),
                        fin = n.getDouble("fin"),
                        fuerza = n.getInt("fuerza"),
                        mano = if (n.has("mano")) n.getString("mano") else null,
                        dedo = if (n.has("dedo")) n.getInt("dedo") else null,
                    )
                },
                pedales = List(ps.length()) { i ->
                    val p = ps.getJSONObject(i)
                    Pedal(TipoPedal.deClave(p.getString("tipo")), p.getDouble("tiempo"), p.getInt("valor"))
                },
            )
        }
    }
}

private val NEGRAS = setOf(1, 3, 6, 8, 10)
fun esNegra(tecla: Int) = (tecla % 12) in NEGRAS

private val NOMBRES = arrayOf("Do", "Do♯", "Re", "Mi♭", "Mi", "Fa", "Fa♯", "Sol", "La♭", "La", "Si♭", "Si")
fun nombreTecla(tecla: Int) = "${NOMBRES[tecla % 12]}${tecla / 12 - 1}"

/** "1:05" */
fun formatoTiempo(seg: Double): String {
    val s = seg.coerceAtLeast(0.0).toInt()
    return "%d:%02d".format(s / 60, s % 60)
}
