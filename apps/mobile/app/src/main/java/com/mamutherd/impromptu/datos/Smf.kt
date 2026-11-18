package com.mamutherd.impromptu.datos

import java.io.ByteArrayOutputStream
import kotlin.math.roundToLong

/**
 * Archivos MIDI estándar (SMF). Lee tipo 0 y 1 con su mapa de tempo; escribe tipo 1 como la web
 * (packages/midi/src/export.ts): PPQ 480, tempo 120, una pista con notas y pedales (CC64/66/67).
 */
object Smf {
    const val PPQ = 480
    private const val TEMPO_US = 500_000 // 120 por minuto

    class Leido(val notas: List<Nota>, val pedales: List<Pedal>, val nombre: String?)

    class Formato(msg: String) : Exception(msg)

    fun leer(bytes: ByteArray): Leido {
        var p = 0
        fun u8() = (bytes[p++].toInt() and 0xFF)
        fun u16() = (u8() shl 8) or u8()
        fun u32() = (u16() shl 16) or u16()
        fun vlq(): Int {
            var v = 0
            while (true) {
                val b = u8()
                v = (v shl 7) or (b and 0x7F)
                if (b and 0x80 == 0) return v
            }
        }
        if (bytes.size < 14 || String(bytes, 0, 4, Charsets.ISO_8859_1) != "MThd") throw Formato("No es un archivo MIDI")
        p = 4
        val largoCabecera = u32()
        u16() // formato
        val pistas = u16()
        val division = u16()
        p = 8 + largoCabecera
        if (division and 0x8000 != 0) throw Formato("MIDI con tiempo SMPTE: no se puede leer todavía")

        // Eventos crudos de todas las pistas en ticks.
        data class Ev(val tick: Long, val orden: Int, val tipo: Int, val a: Int, val b: Int, val canal: Int)
        val eventos = ArrayList<Ev>()
        val tempos = ArrayList<Pair<Long, Int>>() // tick, µs por negra
        var nombre: String? = null
        var orden = 0
        repeat(pistas) {
            if (p + 8 > bytes.size) return@repeat
            val id = String(bytes, p, 4, Charsets.ISO_8859_1)
            p += 4
            val largo = u32()
            val fin = p + largo
            if (id != "MTrk") {
                p = fin
                return@repeat
            }
            var tick = 0L
            var estado = 0
            while (p < fin && p < bytes.size) {
                tick += vlq()
                var b = u8()
                if (b == 0xFF) {
                    val tipo = u8()
                    val l = vlq()
                    if (tipo == 0x51 && l == 3) {
                        tempos += tick to ((bytes[p].toInt() and 0xFF shl 16) or (bytes[p + 1].toInt() and 0xFF shl 8) or (bytes[p + 2].toInt() and 0xFF))
                    } else if (tipo == 0x03 && nombre == null && l > 0) {
                        nombre = String(bytes, p, l, Charsets.UTF_8).trim().ifEmpty { null }
                    }
                    p += l
                    continue
                }
                if (b == 0xF0 || b == 0xF7) {
                    p += vlq()
                    continue
                }
                if (b and 0x80 != 0) estado = b else { p--; b = estado }
                val tipo = estado and 0xF0
                val canal = estado and 0x0F
                when (tipo) {
                    0xC0, 0xD0 -> u8()
                    else -> {
                        val d1 = u8()
                        val d2 = u8()
                        eventos += Ev(tick, orden++, tipo, d1, d2, canal)
                    }
                }
            }
            p = fin
        }
        tempos.sortBy { it.first }
        // Ticks a segundos con el mapa de tempo.
        fun segundos(tick: Long): Double {
            var t = 0.0
            var ultimoTick = 0L
            var us = TEMPO_US
            for ((tt, v) in tempos) {
                if (tt >= tick) break
                t += (tt - ultimoTick) * us / 1e6 / division
                ultimoTick = tt
                us = v
            }
            return t + (tick - ultimoTick) * us / 1e6 / division
        }

        eventos.sortWith(compareBy({ it.tick }, { it.orden }))
        val notas = ArrayList<Nota>()
        val pedales = ArrayList<Pedal>()
        val abiertas = HashMap<Int, ArrayDeque<Pair<Double, Int>>>() // canal*128+tecla
        for (e in eventos) {
            val t = segundos(e.tick)
            val clave = e.canal * 128 + e.a
            when {
                e.tipo == 0x90 && e.b > 0 -> abiertas.getOrPut(clave) { ArrayDeque() }.addLast(t to e.b)
                e.tipo == 0x80 || (e.tipo == 0x90 && e.b == 0) -> {
                    val (ini, vel) = abiertas[clave]?.removeFirstOrNull() ?: continue
                    if (e.canal != 9) notas += Nota(e.a, ini, maxOf(t, ini + 0.01), vel)
                }
                e.tipo == 0xB0 -> TipoPedal.deCc(e.a)?.let { pedales += Pedal(it, t, e.b) }
            }
        }
        val finTotal = notas.maxOfOrNull { it.fin } ?: 0.0
        for ((clave, cola) in abiertas) for ((ini, vel) in cola) {
            if (clave / 128 != 9) notas += Nota(clave % 128, ini, maxOf(finTotal, ini + 0.5), vel)
        }
        return Leido(notas.sortedWith(compareBy({ it.inicio }, { it.tecla })), pedales.sortedBy { it.tiempo }, nombre)
    }

    fun ticks(seg: Double) = (seg * PPQ * 1e6 / TEMPO_US).roundToLong()

    fun escribir(pieza: Pieza): ByteArray {
        data class Ev(val tick: Long, val prioridad: Int, val bytes: ByteArray)
        val evs = ArrayList<Ev>()
        for (n in pieza.notas) {
            val on = ticks(n.inicio)
            val off = maxOf(on + 1, ticks(n.fin))
            evs += Ev(on, 2, byteArrayOf(0x90.toByte(), n.tecla.toByte(), n.fuerza.coerceIn(1, 127).toByte()))
            evs += Ev(off, 0, byteArrayOf(0x80.toByte(), n.tecla.toByte(), 64))
        }
        for (p in pieza.pedales) {
            evs += Ev(ticks(p.tiempo), 1, byteArrayOf(0xB0.toByte(), p.tipo.cc.toByte(), p.valor.coerceIn(0, 127).toByte()))
        }
        evs.sortWith(compareBy({ it.tick }, { it.prioridad }))

        val pista = ByteArrayOutputStream()
        fun vlq(v0: Long) {
            var v = v0
            val pila = ArrayList<Int>()
            pila += (v and 0x7F).toInt()
            v = v shr 7
            while (v > 0) {
                pila += ((v and 0x7F) or 0x80).toInt()
                v = v shr 7
            }
            for (i in pila.indices.reversed()) pista.write(pila[i])
        }
        val titulo = pieza.titulo.toByteArray(Charsets.UTF_8)
        vlq(0); pista.write(byteArrayOf(0xFF.toByte(), 0x03)); vlq(titulo.size.toLong()); pista.write(titulo)
        vlq(0); pista.write(byteArrayOf(0xFF.toByte(), 0x51, 0x03, 0x07, 0xA1.toByte(), 0x20))
        vlq(0); pista.write(byteArrayOf(0xFF.toByte(), 0x58, 0x04, 0x04, 0x02, 0x18, 0x08))
        var ultimo = 0L
        for (e in evs) {
            vlq(e.tick - ultimo)
            pista.write(e.bytes)
            ultimo = e.tick
        }
        vlq(0); pista.write(byteArrayOf(0xFF.toByte(), 0x2F, 0x00))

        val out = ByteArrayOutputStream()
        fun u16(v: Int) { out.write(v shr 8 and 0xFF); out.write(v and 0xFF) }
        fun u32(v: Int) { u16(v ushr 16); u16(v and 0xFFFF) }
        out.write("MThd".toByteArray()); u32(6); u16(1); u16(1); u16(PPQ)
        val datos = pista.toByteArray()
        out.write("MTrk".toByteArray()); u32(datos.size); out.write(datos)
        return out.toByteArray()
    }
}
