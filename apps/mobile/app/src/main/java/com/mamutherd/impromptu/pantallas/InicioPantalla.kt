package com.mamutherd.impromptu.pantallas

import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.datos.Pieza
import com.mamutherd.impromptu.datos.Smf
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.importarMidi
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Logo
import com.mamutherd.impromptu.ui.PuntoRec
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Pantalla principal ("Piezas primero", DESIGN §5): arriba el estado del teclado y las cuatro
 * formas de crear una pieza; debajo, las piezas guardadas.
 */
@Composable
fun InicioPantalla(nav: Navegador) {
    val context = LocalContext.current
    val alcance = rememberCoroutineScope()
    val pedirNotificaciones = rememberPedirNotificaciones()
    var menu by remember { mutableStateOf<String?>(null) }
    var renombrar by remember { mutableStateOf<Pieza?>(null) }
    var borrar by remember { mutableStateOf<Pieza?>(null) }
    var exportarMidi by remember { mutableStateOf<Pieza?>(null) }

    val abrirAudio = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        if (!Impromptu.iaDisponible) {
            Toast.makeText(context, "Esta versión de la app no trae la IA. Instala el paquete de piano.", Toast.LENGTH_LONG).show()
            return@rememberLauncherForActivityResult
        }
        val nombre = nombreDe(context, uri) ?: Impromptu.piezas.siguienteTitulo("Audio")
        pedirNotificaciones()
        alcance.launch {
            runCatching { Impromptu.conversiones.encolarArchivo(uri, nombre) }
                .onFailure { Toast.makeText(context, "No se pudo leer ese audio.", Toast.LENGTH_LONG).show() }
        }
    }
    val abrirMidi = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri != null) importarMidi(context, uri)?.let { nav.ir(Pantalla.Pieza(it)) }
    }
    val guardarMidi = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("audio/midi")) { uri ->
        val p = exportarMidi
        exportarMidi = null
        if (uri == null || p == null) return@rememberLauncherForActivityResult
        runCatching { context.contentResolver.openOutputStream(uri)!!.use { it.write(Smf.escribir(p)) } }
            .onSuccess { Toast.makeText(context, "MIDI guardado.", Toast.LENGTH_SHORT).show() }
            .onFailure { Toast.makeText(context, "No se pudo guardar el MIDI.", Toast.LENGTH_LONG).show() }
    }

    val acciones: @Composable (Int) -> Unit = { columnas ->
        val lista = listOf<@Composable (Modifier) -> Unit>(
            { m -> Accion(Iconos.Teclado, "Grabar", "Con tu teclado por USB", m, destacada = true) { nav.ir(Pantalla.Grabar) } },
            { m -> Accion(Iconos.Microfono, "Micrófono", "Toca y la app escribe", m) { nav.ir(Pantalla.Microfono) } },
            { m -> Accion(Iconos.ArchivoAudio, "Audio a notas", "MP3, WAV o M4A", m) { abrirAudio.launch(arrayOf("audio/*")) } },
            { m ->
                Accion(Iconos.Abrir, "Abrir MIDI", "Archivo .mid", m) {
                    abrirMidi.launch(arrayOf("audio/midi", "audio/x-midi", "audio/mid", "application/octet-stream"))
                }
            },
        )
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            for (fila in lista.chunked(columnas)) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    for (a in fila) a(Modifier.weight(1f))
                }
            }
        }
    }
    val piezas: LazyListScope.() -> Unit = {
        item(key = "titulo-piezas") {
            Row(Modifier.padding(top = 18.dp).animateItem(), verticalAlignment = Alignment.CenterVertically) {
                Etiqueta("Tus piezas", Modifier.weight(1f))
                Etiqueta("${Impromptu.piezas.lista.size}")
            }
        }
        if (Impromptu.piezas.lista.isEmpty()) {
            item(key = "vacio") {
                Panel(Modifier.fillMaxWidth().animateItem()) {
                    Text("Todavía no hay piezas.", style = Tipos.Texto)
                    Text("Graba con el teclado, usa el micrófono o abre un MIDI.", style = Tipos.Secundario, modifier = Modifier.padding(top = 4.dp))
                }
            }
        }
        items(Impromptu.piezas.lista, key = { it.id }) { p ->
            FilaPieza(
                p,
                abierta = menu == p.id,
                alAbrir = { nav.ir(Pantalla.Pieza(p.id)) },
                alMenu = { menu = if (menu == p.id) null else p.id },
                alRenombrar = { renombrar = p },
                alGuardarMidi = {
                    exportarMidi = p
                    guardarMidi.launch("${p.titulo}.mid")
                },
                alVideo = { nav.ir(Pantalla.Exportar(p.id)) },
                alBorrar = { borrar = p },
                modifier = Modifier.animateItem(),
            )
        }
    }
    val cabecera: @Composable () -> Unit = {
        Row(Modifier.fillMaxWidth().height(64.dp), verticalAlignment = Alignment.CenterVertically) {
            Logo(tamano = 24, modifier = Modifier.weight(1f))
            BotonIcono(Iconos.Ajustes, "Ajustes", { nav.ir(Pantalla.Ajustes) })
        }
    }

    BoxWithConstraints(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        if (maxWidth >= 720.dp) {
            // Tableta: a la izquierda crear (y la cola); a la derecha las piezas.
            Row(Modifier.fillMaxSize().padding(horizontal = 24.dp), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                Column(
                    Modifier.weight(0.45f).verticalScroll(rememberScrollState()).padding(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    cabecera()
                    EstadoTeclado()
                    acciones(2)
                    ColaConversiones(nav, Modifier.fillMaxWidth())
                }
                LazyColumn(
                    Modifier.weight(0.55f),
                    contentPadding = PaddingValues(top = 46.dp, bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    content = piezas,
                )
            }
        } else {
            LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 20.dp, end = 20.dp, bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                item(key = "cabecera") { cabecera() }
                item(key = "teclado") { EstadoTeclado() }
                item(key = "cola") { ColaConversiones(nav, Modifier.fillMaxWidth()) }
                item(key = "acciones") { acciones(2) }
                piezas()
            }
        }
    }

    renombrar?.let { p ->
        PedirTexto("Nombre de la pieza", p.titulo, { Impromptu.piezas.renombrar(p.id, it); renombrar = null }, { renombrar = null })
    }
    borrar?.let { p ->
        Confirmar(
            "¿Borrar \"${p.titulo}\"?",
            "Se borra del celular. Si la guardaste como MIDI, ese archivo queda.",
            "Borrar",
            { Impromptu.piezas.borrar(p.id); borrar = null; menu = null },
            { borrar = null },
        )
    }
}

@Composable
private fun EstadoTeclado() {
    val nombre = Impromptu.teclado.nombre
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(C3.Lcd)
            .border(1.dp, C3.LcdBorde, RoundedCornerShape(4.dp))
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(8.dp).clip(RoundedCornerShape(50)).background(if (nombre != null) C3.Ambar else C3.LcdBorde))
        Spacer(Modifier.width(10.dp))
        Text(
            if (nombre != null) nombre.uppercase() else "SIN TECLADO · CONÉCTALO POR USB (OTG)",
            style = Tipos.Mono.copy(color = C3.Ambar),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f),
        )
        if (Impromptu.motor == null) Text("SIN SONIDO", style = Tipos.Etiqueta.copy(color = C3.Ambar))
    }
}

@Composable
private fun Accion(icono: ImageVector, titulo: String, detalle: String, modifier: Modifier, destacada: Boolean = false, onClick: () -> Unit) {
    // Al tocarla se hunde un poco, como una tecla.
    val toque = remember { MutableInteractionSource() }
    val apretada by toque.collectIsPressedAsState()
    val escala by animateFloatAsState(if (apretada) 0.96f else 1f, label = "escala")
    Column(
        modifier
            .scale(escala)
            .heightIn(min = 112.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(if (destacada) C3.PanelAlto else C3.Panel)
            .border(1.dp, if (destacada) C3.LcdBorde else C3.Linea, RoundedCornerShape(6.dp))
            .clickable(interactionSource = toque, indication = null, role = Role.Button, onClick = onClick)
            .padding(14.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icono(icono, null, color = C3.Ambar, tamano = 26.dp)
            if (destacada) {
                Spacer(Modifier.weight(1f))
                PuntoRec(10.dp)
            }
        }
        Column(Modifier.padding(top = 18.dp)) {
            Text(titulo, style = Tipos.TituloPanel.copy(fontSize = Tipos.Texto.fontSize * 1.15f))
            Text(detalle, style = Tipos.Secundario, maxLines = 2)
        }
    }
}

private val fecha = SimpleDateFormat("d MMM", Locale.forLanguageTag("es"))

@Composable
private fun FilaPieza(
    p: Pieza,
    abierta: Boolean,
    alAbrir: () -> Unit,
    alMenu: () -> Unit,
    alRenombrar: () -> Unit,
    alGuardarMidi: () -> Unit,
    alVideo: () -> Unit,
    alBorrar: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(6.dp))
            .background(C3.Panel)
            .border(1.dp, if (abierta) C3.LcdBorde else C3.Linea, RoundedCornerShape(6.dp)),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(
                Modifier
                    .weight(1f)
                    .clickable(role = Role.Button, onClickLabel = "Abrir ${p.titulo}", onClick = alAbrir)
                    .padding(start = 14.dp, top = 12.dp, bottom = 12.dp, end = 8.dp),
            ) {
                Text(p.titulo, style = Tipos.Texto.copy(fontSize = Tipos.Texto.fontSize * 1.05f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    "${p.origen.texto.uppercase()} · ${formatoTiempo(p.duracion)} · ${p.notas.size} NOTAS · ${fecha.format(Date(p.creada)).uppercase()}",
                    style = Tipos.Etiqueta.copy(letterSpacing = Tipos.Etiqueta.letterSpacing * 0.5f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }
            BotonIcono(if (abierta) Iconos.Cerrar else Iconos.Mas, if (abierta) "Cerrar opciones" else "Opciones de ${p.titulo}", alMenu)
        }
        if (abierta) {
            Row(
                Modifier.fillMaxWidth().padding(start = 6.dp, end = 6.dp, bottom = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                MiniAccion(Iconos.Editar, "Nombre", alRenombrar)
                MiniAccion(Iconos.Descargar, "MIDI", alGuardarMidi)
                MiniAccion(Iconos.Video, "Video", alVideo)
                MiniAccion(Iconos.Borrar, "Borrar", alBorrar)
            }
        }
    }
}

@Composable
private fun MiniAccion(icono: ImageVector, texto: String, onClick: () -> Unit) {
    Column(
        Modifier
            .clip(RoundedCornerShape(4.dp))
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icono(icono, null, color = C3.Chasis, tamano = 20.dp)
        Text(texto, style = Tipos.Etiqueta, modifier = Modifier.padding(top = 4.dp))
    }
}

fun nombreDe(context: android.content.Context, uri: Uri): String? =
    context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c ->
        if (c.moveToFirst()) c.getString(0)?.substringBeforeLast('.') else null
    }
