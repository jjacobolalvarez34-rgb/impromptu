package com.mamutherd.impromptu.pantallas

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.audio.Floats
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Etiqueta
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.sqrt

/** Graba del micrófono a 44,1 kHz mono en un hilo propio. */
class GrabadoraMic(context: Context) {
    val tasa = 44_100
    private val buffer = Floats(tasa * 60)
    @Volatile var nivel = 0f
        private set
    @Volatile private var activa = false
    private var hilo: Thread? = null
    private val fuente: Int = run {
        val am = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        // Sin procesar (sin control de ganancia ni supresión de ruido) si el celular lo permite.
        if (am.getProperty(AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED) == "true") MediaRecorder.AudioSource.UNPROCESSED
        else MediaRecorder.AudioSource.VOICE_RECOGNITION
    }

    val segundos get() = buffer.largo.toDouble() / tasa

    @SuppressLint("MissingPermission")
    fun empezar() {
        val minimo = AudioRecord.getMinBufferSize(tasa, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
        val rec = AudioRecord(fuente, tasa, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, max(minimo, tasa / 5 * 2))
        if (rec.state != AudioRecord.STATE_INITIALIZED) {
            rec.release()
            throw IllegalStateException("No se pudo abrir el micrófono.")
        }
        activa = true
        hilo = Thread({
            val bloque = ShortArray(2048)
            rec.startRecording()
            try {
                while (activa) {
                    val n = rec.read(bloque, 0, bloque.size)
                    if (n <= 0) continue
                    var pico = 0f
                    synchronized(buffer) {
                        for (i in 0 until n) {
                            val x = bloque[i] / 32768f
                            buffer.agregar(x)
                            pico = max(pico, abs(x))
                        }
                    }
                    nivel = pico
                }
            } finally {
                rec.stop()
                rec.release()
            }
        }, "impromptu-mic").also { it.start() }
    }

    fun detener(): FloatArray {
        activa = false
        hilo?.join(1000)
        hilo = null
        return synchronized(buffer) { buffer.recortado() }
    }
}

/**
 * Pide el permiso de notificaciones (Android 13+) la primera vez que se manda algo a convertir:
 * así se ve el avance en segundo plano. Si se niega, la conversión sigue igual.
 */
@Composable
fun rememberPedirNotificaciones(): () -> Unit {
    val context = LocalContext.current
    val pedir = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { }
    return remember {
        {
            if (Build.VERSION.SDK_INT >= 33 &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            ) {
                pedir.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}

private const val MUESTRAS_ONDA = 72

/**
 * Micrófono: tocar cerca del celular y convertir lo grabado en notas. Al terminar, la grabación
 * pasa a la cola y se puede grabar otra enseguida (la IA trabaja en segundo plano).
 */
@Composable
fun MicrofonoPantalla(nav: Navegador) {
    val context = LocalContext.current
    val alcance = rememberCoroutineScope()
    val pedirNotificaciones = rememberPedirNotificaciones()
    var permiso by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED)
    }
    val pedir = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { permiso = it }
    var grabadora by remember { mutableStateOf<GrabadoraMic?>(null) }
    var segundos by remember { mutableDoubleStateOf(0.0) }
    val onda = remember { FloatArray(MUESTRAS_ONDA) }
    var cuadro by remember { mutableIntStateOf(0) }
    var aviso by remember { mutableStateOf<String?>(null) }
    var salir by remember { mutableStateOf(false) }

    DisposableEffect(Unit) { onDispose { grabadora?.detener() } }
    LaunchedEffect(grabadora) {
        val g = grabadora
        if (g == null) {
            onda.fill(0f)
            cuadro++
            return@LaunchedEffect
        }
        while (true) {
            segundos = g.segundos
            // La onda se corre a la izquierda y entra el nivel nuevo (raíz: se ven mejor los suaves).
            System.arraycopy(onda, 1, onda, 0, MUESTRAS_ONDA - 1)
            onda[MUESTRAS_ONDA - 1] = sqrt(g.nivel.coerceIn(0f, 1f))
            cuadro++
            delay(50)
        }
    }

    val grabando = grabadora != null

    fun alternar() {
        val g = grabadora
        if (g == null) {
            if (!Impromptu.iaDisponible) {
                aviso = "Esta versión de la app no trae la IA de audio a notas."
                return
            }
            aviso = null
            segundos = 0.0
            runCatching { GrabadoraMic(context).also { it.empezar() } }
                .onSuccess { grabadora = it }
                .onFailure { aviso = it.message }
        } else {
            val muestras = g.detener()
            grabadora = null
            if (muestras.size < g.tasa) {
                aviso = "La grabación es muy corta. Graba al menos unos segundos."
                return
            }
            val titulo = Impromptu.piezas.siguienteTitulo("Micrófono")
            pedirNotificaciones()
            alcance.launch { Impromptu.conversiones.encolarGrabacion(muestras, g.tasa, titulo, Impromptu.instrumento) }
            aviso = "«$titulo» pasó a convertirse. Puedes grabar otra."
        }
    }

    BackHandler(enabled = grabando) { salir = true }

    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Encabezado("Micrófono", { if (grabando) salir = true else nav.volver() })
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(Modifier.widthIn(max = 560.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                if (!permiso) {
                    Spacer(Modifier.height(48.dp))
                    Icono(Iconos.Microfono, null, color = C3.Ambar, tamano = 48.dp)
                    Text(
                        "Para escuchar tu piano, la app necesita el micrófono. Lo grabado no sale del celular.",
                        style = Tipos.Texto,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 16.dp),
                    )
                    Tecla("Permitir el micrófono", { pedir.launch(Manifest.permission.RECORD_AUDIO) }, principal = true, modifier = Modifier.padding(top = 20.dp))
                    return@Column
                }
                Spacer(Modifier.height(12.dp))
                EstadoGrabacion(grabando)
                Lcd(formatoTiempo(segundos), Modifier.padding(top = 14.dp), tamano = 34)
                Onda(onda, cuadro, grabando, Modifier.padding(vertical = 22.dp).fillMaxWidth().height(96.dp))
                BotonGrabar(grabando, ::alternar)
                AnimatedContent(
                    targetState = if (grabando) "Toca para terminar. Se convierte en segundo plano y puedes grabar otra." else "Toca para grabar",
                    transitionSpec = { fadeIn(tween(220)) togetherWith fadeOut(tween(160)) },
                    label = "indicacion",
                ) { texto ->
                    Text(texto, style = Tipos.Texto, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 16.dp))
                }
                aviso?.let {
                    Text(it, style = Tipos.Secundario.copy(color = C3.Ambar), textAlign = TextAlign.Center, modifier = Modifier.padding(top = 10.dp))
                }
                Consejos(Modifier.padding(top = 28.dp))
                ColaConversiones(nav, Modifier.padding(vertical = 20.dp).fillMaxWidth())
            }
        }
    }

    if (salir) {
        Confirmar(
            "¿Salir sin convertir?",
            "Lo que grabaste se pierde.",
            "Salir",
            {
                salir = false
                grabadora?.detener()
                grabadora = null
                nav.volver()
            },
            { salir = false },
            no = "Seguir grabando",
        )
    }
}

/** "● GRABANDO" con el punto que late, o "LISTO". */
@Composable
private fun EstadoGrabacion(grabando: Boolean) {
    val latido = rememberInfiniteTransition(label = "latido")
    val alfa by latido.animateFloat(1f, 0.25f, infiniteRepeatable(tween(700), RepeatMode.Reverse), label = "alfa")
    Row(
        Modifier
            .clip(RoundedCornerShape(50))
            .background(if (grabando) C3.Grabacion.copy(alpha = 0.18f) else C3.Panel)
            .border(1.dp, if (grabando) C3.Grabacion else C3.Linea, RoundedCornerShape(50))
            .padding(horizontal = 14.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(if (grabando) C3.PuntoRec.copy(alpha = alfa) else C3.GrisTecla),
        )
        Spacer(Modifier.width(8.dp))
        Etiqueta(if (grabando) "Grabando" else "Listo para grabar")
    }
}

/** Onda de lo que escucha el micrófono: barras ámbar que corren de derecha a izquierda. */
@Composable
private fun Onda(onda: FloatArray, cuadro: Int, activa: Boolean, modifier: Modifier) {
    val respiro = rememberInfiniteTransition(label = "respiro")
    val r by respiro.animateFloat(0.04f, 0.09f, infiniteRepeatable(tween(1400, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "r")
    Canvas(modifier.semantics { contentDescription = "Nivel del micrófono" }) {
        cuadro.let { }
        val n = onda.size
        val w = size.width / n
        val medio = size.height / 2
        for (i in 0 until n) {
            val v = if (activa) onda[i] else r
            val alto = (v * size.height).coerceAtLeast(3f)
            val color = if (activa) C3.Ambar.copy(alpha = 0.35f + 0.65f * i / n) else C3.Linea
            drawRoundRect(
                color,
                topLeft = Offset(i * w + w * 0.2f, medio - alto / 2),
                size = Size(w * 0.6f, alto),
                cornerRadius = CornerRadius(w * 0.3f),
            )
        }
    }
}

/** Botón redondo de grabar: rojo; al grabar, cuadrado de detener con un anillo que late. */
@Composable
private fun BotonGrabar(grabando: Boolean, onClick: () -> Unit) {
    val latido = rememberInfiniteTransition(label = "anillo")
    val escala by latido.animateFloat(1f, 1.18f, infiniteRepeatable(tween(900, easing = FastOutSlowInEasing), RepeatMode.Reverse), label = "e")
    Box(Modifier.size(132.dp), contentAlignment = Alignment.Center) {
        if (grabando) {
            Box(
                Modifier
                    .size(104.dp)
                    .scale(escala)
                    .clip(CircleShape)
                    .background(C3.Grabacion.copy(alpha = 0.22f)),
            )
        }
        Box(
            Modifier
                .size(104.dp)
                .clip(CircleShape)
                .background(if (grabando) C3.Chasis else C3.Grabacion)
                .border(4.dp, if (grabando) C3.GrisTecla else C3.PuntoRec, CircleShape)
                .clickable(role = Role.Button, onClickLabel = if (grabando) "Terminar y convertir" else "Grabar", onClick = onClick),
            contentAlignment = Alignment.Center,
        ) {
            if (grabando) Icono(Iconos.Detener, null, color = C3.Grabacion, tamano = 36.dp)
            else Icono(Iconos.Microfono, null, color = C3.Chasis, tamano = 40.dp)
        }
    }
}

@Composable
private fun Consejos(modifier: Modifier) {
    Panel(modifier.fillMaxWidth()) {
        Etiqueta("Para que salga mejor")
        for (c in listOf(
            "Deja el celular cerca del piano, sin taparle el micrófono.",
            "Mejor en silencio alrededor y con piano solo.",
            "Puedes grabar varias seguidas: cada una se convierte en la cola.",
            "Se escucha con el instrumento elegido en el inicio (piano, guitarra, bajo o batería).",
        )) {
            Row(Modifier.padding(top = 8.dp)) {
                Text("·", style = Tipos.Texto.copy(color = C3.Ambar), modifier = Modifier.width(14.dp))
                Text(c, style = Tipos.Secundario)
            }
        }
    }
}
