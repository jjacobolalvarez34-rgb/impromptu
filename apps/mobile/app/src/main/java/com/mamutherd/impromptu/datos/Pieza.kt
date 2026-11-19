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
    /** Guitarra y bajo (fase 9): cuerda (1 la más aguda) y traste. */
    val cuerda: Int? = null,
    val traste: Int? = null,
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
    val instr get() = com.mamutherd.impromptu.instrumentos.Instrumento.deClave(instrumento)

    /** Fin de la última nota o pedal. */
    val duracion: Double =
        maxOf(notas.maxOfOrNull { it.fin } ?: 0.0, pedales.maxOfOrNull { it.tiempo } ?: 0.0)

    /**
     * Rango de teclas a mostrar: el piano completo de 88 teclas (La0 a Do8), como pidió Jacobo
     * (2026-11-18). Si alguna nota se sale (no pasa en un piano real), se amplía.
     */
    fun rango(): IntRange {
        val bajo = minOf(21, notas.minOfOrNull { it.tecla } ?: 21)
        val alto = maxOf(108, notas.maxOfOrNull { it.tecla } ?: 108)
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
                n.cuerda?.let { put("cuerda", it) }
                n.traste?.let { put("traste", it) }
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
        put("instrument", instrumento)
        put("duration", duracion)
        put("notes", JSONArray().apply {
            for (n in notas) put(JSONObject().apply {
                put("pitch", n.tecla)
                put("start", n.inicio)
                put("end", n.fin)
                put("velocity", n.fuerza)
                n.cuerda?.let { put("string", it) }
                n.traste?.let { put("fret", it) }
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
                        cuerda = if (n.has("cuerda")) n.getInt("cuerda") else null,
                        traste = if (n.has("traste")) n.getInt("traste") else null,
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
