package com.mamutherd.impromptu

import android.content.Context
import android.content.Intent
import android.content.pm.ActivityInfo
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.Smf
import com.mamutherd.impromptu.pantallas.AjustesPantalla
import com.mamutherd.impromptu.pantallas.ExportarPantalla
import com.mamutherd.impromptu.pantallas.GrabarPantalla
import com.mamutherd.impromptu.pantallas.InicioPantalla
import com.mamutherd.impromptu.pantallas.MicrofonoPantalla
import com.mamutherd.impromptu.pantallas.PaquetesPantalla
import com.mamutherd.impromptu.pantallas.PartituraPantalla
import com.mamutherd.impromptu.pantallas.PiezaPantalla
import com.mamutherd.impromptu.pantallas.PresentacionPantalla
import com.mamutherd.impromptu.ui.C3

/** Pantallas de la app. */
sealed interface Pantalla {
    /** La pieza, la grabación y la partitura van en horizontal (DESIGN §5). */
    val horizontal: Boolean get() = false

    data object Presentacion : Pantalla
    data class Paquetes(val primeraVez: Boolean) : Pantalla
    data object Inicio : Pantalla
    data class Pieza(val id: String) : Pantalla { override val horizontal get() = true }
    data object Grabar : Pantalla { override val horizontal get() = true }
    data object Microfono : Pantalla
    data class Partitura(val id: String) : Pantalla { override val horizontal get() = true }
    data class Exportar(val id: String) : Pantalla
    data object Ajustes : Pantalla
}

/**
 * Pila de pantallas. Cada pantalla tiene su botón de volver visible y el "atrás" de Android
 * vuelve a la anterior; solo en el inicio sale de la app (BUG-003).
 */
class Navegador(inicial: Pantalla) {
    val pila = mutableStateListOf(inicial)
    val actual get() = pila.last()

    fun ir(p: Pantalla) {
        pila.add(p)
    }

    fun volver() {
        if (pila.size > 1) pila.removeAt(pila.lastIndex)
    }

    /** Reemplaza la pantalla actual (por ejemplo, "convirtiendo" por la pieza ya lista). */
    fun reemplazar(p: Pantalla) {
        pila[pila.lastIndex] = p
    }

    /** Deja solo el inicio (y opcionalmente abre otra encima). */
    fun alInicio(encima: Pantalla? = null) {
        pila.clear()
        pila.add(Pantalla.Inicio)
        encima?.let { pila.add(it) }
    }
}

class MainActivity : ComponentActivity() {
    private lateinit var nav: Navegador

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(C3.Carbon.toArgb()),
            navigationBarStyle = SystemBarStyle.dark(C3.Carbon.toArgb()),
        )
        Impromptu.iniciar(this)
        val prefs = getSharedPreferences("app", Context.MODE_PRIVATE)
        nav = Navegador(
            when {
                !prefs.getBoolean("presentada", false) -> Pantalla.Presentacion
                !Impromptu.paquetes.pianoInstalado -> Pantalla.Paquetes(primeraVez = true)
                else -> Pantalla.Inicio
            },
        )
        abrirIntent(intent)
        setContent { App(nav, this) }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        abrirIntent(intent)
    }

    /** Un archivo MIDI abierto desde otra app se importa como pieza. */
    private fun abrirIntent(intent: Intent?) {
        val uri = intent?.takeIf { it.action == Intent.ACTION_VIEW }?.data ?: return
        importarMidi(this, uri)?.let { if (nav.actual != Pantalla.Presentacion) nav.alInicio(Pantalla.Pieza(it)) }
    }

    override fun onStart() {
        super.onStart()
        Impromptu.reanudarSonido()
    }

    override fun onStop() {
        super.onStop()
        Impromptu.pausarSonido()
    }

    fun orientar(horizontal: Boolean) {
        val o = if (horizontal) ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE else ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT
        if (requestedOrientation != o) requestedOrientation = o
        val ctrl = WindowCompat.getInsetsController(window, window.decorView)
        if (horizontal) {
            ctrl.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            ctrl.hide(WindowInsetsCompat.Type.systemBars())
        } else {
            ctrl.show(WindowInsetsCompat.Type.systemBars())
        }
    }
}

/** Lee un MIDI y lo guarda como pieza. Devuelve su id, o null (y avisa) si no se pudo. */
fun importarMidi(context: Context, uri: Uri): String? = try {
    val bytes = context.contentResolver.openInputStream(uri)!!.use { it.readBytes() }
    val leido = Smf.leer(bytes)
    if (leido.notas.isEmpty()) throw Smf.Formato("El archivo no tiene notas.")
    val nombreArchivo = context.contentResolver.query(uri, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME), null, null, null)
        ?.use { c -> if (c.moveToFirst()) c.getString(0) else null }
        ?.substringBeforeLast('.')
    val pieza = Impromptu.piezas.nueva(nombreArchivo ?: leido.nombre ?: "MIDI", Origen.Midi, leido.notas, leido.pedales)
    Impromptu.piezas.guardar(pieza)
    pieza.id
} catch (e: Exception) {
    Toast.makeText(context, e.message ?: "No se pudo abrir el MIDI.", Toast.LENGTH_LONG).show()
    null
}

@Composable
fun App(nav: Navegador, actividad: MainActivity) {
    val actual = nav.actual
    LaunchedEffect(actual.horizontal) { actividad.orientar(actual.horizontal) }
    BackHandler(enabled = nav.pila.size > 1) { nav.volver() }
    // Transición suave entre pantallas: hacia adelante entra desde la derecha; al volver, desde
    // la izquierda.
    val tamano = nav.pila.size
    val previo = remember { mutableIntStateOf(tamano) }
    val adelante = tamano >= previo.intValue
    SideEffect { previo.intValue = tamano }
    AnimatedContent(
        targetState = actual,
        modifier = Modifier.fillMaxSize().background(C3.Carbon),
        transitionSpec = {
            val d = if (adelante) 1 else -1
            (slideInHorizontally(tween(260)) { it / 10 * d } + fadeIn(tween(260))) togetherWith
                (slideOutHorizontally(tween(200)) { -it / 10 * d } + fadeOut(tween(160)))
        },
        label = "pantallas",
    ) { actual ->
        when (actual) {
            Pantalla.Presentacion -> PresentacionPantalla {
                actividad.getSharedPreferences("app", Context.MODE_PRIVATE).edit().putBoolean("presentada", true).apply()
                nav.reemplazar(if (Impromptu.paquetes.pianoInstalado) Pantalla.Inicio else Pantalla.Paquetes(primeraVez = true))
            }
            is Pantalla.Paquetes -> PaquetesPantalla(
                primeraVez = actual.primeraVez,
                alVolver = { nav.volver() },
                alTerminar = { if (actual.primeraVez) nav.reemplazar(Pantalla.Inicio) else nav.volver() },
            )
            Pantalla.Inicio -> InicioPantalla(nav)
            is Pantalla.Pieza -> PiezaPantalla(actual.id, nav)
            Pantalla.Grabar -> GrabarPantalla(nav)
            Pantalla.Microfono -> MicrofonoPantalla(nav)
            is Pantalla.Partitura -> PartituraPantalla(actual.id, nav)
            is Pantalla.Exportar -> ExportarPantalla(actual.id, nav)
            Pantalla.Ajustes -> AjustesPantalla(nav)
        }
    }
}
