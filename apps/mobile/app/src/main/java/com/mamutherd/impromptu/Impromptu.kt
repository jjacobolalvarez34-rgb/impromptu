package com.mamutherd.impromptu

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.mamutherd.impromptu.audio.Banco
import com.mamutherd.impromptu.audio.Decodificar
import com.mamutherd.impromptu.audio.Motor
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.Piezas
import com.mamutherd.impromptu.midi.EventoMidi
import com.mamutherd.impromptu.midi.Grabacion
import com.mamutherd.impromptu.midi.Teclado
import com.mamutherd.impromptu.paquetes.Modelo
import com.mamutherd.impromptu.paquetes.Paquetes
import com.mamutherd.impromptu.transcribir.Transkun
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

/** Estado de una conversión de audio a notas. */
sealed interface Conversion {
    data object Inactiva : Conversion
    data class Leyendo(val avance: Float) : Conversion
    data object Preparando : Conversion
    data class Escuchando(val avance: Float) : Conversion
    data class Lista(val piezaId: String) : Conversion
    data class Fallo(val mensaje: String) : Conversion
}

/**
 * Estado de toda la app: piezas, paquetes, sonido, teclado y la conversión en curso. Vive lo
 * que vive el proceso; las pantallas solo lo leen y le dan órdenes.
 */
object Impromptu {
    lateinit var app: Context
        private set
    lateinit var piezas: Piezas
        private set
    lateinit var paquetes: Paquetes
        private set
    lateinit var teclado: Teclado
        private set
    var motor: Motor? = null
        private set

    val alcance = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    @Volatile var grabacion: Grabacion? = null

    var conversion by mutableStateOf<Conversion>(Conversion.Inactiva)
        private set
    private var trabajo: Job? = null
    @Volatile private var transkun: Transkun? = null

    private var iniciado = false

    fun iniciar(context: Context) {
        if (iniciado) return
        iniciado = true
        app = context.applicationContext
        piezas = Piezas(app)
        paquetes = Paquetes(app)
        teclado = Teclado(app, ::alEventoMidi)
        teclado.iniciar()
        encenderSonido()
    }

    /** Arranca el motor de sonido si el paquete de piano ya está instalado. */
    fun encenderSonido(): Motor? {
        motor?.let { return it }
        if (!paquetes.pianoInstalado) return null
        val banco = Banco(paquetes.carpetaPiano)
        if (!banco.completo) return null
        return Motor(app, banco).also {
            it.sampler.panelSustain = app.getSharedPreferences("ajustes", Context.MODE_PRIVATE).getFloat("panelSustain", 0f).toDouble()
            it.encender()
            motor = it
        }
    }

    fun pausarSonido() {
        motor?.apagar()
    }

    fun reanudarSonido() {
        motor?.encender()
    }

    private fun alEventoMidi(e: EventoMidi) {
        val m = motor
        when (e) {
            is EventoMidi.On -> m?.notaOn(e.tecla, e.fuerza)
            is EventoMidi.Off -> m?.notaOff(e.tecla)
            is EventoMidi.Control -> m?.pedal(e.cc, e.valor)
        }
        grabacion?.evento(e)
    }

    val iaDisponible get() = Modelo.disponible(app)

    /**
     * Convierte audio (un archivo elegido o lo grabado con el micrófono) en una pieza nueva.
     * Cancelar detiene todo enseguida y deja la app lista para seguir (BUG-002).
     */
    fun convertir(titulo: String, origen: Origen, uri: Uri? = null, muestras: FloatArray? = null, tasa: Int = Transkun.TASA) {
        val anterior = trabajo
        cancelarConversion()
        conversion = Conversion.Leyendo(0f)
        trabajo = alcance.launch {
            // Una conversión a la vez: la anterior (cancelada) termina antes de reusar la red.
            anterior?.join()
            try {
                val audio = if (uri != null) {
                    val job = coroutineContext
                    val pcm = Decodificar.aMono(app, uri = uri, seguir = { job.isActive }) { conversion = Conversion.Leyendo(it) }
                    Decodificar.remuestrear(pcm.muestras, pcm.tasa, Transkun.TASA)
                } else {
                    Decodificar.remuestrear(muestras!!, tasa, Transkun.TASA)
                }
                if (audio.size < Transkun.TASA / 2) throw IllegalStateException("El audio es demasiado corto.")
                if (!isActive) return@launch
                conversion = Conversion.Preparando
                val tk = transkun ?: Transkun.cargar(app).also { transkun = it }
                if (!isActive) return@launch
                conversion = Conversion.Escuchando(0f)
                val eventos = tk.transcribir(audio) { conversion = Conversion.Escuchando(it) }
                val (notas, pedales) = Transkun.aPieza(eventos)
                if (notas.isEmpty()) throw IllegalStateException("No se escucharon notas de piano en este audio.")
                val pieza = piezas.nueva(titulo, origen, notas, pedales)
                piezas.guardar(pieza)
                conversion = Conversion.Lista(pieza.id)
            } catch (e: CancellationException) {
                // Cancelada: la pantalla ya volvió al inicio.
            } catch (e: OutOfMemoryError) {
                transkun?.close()
                transkun = null
                conversion = Conversion.Fallo("El celular se quedó sin memoria. Prueba con un audio más corto.")
            } catch (e: Throwable) {
                conversion = Conversion.Fallo(e.message ?: "No se pudo convertir el audio.")
            }
        }
    }

    fun cancelarConversion() {
        transkun?.cancelar()
        trabajo?.cancel()
        trabajo = null
        conversion = Conversion.Inactiva
    }

    fun olvidarConversion() {
        if (conversion is Conversion.Lista || conversion is Conversion.Fallo) conversion = Conversion.Inactiva
    }
}
