# BUGS — trampas conocidas y registro

## Trampas conocidas (léelas antes de tocar estas áreas)

| # | Área | Trampa | Cómo evitarla |
|---|---|---|---|
| B-001 | MIDI | Muchos teclados mandan *note on* con velocity 0 en lugar de *note off* | Tratar `0x9n` con velocity 0 como note off |
| B-002 | MIDI | Notas abiertas al parar de grabar o al desconectar el teclado | Cerrarlas con el tiempo de parada |
| B-003 | MIDI | Los teclados Yamaha y otros envían *active sensing* (0xFE) constantemente | Filtrar 0xFE, 0xF8 (clock) y demás mensajes de sistema |
| B-004 | MIDI | El pedal no siempre es 0/127: algunos mandan valores intermedios (medio pedal) | Guardar el valor completo; "pisado" si ≥ 64 para lógica binaria |
| B-005 | MIDI | Pedal FC4/FC5 con polaridad invertida según el teclado | Opción "invertir pedal" en ajustes del dispositivo |
| B-006 | MIDI | Web MIDI pide permiso y no existe en Safari | Detectar `navigator.requestMIDIAccess` y mostrar un aviso con alternativa |
| B-007 | MIDI | Usar la hora de llegada al handler en vez de `event.timeStamp` | Siempre `MIDIMessageEvent.timeStamp` |
| B-008 | Audio | `AudioContext` empieza suspendido hasta un gesto del usuario | Reanudar en el primer clic o tecla |
| B-009 | Audio | Doble sonido: el teclado suena por sus parlantes y la app también | Interruptor "sonido de la app" visible al conectar |
| B-010 | Video | Deriva de sincronía en videos largos de celular (fps variable) | Usar los timestamps de cada cuadro, no asumir fps fijo |
| B-011 | Exportar | Códec H.264 o AAC no disponible en algún navegador | `VideoEncoder.isConfigSupported` antes de empezar; ofrecer WebM |
| B-012 | Exportar | Partículas distintas en cada exportación | RNG con semilla por nota |
| B-013 | Render | Crear un objeto por nota en cada cuadro (basura y tirones) | Pool de sprites y geometría instanciada |
| B-014 | Teclado | Calcular posiciones de teclas negras como si fueran equidistantes | Usar posición por clase de nota (ver `render/keyboard`) |
| B-015 | Rango | MIDI de 88 teclas en teclado de 61 | Modo automático de rango y aviso de notas fuera de rango |
| B-016 | PWA | Caché vieja tras actualizar | Aviso "Hay una versión nueva. Recargar" |
| B-017 | Celular | La pantalla se apaga durante la grabación | Wake Lock API mientras se graba |

## Registro de bugs
```
### BUG-XXX · título
- Dónde:
- Cómo reproducir:
- Esperado / obtenido:
- Causa:
- Arreglo y prueba que lo cubre:
```

### BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés
- Dónde: `packages/media/src/align.ts` (`alignAudioToNotes`), usado por "Mi audio" (fase 3) y por el video de la cámara.
- Cómo reproducir: abrir `consuelo.mid` y luego `consuelo.mp3`. La app decía "desfase +0,39 s" y el audio sonaba unos 0,8 s corrido respecto a las notas.
- Esperado / obtenido: esperado −0,39 s (el MP3 trae 0,39 s antes de la primera nota). Obtenido +0,39 s.
- Causa: la app usa MediaRef.offset como "segundo de la toma = segundo del archivo + offset", pero la alineación devolvía "archivo − toma". Las pruebas unitarias tenían la misma convención invertida, así que no lo detectaron.
- Arreglo y prueba que lo cubre: signo corregido en `align`, `alignNear` y el paso de cromagrama. `align.test.ts` ahora prueba la convención de la app (archivo con silencio al comienzo → offset negativo). Se confirmó con datos reales: al transcribir el MP3 de Consuelo, las notas de la IA calzan con el MIDI con −0,40 s, y no hay deriva en toda la pieza (±0,02 s por ventana de 20 s).

### BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba
- Dónde: app de Android (Capacitor), pantalla Grabando (`apps/web/src/pages/Celular.tsx`, `studio/transcribeStore.ts`).
- Cómo reproducir (Jacobo, 2026-11-17): Grabar, Detener, y Cancelar mientras la IA convierte lo grabado.
- Esperado / obtenido: volver al inicio sin la grabación (o con el audio guardado). Obtenido: la pantalla sigue en "Grabando", la app se traba y no deja hacer nada.
- Causa: pendiente de investigar. Probablemente la pantalla Grabando solo sale con un error o con la pieza abierta, y cancelar no hace ninguna de las dos cosas.
- Arreglo y prueba que lo cubre (2026-11-18, app nativa, ADR-019): la conversión vive fuera de la pantalla (`Impromptu.convertir`); Cancelar detiene ONNX Runtime a mitad (`RunOptions.setTerminate`) y vuelve al inicio enseguida; una conversión nueva espera a que la anterior termine. **Sin verificar en un celular.**

### BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app
- Dónde: app de Android (Capacitor), todas las pantallas.
- Cómo reproducir (Jacobo, 2026-11-17): estando en una pieza, grabando o en ajustes, buscar cómo volver; el botón atrás del sistema sale de la app.
- Esperado / obtenido: un "volver" evidente en cada pantalla, y el atrás del sistema debe ir a la pantalla anterior. Obtenido: la app se cierra.
- Causa: la app no maneja el botón atrás de Android (`@capacitor/app`, evento `backButton`), y el botón de volver de la pieza es solo un ícono pequeño.
- Arreglo y prueba que lo cubre (2026-11-18, app nativa): botón de volver de 48 dp en cada pantalla y `BackHandler` que vuelve a la anterior; solo en el inicio sale de la app. Grabando o con el micrófono abierto, pregunta antes de descartar. **Sin verificar en un celular.**

### BUG-004 · Celular: la app se cierra al convertir una grabación
- Dónde: app de Android (Capacitor), conversión con el piano con pedal (Transkun).
- Cómo reproducir (Jacobo, 2026-11-17): grabar algo con el micrófono y esperar la conversión: se quedó cargando y la app se cerró.
- Esperado / obtenido: la pieza convertida. Obtenido: la app se cierra.
- Causa (medida 2026-11-18): ONNX Runtime ocupa ~2,5 GB por segmento de 16 s: la atención arma matrices de ~3 GB si se calcula de una vez, el puntuador hace varias copias de S (691×691×90, 172 MB cada una) y el reservador de memoria de ONNX Runtime guarda los bloques sin soltarlos.
- Arreglo y prueba que lo cubre (app nativa, ADR-019): modelo para celular con la atención por partes y el puntuador aparte (de a 10 teclas), sin el reservador; el modelo se suelta al terminar cada conversión. `TranskunTest.transcribeComoPython` mide la memoria: de +2,5 GB a +0,67 GB, con las mismas 153 notas que Python. **Sin verificar en un celular.**

### BUG-008 · La app se cierra al terminar de grabar con el micrófono
- Dónde: por confirmar con Jacobo (lo más probable, el APK 0.1.0 de Android).
- Cómo reproducir (Jacobo, 2026-11-19): grabar con el micrófono y tocar "Terminar": la app se cierra. Pasa **cada vez**.
- Esperado / obtenido: que la grabación pase a convertirse en notas (o quede guardada). Obtenido: la app se cierra.
- Causa: sin investigar. Sospechosos: lo nuevo del paso de grabar a convertir (separar el instrumento con Spleeter, que antes de convertir baja 79 MB, y la cola en segundo plano), la memoria (como BUG-004) o el permiso del servicio en primer plano. Revisar con `adb logcat` con el celular conectado.
- Arreglo: pendiente.

### BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s)
- Dónde: app de Android, Exportar video (`visual/Exportador.kt`).
- Cómo reproducir (Jacobo, 2026-11-18, APK 0.1, en 720p): exportar una pieza y verla: el sonido va corrido respecto a las notas.
- Causa probable: los cuadros se dibujaban con el lienzo directo sobre la superficie del codificador, que les pone la hora del reloj; si se dibuja más rápido de lo que el codificador alcanza, puede saltarse cuadros y el video queda más corto que el audio.
- Arreglo: OpenGL ES con la hora exacta de cada cuadro (`eglPresentationTimeANDROID`), sin perder cuadros; se vacía la salida del codificador antes de cada cuadro. **Sin verificar en el celular.**

### BUG-007 · En la web, la batería grabada nunca se escuchaba (sonaba la sintetizada)
- Dónde: web y PC, cualquier pieza de batería (`apps/web/vite.config.ts`).
- Cómo se encontró (Claude, 2026-11-19): al agregar los sonidos grabados, la prueba e2e no veía ninguna descarga de `/instrumentos/`.
- Causa: la carpeta pública de Vite es `assets/brand` (el ícono), no `apps/web/public`. Los FLAC de `apps/web/public/bateria` nunca se servían ni se copiaban al build; el pedido devolvía la página y la batería caía, sin aviso, a la sintetizada. En el celular sí sonaba (Gradle los copia aparte). Puede explicar por qué Jacobo sentía que la batería "no suena a batería" en la web.
- Arreglo y prueba: plugin `sonidos()` en `vite.config.ts` que los sirve en desarrollo y los copia al build. Prueba e2e `se bajan los sonidos grabados…` en `instrumentos.spec.ts` (descarga y decodifica cada banco).

### BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas
- Dónde: web, pestaña Tablatura con una pieza de bajo (`score/ScoreTab.tsx`).
- Cómo reproducir (Jacobo, 2026-11-18): abrir "Bajo: rock" y ver la tablatura: 6 líneas, casi todo 0 en la misma cuerda y notas que cambiaban sin cambiar de cuerda.
- Causa: la hoja le pasaba la afinación de la guitarra también al bajo; la nota más grave del bajo no cabe en una guitarra.
- Arreglo y prueba: el bajo usa su afinación (4 cuerdas); prueba `bajo: tablatura de 4 cuerdas…` en `packages/notation/src/instrumentos.test.ts`. Verificado con captura (`test-results/capturas/tab-bajo.png`).
