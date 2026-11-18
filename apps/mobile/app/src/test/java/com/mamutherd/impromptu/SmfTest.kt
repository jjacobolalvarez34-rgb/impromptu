package com.mamutherd.impromptu

import com.mamutherd.impromptu.audio.Salamander
import com.mamutherd.impromptu.audio.Secuencia
import com.mamutherd.impromptu.datos.Nota
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.Pedal
import com.mamutherd.impromptu.datos.Pieza
import com.mamutherd.impromptu.datos.Smf
import com.mamutherd.impromptu.datos.TipoPedal
import com.mamutherd.impromptu.midi.EventoMidi
import com.mamutherd.impromptu.midi.Grabacion
import org.junit.Assert.assertEquals
import org.junit.Test

class SmfTest {
    private val pieza = Pieza(
        id = "x",
        titulo = "Prueba ñandú",
        creada = 0,
        origen = Origen.Teclado,
        notas = listOf(Nota(60, 0.5, 1.0, 90), Nota(64, 0.5, 1.25, 70), Nota(60, 1.0, 2.0, 50)),
        pedales = listOf(Pedal(TipoPedal.Sustain, 0.4, 127), Pedal(TipoPedal.Sustain, 1.9, 0), Pedal(TipoPedal.UnaCorda, 0.0, 127)),
    )

    @Test
    fun escribirYLeerDaLasMismasNotasYPedales() {
        val leido = Smf.leer(Smf.escribir(pieza))
        assertEquals("Prueba ñandú", leido.nombre)
        assertEquals(pieza.notas.size, leido.notas.size)
        for ((a, b) in pieza.notas.sortedWith(compareBy({ it.inicio }, { it.tecla })).zip(leido.notas)) {
            assertEquals(a.tecla, b.tecla)
            assertEquals(a.inicio, b.inicio, 0.002)
            assertEquals(a.fin, b.fin, 0.002)
            assertEquals(a.fuerza, b.fuerza)
        }
        assertEquals(pieza.pedales.sortedBy { it.tiempo }.map { it.tipo to it.valor }, leido.pedales.map { it.tipo to it.valor })
    }

    @Test
    fun laNotaRepetidaSeSueltaAntesDeVolverATocar() {
        val s = Secuencia(pieza)
        // En 1.0 la 60 termina y vuelve a empezar: primero se suelta (tipo 0), después se toca.
        val i = s.indice(1.0)
        assertEquals(0, s.tipo[i])
        assertEquals(60, s.a[i])
    }

    @Test
    fun muestrasDelSalamander() {
        assertEquals("A0v1", Salamander.nombre(21, 1))
        assertEquals("Ds1v13", Salamander.nombre(27, 13))
        assertEquals(150, Salamander.todas().size)
        assertEquals(60, Salamander.cercana(61))
        assertEquals(63, Salamander.cercana(62))
        assertEquals(16, Salamander.capa(127))
        assertEquals(1, Salamander.capa(1))
    }

    @Test
    fun laGrabacionQuitaElSilencioDelComienzo() {
        val g = Grabacion(inicioNs = 0)
        g.evento(EventoMidi.Control(64, 127, 1_000_000_000))
        g.evento(EventoMidi.On(60, 80, 3_000_000_000))
        g.evento(EventoMidi.Off(60, 3_500_000_000))
        val (notas, pedales) = g.terminar()
        assertEquals(0.5, notas[0].inicio, 1e-9)
        assertEquals(1.0, notas[0].fin, 1e-9)
        // El pedal ya estaba pisado: queda pisado desde el comienzo.
        assertEquals(listOf(Pedal(TipoPedal.Sustain, 0.0, 127)), pedales)
    }
}
