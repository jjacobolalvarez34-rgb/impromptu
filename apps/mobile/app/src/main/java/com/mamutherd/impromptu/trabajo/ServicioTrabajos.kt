package com.mamutherd.impromptu.trabajo

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.mamutherd.impromptu.Impromptu
import com.mamutherd.impromptu.MainActivity
import com.mamutherd.impromptu.R
import com.mamutherd.impromptu.pantallas.Exportacion
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Servicio en primer plano mientras hay conversiones o un video armándose (pedido de Jacobo,
 * 2026-11-18): como las descargas de WhatsApp, sigue aunque se salga de la app, con una
 * notificación que muestra el avance. El trabajo en sí vive en `Impromptu`; el servicio solo
 * mantiene vivo el proceso (y el procesador despierto) y muestra el avance.
 */
class ServicioTrabajos : Service() {
    private val alcance = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var despierto: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CANAL, "Conversiones y videos", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Avance de lo que la app hace en segundo plano"
            },
        )
        despierto = (getSystemService(POWER_SERVICE) as PowerManager)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "impromptu:trabajos")
            .apply { setReferenceCounted(false); acquire(6 * 60 * 60 * 1000L) }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val tipo = when {
            Build.VERSION.SDK_INT >= 35 -> ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROCESSING
            Build.VERSION.SDK_INT >= 29 -> ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            else -> 0
        }
        ServiceCompat.startForeground(this, ID, notificacion("Preparando…", null), tipo)
        if (!corriendo) {
            corriendo = true
            alcance.launch {
                while (true) {
                    val (texto, avance) = estado() ?: break
                    getSystemService(NotificationManager::class.java).notify(ID, notificacion(texto, avance))
                    delay(1000)
                }
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    /** Qué mostrar, o null si ya no hay nada en marcha. */
    private fun estado(): Pair<String, Int?>? {
        Impromptu.conversiones.resumen()?.let { (titulo, pct) ->
            val mas = Impromptu.conversiones.cola.size - 1
            return "Convirtiendo «$titulo»" + (if (mas > 0) " (+$mas en espera)" else "") to pct
        }
        (Exportacion.estado as? Exportacion.Estado.Trabajando)?.let { return "Armando el video" to (it.avance * 100).toInt() }
        return null
    }

    private fun notificacion(texto: String, avance: Int?): Notification {
        val abrir = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        return NotificationCompat.Builder(this, CANAL)
            .setSmallIcon(R.drawable.ic_notificacion)
            .setContentTitle("Impromptu")
            .setContentText(texto)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(abrir)
            .setProgress(100, avance ?: 0, avance == null)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()
    }

    override fun onDestroy() {
        corriendo = false
        alcance.cancel()
        despierto?.let { if (it.isHeld) it.release() }
        super.onDestroy()
    }

    companion object {
        private const val CANAL = "trabajos"
        private const val ID = 7
        @Volatile private var corriendo = false

        /** Asegura que el servicio esté andando (se detiene solo cuando no queda nada). */
        fun asegurar(context: Context) {
            runCatching { ContextCompat.startForegroundService(context, Intent(context, ServicioTrabajos::class.java)) }
        }
    }
}
