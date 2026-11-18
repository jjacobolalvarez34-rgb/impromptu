package com.mamutherd.impromptu

import android.content.Context
import com.mamutherd.impromptu.audio.Banco
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
import kotlinx.coroutines.SupervisorJob

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
        encenderSonido()
    }

    /** Arranca el motor de sonido si el paquete de piano ya está instalado. */
    fun encenderSonido(): Motor? {
        motor?.let { return it }
        if (!paquetes.pianoInstalado) return null
        val banco = Banco(paquetes.carpetaPiano)
        if (!banco.completo) return null
        this.banco = banco
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
}
