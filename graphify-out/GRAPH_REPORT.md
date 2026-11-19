# Graph Report - impromptu  (2026-11-19)

## Corpus Check
- 317 files · ~192,537 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 236 file(s) not represented in the graph (top: .flac 175, .css 36, .xml 8)

## Summary
- 3060 nodes · 7304 edges · 180 communities (130 shown, 50 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `59a5d38e`
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
- Impromptu
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
- ExportarPantalla.kt
- Celular.tsx
- export/src/export.ts
- align.ts
- InstrumentosTest.kt
- transcribe/package.json
- transcribe/README.md
- PiezaPantalla.kt
- store.ts
- practice/src/index.ts
- audio.ts
- core/package.json
- desktop/package.json
- Sintes
- notation/package.json
- studio/live.ts
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
- import.ts
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
- Sampler
- DECISIONES (ADRs)
- Transport
- web/vite.config.ts
- scene.test.ts
- AudioEngine
- LivePlayer
- SettingsPanel.tsx
- ServicioTrabajos.kt
- LiveListener
- core/src/index.ts
- export/package.json
- practice.test.ts
- web/package.json
- Etapa
- ScoreTab.tsx
- Landing.tsx
- transkun/worker.ts
- EventoMidi
- InicioPantalla.kt
- Paquetes.kt
- Theme.kt
- ref_node_fs
- fingering.ts
- Formato
- StudioState
- Conversiones
- demos-midi.mjs
- @impromptu/media@workspace:*
- @impromptu/notation@workspace:*
- audio/src/index.ts
- main.ts
- CopiarModelos
- render/src/index.ts
- Pedal
- @impromptu/transcribe@workspace:*
- @impromptu/ui@workspace:*
- @playwright/test
- web/vite.config.ts
- opensheetmusicdisplay@2.2.1
- react-dom
- Take
- GrabarPantalla
- edit.ts
- BasicPitch
- core/src/index.ts
- Pieza
- muestras.mjs
- .asignar
- visualizer.ts
- ColaPanel.kt
- Puente
- Separador.kt
- instrumentos.ts
- LEEME.md
- Exportador.kt
- NoteEvent
- bateria.ts
- DetectorBateria
- Instrument
- MainActivity.kt
- avance.ts

## God Nodes (most connected - your core abstractions)
1. `Visualizer` - 63 edges
2. `createNoteEvent()` - 58 edges
3. `Estudio()` - 55 edges
4. `useStudio` - 52 edges
5. `Take` - 49 edges
6. `NoteEvent` - 47 edges
7. `Button()` - 45 edges
8. `createTrack()` - 42 edges
9. `Nota` - 41 edges
10. `createTake()` - 39 edges

## Surprising Connections (you probably didn't know these)
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería` --references--> `ManosYRasgueoTest`  [INFERRED]
  docs/BITACORA.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/ManosYRasgueoTest.kt
- `2026-11-19 (tarde) · Todo al celular, video en segundo plano, separar instrumentos y compilados` --references--> `SeparadorTest`  [INFERRED]
  docs/BITACORA.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/SeparadorTest.kt

## Import Cycles
- None detected.

## Communities (180 total, 50 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.07
Nodes (30): root, COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS (+22 more)

### Community 1 - "separar/worker.ts"
Cohesion: 0.23
Nodes (17): BINS, cuadrosDe(), espectroCuadro(), F, Fft, HOP, mascara(), N_FFT (+9 more)

### Community 2 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/export@workspace:*, @impromptu/practice@workspace:*, lucide-react@catalog:, react@catalog:, react-router@catalog: (+6 more)

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
Cohesion: 0.12
Nodes (29): BackgroundChoice, BACKGROUNDS, EnVivo(), TO_BACKGROUND, ASPECTS, ESCUCHAR, Estudio(), NOMBRE_HOJA (+21 more)

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
Cohesion: 0.13
Nodes (28): NotesOptions, RawNote, PARTE_DE, SepararEtapa, separarInstrumento(), Parte, SepararMessage, SepararRequest (+20 more)

### Community 19 - "Visualizer"
Cohesion: 0.11
Nodes (9): CameraState, CameraVideo, KeyboardCalibration, Rasgueo, indexNotes(), NoteIndex, VisualSettings, getTheme() (+1 more)

### Community 20 - "transcribeStore.ts"
Cohesion: 0.14
Nodes (14): avances, Conversion, mb(), Model, nextAudioName(), pendientes, PIANO_MODEL_URL, SEPARADOR_URL (+6 more)

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

### Community 30 - "Impromptu"
Cohesion: 0.09
Nodes (3): Banco, Impromptu, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - ".aMono"
Cohesion: 0.18
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

### Community 54 - "Celular.tsx"
Cohesion: 0.08
Nodes (38): lockOrientation(), Ajustes(), Celular(), Girar(), Grabando(), Inicio(), Miniatura(), Mode (+30 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.14
Nodes (34): ASPECTS, PHASES, RATES, RESOLUTIONS, State, ExportPreview(), PROPORCION, chooseFormat() (+26 more)

### Community 56 - "align.ts"
Cohesion: 0.09
Nodes (31): sonidos(), BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s), BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas, BUG-007 · En la web, la batería grabada nunca se escuchaba (sonaba la sintetizada) (+23 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.08
Nodes (32): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, @impromptu/audio@workspace:* (+24 more)

### Community 62 - "PiezaPantalla.kt"
Cohesion: 0.16
Nodes (4): formatoTiempo(), BarraTiempo(), Lienzo(), PiezaPantalla()

### Community 63 - "store.ts"
Cohesion: 0.10
Nodes (35): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, chunks, startCamera() (+27 more)

### Community 64 - "practice/src/index.ts"
Cohesion: 0.17
Nodes (7): rebuild(), 2026-11-17 · Fase 7 · Tutoriales y práctica, ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, FingeringOptions, PracticeChord, practiceChords(), WaitMode

### Community 65 - "audio.ts"
Cohesion: 0.14
Nodes (22): AudioState, AudioStatus, NOMBRE_BANCO, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, analyzeAudio() (+14 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.05
Nodes (38): build, appId, copyright, directories, extraResources, files, nsis, productName (+30 more)

### Community 68 - "Sintes"
Cohesion: 0.10
Nodes (13): BancoGrabado, Sintes, Timbre, Acero, Bajo, Electrica, Nylon, Voz (+5 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "studio/live.ts"
Cohesion: 0.08
Nodes (24): startCameraRecording(), stopCameraRecording(), liveNow(), LiveSession, LiveState, MidiStatus, readRecordMic(), click() (+16 more)

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
Cohesion: 0.21
Nodes (5): BarraVideo(), compartirArchivo(), compartirTexto(), PartituraPantalla(), WebViewClient

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "LivePanel.tsx"
Cohesion: 0.13
Nodes (26): InsigniaInstrumento(), refreshTakes(), useLive, METER_OPTIONS, saveForTests(), SOURCE_ICON, SOURCE_TEXT, STATUS_TEXT (+18 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.08
Nodes (43): Edicion, editar(), FIGURAS, hacerSeleccionable(), largoCompas(), nombreNota(), NOMBRES, NotaGrafica (+35 more)

### Community 82 - "main.cts"
Cohesion: 0.29
Nodes (8): createSplash(), createWindow(), ADR-0018, inside(), ISOLATION, menu(), send(), serve()

### Community 83 - "import.ts"
Cohesion: 0.12
Nodes (17): sortPedals(), importMidi(), instrumentoDePista(), MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack(), sameNotes() (+9 more)

### Community 84 - "Muestras"
Cohesion: 0.27
Nodes (6): Capa, Manifiesto, Muestras, Zona, MuestrasTest, 2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería

### Community 85 - "MicrofonoPantalla.kt"
Cohesion: 0.07
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 88 - "Iconos.kt"
Cohesion: 0.15
Nodes (4): notasCayendo(), PresentacionPantalla(), Punto(), Icono()

### Community 89 - "Secuencia"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 90 - ".renderFrame"
Cohesion: 0.15
Nodes (9): forEachNoteIn(), lowerBound(), noteRect(), azar(), hashId(), labelFor(), lighten(), luminance() (+1 more)

### Community 91 - "Transkun.kt"
Cohesion: 0.10
Nodes (7): Cancelada, Constantes, Decodificacion, Espectro, Evento, Modelos, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "Piano"
Cohesion: 0.12
Nodes (23): note(), ActiveVoice, LiveVoiceHandle, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, Piano, PianoOptions (+15 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "createNoteEvent"
Cohesion: 0.14
Nodes (23): CHORDS, createDemoBateria(), createDemoGuitarra(), createDemoPiece(), MELODY, HeroVisualizer(), piece(), conInstrumento() (+15 more)

### Community 97 - "Nota"
Cohesion: 0.13
Nodes (9): esNegra(), Nota, Estado, Manos, Golpe, Rasgueo, Opciones, Renderizador (+1 more)

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 100 - "Sampler"
Cohesion: 0.24
Nodes (3): Salamander, Sampler, Voz

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.10
Nodes (19): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano` (+11 more)

### Community 102 - "Transport"
Cohesion: 0.06
Nodes (24): SeparadorTest, Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd (+16 more)

### Community 103 - "web/vite.config.ts"
Cohesion: 0.17
Nodes (5): brandDir, CARPETAS_SONIDO, isolation, sonidosDir, brand

### Community 104 - "scene.test.ts"
Cohesion: 0.13
Nodes (17): ADR-0006, isSounding(), noteColor(), pedalLevels(), kb, layout, note(), burstSeed() (+9 more)

### Community 105 - "AudioEngine"
Cohesion: 0.14
Nodes (4): AudioEngine, lowerBound(), avisarDescarga(), terminarDescarga()

### Community 107 - "SettingsPanel.tsx"
Cohesion: 0.10
Nodes (24): useAudio, ColorField(), Props, AFINACIONES_UI, BACKGROUNDS, BRILLO_DE, CalidadDelPiano(), CALIDADES (+16 more)

### Community 108 - "ServicioTrabajos.kt"
Cohesion: 0.05
Nodes (9): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando, object@L150, ServicioTrabajos (+1 more)

### Community 109 - "LiveListener"
Cohesion: 0.36
Nodes (3): LiveListener, resample(), MODEL_RATE

### Community 110 - "core/src/index.ts"
Cohesion: 0.07
Nodes (37): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar() (+29 more)

### Community 111 - "export/package.json"
Cohesion: 0.11
Nodes (22): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+14 more)

### Community 112 - "practice.test.ts"
Cohesion: 0.24
Nodes (9): Hand, alcance(), avg(), Estado, HandOptions, separateHands(), fixtures, melody() (+1 more)

### Community 113 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/midi@workspace:*, @impromptu/render@workspace:*, description, @impromptu/midi, @impromptu/render, name, private, type (+1 more)

### Community 114 - "Etapa"
Cohesion: 0.22
Nodes (8): Etapa, Armando, Descargando, Escuchando, Esperando, Leyendo, Preparando, Separando

### Community 115 - "ScoreTab.tsx"
Cohesion: 0.11
Nodes (25): download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, VISTAS_TAB, Burbuja(), ExportDialog() (+17 more)

### Community 116 - "Landing.tsx"
Cohesion: 0.07
Nodes (33): MAMUT_HERD, MamutHerdSello(), PROPORCION, abrirPantalla(), connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction (+25 more)

### Community 117 - "transkun/worker.ts"
Cohesion: 0.18
Nodes (21): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+13 more)

### Community 118 - "EventoMidi"
Cohesion: 0.33
Nodes (4): Control, EventoMidi, Off, On

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.11
Nodes (9): BotonIcono(), Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), SelectorInstrumento() (+1 more)

### Community 120 - "Paquetes.kt"
Cohesion: 0.12
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 122 - "ref_node_fs"
Cohesion: 0.19
Nodes (6): androidEnv, r, r, { version }, outDir, [width = 1920, height = 1080, fps = 60]

### Community 123 - "fingering.ts"
Cohesion: 0.21
Nodes (14): ADR-0012, Finger, chordOptions(), FINGERS, isBlack(), linkCost(), ownCost(), placementCost() (+6 more)

### Community 124 - "Formato"
Cohesion: 0.50
Nodes (4): Formato, Cuadrado, Horizontal, Vertical

### Community 125 - "StudioState"
Cohesion: 0.67
Nodes (3): StudioState, LoopRange, HandSize

### Community 126 - "Conversiones"
Cohesion: 0.12
Nodes (4): AvanceSuave, Conversiones, Terminada, TrabajoConversion

### Community 127 - "demos-midi.mjs"
Cohesion: 0.17
Nodes (12): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+4 more)

### Community 130 - "audio/src/index.ts"
Cohesion: 0.10
Nodes (21): cadenaMaestra(), VOLUMEN_EXTRA, archivosDe(), Banco, bancoDe(), CapaBateria, golpeBateria(), Manifiesto (+13 more)

### Community 131 - "main.ts"
Cohesion: 0.11
Nodes (26): aplicar(), aTake(), baseMs, compasActual, cuadro(), dibujar(), elegir(), enVivo() (+18 more)

### Community 132 - "CopiarModelos"
Cohesion: 0.10
Nodes (7): CopiarModelos, compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 133 - "render/src/index.ts"
Cohesion: 0.17
Nodes (18): calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, Carriles, BLACK, BLACK_LENGTH, BLACK_OFFSET (+10 more)

### Community 134 - "Pedal"
Cohesion: 0.12
Nodes (11): Pedal, TipoPedal, Sostenuto, Sustain, UnaCorda, Formato, Leido, Smf (+3 more)

### Community 139 - "web/vite.config.ts"
Cohesion: 0.12
Nodes (17): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog: (+9 more)

### Community 150 - "Take"
Cohesion: 0.16
Nodes (14): DEMO_PIECES, demoPieces, describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName(), countOutOfRange() (+6 more)

### Community 163 - "GrabarPantalla"
Cohesion: 0.18
Nodes (4): GrabarPantalla(), HojaEnVivo(), object@L218, WebViewClient

### Community 168 - "edit.ts"
Cohesion: 0.26
Nodes (13): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+5 more)

### Community 170 - "core/src/index.ts"
Cohesion: 0.13
Nodes (17): Beat, beatAt(), beatGrid(), tempoAt(), TempoPoint, exportMidi(), noteEvents(), PEDAL_CC (+9 more)

### Community 171 - "Pieza"
Cohesion: 0.11
Nodes (7): Origen, Audio, Microfono, Midi, Teclado, Pieza, Piezas

### Community 174 - "muestras.mjs"
Cohesion: 0.26
Nodes (11): BATERIA, bateria(), CAPAS_BATERIA, convertir(), cuerdas(), DESTINO, leerSfz(), nombreNota() (+3 more)

### Community 175 - ".asignar"
Cohesion: 0.21
Nodes (6): Bateria, Forma, Guitarra, Pieza, Posicion, InstrumentosTest

### Community 177 - "visualizer.ts"
Cohesion: 0.14
Nodes (17): frameLayout(), COLOR_BAQUETA, installLabelFont(), makeBeamTexture(), makeCristalTexture(), makeEstelaTexture(), makeGlowTexture(), makeHaloTexture() (+9 more)

### Community 181 - "ColaPanel.kt"
Cohesion: 0.15
Nodes (21): AjustesPantalla(), ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), Avance(), Confirmar(), Encabezado() (+13 more)

### Community 193 - "instrumentos.ts"
Cohesion: 0.22
Nodes (12): Baqueta, baquetas(), PIES, PLATILLOS, carriles(), carrilesBateria(), carrilesCuerdas(), COLOR_CUERDA (+4 more)

### Community 195 - "Exportador.kt"
Cohesion: 0.09
Nodes (4): Limitador, Exportador, Paquete, SuperficieGl

### Community 196 - "NoteEvent"
Cohesion: 0.31
Nodes (5): IdFactory, NoteEvent, ImportOptions, Recorder, toMicro()

### Community 199 - "bateria.ts"
Cohesion: 0.31
Nodes (8): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda(), ritmo()

### Community 205 - "DetectorBateria"
Cohesion: 0.42
Nodes (3): Bandas, DetectorBateria, Golpe

### Community 208 - "Instrument"
Cohesion: 0.08
Nodes (30): PiezaWeb, 2026-11-16 · Fase 0 · Cimientos, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, Strikeable, KEYBOARD_61, NoteInput, sortNotes(), takeEnd() (+22 more)

### Community 214 - "MainActivity.kt"
Cohesion: 0.07
Nodes (14): Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono (+6 more)

### Community 216 - "avance.ts"
Cohesion: 0.29
Nodes (4): AvanceSuave, fraseDeEspera(), FRASES, textoRestante()

## Knowledge Gaps
- **64 isolated node(s):** `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json`, `Presentacion`, `Partitura` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1049 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **50 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plantilla` connect `Transport` to `Instrument`, `LivePlayer`, `practice/src/index.ts`, `Muestras`?**
  _High betweenness centrality (0.254) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06641604010025062 - nodes in this community are weakly interconnected._
- **Why does `2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería` connect `Muestras` to `Nota`, `Transport`?**
  _High betweenness centrality (0.180) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `2026-11-16 · Fase 0 · Cimientos` connect `Instrument` to `transcribe/src/index.ts`, `import.ts`, `Transport`, `createNoteEvent`?**
  _High betweenness centrality (0.161) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06538461538461539 - nodes in this community are weakly interconnected._