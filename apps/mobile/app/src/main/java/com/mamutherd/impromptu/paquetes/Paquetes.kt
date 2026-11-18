package com.mamutherd.impromptu.paquetes

import android.content.Context
import com.mamutherd.impromptu.audio.Decodificar
import com.mamutherd.impromptu.audio.Salamander
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.isActive
import kotlinx.coroutines.sync.Semaphore
import kotlinx.coroutines.sync.withPermit
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.coroutines.coroutineContext

/**
 * Paquetes de instrumentos que se instalan la primera vez. El de piano trae TODO lo del piano:
 * el sonido (Salamander, se descarga) y la IA de audio a notas (Transkun, viene en la app).
 * Batería y guitarra quedan para cuando existan.
 */
class Paquetes(private val context: Context) {
    val carpetaPiano = File(context.filesDir, "paquetes/piano").apply { mkdirs() }
    private val prefs = context.getSharedPreferences("paquetes", Context.MODE_PRIVATE)

    sealed interface Avance {
        data class Sonido(val listas: Int, val total: Int) : Avance
        data object Ia : Avance
    }

    val pianoInstalado: Boolean
        get() = prefs.getBoolean("piano", false) && Salamander.todas().all { File(carpetaPiano, "$it.pcm").exists() }

    /** Megas aproximados que ocupa el piano instalado. */
    val megasPiano get() = (carpetaPiano.listFiles()?.sumOf { it.length() } ?: 0L) / 1_000_000

    /** Descarga y prepara el paquete de piano. Se puede cancelar y retomar: lo ya listo se conserva. */
    suspend fun instalarPiano(avance: (Avance) -> Unit) = withContext(Dispatchers.IO) {
        val nombres = Salamander.todas()
        var listas = nombres.count { File(carpetaPiano, "$it.pcm").exists() }
        avance(Avance.Sonido(listas, nombres.size))
        val tmp = File(context.cacheDir, "descargas").apply { mkdirs() }
        val turnos = Semaphore(6)
        coroutineScope {
            nombres.filterNot { File(carpetaPiano, "$it.pcm").exists() }.map { nombre ->
                async {
                    turnos.withPermit {
                        prepararMuestra(nombre, tmp)
                        synchronized(this@Paquetes) { listas++ }
                        avance(Avance.Sonido(listas, nombres.size))
                    }
                }
            }.awaitAll()
        }
        avance(Avance.Ia)
        // La IA viene dentro de la app (PROVISIONAL(P21): hasta decidir dónde se aloja el modelo).
        // Si la app se armó sin el modelo, el sonido queda igual; la conversión avisa al usarla.
        Modelo.disponible(context)
        prefs.edit().putBoolean("piano", true).apply()
    }

    private suspend fun prepararMuestra(nombre: String, tmp: File) {
        val mp3 = File(tmp, "$nombre.mp3")
        var intento = 0
        while (true) {
            coroutineContext.ensureActive()
            try {
                descargar(URL("${Salamander.BASE}$nombre.mp3"), mp3)
                break
            } catch (e: java.io.IOException) {
                if (++intento >= 3) throw java.io.IOException("No se pudo descargar el sonido ($nombre). Revisa la conexión.", e)
            }
        }
        val ctx = coroutineContext
        val pcm = Decodificar.aMono(context, archivo = mp3, seguir = { ctx.isActive })
        val tecla = Salamander.TECLAS.first { Salamander.nombre(it, 1).dropLast(2) == nombre.substringBefore('v') }
        var x = Decodificar.remuestrear(pcm.muestras, pcm.tasa, 44_100)
        val maximo = (Salamander.largo(tecla) * 44_100).toInt()
        if (x.size > maximo) x = x.copyOf(maximo)
        // Final suave de medio segundo (la cola que se recorta ya casi no suena).
        val fundido = minOf(x.size, 22_050)
        for (i in 0 until fundido) x[x.size - fundido + i] *= 1f - i.toFloat() / fundido
        val bytes = ByteBuffer.allocate(x.size * 2).order(ByteOrder.LITTLE_ENDIAN)
        for (v in x) bytes.putShort((v.coerceIn(-1f, 1f) * 32767).toInt().toShort())
        val destino = File(carpetaPiano, "$nombre.pcm")
        val parcial = File(carpetaPiano, "$nombre.pcm.tmp")
        FileOutputStream(parcial).use { it.write(bytes.array()) }
        parcial.renameTo(destino)
        mp3.delete()
    }

    private suspend fun descargar(url: URL, destino: File) {
        val c = url.openConnection() as HttpURLConnection
        c.connectTimeout = 15_000
        c.readTimeout = 30_000
        try {
            if (c.responseCode != 200) throw java.io.IOException("HTTP ${c.responseCode}")
            c.inputStream.use { entrada ->
                FileOutputStream(destino).use { salida ->
                    val buf = ByteArray(64 * 1024)
                    while (true) {
                        coroutineContext.ensureActive()
                        val n = entrada.read(buf)
                        if (n < 0) break
                        salida.write(buf, 0, n)
                    }
                }
            }
        } finally {
            c.disconnect()
        }
    }
}

/** Archivos de Transkun dentro de la app (assets/modelos, sin comprimir). */
object Modelo {
    val ARCHIVOS = listOf("transkun-red.onnx", "transkun-puntuador.onnx", "transkun-cabezas.onnx", "transkun-ventanas.f32", "transkun-mel.f32", "transkun-espectro.json")

    fun disponible(context: Context) = runCatching { verificar(context) }.isSuccess

    fun verificar(context: Context) {
        for (a in ARCHIVOS) context.assets.openFd("modelos/$a").use { }
    }
}
