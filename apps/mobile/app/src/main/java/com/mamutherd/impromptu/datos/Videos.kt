package com.mamutherd.impromptu.datos

import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.provider.MediaStore

/** Un video exportado por la app (en Películas/Impromptu). */
data class VideoGuardado(val uri: Uri, val nombre: String, val creado: Long, val duracionMs: Long)

/**
 * Pedido 62 (Jacobo): ver aparte los videos exportados, con su nombre, y poder cambiarlo o
 * borrarlos. Son los que la app dejó en la galería; como la app los creó, no hace falta pedir
 * permisos para leerlos, renombrarlos ni borrarlos (Android 10 o más nuevo).
 */
object Videos {
    private const val CARPETA = "Movies/Impromptu"

    fun listar(context: Context): List<VideoGuardado> {
        if (Build.VERSION.SDK_INT < 29) return emptyList()
        val columnas = arrayOf(
            MediaStore.Video.Media._ID,
            MediaStore.Video.Media.DISPLAY_NAME,
            MediaStore.Video.Media.DATE_ADDED,
            MediaStore.Video.Media.DURATION,
        )
        val lista = ArrayList<VideoGuardado>()
        runCatching {
            context.contentResolver.query(
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                columnas,
                "${MediaStore.Video.Media.RELATIVE_PATH} LIKE ?",
                arrayOf("$CARPETA%"),
                "${MediaStore.Video.Media.DATE_ADDED} DESC",
            )?.use { c ->
                while (c.moveToNext()) {
                    val id = c.getLong(0)
                    lista += VideoGuardado(
                        uri = ContentUris.withAppendedId(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, id),
                        nombre = (c.getString(1) ?: "Video").substringBeforeLast('.'),
                        creado = c.getLong(2) * 1000,
                        duracionMs = c.getLong(3),
                    )
                }
            }
        }
        return lista
    }

    /** Cambia el nombre visible del video (se le deja la extensión .mp4). */
    fun renombrar(context: Context, uri: Uri, nombre: String): Boolean {
        val limpio = nombre.trim().replace(Regex("[\\\\/:*?\"<>|]"), " ").ifEmpty { return false }
        val valores = ContentValues().apply { put(MediaStore.Video.Media.DISPLAY_NAME, "$limpio.mp4") }
        return runCatching { context.contentResolver.update(uri, valores, null, null) > 0 }.getOrDefault(false)
    }

    fun borrar(context: Context, uri: Uri): Boolean =
        runCatching { context.contentResolver.delete(uri, null, null) > 0 }.getOrDefault(false)
}

/** Grupos de "Tus piezas" (pedido 62). */
enum class Grupo(val texto: String) {
    Todo("Todo"),
    Grabadas("Grabadas"),
    Convertidas("Convertidas"),
    Midi("MIDI"),
    Videos("Videos");

    /** ¿La pieza va en este grupo? (Videos no muestra piezas sino los videos exportados). */
    fun incluye(p: Pieza): Boolean = when (this) {
        Todo -> true
        Grabadas -> p.origen == Origen.Teclado || p.origen == Origen.Microfono
        Convertidas -> p.origen == Origen.Audio
        Midi -> p.origen == Origen.Midi
        Videos -> false
    }
}
