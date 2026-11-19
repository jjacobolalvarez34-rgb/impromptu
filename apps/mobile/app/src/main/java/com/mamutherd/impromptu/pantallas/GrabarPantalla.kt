package com.mamutherd.impromptu.pantallas

import com.mamutherd.impromptu.instrumentos.Instrumento
import com.mamutherd.impromptu.instrumentos.Guitarra
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.midi.Grabacion
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.PuntoRec
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import com.mamutherd.impromptu.visual.Renderizador
import kotlinx.coroutines.delay
import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.mamutherd.impromptu.datos.Pieza
import com.mamutherd.impromptu.ui.Chip
import org.json.JSONObject

/**
 * Grabar con el teclado MIDI, en horizontal: las notas salen del teclado hacia arriba mientras
 * se toca, con el sonido del piano. Al detener se guarda la pieza y se abre.
 */
@Composable
fun GrabarPantalla(nav: Navegador) {
    val teclado = Impromptu.teclado
    val renderizador = remember { Renderizador() }
    val instrumento = Impromptu.instrumento
    val opciones = remember(instrumento) { Renderizador.Opciones(subiendo = true, instrumento = instrumento) }
    var grabacion by remember { mutableStateOf<Grabacion?>(null) }
    var segundos by remember { mutableDoubleStateOf(0.0) }
    var salir by remember { mutableStateOf(false) }
    // Ver las notas subiendo o la hoja escribiéndose mientras se toca (fase 10).
    var verHoja by remember { mutableStateOf(false) }

    DisposableEffect(Unit) {
        onDispose { Impromptu.grabacion = null }
    }
    LaunchedEffect(grabacion) {
        val g = grabacion ?: return@LaunchedEffect
        while (true) {
            segundos = g.segundos()
            delay(200)
        }
    }

    fun empezar() {
        val g = Grabacion()
        Impromptu.grabacion = g
        grabacion = g
    }

    fun detener() {
        val g = grabacion ?: return
        Impromptu.grabacion = null
        grabacion = null
        val (grabadas, pedalesGrabados) = g.terminar()
        if (grabadas.isEmpty()) return
        // Guitarra y bajo: cada nota con cuerda y traste; sin pedal fuera del piano.
        val notas = if (instrumento.cuerdas) Guitarra.asignar(grabadas, Guitarra.afinacion(instrumento, Impromptu.conversiones.afinacionGuitarra)) else grabadas
        val pedales = if (instrumento == Instrumento.Piano) pedalesGrabados else emptyList()
        val p = Impromptu.piezas.nueva(Impromptu.piezas.siguienteTitulo("Grabación"), Origen.Teclado, notas, pedales, instrumento.clave)
        Impromptu.piezas.guardar(p)
        nav.reemplazar(Pantalla.Pieza(p.id))
    }

    BackHandler(enabled = grabacion != null) { salir = true }

    Box(Modifier.fillMaxSize().background(C3.FondoVisualizador)) {
        if (verHoja) HojaEnVivo(grabacion, instrumento, Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing).padding(top = 56.dp))
        else Lienzo(Modifier.fillMaxSize().semantics { contentDescription = "Teclado y notas grabadas" }) { c, w, h ->
            val g = grabacion
            renderizador.dibujar(
                c, w, h,
                notas = g?.vista ?: emptyList(),
                pedales = emptyList(),
                t = g?.segundos() ?: 0.0,
                // Piano completo de 88 teclas.
                rango = 21..108,
                abajo = teclado.abajo,
                sustainVivo = teclado.sustain,
                op = opciones,
            )
        }
        Row(
            Modifier
                .fillMaxWidth()
                .background(C3.Carbon.copy(alpha = 0.88f))
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 4.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            BotonIcono(Iconos.Volver, "Volver", { if (grabacion != null) salir = true else nav.volver() })
            Text(
                when {
                    teclado.nombre == null -> "Conecta tu teclado por USB (cable OTG)"
                    grabacion != null -> "Grabando…"
                    else -> teclado.nombre!!
                },
                style = Tipos.Texto,
                maxLines = 1,
                modifier = Modifier.weight(1f),
            )
            if (Impromptu.motor == null) Text("SIN SONIDO", style = Tipos.Etiqueta.copy(color = C3.Ambar))
            Chip("Notas", !verHoja, { verHoja = false })
            Chip(if (instrumento.cuerdas) "Tablatura" else "Hoja", verHoja, { verHoja = true })
            Lcd(formatoTiempo(segundos), tamano = 14)
            if (grabacion == null) {
                Tecla(
                    "Grabar",
                    ::empezar,
                    principal = true,
                    altura = 44.dp,
                    icono = { PuntoRec(12.dp) },
                )
            } else {
                Tecla(
                    "Detener y guardar",
                    ::detener,
                    principal = true,
                    altura = 44.dp,
                    icono = { Icono(Iconos.Detener, null, color = C3.Grabacion, tamano = 16.dp) },
                )
            }
        }
    }

    if (salir) {
        Confirmar(
            "¿Salir sin guardar?",
            "Lo que grabaste se pierde. Para guardarlo, toca \"Detener y guardar\".",
            "Salir sin guardar",
            {
                salir = false
                Impromptu.grabacion = null
                grabacion = null
                nav.volver()
            },
            { salir = false },
            no = "Seguir grabando",
        )
    }
}

/**
 * La hoja escribiéndose mientras se graba (fase 10, "grabar directo en la partitura"): cada
 * segundo se manda lo tocado (las notas apretadas, cortadas en el instante actual) a la página
 * de la partitura, que la redibuja sin editor y baja hasta el final.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun HojaEnVivo(grabacion: Grabacion?, instrumento: Instrumento, modifier: Modifier) {
    var web by remember { mutableStateOf<WebView?>(null) }
    LaunchedEffect(web, grabacion) {
        val w = web ?: return@LaunchedEffect
        while (true) {
            val g = grabacion
            val ahora = g?.segundos() ?: 0.0
            val sonando = g != null
            val vistas = (g?.vista ?: emptyList()).map { if (it.fin < 0) it.copy(fin = maxOf(ahora, it.inicio + 0.05)) else it }
            val notas = if (instrumento.cuerdas && vistas.isNotEmpty()) {
                Guitarra.asignar(vistas.sortedBy { it.inicio }, Guitarra.afinacion(instrumento, Impromptu.conversiones.afinacionGuitarra))
            } else vistas.sortedBy { it.inicio }
            val p = Pieza("en-vivo", if (g != null) "Grabando" else "", 0L, Origen.Teclado, notas, emptyList(), instrumento.clave)
            val json = JSONObject.quote(p.aJsonWeb().toString())
            w.evaluateJavascript("window.impromptu && impromptu.enVivo($json, '4/4')", null)
            w.evaluateJavascript("window.impromptu && impromptu.reloj($ahora, $sonando, 1)", null)
            delay(1000)
        }
    }
    AndroidView(
        factory = { ctx ->
            val cargador = WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(ctx))
                .build()
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.allowFileAccess = false
                setBackgroundColor(0xFFE8E4DC.toInt())
                addJavascriptInterface(object {
                    @JavascriptInterface fun listo(b: Int) = Unit
                    @JavascriptInterface fun error(m: String) = Unit
                }, "Puente")
                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                        cargador.shouldInterceptRequest(request.url)
                }
                loadUrl("https://appassets.androidplatform.net/assets/partitura/index.html")
                web = this
            }
        },
        onRelease = { it.destroy() },
        modifier = modifier,
    )
}
