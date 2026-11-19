package com.mamutherd.impromptu.pantallas

import android.annotation.SuppressLint
import android.content.Intent
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Chip
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import kotlinx.coroutines.delay
import org.json.JSONObject
import java.io.File

/**
 * Partitura de la pieza en horizontal (fase 6 de la web, ADR-019): dos pentagramas con el
 * cursor siguiendo lo que suena. Se puede cambiar el compás y compartir el MusicXML.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PartituraPantalla(id: String, nav: Navegador) {
    val pieza = Impromptu.piezas.buscar(id)
    if (pieza == null) {
        LaunchedEffect(Unit) { nav.volver() }
        return
    }
    val context = LocalContext.current
    val motor = Impromptu.motor
    var compas by remember { mutableStateOf("4/4") }
    var soloTab by remember { mutableStateOf(false) }
    var estado by remember { mutableStateOf("Escribiendo la partitura…") }
    var bpm by remember { mutableStateOf<Int?>(null) }
    var tocando by remember { mutableStateOf(false) }
    var web by remember { mutableStateOf<WebView?>(null) }

    DisposableEffect(pieza) {
        val ficha = motor?.cargar(pieza)
        onDispose { if (ficha != null) motor.soltar(ficha) }
    }
    LaunchedEffect(web, compas, soloTab) {
        val w = web ?: return@LaunchedEffect
        estado = "Escribiendo la partitura…"
        bpm = null
        val json = JSONObject.quote(pieza.aJsonWeb().toString())
        // La página puede no haber cargado todavía: se reintenta hasta que exista `impromptu`.
        while (bpm == null) {
            w.evaluateJavascript("window.impromptu ? (impromptu.mostrar($json, '$compas', $soloTab), 1) : 0") { r ->
                if (r == "1") bpm = -1
            }
            delay(300)
        }
    }
    // Reloj para la línea de lectura: la página la mueve a 60 fps y extrapola entre avisos.
    LaunchedEffect(web, motor) {
        val w = web ?: return@LaunchedEffect
        while (true) {
            if (motor != null) {
                tocando = motor.reproduciendo
                w.evaluateJavascript("window.impromptu && impromptu.reloj(${motor.posicionVisible}, $tocando, ${motor.velocidad})", null)
            }
            delay(if (tocando) 250 else 120)
        }
    }

    Column(Modifier.fillMaxSize().background(C3.Carbon).windowInsetsPadding(WindowInsets.safeDrawing)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            BotonIcono(Iconos.Volver, "Volver", { nav.volver() })
            Text(pieza.titulo, style = Tipos.TituloPanel, maxLines = 1, modifier = Modifier.weight(1f))
            if (pieza.instr.cuerdas) Chip(if (soloTab) "Solo tab" else "Notas y tab", soloTab, { soloTab = !soloTab })
            for (c in listOf("4/4", "3/4", "2/4", "6/8")) Chip(c, compas == c, { compas = c })
            Tecla(
                if (tocando) "Pausa" else "Tocar",
                { if (motor?.reproduciendo == true) motor.pausar() else motor?.tocar() },
                principal = true,
                habilitada = motor != null,
                altura = 40.dp,
                icono = { Icono(if (tocando) Iconos.Pausa else Iconos.Tocar, null, color = C3.Carbon, tamano = 16.dp) },
            )
            BotonIcono(Iconos.Compartir, "Compartir MusicXML", {
                web?.evaluateJavascript("window.impromptu ? impromptu.musicxml() : ''") { r ->
                    val xml = runCatching { org.json.JSONArray("[$r]").getString(0) }.getOrDefault("")
                    if (xml.isNotEmpty()) compartirTexto(context, "${pieza.titulo}.musicxml", xml, "application/vnd.recordare.musicxml+xml")
                }
            })
        }
        Box(Modifier.weight(1f).fillMaxWidth()) {
            AndroidView(
                factory = { ctx ->
                    val cargador = WebViewAssetLoader.Builder()
                        .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(ctx))
                        .build()
                    WebView(ctx).apply {
                        settings.javaScriptEnabled = true
                        settings.allowFileAccess = false
                        settings.builtInZoomControls = true
                        settings.displayZoomControls = false
                        setBackgroundColor(0xFFE8E4DC.toInt())
                        addJavascriptInterface(object {
                            @JavascriptInterface fun listo(b: Int) {
                                post { bpm = b; estado = "" }
                            }
                            @JavascriptInterface fun error(m: String) {
                                post { bpm = 0; estado = "No se pudo escribir la partitura: $m" }
                            }
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
                modifier = Modifier.fillMaxSize(),
            )
            if (estado.isNotEmpty()) {
                Box(Modifier.align(Alignment.Center).background(C3.Carbon.copy(alpha = 0.9f)).padding(16.dp)) {
                    Text(estado, style = Tipos.Texto)
                }
            }
            bpm?.takeIf { it > 0 }?.let { Lcd("♩ = $it", Modifier.align(Alignment.BottomEnd).padding(12.dp), tamano = 12) }
        }
    }
}

/** Comparte un texto como archivo (por ejemplo, el MusicXML) con otras apps. */
fun compartirTexto(context: android.content.Context, nombre: String, texto: String, tipo: String) {
    val carpeta = File(context.cacheDir, "exportados").apply { mkdirs() }
    val f = File(carpeta, nombre.replace(Regex("[\\\\/:*?\"<>|]"), "_"))
    f.writeText(texto)
    compartirArchivo(context, f, tipo)
}

fun compartirArchivo(context: android.content.Context, f: File, tipo: String) {
    val uri = FileProvider.getUriForFile(context, "${context.packageName}.archivos", f)
    val i = Intent(Intent.ACTION_SEND).apply {
        type = tipo
        putExtra(Intent.EXTRA_STREAM, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    context.startActivity(Intent.createChooser(i, "Compartir").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
}
