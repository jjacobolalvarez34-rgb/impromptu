package com.mamutherd.impromptu.trabajo

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.mamutherd.impromptu.audio.Decodificar
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.Piezas
import com.mamutherd.impromptu.instrumentos.Guitarra
import com.mamutherd.impromptu.instrumentos.Instrumento
import com.mamutherd.impromptu.transcribir.BasicPitch
import com.mamutherd.impromptu.transcribir.Umbrales
import com.mamutherd.impromptu.transcribir.Volumen
import com.mamutherd.impromptu.transcribir.DetectorBateria
import com.mamutherd.impromptu.transcribir.Separador
import com.mamutherd.impromptu.transcribir.Modelos
import com.mamutherd.impromptu.transcribir.Transkun
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers
import org.json.JSONObject
import java.io.DataOutputStream
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.UUID
import kotlin.coroutines.cancellation.CancellationException

/** Una conversión de audio a notas en la cola. Sus campos son estado de Compose. */
class TrabajoConversion(
    val id: String,
    val titulo: String,
    val origen: Origen,
    val archivo: File,
    /** Con qué se escucha: piano (Transkun), guitarra o bajo (Basic Pitch) o batería (detector). */
    val instrumento: Instrumento = Instrumento.Piano,
) {
    var etapa by mutableStateOf(Etapa.Esperando)
    /** Cuándo empezó a trabajar (System.currentTimeMillis), 0 si espera. */
    var inicio by mutableStateOf(0L)
    /** Avance de la lectura del audio (0 a 1). */
    var lectura by mutableStateOf(0f)
    var avance = AvanceSuave(0)
        internal set
}

/** Pieza recién convertida, para el aviso "lista". */
data class Terminada(val piezaId: String, val titulo: String)

/**
 * Cola de conversiones (pedido de Jacobo, 2026-11-18): se puede grabar otra o elegir otro audio
 * mientras la anterior trabaja; se convierten de a una para no llenar la memoria (BUG-004). El
 * audio queda en la memoria del celular hasta convertirse, así la cola sigue aunque la app se
 * cierre (se retoma al abrirla) y, con el servicio en primer plano, aunque se salga de la app.
 */
class Conversiones(
    private val context: Context,
    private val piezas: Piezas,
    private val alcance: CoroutineScope,
    /** Se llama cuando la cola pasa a tener trabajo o queda vacía (para el servicio). */
    private val alCambiar: (ocupada: Boolean) -> Unit,
) {
    private val carpeta = File(context.filesDir, "cola").apply { mkdirs() }

    val cola = mutableStateListOf<TrabajoConversion>()
    val terminadas = mutableStateListOf<Terminada>()
    var fallo by mutableStateOf<String?>(null)

    private var procesador: Job? = null
    @Volatile private var actual: TrabajoConversion? = null
    @Volatile private var transkun: Transkun? = null

    init {
        // Lo que quedó en la cola la última vez (la app se cerró a mitad) se retoma.
        val pendientes = carpeta.listFiles { f -> f.extension == "json" }.orEmpty().sortedBy { it.lastModified() }
        for (meta in pendientes) {
            runCatching {
                val o = JSONObject(meta.readText())
                val audio = File(carpeta, o.getString("archivo"))
                if (audio.exists()) cola += TrabajoConversion(o.getString("id"), o.getString("titulo"), Origen.deClave(o.getString("origen")), audio, Instrumento.deClave(o.optString("instrumento")))
                else meta.delete()
            }
        }
    }

    /** Arranca (o retoma) la cola. */
    fun reanudar() {
        if (cola.isNotEmpty()) procesar()
    }

    /** Pone en la cola un audio elegido (se copia: el permiso para leerlo no dura). */
    suspend fun encolarArchivo(uri: Uri, titulo: String, instrumento: Instrumento = Instrumento.Piano) {
        val id = UUID.randomUUID().toString()
        val ext = context.contentResolver.getType(uri)?.substringAfter('/')?.takeIf { it.length in 2..5 } ?: "audio"
        val destino = File(carpeta, "$id.$ext")
        withContext(Dispatchers.IO) {
            context.contentResolver.openInputStream(uri)!!.use { entrada -> destino.outputStream().use { entrada.copyTo(it) } }
        }
        agregar(TrabajoConversion(id, titulo, Origen.Audio, destino, instrumento))
    }

    /** Pone en la cola lo grabado con el micrófono (se guarda como WAV). */
    suspend fun encolarGrabacion(muestras: FloatArray, tasa: Int, titulo: String, instrumento: Instrumento = Instrumento.Piano) {
        val id = UUID.randomUUID().toString()
        val destino = File(carpeta, "$id.wav")
        withContext(Dispatchers.IO) { escribirWav(destino, muestras, tasa) }
        agregar(TrabajoConversion(id, titulo, Origen.Microfono, destino, instrumento))
    }

    private fun agregar(t: TrabajoConversion) {
        File(carpeta, "${t.id}.json").writeText(
            JSONObject().put("id", t.id).put("titulo", t.titulo).put("origen", t.origen.clave).put("archivo", t.archivo.name).put("instrumento", t.instrumento.clave).toString(),
        )
        cola += t
        procesar()
    }

    /** Cancela una conversión: la que trabaja se detiene a mitad; las que esperan se quitan. */
    fun cancelar(id: String) {
        val t = cola.firstOrNull { it.id == id } ?: return
        if (t === actual) {
            transkun?.cancelar()
            basicPitch?.cancelar()
            procesador?.cancel()
        } else {
            quitar(t)
        }
    }

    fun olvidarTerminada(t: Terminada) {
        terminadas.remove(t)
    }

    private fun quitar(t: TrabajoConversion) {
        cola.remove(t)
        t.archivo.delete()
        File(carpeta, "${t.id}.json").delete()
    }

    private fun procesar() {
        if (procesador?.isActive == true) return
        alCambiar(true)
        val anterior = procesador
        procesador = alcance.launch {
            anterior?.join()
            try {
                while (isActive) {
                    val t = cola.firstOrNull() ?: break
                    convertir(t)
                }
            } finally {
                transkun?.close()
                transkun = null
                basicPitch?.close()
                basicPitch = null
                if (cola.isEmpty()) alCambiar(false)
                else if (!isActive) {
                    // Se canceló la que trabajaba: sigue con la próxima.
                    alcance.launch { procesar() }
                }
            }
        }
    }

    private suspend fun convertir(t: TrabajoConversion) {
        actual = t
        val ahora = System.currentTimeMillis()
        t.inicio = ahora
        t.avance = AvanceSuave(ahora, 0.08)
        t.etapa = Etapa.Leyendo
        try {
            val job = kotlin.coroutines.coroutineContext
            val pcm = Decodificar.aMono(context, archivo = t.archivo, seguir = { job.isActive }) { t.lectura = it }
            if (pcm.muestras.size < pcm.tasa / 2) throw IllegalStateException("El audio es demasiado corto.")
            if (t.instrumento != Instrumento.Piano) {
                convertirOtro(t, pcm, job)
                return
            }
            val audio = Decodificar.remuestrear(pcm.muestras, pcm.tasa, Transkun.TASA)
            t.etapa = Etapa.Preparando
            val tk = transkun ?: Transkun.cargar(context).also { transkun = it }
            if (!job.isActive) throw CancellationException()
            t.etapa = Etapa.Escuchando
            t.avance = AvanceSuave(System.currentTimeMillis(), 0.08)
            val eventos = tk.transcribir(audio) { v, paso -> t.avance.actualizar(v.toDouble(), System.currentTimeMillis(), paso) }
            t.etapa = Etapa.Armando
            val (notas, pedales) = Transkun.aPieza(eventos)
            if (notas.isEmpty()) throw IllegalStateException("No se escucharon notas de piano en «${t.titulo}».")
            val pieza = piezas.nueva(t.titulo, t.origen, notas, pedales)
            piezas.guardar(pieza)
            terminadas += Terminada(pieza.id, pieza.titulo)
            quitar(t)
        } catch (e: CancellationException) {
            quitar(t)
            throw e
        } catch (e: OutOfMemoryError) {
            transkun?.close()
            transkun = null
            fallo = "El celular se quedó sin memoria con «${t.titulo}». Prueba con un audio más corto."
            quitar(t)
        } catch (e: Throwable) {
            fallo = e.message ?: "No se pudo convertir «${t.titulo}»."
            quitar(t)
        } finally {
            actual = null
        }
    }

    @Volatile private var basicPitch: BasicPitch? = null

    /** Guitarra y bajo con Basic Pitch (y cuerda y traste); batería con el detector por bandas. */
    private fun convertirOtro(t: TrabajoConversion, pcmOriginal: Decodificar.Pcm, job: kotlin.coroutines.CoroutineContext) {
        // Pedido 35: con un archivo (una canción), primero se separa el instrumento del resto.
        var pcm = pcmOriginal
        if (t.origen == Origen.Audio && separar) {
            t.etapa = if (Separador.bajado(context)) Etapa.Preparando else Etapa.Descargando
            t.avance = AvanceSuave(System.currentTimeMillis(), 0.1)
            Separador.cargar(context) { t.avance.actualizar(it.toDouble(), System.currentTimeMillis()) }.use { sep ->
                if (!job.isActive) throw CancellationException()
                t.etapa = Etapa.Separando
                t.avance = AvanceSuave(System.currentTimeMillis(), 0.1)
                val audio = Decodificar.remuestrear(pcm.muestras, pcm.tasa, Separador.TASA)
                val parte = when (t.instrumento) {
                    Instrumento.Bateria -> "drums"
                    Instrumento.Bajo -> "bass"
                    else -> "other"
                }
                pcm = Decodificar.Pcm(
                    sep.separar(audio, parte, { job.isActive }) { t.avance.actualizar(it.toDouble(), System.currentTimeMillis()) },
                    Separador.TASA,
                )
            }
        }
        t.etapa = Etapa.Escuchando
        t.avance = AvanceSuave(System.currentTimeMillis(), 0.1)
        val notas = if (t.instrumento == Instrumento.Bateria) {
            t.avance.actualizar(0.5, System.currentTimeMillis())
            DetectorBateria.detectar(pcm.muestras, pcm.tasa, sensibilidadBateria)
        } else {
            val audio = Decodificar.remuestrear(pcm.muestras, pcm.tasa, BasicPitch.TASA)
            // Pedido 55: guitarra y bajo bajitos (micrófono del teléfono): subir el volumen y
            // usar umbrales menos exigentes que los del piano.
            Volumen.normalizar(audio)
            val bp = basicPitch ?: BasicPitch(Modelos.sesion(context, "basic-pitch.onnx")).also { basicPitch = it }
            val crudas = bp.transcribir(audio, Umbrales.CUERDAS) { t.avance.actualizar(it.toDouble(), System.currentTimeMillis()) }
            Guitarra.asignar(crudas, Guitarra.afinacion(t.instrumento, afinacionGuitarra))
        }
        if (!job.isActive) throw CancellationException()
        t.etapa = Etapa.Armando
        if (notas.isEmpty()) throw IllegalStateException("No se escucharon notas en «${t.titulo}».")
        val pieza = piezas.nueva(t.titulo, t.origen, notas, emptyList(), t.instrumento.clave)
        piezas.guardar(pieza)
        terminadas += Terminada(pieza.id, pieza.titulo)
        quitar(t)
    }

    /** Afinación de la guitarra y sensibilidad de la batería (Ajustes). */
    var afinacionGuitarra = "estandar"
    /** Separar el instrumento de la canción antes de convertir (pedido 35, Ajustes). */
    var separar = true
    var sensibilidadBateria = 1.0

    /** Avance total para la notificación (0 a 100) y el nombre de la que trabaja. */
    fun resumen(): Pair<String, Int>? {
        val t = cola.firstOrNull() ?: return null
        val v = if (t.etapa == Etapa.Escuchando) t.avance.valor(System.currentTimeMillis()) else 0.0
        return t.titulo to (v * 100).toInt()
    }

    companion object {
        /** WAV PCM de 16 bits mono. */
        fun escribirWav(f: File, x: FloatArray, tasa: Int) {
            val datos = ByteBuffer.allocate(x.size * 2).order(ByteOrder.LITTLE_ENDIAN)
            for (v in x) datos.putShort((v.coerceIn(-1f, 1f) * 32767).toInt().toShort())
            val cab = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN).apply {
                put("RIFF".toByteArray()); putInt(36 + x.size * 2); put("WAVE".toByteArray())
                put("fmt ".toByteArray()); putInt(16); putShort(1); putShort(1); putInt(tasa); putInt(tasa * 2); putShort(2); putShort(16)
                put("data".toByteArray()); putInt(x.size * 2)
            }
            DataOutputStream(f.outputStream().buffered()).use {
                it.write(cab.array())
                it.write(datos.array())
            }
        }
    }
}
