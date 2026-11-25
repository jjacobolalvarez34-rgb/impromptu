package com.mamutherd.impromptu

import com.mamutherd.impromptu.datos.Grupo
import com.mamutherd.impromptu.datos.Origen
import com.mamutherd.impromptu.datos.Pieza
import com.mamutherd.impromptu.visual.EstiloNota
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** Pedido 62: "Tus piezas" separadas en grabadas, convertidas y MIDI. */
class GrupoTest {
    private fun pieza(origen: Origen) = Pieza("x", "x", 0L, origen, emptyList(), emptyList())

    @Test
    fun cadaPiezaVaEnSuGrupo() {
        assertTrue(Grupo.Grabadas.incluye(pieza(Origen.Teclado)))
        assertTrue(Grupo.Grabadas.incluye(pieza(Origen.Microfono)))
        assertTrue(Grupo.Convertidas.incluye(pieza(Origen.Audio)))
        assertTrue(Grupo.Midi.incluye(pieza(Origen.Midi)))
        assertFalse(Grupo.Midi.incluye(pieza(Origen.Audio)))
        assertFalse(Grupo.Videos.incluye(pieza(Origen.Teclado)))
        for (o in Origen.entries) assertTrue(Grupo.Todo.incluye(pieza(o)))
    }

    @Test
    fun elEstiloGuardadoSeLeeYSiNoHayEsVidrio() {
        assertEquals(EstiloNota.Gema, EstiloNota.deClave("gema"))
        assertEquals(EstiloNota.Vidrio, EstiloNota.deClave(null))
        assertEquals(EstiloNota.Vidrio, EstiloNota.deClave("cristal"))
    }
}
