# Error: Impromptu se cierra en la cola de conversiones (índice -1)

Visto el 2026-11-19 a las 17:06 en el teléfono del autor: Redmi 12C (2212ARNC4L), Android 14, Impromptu 0.1.0. Lo encontró la sesión de Velora al leer `logcat -b crash` por `adb`. Todavía no se arregla.

## El error

```
FATAL EXCEPTION: main
Process: com.mamutherd.impromptu
java.lang.ArrayIndexOutOfBoundsException: length=2; index=-1
	at java.util.Arrays$ArrayList.get(Arrays.java:5041)
	at com.mamutherd.impromptu.trabajo.Etapa.frase(AvanceSuave.kt:71)
	at com.mamutherd.impromptu.pantallas.ColaPanelKt.FilaTrabajando(ColaPanel.kt:106)
	at com.mamutherd.impromptu.pantallas.ColaPanelKt.ColaConversiones$lambda$0$0$0(ColaPanel.kt:60)
	at com.mamutherd.impromptu.pantallas.ComunKt.Panel(Comun.kt:243)
	at androidx.compose.animation.AnimatedVisibilityKt.AnimatedEnterExitImpl(AnimatedVisibility.kt:762)
	at com.mamutherd.impromptu.pantallas.ColaPanelKt.ColaConversiones(ColaPanel.kt:56)
	at com.mamutherd.impromptu.pantallas.MicrofonoPantallaKt.MicrofonoPantalla(MicrofonoPantalla.kt:272)
```

`length=2` dice que la etapa era una de las de dos frases: `Leyendo`, `Preparando` o `Separando`.

## Causa (probable)

`apps/mobile/app/src/main/java/com/mamutherd/impromptu/trabajo/AvanceSuave.kt:71`:

```kotlin
fun frase(msDesdeInicio: Long) = frases[((msDesdeInicio / 4500) % frases.size).toInt()]
```

En Kotlin, `%` con un número negativo da negativo, así que si `msDesdeInicio < 0` el índice sale -1 o menos.

Ese valor viene de `ColaPanel.kt:106`, que llama a `t.etapa.frase(ahora - t.inicio)`:

- `ahora` sale de `relojDeCuadros(...)` (`ColaPanel.kt:42` y `:54`). Solo se actualiza en cada cuadro mientras la cola está activa, así que puede quedarse con un valor viejo.
- `t.inicio` se fija con la hora actual al empezar el trabajo (`Conversiones.kt:172`).

Basta un cuadro en el que `ahora` todavía tiene el valor viejo y el trabajo ya tiene un `inicio` más nuevo: `ahora - t.inicio` sale negativo y la app se cierra.

## Arreglo sugerido

En `AvanceSuave.kt`, que nunca dé un índice fuera de la lista:

```kotlin
fun frase(msDesdeInicio: Long) =
    frases[Math.floorMod(msDesdeInicio.coerceAtLeast(0) / 4500, frases.size.toLong()).toInt()]
```

Y en el reloj de cuadros, empezar `ahora` con `System.currentTimeMillis()` en vez de un valor viejo o 0. Así el texto no salta al primer cuadro.

Conviene una prueba unitaria: `Etapa.Leyendo.frase(-1)` y `frase(-10_000)` no deben lanzar.
