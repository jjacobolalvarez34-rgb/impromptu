package com.mamutherd.impromptu.pantallas

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.datos.Pieza
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.ui.Chip
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import com.mamutherd.impromptu.visual.Exportador
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import kotlin.coroutines.cancellation.CancellationException

/** Exportación de video en curso. Sigue aunque se salga de la pantalla. */
object Exportacion {
    sealed interface Estado {
        data object Quieta : Estado
        data class Trabajando(val piezaId: String, val avance: Float) : Estado
        data class Lista(val piezaId: String, val archivo: File, val enGaleria: Boolean) : Estado
        data class Fallo(val piezaId: String, val mensaje: String) : Estado
    }

    var estado by mutableStateOf<Estado>(Estado.Quieta)
        private set
    private var trabajo: Job? = null

    fun iniciar(context: Context, pieza: Pieza, ancho: Int, alto: Int) {
        val banco = Impromptu.banco ?: run {
            estado = Estado.Fallo(pieza.id, "Para exportar con sonido, instala primero el piano.")
            return
        }
        trabajo?.cancel()
        estado = Estado.Trabajando(pieza.id, 0f)
        trabajo = Impromptu.alcance.launch(Dispatchers.Default) {
            val carpeta = File(context.cacheDir, "exportados").apply { mkdirs() }
            val nombre = pieza.titulo.replace(Regex("[\\\\/:*?\"<>|]"), "_") + ".mp4"
            val archivo = File(carpeta, nombre)
            try {
                Exportador(pieza, banco, ancho, alto).exportar(archivo) { estado = Estado.Trabajando(pieza.id, it) }
                val enGaleria = withContext(Dispatchers.IO) { aGaleria(context, archivo) != null }
                estado = Estado.Lista(pieza.id, archivo, enGaleria)
            } catch (e: CancellationException) {
                archivo.delete()
                estado = Estado.Quieta
            } catch (e: Throwable) {
                archivo.delete()
                estado = Estado.Fallo(pieza.id, e.message ?: "No se pudo exportar el video.")
            }
        }
    }

    fun cancelar() {
        trabajo?.cancel()
        trabajo = null
        estado = Estado.Quieta
    }

    fun olvidar() {
        if (estado !is Estado.Trabajando) estado = Estado.Quieta
    }

    /** Copia el video a Películas/Impromptu (Android 10 o más nuevo). */
    private fun aGaleria(context: Context, f: File): Uri? {
        if (Build.VERSION.SDK_INT < 29) return null
        val valores = ContentValues().apply {
            put(MediaStore.Video.Media.DISPLAY_NAME, f.name)
            put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
            put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/Impromptu")
            put(MediaStore.Video.Media.IS_PENDING, 1)
        }
        val r = context.contentResolver
        val uri = r.insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, valores) ?: return null
        r.openOutputStream(uri)?.use { out -> f.inputStream().use { it.copyTo(out) } }
        valores.clear()
        valores.put(MediaStore.Video.Media.IS_PENDING, 0)
        r.update(uri, valores, null, null)
        return uri
    }
}

private enum class Formato(val texto: String, val ancho: Int, val alto: Int) {
    Horizontal("Horizontal 16:9", 1920, 1080),
    Vertical("Vertical 9:16", 1080, 1920),
    Cuadrado("Cuadrado 1:1", 1080, 1080),
}

@Composable
fun ExportarPantalla(id: String, nav: Navegador) {
    val pieza = Impromptu.piezas.buscar(id)
    if (pieza == null) {
        LaunchedEffect(Unit) { nav.volver() }
        return
    }
    val context = LocalContext.current
    var formato by remember { mutableStateOf(Formato.Horizontal) }
    var hd by remember { mutableStateOf(true) }
    val estado = Exportacion.estado
    val deEsta = when (estado) {
        is Exportacion.Estado.Trabajando -> estado.piezaId == id
        is Exportacion.Estado.Lista -> estado.piezaId == id
        is Exportacion.Estado.Fallo -> estado.piezaId == id
        Exportacion.Estado.Quieta -> false
    }

    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Encabezado("Exportar video", { nav.volver() })
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Panel(Modifier.fillMaxWidth()) {
                Text(pieza.titulo, style = Tipos.TituloPanel)
                Text(
                    "${formatoTiempo(pieza.duracion)} de música, más 4 s al final con fundido para editar con holgura.",
                    style = Tipos.Secundario,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            if (estado is Exportacion.Estado.Trabajando && deEsta) {
                Panel(Modifier.fillMaxWidth()) {
                    Text(if (estado.avance < 0.1f) "Preparando el sonido…" else "Dibujando el video… ${(estado.avance * 100).toInt()} %", style = Tipos.Texto)
                    Avance(estado.avance, Modifier.padding(vertical = 14.dp))
                    Text("Puedes salir de esta pantalla: el video sigue armándose.", style = Tipos.Secundario)
                    Tecla("Cancelar", Exportacion::cancelar, modifier = Modifier.padding(top = 14.dp))
                }
                return@Column
            }
            if (estado is Exportacion.Estado.Lista && deEsta) {
                Panel(Modifier.fillMaxWidth()) {
                    Text("Video listo.", style = Tipos.TituloPanel)
                    Text(
                        if (estado.enGaleria) "Quedó en tu galería, en Películas/Impromptu." else "Compártelo para guardarlo donde quieras.",
                        style = Tipos.Secundario,
                        modifier = Modifier.padding(top = 4.dp, bottom = 14.dp),
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Tecla("Compartir", { compartirArchivo(context, estado.archivo, "video/mp4") }, principal = true, icono = { Icono(Iconos.Compartir, null, color = com.mamutherd.impromptu.ui.C3.Carbon, tamano = 18.dp) })
                        Tecla("Otro formato", Exportacion::olvidar)
                    }
                }
                return@Column
            }
            if (estado is Exportacion.Estado.Fallo && deEsta) {
                Panel(Modifier.fillMaxWidth()) {
                    Text(estado.mensaje, style = Tipos.Texto)
                }
            }
            Etiqueta("Formato")
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                for (f in Formato.entries) Chip(f.texto, formato == f, { formato = f })
            }
            Etiqueta("Calidad")
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Chip("1080p", hd, { hd = true })
                Chip("720p (más rápido)", !hd, { hd = false })
            }
            val ocupado = estado is Exportacion.Estado.Trabajando
            Tecla(
                if (ocupado) "Ya hay otro video armándose" else "Exportar video",
                {
                    val escala = if (hd) 1.0 else 2.0 / 3
                    Exportacion.iniciar(context, pieza, par(formato.ancho * escala), par(formato.alto * escala))
                },
                principal = true,
                habilitada = !ocupado,
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                altura = 52.dp,
            )
        }
    }
}

/** Los codificadores piden medidas pares. */
private fun par(x: Double) = (x.toInt() / 2) * 2
