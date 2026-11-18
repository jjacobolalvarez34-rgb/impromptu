# ROADMAP — Impromptu

Cada fase termina con algo que Jacobo puede usar y probar con su Yamaha. No se empieza una fase sin cerrar la anterior, es decir, con todo `VERIFICACIONES.md` en verde y la prueba de Jacobo anotada en la BITÁCORA.

**Cómo usar los prompts:** abre Claude Code en la carpeta del repo, activa el modo plan (Shift+Tab), usa el modelo más capaz disponible y pega el prompt de la fase. Revisa el plan antes de aprobarlo.

| Fase | Resultado | Hito |
|---|---|---|
| 0 | Repo listo, identidad en código, CI, Graphify | — |
| 1 | Visualizador desde un archivo MIDI | Primer video "a mano" |
| 2 | Teclado en vivo, pedales, piano incluido, modo en vivo | Tocar y verlo |
| 3 | Cámara, calibración, plantillas y exportar MP4 | **v0.1 pública** |
| 4 | Manos y dedos: separación, digitación, editor | Videos con dedos |
| 5 | Audio o micrófono a notas (con pedal en piano) | Sin MIDI también |
| 6 | Partitura formal (MusicXML, PDF, MIDI) | |
| 7 | Tutoriales y modo práctica | |
| 8 | App instalable de PC (Tauri) y de celular (Android, sin conexión) | |
| 9 | Guitarra (tablatura) y batería | |

---

## Fase 0 — Cimientos
**Prompt:**
```
Lee CLAUDE.md, docs/ARQUITECTURA.md, docs/DESIGN.md y docs/HERRAMIENTAS.md.
Fase 0 de docs/ROADMAP.md:
1. Crea el monorepo con pnpm + Turborepo según la estructura de ARQUITECTURA.md
   (apps/web con Vite + React + PWA; packages core, midi, render, audio, export, media, ui).
   Los paquetes de fases futuras quedan como carpetas con un README de una línea.
2. packages/ui: tokens CSS exactos de DESIGN.md §2, fuentes Martian Mono y Archivo
   empaquetadas localmente, y los componentes base de DESIGN.md §4 (Botón principal,
   Botón secundario, Botón de ícono, LCD, Interruptor, Chips, Pestañas, Deslizador,
   Indicador de dispositivo) y <Logo size>. Página /componentes que los muestre todos.
3. packages/core: tipos del modelo de datos EXACTOS de ARQUITECTURA.md, con pruebas.
4. Vitest, Playwright (con una prueba que abra /componentes y tome captura), ESLint,
   Prettier, TypeScript strict y CI en GitHub Actions.
5. Íconos con Lucide. assets/brand/icon.svg como favicon e ícono de la PWA.
6. Deja instalado Graphify según HERRAMIENTAS.md y genera el primer grafo.
No hagas nada de fases siguientes. Al final: /verificar y entrada en BITACORA.
```
**Listo cuando:** CI verde, `/componentes` se ve igual que el lienzo de identidad y las pruebas del modelo pasan.

## Fase 1 — Visualizador desde un MIDI
**Prompt:**
```
Fase 1 de docs/ROADMAP.md. Lee ARQUITECTURA (modelo de datos, flujos, presupuestos)
y DESIGN (§2 tema por defecto, §5 pantalla Estudio).
1. packages/midi: importar .mid a un Take (notas, velocity, CC64/66/67, tempo).
   Reglas de docs/BUGS.md (velocity 0 = note off, notas sin cerrar, running status).
2. packages/render con PixiJS: notas cayendo, teclado virtual 61/76/88 o automático,
   teclas iluminadas al sonar, guías de octava, barra de pedal, chispas con semilla fija.
   Todo dibujado a partir de t (segundos), sin estado que dependa del cuadro anterior.
3. Tema "Ámbar" (por defecto) y "Sala"; colores por mano (sin asignar = gris).
4. Pantalla Estudio con el layout de DESIGN §5: transporte con LCD, play/pausa,
   buscar, repetir sección, velocidad 0,5×–1,5×, línea de tiempo con carriles.
5. Audio de reproducción con @tonejs/piano (respetando el pedal sustain).
6. Prueba de rendimiento: MIDI sintético de 2.000 notas visibles a 60 fps.
Fixtures: usa fixtures/ (si está vacío, genera MIDIs de prueba y anótalo en PENDIENTES).
```
**Prueba de Jacobo:** cargar un MIDI que grabó en Cakewalk y ver que se ve y suena bien.

**Pedido de Jacobo (2026-11-16), se hace al final del proyecto, por decisión suya:** teclado con **nivel de realismo** elegible:
- **Plano:** el actual, liviano para celulares.
- **Realista:** teclas con relieve y sombras. Al tocar, la tecla baja suave y sube al soltar, y lo hondo y lo rápido dependen de la fuerza (velocity).

Todo se calcula a partir de t, para que el video exportado se vea igual (ADR-004).

## Fase 2 — Teclado en vivo, pedales y modo en vivo
**Prompt:**
```
Fase 2 de docs/ROADMAP.md.
1. Adaptador Web MIDI en packages/midi: lista de dispositivos, conexión y desconexión
   en caliente, permiso explicado al usuario, aviso claro en Safari.
   Normalizador: note on/off, velocity 0, CC64/66/67 (valor completo 0–127 para
   medio pedal), ignora active sensing (0xFE) y clock.
2. Grabación de tomas con timestamps del evento (MIDIMessageEvent.timeStamp),
   guardado en IndexedDB, lista de tomas, renombrar y borrar.
3. Visualizador en tiempo real mientras se toca (latencia ≤ 20 ms percibidos).
4. Piano incluido sonando en vivo (opcional: el usuario puede apagarlo si su teclado
   ya suena).
5. Pedales visibles: sustain, sostenuto y una corda, con barra continua para medio pedal.
6. Ruta /en-vivo: solo el visualizador con fondo transparente o verde. Prueba la
   integración con OBS (ver [VERIFICAR] en ARQUITECTURA) y documenta el resultado.
7. Vista celular (DESIGN §5, Grabar), pensada como pantalla de la futura app instalable (ADR-008); por ahora se prueba en Chrome Android.
```
**Prueba de Jacobo:** conectar el PSR-E343 por USB, tocar con pedal y grabar 3 tomas. Repetirlo en el celular Android con cable OTG.

## Fase 3 — Cámara, plantillas y exportar (v0.1)
**Prompt:**
```
Fase 3 de docs/ROADMAP.md.
1. packages/media: grabar cámara junto con la toma (offset con performance.now),
   importar video y audio externos, alinear (automático por correlación entre ataques
   de audio y notas MIDI cuando el video tiene sonido; manual ±500 ms con vista previa).
2. Calibración de teclas sobre el video: el usuario marca la primera y la última tecla
   y la línea de aterrizaje; las notas caen exactamente sobre las teclas reales.
3. Plantillas: solo visualizador, cámara arriba, cámara en recuadro, fondo
   (color, imagen, video, desenfoque).
4. packages/export: render offline determinista cuadro por cuadro + WebCodecs +
   Mediabunny → MP4 (H.264 + AAC). 16:9, 9:16, 1:1; 1080p y 4K; 30 y 60 fps.
   Audio: piano incluido (OfflineAudioContext) o audio importado. Barra de progreso
   y cancelar. Comprobación de soporte de códecs con mensaje claro si falta.
5. README para usuarios, página de inicio simple y despliegue de la PWA.
```
**Prueba de Jacobo:** hacer un video completo, de principio a fin, de una pieza suya con la cámara arriba, y publicarlo. **Esto es la v0.1.**

## Fase 4 — Manos y dedos
**Prompt:**
```
Fase 4 de docs/ROADMAP.md.
1. packages/practice: separación automática de manos (registro + continuidad de
   voces + distancia máxima de la mano) con pruebas sobre fixtures.
2. Digitación sugerida: puerto a TypeScript del algoritmo de PianoPlayer (MIT,
   respeta su aviso de copyright en LICENCIAS.md), con tamaño de mano configurable.
   Si el usuario fija un dedo, se usa como ancla y se recalcula alrededor.
3. Editor: seleccionar notas, cambiar mano o dedo, mover, alargar, borrar, deshacer
   y rehacer.
4. Mostrar dedos y nombres de notas en el visualizador (interruptores ya existentes).
```
**Prueba de Jacobo:** revisar la digitación sugerida en 3 piezas que conoce y anotar en BITACORA el porcentaje que cambiaría.

## Fase 5 — Audio o micrófono a notas
**Prompt:**
```
Fase 5 de docs/ROADMAP.md. Antes de construir, resuelve los [VERIFICAR] de
transcripción en ARQUITECTURA con una prueba aislada y registra un ADR.
1. packages/transcribe con Web Workers: Basic Pitch (TF.js) para cualquier
   instrumento; modelo de piano de ByteDance convertido a ONNX (onnxruntime-web,
   WebGPU con respaldo WASM) con detección de pedal.
2. Importar WAV, MP3, M4A o FLAC, o grabar con micrófono. Progreso, cancelar y
   resultado como Take con origin 'audio'.
3. Separación de manos de fase 4 sobre el resultado.
4. Comparar contra fixtures (MIDI real de Jacobo vs. su audio): F1 de ataques
   en BITACORA.
```

## Fase 6 — Partitura
**Prompt:**
```
Fase 6 de docs/ROADMAP.md.
1. packages/notation: detección de tempo y pulsos (evaluar beat_this, MIT),
   cuantización a compases, figuras, silencios, ligaduras, tresillos, dos pentagramas
   por mano, armadura, voces y pedal anotado (Ped. y asterisco o líneas).
2. Exportar MusicXML (validado con un parser) y MIDI cuantizado. PDF a partir del
   render de OpenSheetMusicDisplay.
3. Pestaña Partitura con vista sincronizada al reproducir.
Jacobo valida legibilidad: tiene que verse como una partitura que él tocaría.
```

## Fase 7 — Tutoriales y práctica
```
Fase 7 de docs/ROADMAP.md. Pestaña Tutorial: modo espera (avanza cuando tocas la nota
correcta), manos por separado, repetir sección, velocidad, números de dedo y marcas
de pedal grandes, puntuación de precisión sin gamificación invasiva.
Exportar video tutorial con dedos y pedal visibles.
```

## Fase 8 — Escritorio y Android
```
Fase 8 de docs/ROADMAP.md. apps/desktop con Tauri 2 + tauri-plugin-midi; archivos
locales; exportación con rutas del sistema. apps/mobile: APK de Android instalable que
funciona sin conexión (ADR-008); elegir Tauri 2 móvil o Capacitor con una prueba aislada
de Web MIDI por OTG; todo empaquetado en el instalador; ícono, splash e instalación.
```

## Fase 9 — Más instrumentos
```
Fase 9 de docs/ROADMAP.md. Guitarra: transcripción, asignación de cuerda y traste,
tablatura con alphaTab y exportación Guitar Pro. Batería: transcripción y tablatura
de batería. El visualizador se adapta (diapasón para guitarra, pads para batería).
```

## Fase 10 — Editor de partitura y video de la partitura (pedido de Jacobo, 2026-11-17)
```
Fase 10 de docs/ROADMAP.md. MVP de editor de partitura dentro de la pestaña Partitura:
seleccionar una nota o acorde en la hoja, cambiar altura, figura (duración), alteración,
ligadura, silencio y mano (pentagrama), con deshacer y rehacer; lo editado actualiza la
toma (visualizador, audio y MIDI) y se guarda con ella. Exportar un video de la
partitura: la hoja con el cursor avanzando (y desplazándose por los sistemas) en
sincronía con el audio, en los mismos formatos del video del visualizador (16:9, 9:16,
1:1). Grabar directo en la partitura: desde la pestaña Partitura, grabar con el teclado o
el micrófono (audio) y ver la partitura escribirse (pedido de Jacobo). Jacobo valida que se
pueda corregir una transcripción a mano sin salir de la app.
```

## Fase 11 — Gráficos mejores (pedido de Jacobo, 2026-11-18)
```
Fase 11 de docs/ROADMAP.md. Que el visualizador se vea de primera en web, PC y celular:
teclado realista por niveles (teclas que bajan según la fuerza, sombras, brillo), notas con
mejor luz, chispas y estelas, y lo equivalente para guitarra (diapasón) y batería (pads).
Mismo dibujo en pantalla y en el video exportado. Medir 60 fps en el celular de Jacobo.
```
