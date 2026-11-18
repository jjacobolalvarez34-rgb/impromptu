package com.mamutherd.impromptu.pantallas

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.midi.Grabacion
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.PuntoRec
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import com.mamutherd.impromptu.visual.Renderizador
import kotlinx.coroutines.delay

/**
 * Grabar con el teclado MIDI, en horizontal: las notas salen del teclado hacia arriba mientras
 * se toca, con el sonido del piano. Al detener se guarda la pieza y se abre.
 */
@Composable
fun GrabarPantalla(nav: Navegador) {
    val teclado = Impromptu.teclado
    val renderizador = remember { Renderizador() }
    val opciones = remember { Renderizador.Opciones(subiendo = true) }
    var grabacion by remember { mutableStateOf<Grabacion?>(null) }
    var segundos by remember { mutableDoubleStateOf(0.0) }
    var salir by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        onDispose { Impromptu.grabacion = null }
    }
    LaunchedEffect(grabacion) {
        val g = grabacion ?: return@LaunchedEffect
        while (true) {
            segundos = g.segundos()
            delay(200)
        }
    }

    fun empezar() {
        val g = Grabacion()
        Impromptu.grabacion = g
        grabacion = g
    }

    fun detener() {
        val g = grabacion ?: return
        Impromptu.grabacion = null
        grabacion = null
        val (notas, pedales) = g.terminar()
        if (notas.isEmpty()) return
        val p = Impromptu.piezas.nueva(Impromptu.piezas.siguienteTitulo("Grabación"), Origen.Teclado, notas, pedales)
        Impromptu.piezas.guardar(p)
        nav.reemplazar(Pantalla.Pieza(p.id))
    }

    BackHandler(enabled = grabacion != null) { salir = true }

    Box(Modifier.fillMaxSize().background(C3.FondoVisualizador)) {
        Lienzo(Modifier.fillMaxSize().semantics { contentDescription = "Teclado y notas grabadas" }) { c, w, h ->
            val g = grabacion
            renderizador.dibujar(
                c, w, h,
                notas = g?.vista ?: emptyList(),
                pedales = emptyList(),
                t = g?.segundos() ?: 0.0,
                rango = 36..96,
                abajo = teclado.abajo,
                sustainVivo = teclado.sustain,
                op = opciones,
            )
        }
        Row(
            Modifier
                .fillMaxWidth()
                .background(C3.Carbon.copy(alpha = 0.88f))
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 4.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            BotonIcono(Iconos.Volver, "Volver", { if (grabacion != null) salir = true else nav.volver() })
            Text(
                when {
                    teclado.nombre == null -> "Conecta tu teclado por USB (cable OTG)"
                    grabacion != null -> "Grabando: toca y suelta el pedal cuando quieras"
                    else -> teclado.nombre!!
                },
                style = Tipos.Texto,
                maxLines = 1,
                modifier = Modifier.weight(1f),
            )
            if (Impromptu.motor == null) Text("SIN SONIDO", style = Tipos.Etiqueta.copy(color = C3.Ambar))
            Lcd(formatoTiempo(segundos), tamano = 14)
            if (grabacion == null) {
                Tecla(
                    "Grabar",
                    ::empezar,
                    principal = true,
                    altura = 44.dp,
                    icono = { PuntoRec(12.dp) },
                )
            } else {
                Tecla(
                    "Detener y guardar",
                    ::detener,
                    principal = true,
                    altura = 44.dp,
                    icono = { Icono(Iconos.Detener, null, color = C3.Grabacion, tamano = 16.dp) },
                )
            }
        }
    }

    if (salir) {
        Confirmar(
            "¿Salir sin guardar?",
            "Lo que grabaste se pierde. Para guardarlo, toca \"Detener y guardar\".",
            "Salir sin guardar",
            {
                salir = false
                Impromptu.grabacion = null
                grabacion = null
                nav.volver()
            },
            { salir = false },
            no = "Seguir grabando",
        )
    }
}
