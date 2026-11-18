package com.mamutherd.impromptu.pantallas

import android.content.Context
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.BuildConfig
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.ui.Chip
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos

@Composable
fun AjustesPantalla(nav: Navegador) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("ajustes", Context.MODE_PRIVATE) }
    var sustain by remember { mutableDoubleStateOf(prefs.getFloat("panelSustain", 0f).toDouble()) }

    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Encabezado("Ajustes", { nav.volver() })
        Column(
            Modifier.verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Panel(Modifier.fillMaxWidth()) {
                Text("Sustain sin pedal", style = Tipos.TituloPanel)
                Text(
                    "Como el botón SUSTAIN del teclado: al soltar una tecla, la nota se apaga sola en este tiempo. Para tocar sin pedal.",
                    style = Tipos.Secundario,
                    modifier = Modifier.padding(top = 6.dp, bottom = 12.dp),
                )
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    for ((texto, v) in listOf("Apagado" to 0.0, "Corto" to 1.0, "Medio" to 2.5, "Largo" to 5.0)) {
                        Chip(texto, sustain == v, {
                            sustain = v
                            prefs.edit().putFloat("panelSustain", v.toFloat()).apply()
                            Impromptu.motor?.orden { it.panelSustain = v }
                        })
                    }
                }
            }
            Panel(Modifier.fillMaxWidth()) {
                Text("Instrumentos", style = Tipos.TituloPanel)
                Text(
                    if (Impromptu.paquetes.pianoInstalado) "Piano instalado (${Impromptu.paquetes.megasPiano} MB)." else "El piano no está instalado: no hay sonido.",
                    style = Tipos.Secundario,
                    modifier = Modifier.padding(top = 6.dp, bottom = 12.dp),
                )
                Tecla("Ver instrumentos", { nav.ir(Pantalla.Paquetes(primeraVez = false)) })
            }
            Panel(Modifier.fillMaxWidth()) {
                Text("Acerca de Impromptu", style = Tipos.TituloPanel)
                Text(
                    "Versión ${BuildConfig.VERSION_NAME}. Gratis y de código abierto. Un producto de Mamut Herd.",
                    style = Tipos.Texto,
                    modifier = Modifier.padding(top = 6.dp),
                )
                Text("Contacto: mamutherdoficial@gmail.com", style = Tipos.Secundario, modifier = Modifier.padding(top = 6.dp))
                Etiqueta("Créditos", Modifier.padding(top = 16.dp, bottom = 6.dp))
                Text(
                    "Sonido: Salamander Grand Piano, de Alexander Holm (CC-BY 3.0).\n" +
                        "Audio a notas: Transkun, de Yujia Yan (MIT), con ONNX Runtime (MIT).\n" +
                        "Partitura: OpenSheetMusicDisplay (BSD-3).\n" +
                        "Letras: Archivo y Martian Mono (OFL). Íconos al estilo Lucide (ISC).",
                    style = Tipos.Secundario,
                )
            }
        }
    }
}
