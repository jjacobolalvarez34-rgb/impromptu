package com.mamutherd.impromptu.midi

import android.content.Context
import android.content.pm.PackageManager
import android.media.midi.MidiDevice
import android.media.midi.MidiDeviceInfo
import android.media.midi.MidiManager
import android.media.midi.MidiOutputPort
import android.media.midi.MidiReceiver
import android.os.Handler
import android.os.HandlerThread
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.datos.Pedal
import com.mamutherd.impromptu.datos.TipoPedal

sealed interface EventoMidi {
    val ns: Long
    data class On(val tecla: Int, val fuerza: Int, override val ns: Long) : EventoMidi
    data class Off(val tecla: Int, override val ns: Long) : EventoMidi
    data class Control(val cc: Int, val valor: Int, override val ns: Long) : EventoMidi
}

/**
 * Teclado MIDI por USB (cable OTG) con la API de MIDI de Android. El Yamaha PSR-E343 es de
 * clase estándar: se conecta sin instalar nada. Las notas llegan con la hora del sistema
 * (System.nanoTime) en que las tocó el músico.
 */
class Teclado(private val context: Context, private val alEvento: (EventoMidi) -> Unit) {
    private val manager: MidiManager? =
        if (context.packageManager.hasSystemFeature(PackageManager.FEATURE_MIDI)) context.getSystemService(MidiManager::class.java) else null
    private val hilo = HandlerThread("impromptu-midi").apply { start() }
    private val handler = Handler(hilo.looper)
    private var dispositivo: MidiDevice? = null
    private var puerto: MidiOutputPort? = null

    /** Nombre del teclado conectado, o null. */
    var nombre by mutableStateOf<String?>(null)
        private set
    val disponible get() = manager != null

    /** Teclas apretadas ahora (para iluminar el teclado en pantalla). */
    val abajo = BooleanArray(128)
    @Volatile var sustain = false
        private set

    private val receptor = object : MidiReceiver() {
        private var estado = 0
        private var datos = IntArray(2)
        private var n = 0

        override fun onSend(msg: ByteArray, offset: Int, count: Int, timestamp: Long) {
            for (i in offset until offset + count) {
                val b = msg[i].toInt() and 0xFF
                if (b >= 0xF8) continue // reloj y sensado activo
                if (b and 0x80 != 0) {
                    estado = if (b < 0xF0) b else 0
                    n = 0
                    continue
                }
                if (estado == 0) continue
                datos[n++] = b
                val tipo = estado and 0xF0
                val necesita = if (tipo == 0xC0 || tipo == 0xD0) 1 else 2
                if (n < necesita) continue
                n = 0
                val ns = if (timestamp > 0) timestamp else System.nanoTime()
                when (tipo) {
                    0x90 -> if (datos[1] > 0) on(datos[0], datos[1], ns) else off(datos[0], ns)
                    0x80 -> off(datos[0], ns)
                    0xB0 -> {
                        if (datos[0] == 64) sustain = datos[1] >= 64
                        if (TipoPedal.deCc(datos[0]) != null) alEvento(EventoMidi.Control(datos[0], datos[1], ns))
                        if (datos[0] == 123 || datos[0] == 120) for (t in 0 until 128) if (abajo[t]) off(t, ns)
                    }
                }
            }
        }

        private fun on(t: Int, v: Int, ns: Long) {
            abajo[t] = true
            alEvento(EventoMidi.On(t, v, ns))
        }

        private fun off(t: Int, ns: Long) {
            abajo[t] = false
            alEvento(EventoMidi.Off(t, ns))
        }
    }

    private val callback = object : MidiManager.DeviceCallback() {
        override fun onDeviceAdded(device: MidiDeviceInfo) {
            if (dispositivo == null) abrir(device)
        }

        override fun onDeviceRemoved(device: MidiDeviceInfo) {
            if (dispositivo?.info?.id == device.id) cerrar()
        }
    }

    fun iniciar() {
        val m = manager ?: return
        @Suppress("DEPRECATION")
        m.registerDeviceCallback(callback, handler)
        @Suppress("DEPRECATION")
        m.devices.firstOrNull { it.outputPortCount > 0 }?.let(::abrir)
    }

    private fun abrir(info: MidiDeviceInfo) {
        if (info.outputPortCount == 0) return
        manager?.openDevice(info, { d ->
            if (d == null) return@openDevice
            val p = d.openOutputPort(0) ?: run { d.close(); return@openDevice }
            p.connect(receptor)
            dispositivo = d
            puerto = p
            val props = info.properties
            nombre = props.getString(MidiDeviceInfo.PROPERTY_NAME)
                ?: props.getString(MidiDeviceInfo.PROPERTY_PRODUCT)
                ?: "Teclado MIDI"
        }, handler)
    }

    private fun cerrar() {
        runCatching { puerto?.close() }
        runCatching { dispositivo?.close() }
        puerto = null
        dispositivo = null
        nombre = null
        val ns = System.nanoTime()
        for (t in 0 until 128) if (abajo[t]) {
            abajo[t] = false
            alEvento(EventoMidi.Off(t, ns))
        }
    }
}

/**
 * Grabación de lo que se toca: notas con su fuerza y los tres pedales, en segundos desde que se
 * apretó grabar. Se puede leer mientras graba (para dibujarla).
 */
class Grabacion(private val inicioNs: Long = System.nanoTime()) {
    private val notas = ArrayList<Nota>()
    private val pedales = ArrayList<Pedal>()
    private val abiertas = HashMap<Int, Pair<Double, Int>>()

    /** Copia para dibujar: notas terminadas y las que siguen apretadas (con fin = -1). */
    @Volatile var vista: List<Nota> = emptyList()
        private set

    fun segundos(ns: Long = System.nanoTime()) = (ns - inicioNs) / 1e9

    @Synchronized
    fun evento(e: EventoMidi) {
        val t = segundos(e.ns).coerceAtLeast(0.0)
        when (e) {
            is EventoMidi.On -> {
                abiertas.remove(e.tecla)?.let { (ini, v) -> notas += Nota(e.tecla, ini, maxOf(t, ini + 0.01), v) }
                abiertas[e.tecla] = t to e.fuerza
            }
            is EventoMidi.Off -> abiertas.remove(e.tecla)?.let { (ini, v) -> notas += Nota(e.tecla, ini, maxOf(t, ini + 0.01), v) }
            is EventoMidi.Control -> TipoPedal.deCc(e.cc)?.let { pedales += Pedal(it, t, e.valor) }
        }
        vista = notas + abiertas.map { (k, v) -> Nota(k, v.first, -1.0, v.second) }
    }

    val vacia @Synchronized get() = notas.isEmpty() && abiertas.isEmpty()

    /** Cierra lo que sigue apretado y quita el silencio del comienzo (deja medio segundo). */
    @Synchronized
    fun terminar(): Pair<List<Nota>, List<Pedal>> {
        val ahora = segundos()
        for ((k, v) in abiertas) notas += Nota(k, v.first, maxOf(ahora, v.first + 0.01), v.second)
        abiertas.clear()
        val primero = notas.minOfOrNull { it.inicio } ?: return emptyList<Nota>() to emptyList()
        val corrimiento = maxOf(0.0, primero - 0.5)
        val ns = notas.map { it.copy(inicio = it.inicio - corrimiento, fin = it.fin - corrimiento) }
        // Pedales previos a la primera nota: se conserva el último estado de cada uno en 0.
        val ps = ArrayList<Pedal>()
        for (tipo in TipoPedal.entries) {
            val antes = pedales.lastOrNull { it.tipo == tipo && it.tiempo < corrimiento }
            if (antes != null && antes.abajo) ps += Pedal(tipo, 0.0, antes.valor)
        }
        ps += pedales.filter { it.tiempo >= corrimiento }.map { it.copy(tiempo = it.tiempo - corrimiento) }
        return ns to ps
    }
}
