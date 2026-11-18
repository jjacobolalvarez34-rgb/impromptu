package com.mamutherd.impromptu.pantallas

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.paquetes.Paquetes
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Logo
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlin.coroutines.cancellation.CancellationException

/** Instalación del paquete de piano. Vive fuera de la pantalla: sigue aunque se cambie de vista. */
object Instalacion {
    sealed interface Estado {
        data object Quieta : Estado
        data class Bajando(val listas: Int, val total: Int) : Estado
        data object PreparandoIa : Estado
        data object Lista : Estado
        data class Fallo(val mensaje: String) : Estado
    }

    var estado by mutableStateOf<Estado>(Estado.Quieta)
        private set
    private var trabajo: Job? = null

    fun iniciar() {
        if (trabajo?.isActive == true) return
        estado = Estado.Bajando(0, 1)
        trabajo = Impromptu.alcance.launch {
            try {
                Impromptu.paquetes.instalarPiano { a ->
                    estado = when (a) {
                        is Paquetes.Avance.Sonido -> Estado.Bajando(a.listas, a.total)
                        Paquetes.Avance.Ia -> Estado.PreparandoIa
                    }
                }
                Impromptu.encenderSonido()
                estado = Estado.Lista
            } catch (e: CancellationException) {
                estado = Estado.Quieta
            } catch (e: Throwable) {
                estado = Estado.Fallo(e.message ?: "No se pudo instalar el piano.")
            }
        }
    }

    fun cancelar() {
        trabajo?.cancel()
        trabajo = null
        estado = Estado.Quieta
    }
}

@Composable
fun PaquetesPantalla(primeraVez: Boolean, alVolver: () -> Unit, alTerminar: () -> Unit) {
    val instalado = Impromptu.paquetes.pianoInstalado || Instalacion.estado == Instalacion.Estado.Lista
    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        if (!primeraVez) Encabezado("Instrumentos", alVolver)
        Column(
            Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            if (primeraVez) {
                Spacer(Modifier.height(20.dp))
                Logo(tamano = 22)
                Text("Elige qué instalar", style = Tipos.TituloPantalla, modifier = Modifier.padding(top = 12.dp))
                Text(
                    "Se descarga una sola vez. Después todo funciona sin internet.",
                    style = Tipos.Secundario,
                )
            }
            Panel(Modifier.fillMaxWidth()) {
                Cabeza(Iconos.Piano, "Piano", if (instalado) "INSTALADO" else "UNOS 90 MB")
                Text(
                    "Todo lo del piano: el sonido de un piano de cola (Salamander) y la IA que convierte audio en notas con pedal (Transkun).",
                    style = Tipos.Secundario,
                    modifier = Modifier.padding(top = 10.dp, bottom = 14.dp),
                )
                when (val e = Instalacion.estado) {
                    is Instalacion.Estado.Bajando -> {
                        Text("Descargando el sonido… ${e.listas} de ${e.total}", style = Tipos.Texto)
                        Avance(if (e.total > 0) e.listas.toFloat() / e.total else null, Modifier.padding(vertical = 12.dp))
                        Tecla("Cancelar", Instalacion::cancelar)
                    }
                    Instalacion.Estado.PreparandoIa -> {
                        Text("Preparando la IA…", style = Tipos.Texto)
                        Avance(null, Modifier.padding(top = 12.dp))
                    }
                    is Instalacion.Estado.Fallo -> {
                        Text(e.mensaje, style = Tipos.Texto.copy(color = C3.Ambar))
                        Text("Lo que ya se descargó se guarda: al reintentar sigue desde ahí.", style = Tipos.Secundario, modifier = Modifier.padding(vertical = 8.dp))
                        Tecla("Reintentar", Instalacion::iniciar, principal = true)
                    }
                    else -> if (!instalado) Tecla("Descargar piano", Instalacion::iniciar, principal = true, modifier = Modifier.fillMaxWidth())
                    else Text("Listo: ${Impromptu.paquetes.megasPiano} MB en el celular.", style = Tipos.Secundario)
                }
            }
            Panel(Modifier.fillMaxWidth()) {
                Cabeza(Iconos.Tambor, "Batería", "PRONTO", apagado = true)
            }
            Panel(Modifier.fillMaxWidth()) {
                Cabeza(Iconos.Guitarra, "Guitarra", "PRONTO", apagado = true)
            }
        }
        if (primeraVez) {
            Column(Modifier.padding(20.dp)) {
                Tecla(
                    if (instalado) "Continuar" else "Ahora no",
                    alTerminar,
                    principal = instalado,
                    modifier = Modifier.fillMaxWidth(),
                    altura = 52.dp,
                )
                if (!instalado) Etiqueta("Sin el piano no hay sonido; lo puedes instalar luego en Ajustes.", Modifier.padding(top = 10.dp))
            }
        }
    }
}

@Composable
private fun Cabeza(icono: ImageVector, nombre: String, estado: String, apagado: Boolean = false) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icono(icono, null, color = if (apagado) C3.GrisTexto else C3.Ambar, tamano = 26.dp)
        Spacer(Modifier.width(12.dp))
        Text(nombre, style = Tipos.TituloPanel.copy(color = if (apagado) C3.GrisTexto else C3.Chasis), modifier = Modifier.weight(1f))
        if (apagado) Etiqueta(estado) else Lcd(estado, tamano = 11)
    }
}
