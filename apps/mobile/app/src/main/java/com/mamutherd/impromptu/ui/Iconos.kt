package com.mamutherd.impromptu.ui

import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.addPathNodes
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Íconos de línea al estilo Lucide (ISC; DESIGN: "Íconos: Lucide"): 24×24, trazo de 2 y
 * puntas redondas. Solo los que usa la app, dibujados con sus trazos.
 */
object Iconos {
    private fun icono(nombre: String, vararg trazos: String, relleno: Boolean = false) =
        ImageVector.Builder(nombre, 24.dp, 24.dp, 24f, 24f).apply {
            for (d in trazos) addPath(
                pathData = addPathNodes(d),
                fill = if (relleno) SolidColor(Color.White) else null,
                stroke = SolidColor(Color.White),
                strokeLineWidth = 2f,
                strokeLineCap = StrokeCap.Round,
                strokeLineJoin = StrokeJoin.Round,
            )
        }.build()

    val Volver = icono("volver", "M12 19l-7-7 7-7", "M19 12H5")
    val Tocar = icono("tocar", "M6 3l14 9-14 9V3z", relleno = true)
    val Pausa = icono("pausa", "M6 4h4v16H6z", "M14 4h4v16h-4z", relleno = true)
    val Inicio = icono("inicio", "M19 20L9 12l10-8v16z", "M5 19V5")
    val Detener = icono("detener", "M6 6h12v12H6z", relleno = true)
    val Microfono = icono(
        "microfono",
        "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z",
        "M19 10v2a7 7 0 0 1-14 0v-2",
        "M12 19v3",
    )
    val Teclado = icono("teclado", "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z", "M8 5v8", "M12 5v8", "M16 5v8", "M8 13v6", "M16 13v6", "M12 13v6")
    val ArchivoAudio = icono(
        "archivo-audio",
        "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
        "M14 2v6h6",
        "M10 18a2 2 0 1 1-4 0a2 2 0 1 1 4 0",
        "M10 18v-6l4 1.5",
    )
    val Abrir = icono("abrir", "M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2")
    val Ajustes = icono("ajustes", "M21 4h-7", "M10 4H3", "M21 12h-9", "M8 12H3", "M21 20h-5", "M12 20H3", "M14 2v4", "M8 10v4", "M16 18v4")
    val Partitura = icono("partitura", "M9 18V5l12-2v13", "M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0", "M21 16a3 3 0 1 1-6 0a3 3 0 1 1 6 0")
    val Video = icono("video", "M16 13l5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5", "M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z")
    val Descargar = icono("descargar", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3")
    val Compartir = icono("compartir", "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "M16 6l-4-4-4 4", "M12 2v13")
    val Borrar = icono("borrar", "M3 6h18", "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")
    val Editar = icono("editar", "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z")
    val Cerrar = icono("cerrar", "M18 6L6 18", "M6 6l12 12")
    val Listo = icono("listo", "M20 6L9 17l-5-5")
    val Mas = icono("mas", "M12 5v14", "M5 12h14")
    val Tambor = icono("tambor", "M2 8c0-1.7 4.5-3 10-3s10 1.3 10 3-4.5 3-10 3S2 9.7 2 8z", "M2 8v8c0 1.7 4.5 3 10 3s10-1.3 10-3V8", "M7 11v8", "M17 11v8")
    val Guitarra = icono("guitarra", "M20 2l2 2-6.5 6.5", "M15.5 8.5a5 5 0 0 0-3.9-1.4c-1.9.3-2.6 2-4 2.8C4.8 11.4 2 12.5 2 16c0 3 3 6 6 6 3.5 0 4.6-2.8 6.1-5.6.8-1.4 2.5-2.1 2.8-4a5 5 0 0 0-1.4-3.9z", "M9 15h.01")
    val Piano = icono("piano", "M18.5 8c-1.4 0-2.6-.8-3.2-2A6.87 6.87 0 0 0 2 9v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8.5C22 9.6 20.4 8 18.5 8", "M2 14h20", "M6 14v4", "M10 14v4", "M14 14v4", "M18 14v4")
}

@Composable
fun Icono(icono: ImageVector, descripcion: String?, color: Color = C3.Chasis, tamano: Dp = 22.dp, modifier: Modifier = Modifier) {
    Icon(icono, descripcion, modifier = modifier.size(tamano), tint = color)
}
