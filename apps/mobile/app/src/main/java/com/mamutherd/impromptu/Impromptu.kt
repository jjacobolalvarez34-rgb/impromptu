package com.mamutherd.impromptu

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.mamutherd.impromptu.audio.Banco
import com.mamutherd.impromptu.audio.Decodificar
import com.mamutherd.impromptu.audio.Sintes
import com.mamutherd.impromptu.instrumentos.Instrumento
import com.mamutherd.impromptu.audio.Motor
import com.mamutherd.impromptu.datos.Piezas
import com.mamutherd.impromptu.midi.EventoMidi
import com.mamutherd.impromptu.midi.Grabacion
import com.mamutherd.impromptu.midi.Teclado
import com.mamutherd.impromptu.paquetes.Modelo
import com.mamutherd.impromptu.paquetes.Paquetes
import com.mamutherd.impromptu.trabajo.Conversiones
import com.mamutherd.impromptu.trabajo.ServicioTrabajos
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap

/**
 * Estado de toda la app: piezas, paquetes, sonido, teclado y la cola de conversiones. Vive lo
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
    /** Muestras del piano (para exportar video sin tocar el motor en vivo). */
    var banco: Banco? = null
        private set

    val alcance = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    @Volatile var grabacion: Grabacion? = null

    lateinit var conversiones: Conversiones
        private set

    /** Instrumento con el que se graba y se convierte (fase 9). Se recuerda entre sesiones. */
    var instrumento by mutableStateOf(Instrumento.Piano)
        private set

    fun elegirInstrumento(i: Instrumento) {
        instrumento = i
        app.getSharedPreferences("ajustes", Context.MODE_PRIVATE).edit().putString("instrumento", i.clave).apply()
        cargarBancoPara(i)
    }

    /**
     * Sonidos grabados de guitarra, bajo y batería (pedido 25), por banco ("acero", "bateria"…).
     * Se decodifica solo el banco del instrumento en uso (la batería ocupa ~26 MB en memoria).
     */
    val bancos = ConcurrentHashMap<String, com.mamutherd.impromptu.audio.BancoGrabado>()
    private val cargandoBancos = ConcurrentHashMap<String, kotlinx.coroutines.Deferred<Unit>>()

    /** Opciones del visualizador con lo elegido en Ajustes (vista de batería, flechas de rasgueo). */
    fun opcionesVista(instrumento: Instrumento, subiendo: Boolean = false): com.mamutherd.impromptu.visual.Renderizador.Opciones {
        val ajustes = app.getSharedPreferences("ajustes", Context.MODE_PRIVATE)
        return com.mamutherd.impromptu.visual.Renderizador.Opciones(
            subiendo = subiendo,
            instrumento = instrumento,
            vistaKit = ajustes.getString("vistaBateria", "carriles") == "kit",
            rasgueo = ajustes.getBoolean("rasgueo", true),
            estilo = com.mamutherd.impromptu.visual.EstiloNota.deClave(ajustes.getString("estiloNota", null)),
            colorDerecha = ajustes.getInt("colorDerecha", 0xFFFF9F1C.toInt()),
            colorIzquierda = ajustes.getInt("colorIzquierda", 0xFFE8E4DC.toInt()),
            redondeo = ajustes.getFloat("redondeo", 0.3f),
        )
    }

    /** Pedido 59: el diseño de las notas, elegido desde la pieza; vale también para el video. */
    fun guardarDiseno(estilo: com.mamutherd.impromptu.visual.EstiloNota, derecha: Int, izquierda: Int, redondeo: Float) {
        app.getSharedPreferences("ajustes", Context.MODE_PRIVATE).edit()
            .putString("estiloNota", estilo.clave)
            .putInt("colorDerecha", derecha)
            .putInt("colorIzquierda", izquierda)
            .putFloat("redondeo", redondeo)
            .apply()
    }

    /** Timbre de la guitarra elegido en Ajustes. */
    fun timbreGuardado(): Sintes.Timbre =
        Sintes.Timbre.entries.firstOrNull { t -> t.name == app.getSharedPreferences("ajustes", Context.MODE_PRIVATE).getString("timbre", "Acero") }
            ?: Sintes.Timbre.Acero

    /** Empieza a decodificar el banco de un instrumento (una sola vez). */
    fun cargarBancoPara(i: Instrumento, timbre: Sintes.Timbre = timbreGuardado()): kotlinx.coroutines.Deferred<Unit>? {
        val clave = com.mamutherd.impromptu.audio.Muestras.bancoDe(i, timbre) ?: return null
        bancos[clave]?.let { return null }
        return cargandoBancos.getOrPut(clave) {
            alcance.async(Dispatchers.IO) {
                val b = com.mamutherd.impromptu.audio.BancoGrabado.leer(app, clave)
                if (b != null) bancos[clave] = b else cargandoBancos.remove(clave)
                Unit
            }
        }
    }

    /** Espera el banco de un instrumento (antes de exportar, para que el video suene igual). */
    suspend fun esperarBancoPara(i: Instrumento, timbre: Sintes.Timbre = timbreGuardado()) {
        cargarBancoPara(i, timbre)?.await()
    }

    /** Batería grabada (Sonic Pi, CC0), a 44,1 kHz; se llena al iniciar desde los assets. */
    val bateria = ConcurrentHashMap<String, FloatArray>()

    private var iniciado = false

    fun iniciar(context: Context) {
        if (iniciado) return
        iniciado = true
        app = context.applicationContext
        piezas = Piezas(app)
        paquetes = Paquetes(app)
        teclado = Teclado(app, ::alEventoMidi)
        teclado.iniciar()
        conversiones = Conversiones(app, piezas, alcance) { ocupada -> if (ocupada) ServicioTrabajos.asegurar(app) }
        conversiones.reanudar()
        val ajustes = app.getSharedPreferences("ajustes", Context.MODE_PRIVATE)
        instrumento = Instrumento.deClave(ajustes.getString("instrumento", "piano"))
        conversiones.afinacionGuitarra = ajustes.getString("afinacion", "estandar") ?: "estandar"
        conversiones.sensibilidadBateria = 2 - ajustes.getFloat("sensibilidadBateria", 1f).toDouble()
        conversiones.separar = ajustes.getBoolean("separar", true)
        cargarBateria()
        cargarBancoPara(instrumento)
        encenderSonido()
    }

    /** Arranca el motor de sonido si el paquete de piano ya está instalado. */
    fun encenderSonido(): Motor? {
        motor?.let { return it }
        if (!paquetes.pianoInstalado) return null
        val banco = Banco(paquetes.carpetaPiano)
        if (!banco.completo) return null
        this.banco = banco
        return Motor(app, banco, bateria, bancos).also {
            it.sintes.timbreGuitarra = timbreGuardado()
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
            is EventoMidi.On -> m?.notaOn(e.tecla, e.fuerza, instrumento)
            is EventoMidi.Off -> m?.notaOff(e.tecla, instrumento)
            is EventoMidi.Control -> m?.pedal(e.cc, e.valor)
        }
        grabacion?.evento(e)
    }

    val iaDisponible get() = Modelo.disponible(app)

    private fun cargarBateria() {
        alcance.launch(Dispatchers.IO) {
            val nombres = runCatching { app.assets.list("bateria") }.getOrNull().orEmpty()
            for (archivo in nombres.filter { it.endsWith(".flac") }) {
                runCatching {
                    app.assets.openFd("bateria/$archivo").use { fd ->
                        val pcm = Decodificar.aMono(app, asset = fd)
                        bateria[archivo.removeSuffix(".flac")] = Decodificar.remuestrear(pcm.muestras, pcm.tasa, 44_100)
                    }
                }
            }
        }
    }
}
