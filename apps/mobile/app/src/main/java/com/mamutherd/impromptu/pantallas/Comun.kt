package com.mamutherd.impromptu.pantallas

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos

/** Botón de solo ícono, con área de toque de 48 dp y su nombre para lectores de pantalla. */
@Composable
fun BotonIcono(icono: ImageVector, descripcion: String, onClick: () -> Unit, modifier: Modifier = Modifier, color: androidx.compose.ui.graphics.Color = C3.Chasis, habilitado: Boolean = true) {
    Box(
        modifier
            .size(48.dp)
            .clip(RoundedCornerShape(4.dp))
            .clickable(enabled = habilitado, role = Role.Button, onClickLabel = descripcion, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icono(icono, descripcion, color = if (habilitado) color else color.copy(alpha = 0.4f))
    }
}

/** Barra superior con el botón de volver siempre visible (BUG-003). */
@Composable
fun Encabezado(titulo: String, alVolver: () -> Unit, modifier: Modifier = Modifier, acciones: @Composable RowScope.() -> Unit = {}) {
    Row(
        modifier.fillMaxWidth().height(56.dp).padding(horizontal = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BotonIcono(Iconos.Volver, "Volver", alVolver)
        Text(
            titulo,
            style = Tipos.TituloPanel,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f).padding(start = 4.dp),
        )
        acciones()
    }
}

/** Caja de panel (DESIGN §4): fondo panel, borde de línea, radio 6. */
@Composable
fun Panel(modifier: Modifier = Modifier, contenido: @Composable ColumnScope.() -> Unit) {
    Column(
        modifier
            .clip(RoundedCornerShape(6.dp))
            .background(C3.Panel)
            .border(1.dp, C3.Linea, RoundedCornerShape(6.dp))
            .padding(16.dp),
        content = contenido,
    )
}

/** Barra de avance en ámbar (sin animaciones de relleno falsas: muestra el avance real). */
@Composable
fun Avance(valor: Float?, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)).background(C3.Linea)) {
        if (valor != null) {
            Box(Modifier.fillMaxWidth(valor.coerceIn(0f, 1f)).fillMaxHeight().background(C3.Ambar))
        } else {
            Box(Modifier.fillMaxWidth(0.25f).fillMaxHeight().background(C3.LcdBorde))
        }
    }
}

/** Ventana de confirmación con dos opciones. */
@Composable
fun Confirmar(titulo: String, texto: String, si: String, alSi: () -> Unit, alNo: () -> Unit, no: String = "Cancelar") {
    Dialog(onDismissRequest = alNo) {
        Panel(Modifier.fillMaxWidth()) {
            Text(titulo, style = Tipos.TituloPanel)
            Text(texto, style = Tipos.Secundario, modifier = Modifier.padding(top = 8.dp, bottom = 20.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.End)) {
                Tecla(no, alNo)
                Tecla(si, alSi, principal = true)
            }
        }
    }
}

/** Ventana para escribir un nombre. */
@Composable
fun PedirTexto(titulo: String, inicial: String, alAceptar: (String) -> Unit, alCancelar: () -> Unit) {
    var texto by remember { mutableStateOf(inicial) }
    Dialog(onDismissRequest = alCancelar) {
        Panel(Modifier.fillMaxWidth()) {
            Text(titulo, style = Tipos.TituloPanel)
            BasicTextField(
                texto,
                { texto = it },
                singleLine = true,
                textStyle = Tipos.Texto,
                cursorBrush = SolidColor(C3.Ambar),
                modifier = Modifier
                    .padding(vertical = 16.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(4.dp))
                    .background(C3.Carbon)
                    .border(1.dp, C3.Ambar, RoundedCornerShape(4.dp))
                    .padding(12.dp),
            )
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.End)) {
                Tecla("Cancelar", alCancelar)
                Tecla("Guardar", { alAceptar(texto) }, principal = true, habilitada = texto.isNotBlank())
            }
        }
    }
}
