package com.mamutherd.impromptu.pantallas

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.Navegador
import com.mamutherd.impromptu.Pantalla
import com.mamutherd.impromptu.audio.Floats
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.formatoTiempo
import com.mamutherd.impromptu.ui.C3
import com.mamutherd.impromptu.ui.Icono
import com.mamutherd.impromptu.ui.Iconos
import com.mamutherd.impromptu.ui.Lcd
import com.mamutherd.impromptu.ui.Tecla
import com.mamutherd.impromptu.ui.Tipos
import kotlinx.coroutines.delay
import kotlin.math.abs
import kotlin.math.max

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

/** Micrófono: tocar cerca del celular y convertir lo grabado en notas. */
@Composable
fun MicrofonoPantalla(nav: Navegador) {
    val context = LocalContext.current
    var permiso by remember {
        mutableStateOf(ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED)
    }
    val pedir = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { permiso = it }
    var grabadora by remember { mutableStateOf<GrabadoraMic?>(null) }
    var segundos by remember { mutableDoubleStateOf(0.0) }
    var nivel by remember { mutableFloatStateOf(0f) }
    var error by remember { mutableStateOf<String?>(null) }
    var salir by remember { mutableStateOf(false) }

    DisposableEffect(Unit) { onDispose { grabadora?.detener() } }
    LaunchedEffect(grabadora) {
        val g = grabadora ?: return@LaunchedEffect
        while (true) {
            segundos = g.segundos
            nivel = g.nivel
            delay(50)
        }
    }

    fun alternar() {
        val g = grabadora
        if (g == null) {
            if (!Impromptu.iaDisponible) {
                error = "Esta versión de la app no trae la IA de audio a notas."
                return
            }
            error = null
            runCatching { GrabadoraMic(context).also { it.empezar() } }
                .onSuccess { grabadora = it }
                .onFailure { error = it.message }
        } else {
            val muestras = g.detener()
            grabadora = null
            if (muestras.size < g.tasa) {
                error = "La grabación es muy corta. Graba al menos unos segundos."
                return
            }
            Impromptu.convertir(Impromptu.piezas.siguienteTitulo("Micrófono"), Origen.Microfono, muestras = muestras, tasa = g.tasa)
            nav.reemplazar(Pantalla.Convirtiendo)
        }
    }

    BackHandler(enabled = grabadora != null) { salir = true }

    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Encabezado("Micrófono", { if (grabadora != null) salir = true else nav.volver() })
        Column(
            Modifier.fillMaxWidth().weight(1f).padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            if (!permiso) {
                Text("Para escuchar tu piano, la app necesita el micrófono. Lo grabado no sale del celular.", style = Tipos.Texto, textAlign = TextAlign.Center)
                Tecla("Permitir el micrófono", { pedir.launch(Manifest.permission.RECORD_AUDIO) }, principal = true, modifier = Modifier.padding(top = 20.dp))
                return@Column
            }
            Lcd(formatoTiempo(segundos), tamano = 28)
            Medidor(nivel, grabadora != null, Modifier.padding(vertical = 28.dp))
            val grabando = grabadora != null
            Box(
                Modifier
                    .size(120.dp)
                    .clip(CircleShape)
                    .background(if (grabando) C3.Chasis else C3.Grabacion)
                    .border(4.dp, if (grabando) C3.GrisTecla else C3.PuntoRec, CircleShape)
                    .clickable(role = Role.Button, onClickLabel = if (grabando) "Detener y convertir" else "Grabar", onClick = ::alternar),
                contentAlignment = Alignment.Center,
            ) {
                if (grabando) Icono(Iconos.Detener, null, color = C3.Grabacion, tamano = 40.dp)
                else Icono(Iconos.Microfono, null, color = C3.Chasis, tamano = 44.dp)
            }
            Text(
                if (grabando) "Toca para detener y convertir en notas" else "Toca para grabar",
                style = Tipos.Texto,
                modifier = Modifier.padding(top = 16.dp),
            )
            error?.let { Text(it, style = Tipos.Texto.copy(color = C3.Ambar), textAlign = TextAlign.Center, modifier = Modifier.padding(top = 16.dp)) }
        }
        Text(
            "Deja el celular cerca del piano y en silencio alrededor. Funciona mejor con piano solo.",
            style = Tipos.Secundario,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(24.dp),
        )
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

@Composable
private fun Medidor(nivel: Float, activo: Boolean, modifier: Modifier) {
    Canvas(modifier.fillMaxWidth().height(14.dp).clip(RoundedCornerShape(3.dp))) {
        val segmentos = 24
        val w = size.width / segmentos
        val encendidos = (nivel.coerceIn(0f, 1f) * segmentos * 1.4f).toInt()
        for (i in 0 until segmentos) {
            val c = when {
                !activo || i >= encendidos -> C3.Linea
                i >= segmentos - 3 -> C3.PuntoRec
                else -> C3.Ambar
            }
            drawRect(c, topLeft = Offset(i * w + 1, 0f), size = Size(w - 2, size.height))
        }
    }
}

/** Avance de la conversión de audio a notas. Cancelar vuelve al inicio enseguida (BUG-002). */
@Composable
fun ConvirtiendoPantalla(nav: Navegador) {
    val c = Impromptu.conversion
    LaunchedEffect(c) {
        if (c is com.mamutherd.impromptu.Conversion.Lista) {
            Impromptu.olvidarConversion()
            nav.reemplazar(Pantalla.Pieza(c.piezaId))
        }
        if (c is com.mamutherd.impromptu.Conversion.Inactiva) nav.volver()
    }
    Column(Modifier.fillMaxSize().windowInsetsPadding(WindowInsets.safeDrawing)) {
        Encabezado("Audio a notas", { nav.volver() })
        Column(Modifier.fillMaxWidth().weight(1f).padding(24.dp), verticalArrangement = Arrangement.Center) {
            val (texto, avance) = when (c) {
                is com.mamutherd.impromptu.Conversion.Leyendo -> "Leyendo el audio…" to c.avance
                com.mamutherd.impromptu.Conversion.Preparando -> "Preparando la IA…" to null
                is com.mamutherd.impromptu.Conversion.Escuchando -> "Escuchando las notas y el pedal… ${(c.avance * 100).toInt()} %" to c.avance
                is com.mamutherd.impromptu.Conversion.Fallo -> c.mensaje to 0f
                else -> "" to null
            }
            Text(texto, style = Tipos.TituloPanel)
            if (c !is com.mamutherd.impromptu.Conversion.Fallo) {
                Avance(avance, Modifier.padding(vertical = 20.dp))
                Text(
                    "Todo se hace en tu celular y puede tardar más que el audio. Puedes volver al inicio: la conversión sigue y te avisa al terminar.",
                    style = Tipos.Secundario,
                )
                Tecla(
                    "Cancelar",
                    {
                        Impromptu.cancelarConversion()
                        nav.alInicio()
                    },
                    modifier = Modifier.padding(top = 28.dp),
                )
            } else {
                Tecla("Volver al inicio", { Impromptu.olvidarConversion(); nav.alInicio() }, principal = true, modifier = Modifier.padding(top = 24.dp))
            }
        }
    }
}
