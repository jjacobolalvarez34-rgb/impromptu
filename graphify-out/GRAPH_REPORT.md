# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 248 files · ~119,497 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 49 file(s) not represented in the graph (top: .css 32, .xml 7, (none) 4)

## Summary
- 2391 nodes · 5270 edges · 165 communities (113 shown, 52 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 119 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `edc14782`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/src/index.ts
- transcribe/src/index.ts
- web/package.json
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
- export/package.json
- media/package.json
- midi/package.json
- render/package.json
- LogoIntro.tsx
- notation/src/index.ts
- fingering.ts
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
- ref_react
- audio/tsconfig.json
- core/tsconfig.json
- export/tsconfig.json
- media/tsconfig.json
- midi/tsconfig.json
- render/tsconfig.json
- .prettierrc.json
- .claude/CLAUDE.md
- PENDIENTES.md
- audio/README.md
- export/README.md
- media/README.md
- midi/README.md
- render/README.md
- desktop/README.md
- ExportarPantalla.kt
- LivePanel.tsx
- ExportDialog.tsx
- align.ts
- NoteEvent
- transcribe/package.json
- transcribe/README.md
- LiveSession
- VideoSection.tsx
- MainActivity.kt
- studio/live.ts
- core/package.json
- desktop/package.json
- desktop.ts
- notation/package.json
- Transkun.kt
- mobile/package.json
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- SettingsPanel.tsx
- Flujos principales
- core/src/index.ts
- build
- main.cts
- import.ts
- Transport
- Take
- compilerOptions
- meter.ts
- vite.config.ts
- ownAudio.ts
- PiezaPantalla.kt
- Transkun.kt
- compilerOptions
- render/src/index.ts
- transcribe/tsconfig.json
- keyboard-layout.ts
- Motor
- notation/tsconfig.json
- dev.mjs
- Impromptu.kt
- DECISIONES (ADRs)
- scripts
- transcribeStore.ts
- Estudio.tsx
- core/src/index.ts
- .iniciar
- MicrofonoPantalla.kt
- piano.ts
- Estado
- ref_node_fs
- Components.kt
- Pedal
- mobile/tsconfig.json
- midi/src/index.ts
- scene.test.ts
- .convertir
- transkun/worker.ts
- Sampler.kt
- InicioPantalla.kt
- edit.ts
- Visualizer
- Icono
- AudioEngine
- scripts
- visualizer.ts
- HeroVisualizer.tsx
- .shouldInterceptRequest
- LivePlayer
- Piano
- Impromptu
- .renderFrame
- CopiarModelos
- transkun/transcribe.ts
- Formato
- src/worker.ts
- object@L133
- LiveListener

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 43 edges
2. `Button()` - 40 edges
3. `useStudio` - 39 edges
4. `Visualizer` - 38 edges
5. `NoteEvent` - 38 edges
6. `Take` - 38 edges
7. `createNoteEvent()` - 36 edges
8. `react` - 34 edges
9. `Impromptu` - 27 edges
10. `catalog` - 27 edges

## Surprising Connections (you probably didn't know these)
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `WaitMode`  [INFERRED]
  docs/BITACORA.md → packages/practice/src/wait.ts
- `ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande` --references--> `WaitMode`  [INFERRED]
  docs/DECISIONES.md → packages/practice/src/wait.ts

## Import Cycles
- None detected.

## Communities (165 total, 52 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (25): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+17 more)

### Community 1 - "transcribe/src/index.ts"
Cohesion: 0.23
Nodes (17): RawNote, DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), MODEL_RATE, peakLevel(), prepareTranscriber() (+9 more)

### Community 2 - "web/package.json"
Cohesion: 0.09
Nodes (28): dependencies, @impromptu/audio@workspace:*, @impromptu/export@workspace:*, @impromptu/media@workspace:*, @impromptu/midi@workspace:*, @impromptu/practice@workspace:*, @impromptu/render@workspace:*, @impromptu/transcribe@workspace:* (+20 more)

### Community 3 - "package.json"
Cohesion: 0.06
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
Cohesion: 0.17
Nodes (12): Fase 0 — Cimientos, Fase 10 — Editor de partitura y video de la partitura (pedido de Jacobo, 2026-11-17), Fase 1 — Visualizador desde un MIDI, Fase 2 — Teclado en vivo, pedales y modo en vivo, Fase 3 — Cámara, plantillas y exportar (v0.1), Fase 4 — Manos y dedos, Fase 5 — Audio o micrófono a notas, Fase 6 — Partitura (+4 more)

### Community 13 - "audio/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 14 - "export/package.json"
Cohesion: 0.11
Nodes (23): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+15 more)

### Community 15 - "media/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 16 - "midi/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 18 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

### Community 19 - "notation/src/index.ts"
Cohesion: 0.06
Nodes (46): aTake(), mostrar(), PiezaWeb, Puente, ADR-0019, correlation(), estimateKey(), FLAT_ALTER (+38 more)

### Community 20 - "fingering.ts"
Cohesion: 0.09
Nodes (26): PracticeState, rebuild(), ADR-0012, ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, chordOptions(), FingeringOptions, FINGERS, isBlack() (+18 more)

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
Cohesion: 0.13
Nodes (5): Control, EventoMidi, Off, On, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "ref_react"
Cohesion: 0.10
Nodes (25): MAMUT_HERD, MamutHerdSello(), PROPORCION, useReveal(), root, Acerca(), CREDITOS, Inicio() (+17 more)

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

### Community 48 - "ExportarPantalla.kt"
Cohesion: 0.08
Nodes (4): par(), notasCayendo(), PresentacionPantalla(), Punto()

### Community 54 - "LivePanel.tsx"
Cohesion: 0.13
Nodes (27): LiveState, refreshTakes(), KeyboardSection(), METER_OPTIONS, MetronomeControls(), saveForTests(), SOURCE_ICON, SOURCE_TEXT (+19 more)

### Community 55 - "ExportDialog.tsx"
Cohesion: 0.19
Nodes (24): chooseFormat(), DecodedFrame, ExportError, ExportFailure, ExportOptions, ExportProgress, ExportResult, exportVideo() (+16 more)

### Community 56 - "align.ts"
Cohesion: 0.12
Nodes (23): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas), align(), alignAudioToNotes(), Alignment, alignNear() (+15 more)

### Community 57 - "NoteEvent"
Cohesion: 0.12
Nodes (26): 2026-11-16 · Fase 0 · Cimientos, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, Finger, Instrument (+18 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, typescript@catalog: (+17 more)

### Community 62 - "LiveSession"
Cohesion: 0.10
Nodes (9): startCameraRecording(), stopCameraRecording(), liveNow(), LiveSession, click(), Clicker, LiveEvent, WebMidiError (+1 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.09
Nodes (34): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, chunks, startCamera() (+26 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.06
Nodes (23): Ajustes, App(), Convirtiendo, Exportar, Grabar, importarMidi(), Inicio, MainActivity (+15 more)

### Community 65 - "studio/live.ts"
Cohesion: 0.08
Nodes (34): BackgroundChoice, BACKGROUNDS, EnVivo(), TO_BACKGROUND, ASPECTS, SPEEDS, TABS, AudioState (+26 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+7 more)

### Community 68 - "desktop.ts"
Cohesion: 0.22
Nodes (7): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, requestConvertAudio(), ADR-0018, Window

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

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

### Community 77 - "SettingsPanel.tsx"
Cohesion: 0.15
Nodes (12): useAudio, ColorField(), Props, BACKGROUNDS, HAND_SIZES, KEYBOARDS, LAYOUTS, NOTE_STYLES (+4 more)

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "core/src/index.ts"
Cohesion: 0.26
Nodes (9): midiFileName(), saveMidi(), exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), Timed (+1 more)

### Community 81 - "build"
Cohesion: 0.12
Nodes (17): build, appId, copyright, directories, extraResources, files, nsis, productName (+9 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), ADR-0018, inside(), ISOLATION, menu(), send(), serve()

### Community 83 - "import.ts"
Cohesion: 0.12
Nodes (17): sortPedals(), midi-file@catalog:, importMidi(), MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack(), sameNotes() (+9 more)

### Community 84 - "Transport"
Cohesion: 0.11
Nodes (11): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd (+3 more)

### Community 85 - "Take"
Cohesion: 0.28
Nodes (8): describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName(), Take, ImportResult, ImportWarning

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "meter.ts"
Cohesion: 0.33
Nodes (6): Beat, beatAt(), beatGrid(), tempoAt(), Seconds, indexNotes()

### Community 88 - "vite.config.ts"
Cohesion: 0.13
Nodes (12): devDependencies, @types/react@catalog:, @types/react-dom@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog:, brandDir, isolation (+4 more)

### Community 89 - "ownAudio.ts"
Cohesion: 0.18
Nodes (19): AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, analyzeAudio(), attachTakeAudio(), audioOffset(), OwnAudio (+11 more)

### Community 90 - "PiezaPantalla.kt"
Cohesion: 0.16
Nodes (4): formatoTiempo(), BarraTiempo(), Lienzo(), PiezaPantalla()

### Community 91 - "Transkun.kt"
Cohesion: 0.13
Nodes (6): Cancelada, Constantes, Decodificacion, Espectro, Evento, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "render/src/index.ts"
Cohesion: 0.22
Nodes (11): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, KeyRect, DEFAULT_THEME, getTheme() (+3 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "keyboard-layout.ts"
Cohesion: 0.42
Nodes (6): BLACK, BLACK_OFFSET, BLACK_WIDTH, isBlack(), layoutKeyboard(), normalizeRange()

### Community 97 - "Motor"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 100 - "Impromptu.kt"
Cohesion: 0.11
Nodes (6): Salamander, Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (18): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano` (+10 more)

### Community 102 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 103 - "transcribeStore.ts"
Cohesion: 0.16
Nodes (13): LevelMeter(), MODELS, mb(), micStream(), Model, nextAudioName(), PIANO_MODEL_URL, Store (+5 more)

### Community 104 - "Estudio.tsx"
Cohesion: 0.11
Nodes (38): onMenuAction(), lockOrientation(), Ajustes(), Celular(), Girar(), Grabando(), Inicio(), Miniatura() (+30 more)

### Community 105 - "core/src/index.ts"
Cohesion: 0.11
Nodes (25): CHORDS, MELODY, ids(), piece(), createDemoTake(), note(), createNoteEvent(), createTake() (+17 more)

### Community 106 - ".iniciar"
Cohesion: 0.20
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 107 - "MicrofonoPantalla.kt"
Cohesion: 0.08
Nodes (5): GrabadoraMic, Medidor(), MicrofonoPantalla(), C3, Tipos

### Community 108 - "piano.ts"
Cohesion: 0.23
Nodes (11): ActiveVoice, MAX_VOICES, allSampleNames(), DEFAULT_LAYERS, DEFAULT_SAMPLE_BASE, layerFor(), layerGain(), NAMES (+3 more)

### Community 109 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 110 - "ref_node_fs"
Cohesion: 0.16
Nodes (7): androidEnv, r, r, { version }, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 111 - "Components.kt"
Cohesion: 0.20
Nodes (9): GrabarPantalla(), Cabeza(), PaquetesPantalla(), Etiqueta(), Interruptor(), Lcd(), Logo(), PuntoRec() (+1 more)

### Community 112 - "Pedal"
Cohesion: 0.06
Nodes (20): esNegra(), Nota, Origen, Audio, Microfono, Midi, Teclado, Pedal (+12 more)

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "midi/src/index.ts"
Cohesion: 0.17
Nodes (14): IdFactory, KeyboardRange, ImportOptions, applyCurve(), normalizeMessage(), DeviceProfile, GENERIC_PROFILE, profileFor() (+6 more)

### Community 115 - "scene.test.ts"
Cohesion: 0.14
Nodes (18): BLACK_LENGTH, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, isSounding(), lowerBound(), NoteIndex (+10 more)

### Community 116 - ".convertir"
Cohesion: 0.13
Nodes (3): Decodificar, Floats, Pcm

### Community 117 - "transkun/worker.ts"
Cohesion: 0.20
Nodes (19): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+11 more)

### Community 118 - "Sampler.kt"
Cohesion: 0.18
Nodes (6): Banco, Limitador, Sampler, Voz, Exportador, Paquete

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.09
Nodes (12): Avance(), BotonIcono(), Confirmar(), Panel(), PedirTexto(), Accion(), AvisoConversion(), EstadoTeclado() (+4 more)

### Community 120 - "edit.ts"
Cohesion: 0.28
Nodes (13): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+5 more)

### Community 121 - "Visualizer"
Cohesion: 0.16
Nodes (6): CameraState, CameraVideo, 2026-11-17 · Fase 7 · Tutoriales y práctica, KeyboardCalibration, frameLayout(), Visualizer

### Community 123 - "AudioEngine"
Cohesion: 0.18
Nodes (4): AudioEngine, lowerBound(), LiveVoiceHandle, Hand

### Community 124 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, apk, apk:firmado, partitura, pruebas, typecheck

### Community 125 - "visualizer.ts"
Cohesion: 0.29
Nodes (8): installLabelFont(), makeBeamTexture(), makeGlowTexture(), makeHaloTexture(), makeNoteTexture(), NOTE_NAMES, ADR-0004, ADR-0010

### Community 126 - "HeroVisualizer.tsx"
Cohesion: 0.40
Nodes (3): createDemoPiece(), HeroVisualizer(), DEFAULT_SETTINGS

### Community 128 - "LivePlayer"
Cohesion: 0.14
Nodes (12): LivePlayer, Strikeable, LoadProgress, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), pedalDownRanges(), rangeAt() (+4 more)

### Community 130 - "Impromptu"
Cohesion: 0.08
Nodes (9): Piezas, Conversion, Escuchando, Fallo, Impromptu, Inactiva, Leyendo, Lista (+1 more)

### Community 131 - ".renderFrame"
Cohesion: 0.16
Nodes (8): KeyboardLayout, noteColor(), noteRect(), hexToNumber(), labelFor(), lighten(), luminance(), Pool

### Community 133 - "transkun/transcribe.ts"
Cohesion: 0.22
Nodes (9): TranscriptionCancelled, PEDAL_OF, takeFromTranskun(), toRate(), transcribeTranskun(), TRANSKUN_RATE, TranskunStage, TranskunMessage (+1 more)

### Community 134 - "Formato"
Cohesion: 0.50
Nodes (4): Formato, Cuadrado, Horizontal, Vertical

### Community 135 - "src/worker.ts"
Cohesion: 0.43
Nodes (5): post(), prepare(), run(), WorkerMessage, WorkerRequest

## Knowledge Gaps
- **50 isolated node(s):** `Inactiva`, `Preparando`, `Quieta`, `Horizontal`, `Vertical` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 911 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@playwright/test` connect `package.json` to `ref_node_fs`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `Inactiva`, `Preparando`, `Quieta` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08383838383838384 - nodes in this community are weakly interconnected._
- **Why does `Take` connect `Take` to `transkun/transcribe.ts`, `notation/src/index.ts`, `LivePanel.tsx`, `ExportDialog.tsx`, `NoteEvent`, `LiveSession`, `VideoSection.tsx`, `studio/live.ts`, `core/src/index.ts`, `import.ts`, `meter.ts`, `ownAudio.ts`, `keyboard-layout.ts`, `transcribeStore.ts`, `core/src/index.ts`, `piano.ts`, `midi/src/index.ts`, `edit.ts`, `AudioEngine`, `visualizer.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09113300492610837 - nodes in this community are weakly interconnected._
- **Why does `NoteEvent` connect `NoteEvent` to `LivePlayer`, `studio/live.ts`, `core/src/index.ts`, `core/src/index.ts`, `midi/src/index.ts`, `import.ts`, `notation/src/index.ts`, `Take`, `fingering.ts`, `scene.test.ts`, `edit.ts`, `keyboard-layout.ts`, `align.ts`, `visualizer.ts`, `LiveSession`, `VideoSection.tsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05603864734299517 - nodes in this community are weakly interconnected._