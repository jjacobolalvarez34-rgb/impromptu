package com.mamutherd.impromptu.pantallas

import android.content.ContentValues
import com.mamutherd.impromptu.visual.Renderizador
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.trabajo.ServicioTrabajos
import com.mamutherd.impromptu.trabajo.AvanceSuave
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.draw.clip
import androidx.compose.ui.Alignment
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.border
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.mamutherd.impromptu.visual.HojaVideo
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

    /** Con [hoja], el video es de la partitura (fase 10) en vez del visualizador. */
    fun iniciar(context: Context, pieza: Pieza, ancho: Int, alto: Int, hoja: HojaVideo? = null) {
        val banco = Impromptu.banco ?: run {
            hoja?.soltar()
            estado = Estado.Fallo(pieza.id, "Para exportar con sonido, instala primero el piano.")
            return
        }
        trabajo?.cancel()
        estado = Estado.Trabajando(pieza.id, 0f)
        ServicioTrabajos.asegurar(context)
        trabajo = Impromptu.alcance.launch(Dispatchers.Default) {
            val carpeta = File(context.cacheDir, "exportados").apply { mkdirs() }
            val sufijo = if (hoja != null) " (partitura)" else ""
            val nombre = pieza.titulo.replace(Regex("[\\\\/:*?\"<>|]"), "_") + sufijo + ".mp4"
            val archivo = File(carpeta, nombre)
            try {
                Exportador(pieza, banco, ancho, alto, bateria = Impromptu.bateria, hoja = hoja)
                    .exportar(archivo) { estado = Estado.Trabajando(pieza.id, it) }
                val enGaleria = withContext(Dispatchers.IO) { aGaleria(context, archivo) != null }
                estado = Estado.Lista(pieza.id, archivo, enGaleria)
            } catch (e: CancellationException) {
                archivo.delete()
                estado = Estado.Quieta
            } catch (e: Throwable) {
                archivo.delete()
                estado = Estado.Fallo(pieza.id, e.message ?: "No se pudo exportar el video.")
            } finally {
                hoja?.soltar()
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
    Horizontal("Horizontal", 1920, 1080),
    Vertical("Vertical", 1080, 1920),
    Cuadrado("Cuadrado", 1080, 1080),
}

/**
 * Exportar video (rediseñado, pedido de Jacobo 2026-11-18): una vista previa animada con la
 * forma del formato elegido, pocas opciones y un solo botón; en tableta queda centrado.
 */
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
    val trabajando = estado is Exportacion.Estado.Trabajando && deEsta

    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Encabezado("Exportar video", { nav.volver() })
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(Modifier.widthIn(max = 560.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                VistaPrevia(pieza, formato, Modifier.align(Alignment.CenterHorizontally).padding(top = 4.dp))
                Text(
                    "${pieza.titulo} · ${formatoTiempo(pieza.duracion)} + 4 s de cola con fundido",
                    style = Tipos.Secundario,
                    modifier = Modifier.align(Alignment.CenterHorizontally),
                )
                when {
                    trabajando -> AvanceExportacion(estado as Exportacion.Estado.Trabajando)
                    estado is Exportacion.Estado.Lista && deEsta -> Panel(Modifier.fillMaxWidth()) {
                        Text("Video listo", style = Tipos.TituloPanel)
                        Text(
                            if (estado.enGaleria) "Quedó en tu galería, en Películas/Impromptu." else "Compártelo para guardarlo donde quieras.",
                            style = Tipos.Secundario,
                            modifier = Modifier.padding(top = 4.dp, bottom = 14.dp),
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Tecla(
                                "Compartir",
                                { compartirArchivo(context, estado.archivo, "video/mp4") },
                                principal = true,
                                icono = { Icono(Iconos.Compartir, null, color = C3.Carbon, tamano = 18.dp) },
                            )
                            Tecla("Otro formato", Exportacion::olvidar)
                        }
                    }
                    else -> {
                        if (estado is Exportacion.Estado.Fallo && deEsta) {
                            Text(estado.mensaje, style = Tipos.Texto.copy(color = C3.Ambar))
                        }
                        Etiqueta("Formato")
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            for (f in Formato.entries) Chip(f.texto, formato == f, { formato = f }, Modifier.weight(1f))
                        }
                        Etiqueta("Calidad")
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Chip("1080p", hd, { hd = true }, Modifier.weight(1f))
                            Chip("720p · más rápido", !hd, { hd = false }, Modifier.weight(1f))
                        }
                        val ocupado = estado is Exportacion.Estado.Trabajando
                        Tecla(
                            if (ocupado) "Espera: se arma un video a la vez" else "Exportar video",
                            {
                                val escala = if (hd) 1.0 else 2.0 / 3
                                Exportacion.iniciar(context, pieza, par(formato.ancho * escala), par(formato.alto * escala))
                            },
                            principal = true,
                            habilitada = !ocupado,
                            modifier = Modifier.fillMaxWidth().padding(top = 6.dp, bottom = 24.dp),
                            altura = 52.dp,
                            icono = { Icono(Iconos.Video, null, color = C3.Carbon, tamano = 18.dp) },
                        )
                    }
                }
            }
        }
    }
}

/** Miniatura animada: el comienzo de la pieza cayendo, con la forma del video (pedido de Jacobo). */
@Composable
private fun VistaPrevia(pieza: Pieza, formato: Formato, modifier: Modifier) {
    val renderizador = remember { Renderizador() }
    val rango = remember(pieza) { pieza.rango() }
    val opciones = remember(pieza) { Renderizador.Opciones(instrumento = pieza.instr) }
    val desde = remember(pieza) { maxOf(0.0, (pieza.notas.firstOrNull()?.inicio ?: 0.0) - 1.0) }
    val ciclo = minOf(10.0, maxOf(4.0, pieza.duracion - desde))
    val inicio = remember { System.nanoTime() }
    val altoMax = 220.dp
    val proporcion = formato.ancho.toFloat() / formato.alto
    Box(
        modifier
            .height(altoMax)
            .aspectRatio(proporcion, matchHeightConstraintsFirst = true)
            .clip(RoundedCornerShape(6.dp))
            .border(1.dp, C3.Linea, RoundedCornerShape(6.dp)),
    ) {
        Lienzo(Modifier.fillMaxSize().semantics { contentDescription = "Vista previa del video" }) { c, w, h ->
            val t = desde + ((System.nanoTime() - inicio) / 1e9) % ciclo
            // Se dibuja como en el video (a su resolución) y se escala a la miniatura.
            val escala = w / formato.ancho
            c.save()
            c.scale(escala, escala)
            renderizador.dibujar(c, formato.ancho.toFloat(), formato.alto.toFloat(), pieza.notas, pieza.pedales, t, rango, op = opciones)
            c.restore()
        }
        Etiqueta("Vista previa", Modifier.align(Alignment.TopStart).padding(8.dp))
    }
}

@Composable
private fun AvanceExportacion(e: Exportacion.Estado.Trabajando) {
    val ahora = relojDeCuadros()
    val avance = remember { AvanceSuave(System.currentTimeMillis(), 0.05) }
    LaunchedEffect(e.avance) { avance.actualizar(e.avance.toDouble(), System.currentTimeMillis()) }
    val v = avance.valor(ahora).toFloat()
    val falta = AvanceSuave.texto(avance.restante(ahora))
    Panel(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(if (e.avance < 0.1f) "Preparando el sonido…" else "Dibujando el video…", style = Tipos.Texto, modifier = Modifier.weight(1f))
            Lcd("${(v * 100).toInt()} %", tamano = 12)
        }
        Avance(v, Modifier.padding(vertical = 12.dp))
        Text(
            (falta?.let { "$it · " } ?: "") + "Puedes salir de la app: el video sigue en segundo plano (se arma uno a la vez).",
            style = Tipos.Secundario,
        )
        Tecla("Cancelar", Exportacion::cancelar, modifier = Modifier.padding(top = 12.dp))
    }
}

/** Los codificadores piden medidas pares. */
private fun par(x: Double) = (x.toInt() / 2) * 2
