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
import com.mamutherd.impromptu.visual.HojaVideo
import android.graphics.BitmapFactory
import android.util.Base64
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
    // Video de la partitura (fase 10): la página prepara la hoja y Kotlin arma el video.
    var preparando by remember { mutableStateOf(false) }
    var avisoVideo by remember { mutableStateOf("") }
    val exportacion = Exportacion.estado

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
            BotonIcono(Iconos.Video, "Video de la partitura", {
                when {
                    exportacion is Exportacion.Estado.Trabajando -> avisoVideo = "Espera: se arma un video a la vez."
                    preparando -> Unit
                    else -> {
                        preparando = true
                        avisoVideo = "Preparando la hoja para el video…"
                        web?.evaluateJavascript("window.impromptu && impromptu.paraVideo($FPS_VIDEO)", null)
                    }
                }
            })
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
                            /** La hoja como imagen y la línea por cuadro: se arma el video (fase 10). */
                            @JavascriptInterface fun hoja(png: String, ancho: Int, alto: Int, cursor: String) {
                                val video = runCatching {
                                    val bytes = Base64.decode(png, Base64.DEFAULT)
                                    // Sin transparencia: la mitad de memoria que ARGB.
                                    val op = BitmapFactory.Options().apply { inPreferredConfig = android.graphics.Bitmap.Config.RGB_565 }
                                    val bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.size, op) ?: throw IllegalStateException("imagen vacía")
                                    val arr = org.json.JSONArray(cursor)
                                    val linea = FloatArray(arr.length()) { arr.getDouble(it).toFloat() }
                                    HojaVideo(bmp, linea, FPS_VIDEO)
                                }.getOrNull()
                                post {
                                    preparando = false
                                    if (video == null) {
                                        avisoVideo = "No se pudo preparar la hoja para el video."
                                    } else {
                                        avisoVideo = ""
                                        Exportacion.iniciar(ctx.applicationContext, pieza, 1920, 1080, video)
                                    }
                                }
                            }
                            @JavascriptInterface fun errorVideo(m: String) {
                                post { preparando = false; avisoVideo = "No se pudo preparar el video: $m" }
                            }
                            /** La pieza editada en la hoja (fase 10): se guarda y el sonido la sigue. */
                            @JavascriptInterface fun guardar(json: String) {
                                post { guardarEdicion(id, json) }
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
        BarraVideo(id, exportacion, avisoVideo, { avisoVideo = "" }, context)
    }
}

private const val FPS_VIDEO = 30

/** Avance del video de la partitura, debajo de la hoja (se arma en segundo plano, uno a la vez). */
@Composable
private fun BarraVideo(
    id: String,
    e: Exportacion.Estado,
    aviso: String,
    cerrarAviso: () -> Unit,
    context: android.content.Context,
) {
    val texto = when {
        aviso.isNotEmpty() -> aviso
        e is Exportacion.Estado.Trabajando && e.piezaId == id -> "Armando el video… ${(e.avance * 100).toInt()} % · sigue aunque salgas"
        e is Exportacion.Estado.Lista && e.piezaId == id ->
            if (e.enGaleria) "Video listo: quedó en Películas/Impromptu." else "Video listo."
        e is Exportacion.Estado.Fallo && e.piezaId == id -> e.mensaje
        else -> return
    }
    Row(
        Modifier.fillMaxWidth().background(C3.Carbon).padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(texto, style = Tipos.Secundario, modifier = Modifier.weight(1f))
        when {
            e is Exportacion.Estado.Trabajando && aviso.isEmpty() -> Tecla("Cancelar", Exportacion::cancelar, altura = 36.dp)
            e is Exportacion.Estado.Lista && aviso.isEmpty() && e.piezaId == id -> {
                Tecla("Compartir", { compartirArchivo(context, e.archivo, "video/mp4") }, principal = true, altura = 36.dp)
                Tecla("Cerrar", Exportacion::olvidar, altura = 36.dp)
            }
            aviso.isNotEmpty() -> Tecla("Cerrar", cerrarAviso, altura = 36.dp)
            else -> Tecla("Cerrar", Exportacion::olvidar, altura = 36.dp)
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

/** Guarda en la pieza las notas y pedales que mandó el editor de la hoja. */
private fun guardarEdicion(id: String, json: String) {
    val pieza = Impromptu.piezas.buscar(id) ?: return
    runCatching {
        val o = org.json.JSONObject(json)
        val ns = o.getJSONArray("notes")
        val ps = o.optJSONArray("pedals") ?: org.json.JSONArray()
        val notas = List(ns.length()) { i ->
            val n = ns.getJSONObject(i)
            com.mamutherd.impromptu.datos.Nota(
                tecla = n.getInt("pitch"),
                inicio = n.getDouble("start"),
                fin = n.getDouble("end"),
                fuerza = n.getInt("velocity"),
                mano = n.optString("hand").ifEmpty { null },
                cuerda = if (n.has("string")) n.getInt("string") else null,
                traste = if (n.has("fret")) n.getInt("fret") else null,
            )
        }
        val pedales = List(ps.length()) { i ->
            val q = ps.getJSONObject(i)
            com.mamutherd.impromptu.datos.Pedal(
                com.mamutherd.impromptu.datos.TipoPedal.deClave(q.getString("kind")),
                q.getDouble("time"),
                q.getInt("value"),
            )
        }
        Impromptu.piezas.guardar(pieza.copy(notas = notas.sortedWith(compareBy({ it.inicio }, { it.tecla })), pedales = pedales.sortedBy { it.tiempo }))
    }
}
