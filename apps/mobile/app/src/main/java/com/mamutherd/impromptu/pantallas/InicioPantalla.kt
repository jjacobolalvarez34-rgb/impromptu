package com.mamutherd.impromptu.pantallas

import android.net.Uri
import android.provider.OpenableColumns
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Conversion
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.datos.Origen
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
        Impromptu.convertir(nombre, Origen.Audio, uri = uri)
        nav.ir(Pantalla.Convirtiendo)
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

    LazyColumn(
        Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing),
        contentPadding = PaddingValues(start = 20.dp, end = 20.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth().height(64.dp), verticalAlignment = Alignment.CenterVertically) {
                Logo(tamano = 24, modifier = Modifier.weight(1f))
                BotonIcono(Iconos.Ajustes, "Ajustes", { nav.ir(Pantalla.Ajustes) })
            }
        }
        item { EstadoTeclado() }
        item { AvisoConversion(nav) }
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Accion(Iconos.Teclado, "Grabar", "Con tu teclado por USB", Modifier.weight(1f), destacada = true) { nav.ir(Pantalla.Grabar) }
                    Accion(Iconos.Microfono, "Micrófono", "Toca y la app escribe", Modifier.weight(1f)) { nav.ir(Pantalla.Microfono) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Accion(Iconos.ArchivoAudio, "Audio a notas", "MP3, WAV o M4A", Modifier.weight(1f)) { abrirAudio.launch(arrayOf("audio/*")) }
                    Accion(Iconos.Abrir, "Abrir MIDI", "Archivo .mid", Modifier.weight(1f)) {
                        abrirMidi.launch(arrayOf("audio/midi", "audio/x-midi", "audio/mid", "application/octet-stream"))
                    }
                }
            }
        }
        item {
            Row(Modifier.padding(top = 18.dp), verticalAlignment = Alignment.CenterVertically) {
                Etiqueta("Tus piezas", Modifier.weight(1f))
                Etiqueta("${Impromptu.piezas.lista.size}")
            }
        }
        if (Impromptu.piezas.lista.isEmpty()) {
            item {
                Panel(Modifier.fillMaxWidth()) {
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
            )
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
private fun AvisoConversion(nav: Navegador) {
    when (val c = Impromptu.conversion) {
        is Conversion.Leyendo, Conversion.Preparando, is Conversion.Escuchando -> Panel(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Convirtiendo audio a notas…", style = Tipos.Texto, modifier = Modifier.weight(1f))
                Tecla("Ver", { nav.ir(Pantalla.Convirtiendo) }, altura = 40.dp)
            }
            Avance((c as? Conversion.Escuchando)?.avance, Modifier.padding(top = 10.dp))
        }
        is Conversion.Lista -> Panel(Modifier.fillMaxWidth()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("La conversión está lista.", style = Tipos.Texto, modifier = Modifier.weight(1f))
                Tecla("Abrir", { Impromptu.olvidarConversion(); nav.ir(Pantalla.Pieza(c.piezaId)) }, principal = true, altura = 40.dp)
            }
        }
        is Conversion.Fallo -> Panel(Modifier.fillMaxWidth()) {
            Text(c.mensaje, style = Tipos.Texto)
            Tecla("Entendido", Impromptu::olvidarConversion, modifier = Modifier.padding(top = 10.dp), altura = 40.dp)
        }
        Conversion.Inactiva -> {}
    }
}

@Composable
private fun Accion(icono: ImageVector, titulo: String, detalle: String, modifier: Modifier, destacada: Boolean = false, onClick: () -> Unit) {
    Column(
        modifier
            .heightIn(min = 112.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(if (destacada) C3.PanelAlto else C3.Panel)
            .border(1.dp, if (destacada) C3.LcdBorde else C3.Linea, RoundedCornerShape(6.dp))
            .clickable(role = Role.Button, onClick = onClick)
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
) {
    Column(
        Modifier
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
