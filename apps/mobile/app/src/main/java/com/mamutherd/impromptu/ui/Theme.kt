@file:OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)

package com.mamutherd.impromptu.ui

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.mamutherd.impromptu.R

/** Identidad C3 · Consola ámbar (docs/DESIGN.md §2): tokens de color. */
object C3 {
    val Carbon = Color(0xFF1C1C1A)
    val Panel = Color(0xFF232321)
    val PanelAlto = Color(0xFF2E2E2B)
    val Linea = Color(0xFF3D3D39)
    val Chasis = Color(0xFFE8E4DC)
    val GrisTecla = Color(0xFF9A968C)
    val GrisTexto = Color(0xFFA39F95)
    val Ambar = Color(0xFFFF9F1C)
    val Lcd = Color(0xFF2A1A04)
    val LcdBorde = Color(0xFF7A4A00)
    val Grabacion = Color(0xFFB83A0B)
    val PuntoRec = Color(0xFFD9480F)
    val TeclaOscuraBorde = Color(0xFF0E0E0D)
    val FondoVisualizador = Color(0xFF111110)
}

private fun archivo(weight: Int) = Font(
    R.font.archivo,
    FontWeight(weight),
    variationSettings = FontVariation.Settings(FontVariation.weight(weight)),
)

private fun martian(weight: Int) = Font(
    R.font.martian_mono,
    FontWeight(weight),
    variationSettings = FontVariation.Settings(FontVariation.weight(weight)),
)

/** Archivo para textos y títulos; Martian Mono para logo, LCD, números y etiquetas (DESIGN §3). */
val Archivo = FontFamily(archivo(400), archivo(500), archivo(600))
val MartianMono = FontFamily(martian(400), martian(500))

object Tipos {
    val TituloPantalla = TextStyle(fontFamily = Archivo, fontWeight = FontWeight(500), fontSize = 28.sp, color = C3.Chasis)
    val TituloPanel = TextStyle(fontFamily = Archivo, fontWeight = FontWeight(500), fontSize = 20.sp, color = C3.Chasis)
    val Texto = TextStyle(fontFamily = Archivo, fontWeight = FontWeight(400), fontSize = 15.sp, lineHeight = 23.sp, color = C3.Chasis)
    val Boton = TextStyle(fontFamily = Archivo, fontWeight = FontWeight(500), fontSize = 15.sp)
    val Secundario = TextStyle(fontFamily = Archivo, fontWeight = FontWeight(400), fontSize = 13.sp, lineHeight = 19.sp, color = C3.GrisTexto)
    val Etiqueta = TextStyle(fontFamily = MartianMono, fontWeight = FontWeight(500), fontSize = 11.sp, letterSpacing = 1.5.sp, color = C3.GrisTexto)
    val Mono = TextStyle(fontFamily = MartianMono, fontWeight = FontWeight(400), fontSize = 13.sp, color = C3.GrisTexto)
}
