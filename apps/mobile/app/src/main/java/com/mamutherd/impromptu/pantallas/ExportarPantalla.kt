package com.mamutherd.impromptu.pantallas

import androidx.compose.runtime.Composable
import com.mamutherd.impromptu.Navegador

@Composable
fun ExportarPantalla(id: String, nav: Navegador) {
    Encabezado("Video", { nav.volver() })
}
