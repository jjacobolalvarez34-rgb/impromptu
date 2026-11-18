package com.mamutherd.impromptu.pantallas

import androidx.compose.runtime.Composable
import com.mamutherd.impromptu.Navegador

@Composable
fun PartituraPantalla(id: String, nav: Navegador) {
    Encabezado("Partitura", { nav.volver() })
}
