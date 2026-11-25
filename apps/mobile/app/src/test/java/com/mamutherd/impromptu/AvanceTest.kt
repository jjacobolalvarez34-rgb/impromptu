package com.mamutherd.impromptu

import com.mamutherd.impromptu.trabajo.Etapa
import org.junit.Assert.assertTrue
import org.junit.Test

/** BUG-008: la frase de la etapa nunca debe salirse de la lista, aunque el tiempo sea negativo. */
class AvanceTest {
    @Test
    fun fraseConTiempoNegativoNoSeCierra() {
        for (etapa in Etapa.entries) {
            for (ms in listOf(-1L, -4_500L, -10_000L, Long.MIN_VALUE / 2, 0L, 4_499L, 4_500L, 1_000_000L)) {
                assertTrue(etapa.frase(ms).isNotEmpty())
            }
        }
    }
}
