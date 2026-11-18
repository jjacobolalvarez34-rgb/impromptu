package com.mamutherd.impromptu.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Botón como tecla física (DESIGN §4): clara (principal, una por vista) u oscura. Al apretar,
 * baja 2 dp y el borde inferior se achica, como una tecla.
 */
@Composable
fun Tecla(
    texto: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    principal: Boolean = false,
    habilitada: Boolean = true,
    altura: Dp = 48.dp,
    icono: (@Composable RowScope.() -> Unit)? = null,
    descripcion: String? = null,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val fondo = if (principal) C3.Chasis else C3.PanelAlto
    val texto2 = if (principal) C3.Carbon else C3.Chasis
    val borde = if (principal) C3.GrisTecla else C3.TeclaOscuraBorde
    val bajo = if (pressed) 1.dp else 3.dp
    Row(
        modifier = modifier
            .defaultMinSize(minHeight = altura)
            .offset(y = if (pressed) 2.dp else 0.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(borde)
            .padding(bottom = bajo)
            .clip(RoundedCornerShape(4.dp))
            .background(if (habilitada) fondo else fondo.copy(alpha = 0.5f))
            .clickable(
                interactionSource = interaction,
                indication = null,
                enabled = habilitada,
                role = Role.Button,
                onClick = onClick,
            )
            .then(if (descripcion != null) Modifier.semantics { contentDescription = descripcion } else Modifier)
            .padding(horizontal = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
    ) {
        icono?.invoke(this)
        if (texto.isNotEmpty()) {
            Text(texto, style = Tipos.Boton.copy(color = if (habilitada) texto2 else texto2.copy(alpha = 0.6f)))
        }
    }
}

/** Selector de opciones (DESIGN §4): seleccionado en ámbar; el resto con borde. */
@Composable
fun Chip(texto: String, seleccionado: Boolean, onClick: () -> Unit, modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = 44.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(if (seleccionado) C3.Ambar else Color.Transparent)
            .border(BorderStroke(1.dp, if (seleccionado) C3.Ambar else C3.Linea), RoundedCornerShape(4.dp))
            .clickable(role = Role.RadioButton, onClick = onClick)
            .semantics { selected = seleccionado }
            .padding(horizontal = 14.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            texto,
            style = Tipos.Boton.copy(fontSize = 14.sp, color = if (seleccionado) C3.Carbon else C3.GrisTexto),
        )
    }
}

/** Pantalla LCD (DESIGN §4): fondo ámbar oscuro y texto ámbar en Martian Mono. */
@Composable
fun Lcd(texto: String, modifier: Modifier = Modifier, tamano: Int = 16) {
    Box(
        modifier
            .clip(RoundedCornerShape(3.dp))
            .background(C3.Lcd)
            .border(1.dp, C3.LcdBorde, RoundedCornerShape(3.dp))
            .padding(horizontal = 10.dp, vertical = 5.dp),
    ) {
        Text(texto, style = TextStyle(fontFamily = MartianMono, fontSize = tamano.sp, color = C3.Ambar))
    }
}

/** Interruptor cuadrado (DESIGN §4), con su texto. Toda la fila es el área de toque. */
@Composable
fun Interruptor(texto: String, encendido: Boolean, onCambio: (Boolean) -> Unit, modifier: Modifier = Modifier) {
    Row(
        modifier
            .defaultMinSize(minHeight = 48.dp)
            .clickable(role = Role.Switch) { onCambio(!encendido) }
            .semantics { this.role = Role.Switch; selected = encendido },
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(texto, style = Tipos.Texto, modifier = Modifier.weight(1f))
        Box(
            Modifier
                .size(width = 40.dp, height = 22.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(if (encendido) C3.Ambar else C3.Linea),
        ) {
            Box(
                Modifier
                    .padding(3.dp)
                    .offset(x = if (encendido) 18.dp else 0.dp)
                    .size(16.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(if (encendido) C3.Carbon else C3.Chasis),
            )
        }
    }
}

/** Etiqueta de sección: Martian Mono en mayúsculas (DESIGN §3). */
@Composable
fun Etiqueta(texto: String, modifier: Modifier = Modifier) {
    Text(texto.uppercase(), style = Tipos.Etiqueta, modifier = modifier)
}

/**
 * Logo (DESIGN §1): "impromptu" en Martian Mono, con el punto de la "i" como una nota ámbar
 * que cae, separada del palo; debajo, opcionalmente, la línea ámbar y el teclado.
 */
@Composable
fun Logo(tamano: Int = 22, conTeclado: Boolean = false, modifier: Modifier = Modifier) {
    Box(modifier.semantics { contentDescription = "Impromptu" }) {
        Text(
            "ımpromptu",
            style = TextStyle(
                fontFamily = MartianMono,
                fontWeight = FontWeight(500),
                fontSize = tamano.sp,
                letterSpacing = (-tamano * 0.035).sp,
                color = C3.Chasis,
            ),
            modifier = Modifier.drawBehind {
                val em = tamano.sp.toPx()
                // La nota: 0,13 em de ancho, 0,36 em de alto, sobre la "ı" y separada de ella.
                drawRect(
                    C3.Ambar,
                    topLeft = Offset(em * 0.235f, em * 0.02f),
                    size = Size(em * 0.13f, em * 0.30f),
                )
            },
        )
        if (conTeclado) {
            Canvas(
                Modifier
                    .padding(top = (tamano * 1.45).dp)
                    .width((tamano * 5.6).dp)
                    .height((tamano * 0.5).dp),
            ) {
                drawRect(C3.Ambar, size = Size(size.width, 2.dp.toPx()))
                val w = size.width / 10
                for (i in 0 until 10) {
                    drawRect(
                        if (i == 0) C3.Ambar else C3.Chasis,
                        topLeft = Offset(i * w + 1, 4.dp.toPx()),
                        size = Size(w - 2, size.height - 4.dp.toPx()),
                    )
                }
            }
        }
    }
}

/** Indicador redondo de grabación (punto rojo de DESIGN §4). */
@Composable
fun PuntoRec(size: Dp = 12.dp) {
    Box(Modifier.size(size).clip(RoundedCornerShape(50)).background(C3.PuntoRec))
}
