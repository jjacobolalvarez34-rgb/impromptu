# Graph Report - impromptu  (2026-11-19)

## Corpus Check
- 318 files · ~193,536 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 236 file(s) not represented in the graph (top: .flac 175, .css 36, .xml 8)

## Summary
- 3089 nodes · 7288 edges · 182 communities (131 shown, 51 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2093973d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/src/index.ts
- separar/worker.ts
- dependencies
- package.json
- ui/package.json
- catalog
- with
- compilerOptions
- Funciones por bloque
- practice/package.json
- ARQUITECTURA — Impromptu
- tasks
- ROADMAP — Impromptu
- audio/package.json
- Estudio.tsx
- media/package.json
- midi/package.json
- render/package.json
- transcribe/src/index.ts
- Visualizer
- transcribeStore.ts
- VERIFICACIONES — antes de decir "listo"
- pages.yml
- web/tsconfig.json
- practice/tsconfig.json
- ui/tsconfig.json
- Cómo empezar (para Jacobo)
- HERRAMIENTAS — Graphify, plugins y skills
- INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026)
- AGENTS.md — Impromptu
- Teclado.kt
- vercel.json
- .aMono
- audio/tsconfig.json
- core/tsconfig.json
- export/tsconfig.json
- media/tsconfig.json
- midi/tsconfig.json
- render/tsconfig.json
- .prettierrc.json
- .claude/CLAUDE.md
- LogoIntro.tsx
- audio/README.md
- export/README.md
- media/README.md
- midi/README.md
- render/README.md
- desktop/README.md
- PiezaPantalla.kt
- Celular.tsx
- export/src/export.ts
- align.ts
- Transkun.kt
- transcribe/package.json
- transcribe/README.md
- LiveSession
- store.ts
- edit.ts
- audio.ts
- core/package.json
- desktop/package.json
- Sintes
- notation/package.json
- midi/src/index.ts
- mobile/package.json
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- PartituraPantalla
- Flujos principales
- LivePanel.tsx
- notation/src/index.ts
- main.cts
- transkun/transcribe.ts
- Muestras
- MicrofonoPantalla.kt
- compilerOptions
- Estado
- Iconos.kt
- Secuencia
- .renderFrame
- Transkun.kt
- compilerOptions
- Piano
- transcribe/tsconfig.json
- createNoteEvent
- Nota
- notation/tsconfig.json
- dev.mjs
- Salamander
- DECISIONES (ADRs)
- Transport
- web/vite.config.ts
- scene.test.ts
- AudioEngine
- LivePlayer
- SettingsPanel.tsx
- ServicioTrabajos.kt
- Nota
- core/src/index.ts
- export/package.json
- ColaPanel.kt
- web/package.json
- Presentacion.kt
- ScoreTab.tsx
- Landing.tsx
- NoteEvent
- GrabarPantalla.kt
- InicioPantalla.kt
- Impromptu.kt
- Components.kt
- ref_node_fs
- Impromptu
- build
- HojaVideo.kt
- Conversiones
- demos-midi.mjs
- @impromptu/media@workspace:*
- @impromptu/notation@workspace:*
- audio/src/index.ts
- leerRecorrido
- CopiarModelos
- render/src/index.ts
- Pedal
- @impromptu/transcribe@workspace:*
- Pedal
- @playwright/test
- web/vite.config.ts
- opensheetmusicdisplay@2.2.1
- Etapa
- Lo que queda (resumen al 2026-11-17)
- DetectorBateria
- src/worker.ts
- InstrumentosTest
- @impromptu/export@workspace:*
- @impromptu/render@workspace:*
- keyboard-layout.ts
- liveMic.ts
- BasicPitch
- Pieza
- muestras.mjs
- .asignar
- visualizer.ts
- ExportarPantalla.kt
- main.ts
- Separador.kt
- instrumentos.ts
- LEEME.md
- Exportador.kt
- bateria.ts
- NoteEvent
- MainActivity.kt
- avance.ts

## God Nodes (most connected - your core abstractions)
1. `Visualizer` - 59 edges
2. `createNoteEvent()` - 58 edges
3. `Estudio()` - 55 edges
4. `useStudio` - 52 edges
5. `NoteEvent` - 43 edges
6. `Take` - 43 edges
7. `createTrack()` - 42 edges
8. `Nota` - 41 edges
9. `createTake()` - 39 edges
10. `Button()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `Lo que dijo Jacobo al probar la app nativa (2026-11-18)` --references--> `SeparadorTest`  [INFERRED]
  docs/PENDIENTES.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/SeparadorTest.kt
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `WaitMode`  [INFERRED]
  docs/BITACORA.md → packages/practice/src/wait.ts
- `ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande` --references--> `WaitMode`  [INFERRED]
  docs/DECISIONES.md → packages/practice/src/wait.ts

## Import Cycles
- None detected.

## Communities (182 total, 51 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (23): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+15 more)

### Community 1 - "separar/worker.ts"
Cohesion: 0.22
Nodes (18): BINS, cuadrosDe(), espectroCuadro(), F, Fft, HOP, mascara(), N_FFT (+10 more)

### Community 2 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @impromptu/core@workspace:*, @impromptu/practice@workspace:*, @impromptu/ui@workspace:*, lucide-react@catalog:, react@catalog:, react-dom@catalog:, react-router@catalog: (+6 more)

### Community 3 - "package.json"
Cohesion: 0.07
Nodes (38): description, devDependencies, eslint@catalog:, @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, @playwright/test@catalog:, prettier@catalog: (+30 more)

### Community 4 - "ui/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @fontsource/archivo@catalog:, @fontsource/martian-mono@catalog:, description, devDependencies, react@catalog:, @types/react@catalog:, typescript@catalog: (+17 more)

### Community 5 - "catalog"
Cohesion: 0.06
Nodes (35): allowBuilds, core-js, electron, electron-winstaller, gl, protobufjs, catalog, eslint (+27 more)

### Community 6 - "with"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, verificar, name, on, pull_request (+15 more)

### Community 7 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noImplicitOverride (+8 more)

### Community 8 - "Funciones por bloque"
Cohesion: 0.12
Nodes (15): Celular, El problema, En vivo, Estudio (crear videos) — primero, Fuera de alcance por ahora, Funciones por bloque, Lo que nos diferencia (no negociable), Modelo de sostenibilidad (+7 more)

### Community 9 - "practice/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 10 - "ARQUITECTURA — Impromptu"
Cohesion: 0.25
Nodes (8): ARQUITECTURA — Impromptu, Estructura del monorepo, Modelo de datos (packages/core), Plataformas, Presupuestos de rendimiento, Principios, Seguridad y privacidad, Stack

### Community 11 - "tasks"
Cohesion: 0.15
Nodes (12): dependsOn, outputs, cache, persistent, $schema, tasks, build, dev (+4 more)

### Community 12 - "ROADMAP — Impromptu"
Cohesion: 0.15
Nodes (13): Fase 0 — Cimientos, Fase 10 — Editor de partitura y video de la partitura (pedido de Jacobo, 2026-11-17), Fase 11 — Gráficos mejores (pedido de Jacobo, 2026-11-18), Fase 1 — Visualizador desde un MIDI, Fase 2 — Teclado en vivo, pedales y modo en vivo, Fase 3 — Cámara, plantillas y exportar (v0.1), Fase 4 — Manos y dedos, Fase 5 — Audio o micrófono a notas (+5 more)

### Community 13 - "audio/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 14 - "Estudio.tsx"
Cohesion: 0.14
Nodes (29): onMenuAction(), Ajustes(), ASPECTS, ESCUCHAR, Estudio(), NOMBRE_HOJA, ScoreTab, SPEEDS (+21 more)

### Community 15 - "media/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 16 - "midi/package.json"
Cohesion: 0.11
Nodes (20): dependencies, @impromptu/core@workspace:*, midi-file@catalog:, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+12 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 18 - "transcribe/src/index.ts"
Cohesion: 0.17
Nodes (22): NotesOptions, RawNote, PARTE_DE, SepararEtapa, separarInstrumento(), SepararMessage, SepararRequest, DEFAULT_PARAMS (+14 more)

### Community 19 - "Visualizer"
Cohesion: 0.13
Nodes (4): Rasgueo, noteColor(), VisualSettings, Visualizer

### Community 20 - "transcribeStore.ts"
Cohesion: 0.12
Nodes (16): avances, Conversion, mb(), Model, nextAudioName(), pendientes, SEPARADOR_URL, Store (+8 more)

### Community 21 - "VERIFICACIONES — antes de decir "listo""
Cohesion: 0.22
Nodes (8): 1. Siempre, 2. Interfaz, 3. Modelo de datos y tiempo, 4. MIDI y teclado real, 5. Visualizador y exportación, 6. Transcripción (fase 5+), 7. Privacidad, VERIFICACIONES — antes de decir "listo"

### Community 22 - "pages.yml"
Cohesion: 0.06
Nodes (31): concurrency, cancel-in-progress, group, runs-on, steps, timeout-minutes, VITE_BASE, name (+23 more)

### Community 23 - "web/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, jsx, lib, types, extends, include, ../../tsconfig.base.json

### Community 24 - "practice/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 25 - "ui/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, jsx, lib, types, extends, include, ../../tsconfig.base.json

### Community 26 - "Cómo empezar (para Jacobo)"
Cohesion: 0.29
Nodes (6): 1. Crear el repositorio, 2. Instalar las herramientas (una vez), 3. Arrancar la fase 0, 4. Lo que puedes ir haciendo tú (sin código), 5. Después de cada fase, Cómo empezar (para Jacobo)

### Community 27 - "HERRAMIENTAS — Graphify, plugins y skills"
Cohesion: 0.25
Nodes (7): Comandos del proyecto (`.claude/commands/`), Graphify (ahorro de tokens), HERRAMIENTAS — Graphify, plugins y skills, Para más adelante, Plugins de diseño (se instalan en Claude Code, no en la terminal del sistema), Pruebas y verificación, Regla del equipo de Jacobo: todo en D:

### Community 28 - "INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026)"
Cohesion: 0.29
Nodes (6): Competencia, Fuentes, INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026), Referencias de estilo, Tecnología clave, Yamaha PSR-E343 (equipo de pruebas de Jacobo)

### Community 29 - "AGENTS.md — Impromptu"
Cohesion: 0.40
Nodes (4): AGENTS.md — Impromptu, Antes de tocar código, Reglas, Roles sugeridos para subagentes

### Community 30 - "Teclado.kt"
Cohesion: 0.14
Nodes (5): Control, EventoMidi, Off, On, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - ".aMono"
Cohesion: 0.15
Nodes (3): Decodificar, Floats, Pcm

### Community 33 - "audio/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, lib, extends, include, ../../tsconfig.base.json

### Community 34 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 35 - "export/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, lib, extends, include, ../../tsconfig.base.json

### Community 36 - "media/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, lib, extends, include, ../../tsconfig.base.json

### Community 37 - "midi/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 38 - "render/tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, lib, extends, include, ../../tsconfig.base.json

### Community 39 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

### Community 41 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

### Community 48 - "PiezaPantalla.kt"
Cohesion: 0.16
Nodes (4): formatoTiempo(), BarraTiempo(), Lienzo(), PiezaPantalla()

### Community 54 - "Celular.tsx"
Cohesion: 0.10
Nodes (34): lockOrientation(), Girar(), Grabando(), Inicio(), Miniatura(), Mode, MODES, Pieza() (+26 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.21
Nodes (27): Take, chooseFormat(), DecodedFrame, ExportError, ExportFailure, ExportOptions, ExportProgress, ExportResult (+19 more)

### Community 56 - "align.ts"
Cohesion: 0.09
Nodes (31): sonidos(), BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s), BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas, BUG-007 · En la web, la batería grabada nunca se escuchaba (sonaba la sintetizada) (+23 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.09
Nodes (27): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, @impromptu/audio@workspace:* (+19 more)

### Community 62 - "LiveSession"
Cohesion: 0.10
Nodes (8): startCameraRecording(), stopCameraRecording(), conInstrumento(), liveNow(), LiveSession, Clicker, Recorder, toMicro()

### Community 63 - "store.ts"
Cohesion: 0.07
Nodes (40): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+32 more)

### Community 64 - "edit.ts"
Cohesion: 0.06
Nodes (47): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+39 more)

### Community 65 - "audio.ts"
Cohesion: 0.11
Nodes (27): AudioState, AudioStatus, NOMBRE_BANCO, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, click() (+19 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.10
Nodes (21): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+13 more)

### Community 68 - "Sintes"
Cohesion: 0.14
Nodes (12): Sintes, Timbre, Acero, Bajo, Electrica, Nylon, Voz, Instrumento (+4 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "midi/src/index.ts"
Cohesion: 0.07
Nodes (36): IdFactory, sortPedals(), KeyboardRange, pedalKindFromCC(), importMidi(), ImportOptions, ImportResult, ImportWarning (+28 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.10
Nodes (24): description, devDependencies, @impromptu/core@workspace:*, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, vite@catalog: (+16 more)

### Community 72 - "CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)"
Cohesion: 0.25
Nodes (8): CLAUDE.md — Impromptu (léelo SIEMPRE al empezar), Diseño, Dónde está cada cosa, graphify, Protocolo de cada sesión, Qué construimos, Regla de producto número 1, Reglas de oro técnicas

### Community 73 - "DESIGN — Identidad de Impromptu"
Cohesion: 0.25
Nodes (8): 1. Logo, 2. Color (tokens), 3. Tipografía, 4. Componentes, 5. Pantallas de referencia, 6. Reglas para que no parezca hecho con IA, 7. Voz de la interfaz, DESIGN — Identidad de Impromptu

### Community 74 - "LICENCIAS — qué se puede usar"
Cohesion: 0.25
Nodes (7): Algoritmos y datos, Créditos visibles en la app, Librerías, Licencia del proyecto, LICENCIAS — qué se puede usar, Modelos de IA, Proyectos que NO se copian

### Community 75 - "impromptu"
Cohesion: 0.29
Nodes (7): Apoyar el proyecto, Créditos, Cómo empezar, impromptu, Lo que viene, Para desarrolladores, Qué puedes hacer hoy

### Community 76 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, preview, test, typecheck

### Community 77 - "PartituraPantalla"
Cohesion: 0.14
Nodes (5): BarraVideo(), compartirArchivo(), compartirTexto(), PartituraPantalla(), WebViewClient

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "LivePanel.tsx"
Cohesion: 0.13
Nodes (27): LiveState, MidiStatus, readRecordMic(), refreshTakes(), METER_OPTIONS, saveForTests(), SOURCE_ICON, SOURCE_TEXT (+19 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.09
Nodes (40): ADR-011 · Líneas de compás y pulso en el visualizador, beatGrid(), Seleccion, partitura(), correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES (+32 more)

### Community 82 - "main.cts"
Cohesion: 0.29
Nodes (8): createSplash(), createWindow(), ADR-0018, inside(), ISOLATION, menu(), send(), serve()

### Community 83 - "transkun/transcribe.ts"
Cohesion: 0.15
Nodes (24): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+16 more)

### Community 84 - "Muestras"
Cohesion: 0.27
Nodes (6): Capa, Manifiesto, Muestras, Zona, MuestrasTest, 2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería

### Community 85 - "MicrofonoPantalla.kt"
Cohesion: 0.18
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 89 - "Secuencia"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 90 - ".renderFrame"
Cohesion: 0.19
Nodes (7): noteRect(), azar(), hashId(), lighten(), luminance(), makeRoundedNoteTexture(), Pool

### Community 91 - "Transkun.kt"
Cohesion: 0.10
Nodes (7): Cancelada, Constantes, Decodificacion, Espectro, Evento, Modelos, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "Piano"
Cohesion: 0.09
Nodes (24): ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`, note(), cadenaMaestra(), VOLUMEN_EXTRA, ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX (+16 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "createNoteEvent"
Cohesion: 0.13
Nodes (30): aTake(), CHORDS, createDemoBateria(), createDemoGuitarra(), createDemoPiece(), MELODY, HeroVisualizer(), piece() (+22 more)

### Community 97 - "Nota"
Cohesion: 0.22
Nodes (3): esNegra(), Opciones, Renderizador

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 100 - "Salamander"
Cohesion: 0.27
Nodes (3): Salamander, Sampler, Voz

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (18): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión (+10 more)

### Community 102 - "Transport"
Cohesion: 0.10
Nodes (14): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura (+6 more)

### Community 103 - "web/vite.config.ts"
Cohesion: 0.14
Nodes (7): @vitejs/plugin-react@catalog:, brandDir, CARPETAS_SONIDO, isolation, sonidosDir, @vitejs/plugin-react, brand

### Community 104 - "scene.test.ts"
Cohesion: 0.12
Nodes (20): 2026-11-17 · Fase 7 · Tutoriales y práctica, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, frameLayout(), isSounding(), lowerBound() (+12 more)

### Community 105 - "AudioEngine"
Cohesion: 0.15
Nodes (5): AudioEngine, lowerBound(), avisarDescarga(), terminarDescarga(), LiveVoiceHandle

### Community 107 - "SettingsPanel.tsx"
Cohesion: 0.05
Nodes (29): useAudio, ColorField(), Props, AFINACIONES_UI, BACKGROUNDS, BRILLO_DE, CalidadDelPiano(), CALIDADES (+21 more)

### Community 108 - "ServicioTrabajos.kt"
Cohesion: 0.06
Nodes (8): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando, object@L150, ServicioTrabajos

### Community 109 - "Nota"
Cohesion: 0.22
Nodes (6): Nota, Estado, Manos, Golpe, Rasgueo, ManosYRasgueoTest

### Community 110 - "core/src/index.ts"
Cohesion: 0.11
Nodes (29): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar() (+21 more)

### Community 111 - "export/package.json"
Cohesion: 0.11
Nodes (22): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+14 more)

### Community 112 - "ColaPanel.kt"
Cohesion: 0.15
Nodes (4): ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros()

### Community 113 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/audio@workspace:*, @impromptu/midi@workspace:*, description, @impromptu/audio, @impromptu/midi, name, private, type (+1 more)

### Community 114 - "Presentacion.kt"
Cohesion: 0.17
Nodes (3): notasCayendo(), PresentacionPantalla(), Punto()

### Community 115 - "ScoreTab.tsx"
Cohesion: 0.08
Nodes (31): ScoreTab, download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, VISTAS_TAB, Burbuja() (+23 more)

### Community 116 - "Landing.tsx"
Cohesion: 0.07
Nodes (40): MAMUT_HERD, MamutHerdSello(), PROPORCION, abrirPantalla(), connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction (+32 more)

### Community 117 - "NoteEvent"
Cohesion: 0.27
Nodes (9): NoteEvent, exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), note(), Timed (+1 more)

### Community 118 - "GrabarPantalla.kt"
Cohesion: 0.13
Nodes (5): GrabarPantalla(), HojaEnVivo(), object@L218, WebViewClient, PuntoRec()

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.11
Nodes (8): BotonIcono(), Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), SelectorInstrumento()

### Community 120 - "Impromptu.kt"
Cohesion: 0.08
Nodes (6): Piezas, Avance, Ia, Modelo, Paquetes, Sonido

### Community 122 - "ref_node_fs"
Cohesion: 0.19
Nodes (6): androidEnv, r, r, { version }, outDir, [width = 1920, height = 1080, fps = 60]

### Community 124 - "build"
Cohesion: 0.12
Nodes (17): build, appId, copyright, directories, extraResources, files, nsis, productName (+9 more)

### Community 126 - "Conversiones"
Cohesion: 0.12
Nodes (4): AvanceSuave, Conversiones, Terminada, TrabajoConversion

### Community 127 - "demos-midi.mjs"
Cohesion: 0.17
Nodes (12): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+4 more)

### Community 130 - "audio/src/index.ts"
Cohesion: 0.12
Nodes (22): archivosDe(), Banco, bancoDe(), CapaBateria, golpeBateria(), Manifiesto, zonas, ZonaCuerda (+14 more)

### Community 131 - "leerRecorrido"
Cohesion: 0.18
Nodes (10): cuadro(), paraVideo(), aRedondas(), CursorOsmd, FinesDeRenglon, leerRecorrido(), posicionEn(), PuntoCursor (+2 more)

### Community 132 - "CopiarModelos"
Cohesion: 0.10
Nodes (7): CopiarModelos, compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 133 - "render/src/index.ts"
Cohesion: 0.14
Nodes (15): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, Paleta, paletaDe(), PALETAS (+7 more)

### Community 134 - "Pedal"
Cohesion: 0.25
Nodes (3): Formato, Leido, Smf

### Community 136 - "Pedal"
Cohesion: 0.17
Nodes (8): Pedal, TipoPedal, Sostenuto, Sustain, UnaCorda, Grabacion, guardarEdicion(), SmfTest

### Community 139 - "web/vite.config.ts"
Cohesion: 0.13
Nodes (15): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, vite-plugin-pwa@catalog:, vitest@catalog: (+7 more)

### Community 141 - "Etapa"
Cohesion: 0.22
Nodes (8): Etapa, Armando, Descargando, Escuchando, Esperando, Leyendo, Preparando, Separando

### Community 150 - "Lo que queda (resumen al 2026-11-17)"
Cohesion: 0.22
Nodes (8): App de Android NATIVA (decidido por Jacobo, 2026-11-17; construida el 2026-11-18, ADR-019, sin verificar en un celular), Decisiones de Jacobo abiertas, Lo que queda (resumen al 2026-11-17), Para que pruebe Jacobo, Para subir a Hugging Face (P15 y P21), Pedidos de Jacobo después de probar las apps (2026-11-17), PENDIENTES — decisiones e insumos de Jacobo, Por construir

### Community 152 - "DetectorBateria"
Cohesion: 0.42
Nodes (3): Bandas, DetectorBateria, Golpe

### Community 156 - "src/worker.ts"
Cohesion: 0.43
Nodes (5): post(), prepare(), run(), WorkerMessage, WorkerRequest

### Community 162 - "keyboard-layout.ts"
Cohesion: 0.23
Nodes (9): BLACK, BLACK_LENGTH, BLACK_OFFSET, BLACK_WIDTH, isBlack(), KeyRect, layoutKeyboard(), normalizeRange() (+1 more)

### Community 163 - "liveMic.ts"
Cohesion: 0.36
Nodes (3): LiveListener, resample(), MODEL_RATE

### Community 171 - "Pieza"
Cohesion: 0.17
Nodes (6): Origen, Audio, Microfono, Midi, Teclado, Pieza

### Community 174 - "muestras.mjs"
Cohesion: 0.26
Nodes (11): BATERIA, bateria(), CAPAS_BATERIA, convertir(), cuerdas(), DESTINO, leerSfz(), nombreNota() (+3 more)

### Community 175 - ".asignar"
Cohesion: 0.36
Nodes (5): Bateria, Forma, Guitarra, Pieza, Posicion

### Community 177 - "visualizer.ts"
Cohesion: 0.10
Nodes (16): ADR-0004, COLOR_BAQUETA, installLabelFont(), labelFor(), makeBeamTexture(), makeCristalTexture(), makeEstelaTexture(), makeGlowTexture() (+8 more)

### Community 181 - "ExportarPantalla.kt"
Cohesion: 0.09
Nodes (22): AjustesPantalla(), Avance(), Confirmar(), Encabezado(), Panel(), PedirTexto(), AvanceExportacion(), ExportarPantalla() (+14 more)

### Community 183 - "main.ts"
Cohesion: 0.08
Nodes (27): aplicar(), baseMs, compasActual, dibujar(), elegir(), enVivo(), futuro, guardar() (+19 more)

### Community 184 - "Separador.kt"
Cohesion: 0.12
Nodes (5): Fft, Separador, SeparadorTest, 2026-11-19 (tarde) · Todo al celular, video en segundo plano, separar instrumentos y compilados, Lo que dijo Jacobo al probar la app nativa (2026-11-18)

### Community 193 - "instrumentos.ts"
Cohesion: 0.22
Nodes (13): Baqueta, baquetas(), PIES, PLATILLOS, Carriles, carriles(), carrilesBateria(), carrilesCuerdas() (+5 more)

### Community 195 - "Exportador.kt"
Cohesion: 0.09
Nodes (6): BancoGrabado, Banco, Limitador, Exportador, Paquete, SuperficieGl

### Community 199 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 208 - "NoteEvent"
Cohesion: 0.06
Nodes (37): PiezaWeb, Strikeable, KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, countOutOfRange(), KEYBOARD_PRESETS (+29 more)

### Community 214 - "MainActivity.kt"
Cohesion: 0.06
Nodes (14): Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono (+6 more)

### Community 216 - "avance.ts"
Cohesion: 0.29
Nodes (4): AvanceSuave, fraseDeEspera(), FRASES, textoRestante()

## Knowledge Gaps
- **64 isolated node(s):** `Ia`, `On`, `Quieta`, `Partitura`, `Presentacion` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1069 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **51 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plantilla` connect `Transport` to `scene.test.ts`, `LivePlayer`, `Muestras`, `Separador.kt`, `createNoteEvent`?**
  _High betweenness centrality (0.297) - this node is a cross-community bridge._
- **What connects `Ia`, `On`, `Quieta` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08139534883720931 - nodes in this community are weakly interconnected._
- **Why does `2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería` connect `Muestras` to `Nota`, `Transport`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `2026-11-16 · Fase 0 · Cimientos` connect `createNoteEvent` to `edit.ts`, `Transport`, `midi/src/index.ts`, `NoteEvent`, `transcribe/src/index.ts`?**
  _High betweenness centrality (0.183) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06538461538461539 - nodes in this community are weakly interconnected._