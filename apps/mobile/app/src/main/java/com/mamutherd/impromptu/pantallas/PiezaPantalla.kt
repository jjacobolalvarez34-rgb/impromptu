package com.mamutherd.impromptu.pantallas

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.datos.Smf
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Chip
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import com.mamutherd.impromptu.visual.Renderizador

/** Lienzo que se redibuja en cada cuadro de la pantalla (60 fps), sin recomponer nada. */
@Composable
fun Lienzo(modifier: Modifier, dibujo: (android.graphics.Canvas, Float, Float) -> Unit) {
    var cuadro by remember { mutableLongStateOf(0L) }
    LaunchedEffect(Unit) { while (true) withFrameNanos { cuadro = it } }
    Canvas(modifier) {
        cuadro.let { }
        drawIntoCanvas { dibujo(it.nativeCanvas, size.width, size.height) }
    }
}

/** La pieza en horizontal: notas cayendo, transporte, partitura, video y MIDI. */
@Composable
fun PiezaPantalla(id: String, nav: Navegador) {
    val pieza = Impromptu.piezas.buscar(id)
    if (pieza == null) {
        LaunchedEffect(Unit) { nav.volver() }
        return
    }
    val context = LocalContext.current
    val motor = Impromptu.motor
    val renderizador = remember { Renderizador() }
    val rango = remember(pieza) { pieza.rango() }
    val opciones = remember(pieza) { Renderizador.Opciones(instrumento = pieza.instr) }
    var tocando by remember { mutableStateOf(false) }
    var tiempo by remember { mutableDoubleStateOf(0.0) }
    var velocidad by remember { mutableDoubleStateOf(1.0) }
    var controles by remember { mutableStateOf(true) }

    DisposableEffect(pieza) {
        val ficha = motor?.cargar(pieza)
        onDispose { if (ficha != null) motor.soltar(ficha) }
    }
    // Tiempo de la interfaz (LCD y barra): unas 15 veces por segundo basta.
    LaunchedEffect(motor) {
        while (true) {
            withFrameNanos { }
            if (motor != null) {
                tiempo = motor.posicionVisible
                tocando = motor.reproduciendo
            }
            kotlinx.coroutines.delay(60)
        }
    }
    val guardarMidi = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("audio/midi")) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        runCatching { context.contentResolver.openOutputStream(uri)!!.use { it.write(Smf.escribir(pieza)) } }
            .onSuccess { Toast.makeText(context, "MIDI guardado.", Toast.LENGTH_SHORT).show() }
            .onFailure { Toast.makeText(context, "No se pudo guardar el MIDI.", Toast.LENGTH_LONG).show() }
    }

    Box(Modifier.fillMaxSize().background(C3.FondoVisualizador)) {
        Lienzo(
            Modifier
                .fillMaxSize()
                .semantics { contentDescription = "Notas cayendo de ${pieza.titulo}" }
                .pointerInput(Unit) { detectTapGestures { controles = !controles } },
        ) { c, w, h ->
            renderizador.dibujar(c, w, h, pieza.notas, pieza.pedales, motor?.posicionVisible ?: tiempo, rango, op = opciones)
        }
        if (controles) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(C3.Carbon.copy(alpha = 0.88f))
                    .windowInsetsPadding(WindowInsets.safeDrawing)
                    .padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                BotonIcono(Iconos.Volver, "Volver", { nav.volver() })
                Text(pieza.titulo, style = Tipos.TituloPanel, maxLines = 1, modifier = Modifier.weight(1f).padding(start = 4.dp))
                Tecla("Partitura", { motor?.pausar(); nav.ir(Pantalla.Partitura(id)) }, altura = 40.dp, icono = { Icono(Iconos.Partitura, null, tamano = 18.dp) })
                Box(Modifier.width(8.dp))
                Tecla("Video", { motor?.pausar(); nav.ir(Pantalla.Exportar(id)) }, altura = 40.dp, icono = { Icono(Iconos.Video, null, tamano = 18.dp) })
                Box(Modifier.width(8.dp))
                Tecla("MIDI", { guardarMidi.launch("${pieza.titulo}.mid") }, altura = 40.dp, icono = { Icono(Iconos.Descargar, null, tamano = 18.dp) })
            }
            Column(
                Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(C3.Carbon.copy(alpha = 0.88f))
                    .windowInsetsPadding(WindowInsets.safeDrawing)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
            ) {
                if (motor == null) {
                    Text("Sin sonido: instala el piano en Ajustes para escuchar y reproducir.", style = Tipos.Secundario)
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Tecla(
                        "",
                        { motor?.buscar(0.0) },
                        altura = 44.dp,
                        habilitada = motor != null,
                        descripcion = "Al comienzo",
                        icono = { Icono(Iconos.Inicio, null, tamano = 18.dp) },
                    )
                    Tecla(
                        if (tocando) "Pausa" else "Tocar",
                        { if (tocando) motor?.pausar() else motor?.tocar() },
                        principal = true,
                        habilitada = motor != null,
                        altura = 44.dp,
                        icono = { Icono(if (tocando) Iconos.Pausa else Iconos.Tocar, null, color = C3.Carbon, tamano = 18.dp) },
                    )
                    Lcd("${formatoTiempo(tiempo)} / ${formatoTiempo(pieza.duracion)}", tamano = 13)
                    BarraTiempo(tiempo, pieza.duracion, Modifier.weight(1f)) { motor?.buscar(it); tiempo = it }
                    for (v in listOf(0.5, 0.75, 1.0)) {
                        Chip("${(v * 100).toInt()}%", velocidad == v, { velocidad = v; motor?.velocidad = v })
                    }
                }
            }
        }
    }
}

/** Barra de tiempo: tocar o arrastrar para ir a ese punto. */
@Composable
fun BarraTiempo(tiempo: Double, duracion: Double, modifier: Modifier = Modifier, alBuscar: (Double) -> Unit) {
    Canvas(
        modifier
            .height(44.dp)
            .semantics { contentDescription = "Posición ${formatoTiempo(tiempo)} de ${formatoTiempo(duracion)}" }
            .pointerInput(duracion) {
                detectTapGestures { alBuscar((it.x / size.width).coerceIn(0f, 1f) * duracion) }
            }
            .pointerInput(duracion) {
                detectHorizontalDragGestures { change, _ ->
                    alBuscar((change.position.x / size.width).coerceIn(0f, 1f) * duracion)
                }
            },
    ) {
        val y = size.height / 2
        val p = if (duracion > 0) (tiempo / duracion).toFloat().coerceIn(0f, 1f) else 0f
        drawRect(C3.Linea, topLeft = Offset(0f, y - 2), size = Size(size.width, 4f))
        drawRect(C3.Ambar, topLeft = Offset(0f, y - 2), size = Size(size.width * p, 4f))
        drawRect(C3.Chasis, topLeft = Offset(size.width * p - 4, y - 12), size = Size(8f, 24f))
    }
}
