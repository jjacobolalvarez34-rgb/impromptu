package com.mamutherd.impromptu.trabajo

import kotlin.math.exp
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Avance que se mueve todo el tiempo (pedido de Jacobo, 2026-11-18). La IA avisa a saltos (por
 * tramo); entre aviso y aviso la barra sigue al ritmo promedio medido hasta ahí y, si el tramo
 * todavía no termina, se queda esperando un poco antes del final del tramo. Con ese ritmo se
 * calcula cuánto falta. Mismo cálculo que packages/transcribe/src/avance.ts.
 */
class AvanceSuave(private val inicio: Long, private var paso: Double = 0.15) {
    private var real = 0.0
    private var tReal = inicio
    /** Fracción por milisegundo. */
    private var ritmo = 0.0

    @Synchronized
    fun actualizar(v: Double, ahora: Long, paso: Double? = null) {
        if (paso != null) this.paso = paso
        if (v > real && v > 0) ritmo = v / max(1L, ahora - inicio)
        if (v >= real) {
            real = v
            tReal = ahora
        }
    }

    @Synchronized
    fun valor(ahora: Long): Double {
        val dt = max(0L, ahora - tReal).toDouble()
        val tope = min(0.99, real + paso * 0.95)
        if (ritmo <= 0) return min(tope, real + paso * 0.9 * (1 - exp(-dt / 20_000)))
        return min(tope, real + ritmo * dt)
    }

    @Synchronized
    fun restante(ahora: Long): Double? = if (ritmo <= 0) null else max(0.0, (1 - valor(ahora)) / ritmo / 1000)

    companion object {
        /** "Faltan unos 40 s", "Faltan unos 3 min", "Falta poco". */
        fun texto(segundos: Double?): String? = when {
            segundos == null -> null
            segundos < 8 -> "Falta poco"
            segundos < 90 -> "Faltan unos ${(segundos / 5).roundToInt() * 5} s"
            else -> "Faltan unos ${(segundos / 60).roundToInt()} min"
        }
    }
}

/** Etapas de una conversión, con las frases que se turnan debajo de la barra. */
enum class Etapa(val frases: List<String>) {
    Esperando(listOf("Espera su turno")),
    Leyendo(listOf("Leyendo el audio…", "Pasándolo a la frecuencia de la IA…")),
    Preparando(listOf("Preparando la IA…", "Cargando el modelo en la memoria…")),
    Escuchando(
        listOf(
            "Escuchando nota por nota…",
            "Buscando dónde empieza y termina cada nota…",
            "Midiendo la fuerza de cada nota…",
            "Detectando el pedal…",
            "Separando los acordes…",
        ),
    ),
    Armando(listOf("Armando la pieza…"));

    fun frase(msDesdeInicio: Long) = frases[((msDesdeInicio / 4500) % frases.size).toInt()]
}
