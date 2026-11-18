package com.mamutherd.impromptu.pantallas

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameMillis
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.trabajo.AvanceSuave
import com.mamutherd.impromptu.trabajo.Etapa
import com.mamutherd.impromptu.trabajo.TrabajoConversion
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos

/** Reloj que avanza en cada cuadro de la pantalla (para barras continuas). */
@Composable
fun relojDeCuadros(activo: Boolean = true): Long {
    var ahora by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(activo) {
        while (activo) withFrameMillis { ahora = System.currentTimeMillis() }
    }
    return ahora
}

/**
 * Cola de conversiones: la que trabaja con su barra continua, la frase que va cambiando y cuánto
 * falta; las que esperan; las que terminaron (para abrirlas) y el último problema.
 */
@Composable
fun ColaConversiones(nav: Navegador, modifier: Modifier = Modifier) {
    val c = Impromptu.conversiones
    val ahora = relojDeCuadros(c.cola.isNotEmpty())
    Column(modifier, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        AnimatedVisibility(c.cola.isNotEmpty(), enter = expandVertically() + fadeIn(), exit = shrinkVertically() + fadeOut()) {
            Panel(Modifier.fillMaxWidth()) {
                Etiqueta(if (c.cola.size > 1) "Convirtiendo · ${c.cola.size} en la cola" else "Convirtiendo")
                for ((i, t) in c.cola.toList().withIndex()) {
                    if (i == 0) FilaTrabajando(t, ahora) else FilaEsperando(t)
                }
                Text(
                    "Puedes seguir usando la app o salir: la conversión sigue y te avisa en las notificaciones.",
                    style = Tipos.Secundario,
                    modifier = Modifier.padding(top = 10.dp),
                )
            }
        }
        for (t in c.terminadas.toList()) {
            Panel(Modifier.fillMaxWidth()) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(t.titulo, style = Tipos.Texto, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Text("Lista: ya está en tus piezas.", style = Tipos.Secundario)
                    }
                    Tecla("Abrir", { c.olvidarTerminada(t); nav.ir(Pantalla.Pieza(t.piezaId)) }, principal = true, altura = 40.dp)
                }
            }
        }
        c.fallo?.let { m ->
            Panel(Modifier.fillMaxWidth()) {
                Text(m, style = Tipos.Texto)
                Tecla("Entendido", { c.fallo = null }, modifier = Modifier.padding(top = 10.dp), altura = 40.dp)
            }
        }
    }
}

@Composable
private fun FilaTrabajando(t: TrabajoConversion, ahora: Long) {
    val valor: Float? = when (t.etapa) {
        Etapa.Escuchando -> t.avance.valor(ahora).toFloat()
        Etapa.Leyendo -> t.lectura * 0.999f
        Etapa.Armando -> 1f
        else -> null
    }
    val falta = if (t.etapa == Etapa.Escuchando) AvanceSuave.texto(t.avance.restante(ahora)) else null
    Column(Modifier.padding(top = 10.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(t.titulo, style = Tipos.Texto, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
            if (t.etapa == Etapa.Escuchando && valor != null) Lcd("${(valor * 100).toInt()} %", tamano = 12)
            Tecla("Cancelar", { Impromptu.conversiones.cancelar(t.id) }, altura = 40.dp)
        }
        Avance(valor, Modifier.padding(vertical = 8.dp))
        Text(
            t.etapa.frase(ahora - t.inicio) + (falta?.let { " · $it" } ?: ""),
            style = Tipos.Secundario.copy(color = C3.GrisTexto),
        )
    }
}

@Composable
private fun FilaEsperando(t: TrabajoConversion) {
    Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(t.titulo, style = Tipos.Secundario, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
        Etiqueta("Espera", Modifier.padding(horizontal = 8.dp))
        Tecla("Quitar", { Impromptu.conversiones.cancelar(t.id) }, altura = 40.dp)
    }
}
