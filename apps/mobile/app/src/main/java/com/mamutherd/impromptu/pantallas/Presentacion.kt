package com.mamutherd.impromptu.pantallas

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Logo
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos

/**
 * Presentación de la primera vez: tres notas caen sobre un teclado, aparece el logo y se
 * cuenta en pocas líneas qué hace la app.
 */
@Composable
fun PresentacionPantalla(alEmpezar: () -> Unit) {
    val caida = remember { Animatable(0f) }
    val texto = remember { Animatable(0f) }
    LaunchedEffect(Unit) {
        caida.animateTo(1f, tween(1400, easing = LinearEasing))
        texto.animateTo(1f, tween(500))
    }
    Column(
        Modifier
            .fillMaxSize()
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp, vertical = 16.dp),
    ) {
        Canvas(Modifier.fillMaxWidth().height(180.dp)) { notasCayendo(caida.value) }
        Box(Modifier.padding(top = 8.dp)) { Logo(tamano = 34, conTeclado = false) }
        Column(Modifier.padding(top = 20.dp).fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            val a = texto.value
            Text(
                "Lo que tocas, convertido en notas cayendo, partitura y video.",
                style = Tipos.TituloPantalla.copy(color = C3.Chasis.copy(alpha = a)),
            )
            Punto(Iconos.Teclado, "Graba con tu teclado por USB, con pedal y todo.", a)
            Punto(Iconos.Microfono, "Toca cerca del celular o abre un MP3: la app escucha y escribe las notas.", a)
            Punto(Iconos.Partitura, "Mira la partitura y exporta el video para tus redes.", a)
            Punto(Iconos.Listo, "Gratis. Todo corre en tu celular, sin cuentas ni servidores.", a)
        }
        Spacer(Modifier.height(28.dp))
        Tecla("Empezar", alEmpezar, principal = true, modifier = Modifier.fillMaxWidth(), altura = 52.dp)
        Etiqueta("Un producto de Mamut Herd", Modifier.padding(top = 20.dp).align(Alignment.CenterHorizontally))
    }
}

@Composable
private fun Punto(icono: ImageVector, texto: String, alfa: Float) {
    Row(verticalAlignment = Alignment.Top) {
        Icono(icono, null, color = C3.Ambar.copy(alpha = alfa), tamano = 22.dp)
        Spacer(Modifier.width(14.dp))
        Text(texto, style = Tipos.Texto.copy(color = C3.Chasis.copy(alpha = alfa)))
    }
}

/** Tres notas ámbar que caen y encienden sus teclas al llegar (la tercera, más suave). */
private fun DrawScope.notasCayendo(p: Float) {
    val teclas = 14
    val w = size.width / teclas
    val altoTeclado = 46.dp.toPx()
    val tope = size.height - altoTeclado
    val notas = listOf(Triple(3, 0.0f, 1f), Triple(7, 0.22f, 1f), Triple(10, 0.42f, 0.5f))
    val encendidas = HashSet<Int>()
    for ((tecla, retraso, alfa) in notas) {
        val q = ((p - retraso) / 0.55f).coerceIn(0f, 1f)
        val largo = tope * 0.32f
        val y = -largo + q * (tope + largo)
        val visible = minOf(y + largo, tope) - maxOf(y, 0f)
        if (visible > 0) {
            drawRoundRect(
                C3.Ambar.copy(alpha = alfa),
                topLeft = Offset(tecla * w + 3, maxOf(y, 0f)),
                size = Size(w - 6, visible),
                cornerRadius = CornerRadius(4f),
            )
        }
        if (q > 0.7f && q < 1f || (q >= 1f && p < 0.98f)) encendidas += tecla
    }
    drawRect(C3.Ambar, topLeft = Offset(0f, tope), size = Size(size.width, 3.dp.toPx()))
    for (i in 0 until teclas) {
        drawRect(
            if (i in encendidas) C3.Ambar else C3.Chasis,
            topLeft = Offset(i * w + 1, tope + 5.dp.toPx()),
            size = Size(w - 2, altoTeclado - 5.dp.toPx()),
        )
    }
}

@Suppress("unused")
private val tamanoIcono = Modifier.size(22.dp)
