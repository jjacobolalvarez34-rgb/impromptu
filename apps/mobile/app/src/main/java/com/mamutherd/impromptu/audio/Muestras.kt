package com.mamutherd.impromptu.audio

import android.content.Context
import com.mamutherd.impromptu.instrumentos.Instrumento
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.pow

/**
 * Sonidos grabados de guitarra, bajo y batería (pedido 25), con las mismas reglas que
 * packages/audio/src/muestras.ts: bancos libres de FreePats y MuldjordKit armados con
 * scripts/muestras.mjs y copiados a los assets (`instrumentos/<banco>/`).
 */
object Muestras {
    data class Zona(val nota: Int, val hastaFuerza: Int, val archivo: String)
    data class Capa(val hastaFuerza: Int, val archivos: List<String>)

    class Manifiesto(
        val nombre: String,
        val ganancia: Float,
        val zonas: List<Zona>,
        val piezas: Map<Int, List<Capa>>,
    ) {
        /** Todos los archivos del banco (para decodificarlos). */
        val archivos: List<String> get() = (zonas.map { it.archivo } + piezas.values.flatten().flatMap { it.archivos }).distinct()

        companion object {
            fun leer(json: String): Manifiesto {
                val o = JSONObject(json)
                val zonas = o.optJSONArray("zonas")?.let { a ->
                    List(a.length()) { i ->
                        val z = a.getJSONObject(i)
                        Zona(z.getInt("nota"), z.getInt("hastaFuerza"), z.getString("archivo"))
                    }
                }.orEmpty()
                val piezas = HashMap<Int, List<Capa>>()
                o.optJSONObject("piezas")?.let { p ->
                    for (k in p.keys()) {
                        val capas = p.getJSONArray(k)
                        piezas[k.toInt()] = List(capas.length()) { i ->
                            val c = capas.getJSONObject(i)
                            val archivos = c.getJSONArray("archivos")
                            Capa(c.getInt("hastaFuerza"), List(archivos.length()) { j -> archivos.getString(j) })
                        }
                    }
                }
                return Manifiesto(o.getString("nombre"), o.getDouble("ganancia").toFloat(), zonas, piezas)
            }
        }
    }

    /** El banco de un instrumento (la guitarra, según el timbre elegido); null para el piano. */
    fun bancoDe(instrumento: Instrumento, timbre: Sintes.Timbre): String? = when (instrumento) {
        Instrumento.Bateria -> "bateria"
        Instrumento.Bajo -> "bajo"
        Instrumento.Guitarra -> when (timbre) {
            Sintes.Timbre.Nylon -> "nylon"
            Sintes.Timbre.Electrica -> "electrica"
            else -> "acero"
        }
        else -> null
    }

    /** La nota grabada más cercana (a igual distancia, la de abajo), su capa y su velocidad. */
    fun zonaCuerda(zonas: List<Zona>, tecla: Int, fuerza: Int): Pair<Zona, Double>? {
        if (zonas.isEmpty()) return null
        var cercana = zonas[0].nota
        for (z in zonas) {
            val d = abs(z.nota - tecla)
            val mejor = abs(cercana - tecla)
            if (d < mejor || (d == mejor && z.nota < cercana)) cercana = z.nota
        }
        val capas = zonas.filter { it.nota == cercana }.sortedBy { it.hastaFuerza }
        val zona = capas.firstOrNull { fuerza <= it.hastaFuerza } ?: capas.last()
        return zona to 2.0.pow((tecla - zona.nota) / 12.0)
    }

    /** El golpe: la capa según la fuerza y la variación según el turno. */
    fun golpe(piezas: Map<Int, List<Capa>>, nota: Int, fuerza: Int, turno: Int): String? {
        val capas = piezas[nota] ?: return null
        if (capas.isEmpty()) return null
        val capa = capas.firstOrNull { fuerza <= it.hastaFuerza } ?: capas.last()
        return capa.archivos.getOrNull(turno % capa.archivos.size)
    }
}

/** Un banco decodificado: cada archivo en mono, a la frecuencia en que se grabó. */
class BancoGrabado(val manifiesto: Muestras.Manifiesto, val datos: Map<String, FloatArray>, val tasa: Int) {
    companion object {
        /** Lee y decodifica `instrumentos/<clave>/` de los assets (en un hilo de fondo). */
        fun leer(context: Context, clave: String): BancoGrabado? {
            val carpeta = "instrumentos/$clave"
            val m = runCatching {
                context.assets.open("$carpeta/manifiesto.json").use { Muestras.Manifiesto.leer(it.readBytes().toString(Charsets.UTF_8)) }
            }.getOrNull() ?: return null
            val datos = HashMap<String, FloatArray>()
            var tasa = 0
            for (archivo in m.archivos) {
                runCatching {
                    context.assets.openFd("$carpeta/$archivo").use { fd ->
                        val pcm = Decodificar.aMono(context, asset = fd)
                        datos[archivo] = pcm.muestras
                        tasa = pcm.tasa
                    }
                }
            }
            return if (datos.isEmpty() || tasa == 0) null else BancoGrabado(m, datos, tasa)
        }
    }
}
