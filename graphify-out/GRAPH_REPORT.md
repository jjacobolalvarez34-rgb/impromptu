# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 269 files · ~135,703 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .css 32, .xml 8, (none) 5)

## Summary
- 2656 nodes · 5846 edges · 183 communities (118 shown, 65 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 175 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `068391bb`
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
- Estudio.tsx
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
- ref_react
- audio/tsconfig.json
- core/tsconfig.json
- export/tsconfig.json
- media/tsconfig.json
- midi/tsconfig.json
- render/tsconfig.json
- .prettierrc.json
- .claude/CLAUDE.md
- Lo que queda (resumen al 2026-11-17)
- audio/README.md
- export/README.md
- media/README.md
- midi/README.md
- render/README.md
- desktop/README.md
- LivePanel.tsx
- piano.ts
- align.ts
- transcribe/package.json
- transcribe/README.md
- musicxml.ts
- VideoSection.tsx
- MainActivity.kt
- Celular.tsx
- core/package.json
- desktop/package.json
- Theme.kt
- notation/package.json
- core/src/index.ts
- mobile/package.json
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- SettingsPanel.tsx
- Flujos principales
- EnVivo.tsx
- notation/src/index.ts
- main.cts
- import.ts
- Transport
- ScoreTab.tsx
- compilerOptions
- guitar.ts
- Sampler
- LiveSession
- export/src/export.ts
- Transkun.kt
- compilerOptions
- AvanceSuave
- transcribe/tsconfig.json
- fingering.ts
- Motor
- notation/tsconfig.json
- dev.mjs
- Impromptu.kt
- DECISIONES (ADRs)
- Visualizer
- GrabadoraMic
- vitest
- createNoteEvent
- ServicioTrabajos.kt
- audio/src/index.ts
- render/src/index.ts
- edit.ts
- instrumentos.ts
- Tecla
- Pedal
- mobile/tsconfig.json
- scene.test.ts
- AudioEngine
- store.ts
- transkun/worker.ts
- Exportador.kt
- InicioPantalla.kt
- LivePlayer
- Renderizador.kt
- Icono
- TipoPedal
- object@L130
- WaitMode
- Conversiones
- practice/src/index.ts
- scripts
- visualizer.ts
- LiveListener
- web/vite.config.ts
- CopiarModelos
- .renderFrame
- @playwright/test
- Take
- Decodificar.kt
- .transcribeComoPython
- Impromptu
- Impromptu.kt
- .iniciar
- ExportarPantalla.kt
- src/worker.ts
- keyboard-layout.ts
- practice.test.ts
- bateria.ts
- Etapa
- .shouldInterceptRequest
- AvanceSuave

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 43 edges
2. `useStudio` - 41 edges
3. `createNoteEvent()` - 39 edges
4. `Visualizer` - 38 edges
5. `react` - 35 edges
6. `vitest` - 32 edges
7. `NoteEvent` - 32 edges
8. `Transkun` - 27 edges
9. `Button()` - 27 edges
10. `catalog` - 27 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande` --references--> `WaitMode`  [INFERRED]
  docs/DECISIONES.md → packages/practice/src/wait.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts

## Import Cycles
- None detected.

## Communities (183 total, 65 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (27): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+19 more)

### Community 1 - "transcribe/src/index.ts"
Cohesion: 0.16
Nodes (22): RawNote, DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), peakLevel(), prepareTranscriber(), queue (+14 more)

### Community 2 - "web/package.json"
Cohesion: 0.07
Nodes (37): dependencies, @impromptu/export@workspace:*, @impromptu/media@workspace:*, @impromptu/midi@workspace:*, @impromptu/practice@workspace:*, @impromptu/render@workspace:*, @impromptu/transcribe@workspace:*, @impromptu/ui@workspace:* (+29 more)

### Community 3 - "package.json"
Cohesion: 0.11
Nodes (23): description, devDependencies, eslint@catalog:, @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, prettier@catalog:, turbo@catalog: (+15 more)

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

### Community 19 - "Estudio.tsx"
Cohesion: 0.10
Nodes (26): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window (+18 more)

### Community 20 - "transcribeStore.ts"
Cohesion: 0.10
Nodes (13): avances, Conversion, mb(), Model, nextAudioName(), pendientes, PIANO_MODEL_URL, Store (+5 more)

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
Cohesion: 0.13
Nodes (5): Control, EventoMidi, Off, On, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "ref_react"
Cohesion: 0.08
Nodes (28): MAMUT_HERD, MamutHerdSello(), PROPORCION, HeroVisualizer(), useReveal(), root, Acerca(), CREDITOS (+20 more)

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

### Community 41 - "Lo que queda (resumen al 2026-11-17)"
Cohesion: 0.20
Nodes (9): App de Android NATIVA (decidido por Jacobo, 2026-11-17; construida el 2026-11-18, ADR-019, sin verificar en un celular), Decisiones de Jacobo abiertas, Lo que dijo Jacobo al probar la app nativa (2026-11-18), Lo que queda (resumen al 2026-11-17), Para que pruebe Jacobo, Para subir a Hugging Face (P15 y P21), Pedidos de Jacobo después de probar las apps (2026-11-17), PENDIENTES — decisiones e insumos de Jacobo (+1 more)

### Community 54 - "LivePanel.tsx"
Cohesion: 0.12
Nodes (31): stopCameraRecording(), LiveState, MidiStatus, refreshTakes(), METER_OPTIONS, saveForTests(), SOURCE_ICON, SOURCE_TEXT (+23 more)

### Community 55 - "piano.ts"
Cohesion: 0.12
Nodes (17): ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`, note(), ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, Piano, PianoOptions (+9 more)

### Community 56 - "align.ts"
Cohesion: 0.11
Nodes (26): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas), align() (+18 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.08
Nodes (27): @impromptu/core@workspace:*, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0 (+19 more)

### Community 62 - "musicxml.ts"
Cohesion: 0.18
Nodes (15): piezaDeNota(), Instrument, spell(), ALTERADAS, bateriaXml(), documento(), esc(), Escritura (+7 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.12
Nodes (29): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+21 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.05
Nodes (20): formatoTiempo(), Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity (+12 more)

### Community 65 - "Celular.tsx"
Cohesion: 0.08
Nodes (28): lockOrientation(), Ajustes(), Girar(), Grabando(), Inicio(), Miniatura(), Mode, MODES (+20 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.05
Nodes (38): build, appId, copyright, directories, extraResources, files, nsis, productName (+30 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "core/src/index.ts"
Cohesion: 0.24
Nodes (13): KeyboardRange, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE, profileFor(), PROFILES (+5 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.09
Nodes (24): description, devDependencies, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, vite@catalog:, name (+16 more)

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
Cohesion: 0.16
Nodes (13): useAudio, ColorField(), Props, BACKGROUNDS, HAND_SIZES, KEYBOARDS, LAYOUTS, NOTE_STYLES (+5 more)

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "EnVivo.tsx"
Cohesion: 0.19
Nodes (11): BackgroundChoice, BACKGROUNDS, EnVivo(), TO_BACKGROUND, live, Aspect, syncVideo(), Props (+3 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.10
Nodes (38): beatGrid(), correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key, MAJOR, MAJOR_FIFTHS (+30 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), inside(), ISOLATION, menu(), send(), serve(), ADR-0018

### Community 83 - "import.ts"
Cohesion: 0.06
Nodes (29): midi-file@catalog:, exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), note(), Timed (+21 more)

### Community 84 - "Transport"
Cohesion: 0.10
Nodes (14): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd (+6 more)

### Community 85 - "ScoreTab.tsx"
Cohesion: 0.07
Nodes (25): aTake(), baseMs, cuadro(), mostrar(), PiezaWeb, Puente, opensheetmusicdisplay@2.2.1, download() (+17 more)

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "guitar.ts"
Cohesion: 0.15
Nodes (15): HIHAT_ABIERTO, PiezaBateria, PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar(), asignarTrastes() (+7 more)

### Community 88 - "Sampler"
Cohesion: 0.27
Nodes (3): Salamander, Sampler, Voz

### Community 89 - "LiveSession"
Cohesion: 0.14
Nodes (3): liveNow(), LiveSession, WebMidiInput

### Community 90 - "export/src/export.ts"
Cohesion: 0.19
Nodes (23): chooseFormat(), DecodedFrame, ExportError, ExportFailure, ExportOptions, ExportProgress, ExportResult, exportVideo() (+15 more)

### Community 91 - "Transkun.kt"
Cohesion: 0.14
Nodes (6): Cancelada, Constantes, Decodificacion, Espectro, Evento, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "AvanceSuave"
Cohesion: 0.24
Nodes (6): FilaConversion(), avanceVisible(), AvanceSuave, fraseDeEspera(), FRASES, textoRestante()

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "fingering.ts"
Cohesion: 0.24
Nodes (12): ADR-0012, chordOptions(), FINGERS, isBlack(), linkCost(), ownCost(), placementCost(), SIZE_SCALE (+4 more)

### Community 97 - "Motor"
Cohesion: 0.08
Nodes (10): E, Motor, Secuencia, Bajando, Estado, Fallo, Instalacion, Lista (+2 more)

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.12
Nodes (11): electron, require, desktopEnv, inherited, installer, r, require, androidEnv (+3 more)

### Community 100 - "Impromptu.kt"
Cohesion: 0.14
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (18): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-010 · Estilo y brillo de las notas en `VisualProject.effects` (+10 more)

### Community 102 - "Visualizer"
Cohesion: 0.16
Nodes (5): Carriles, noteColor(), VisualSettings, hexToNumber(), Visualizer

### Community 104 - "vitest"
Cohesion: 0.21
Nodes (6): Strikeable, countOutOfRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount(), vitest

### Community 105 - "createNoteEvent"
Cohesion: 0.13
Nodes (25): CHORDS, createDemoPiece(), MELODY, piece(), createDemoTake(), describeWarning(), LOCAL_PIECES, localPieces (+17 more)

### Community 107 - "audio/src/index.ts"
Cohesion: 0.13
Nodes (14): Activa, cuerda(), golpe(), pasoAlto(), pasoBajo(), ruido(), Sintes, Timbre (+6 more)

### Community 108 - "render/src/index.ts"
Cohesion: 0.19
Nodes (11): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, DEFAULT_THEME, getTheme(), Theme (+3 more)

### Community 109 - "edit.ts"
Cohesion: 0.26
Nodes (14): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+6 more)

### Community 110 - "instrumentos.ts"
Cohesion: 0.15
Nodes (9): carriles(), carrilesBateria(), carrilesCuerdas(), COLOR_CUERDA, COLOR_PIEZA, instrumentoDe(), teclas(), KeyRect (+1 more)

### Community 111 - "Tecla"
Cohesion: 0.11
Nodes (28): AjustesPantalla(), ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), Avance(), Confirmar(), Encabezado() (+20 more)

### Community 112 - "Pedal"
Cohesion: 0.12
Nodes (11): Nota, Origen, Audio, Microfono, Midi, Teclado, Pedal, Pieza (+3 more)

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "scene.test.ts"
Cohesion: 0.15
Nodes (17): BLACK_LENGTH, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, lowerBound(), pedalLevels(), Rect (+9 more)

### Community 115 - "AudioEngine"
Cohesion: 0.19
Nodes (4): AudioEngine, lowerBound(), LiveVoiceHandle, takeVoices()

### Community 116 - "store.ts"
Cohesion: 0.06
Nodes (41): Pieza(), AudioState, AudioStatus, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, ASPECTS (+33 more)

### Community 117 - "transkun/worker.ts"
Cohesion: 0.18
Nodes (21): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+13 more)

### Community 118 - "Exportador.kt"
Cohesion: 0.14
Nodes (4): Banco, Limitador, Exportador, Paquete

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.07
Nodes (7): Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), PuntoRec()

### Community 121 - "Renderizador.kt"
Cohesion: 0.19
Nodes (3): esNegra(), Opciones, Renderizador

### Community 122 - "Icono"
Cohesion: 0.10
Nodes (3): BotonIcono(), Icono(), Iconos

### Community 123 - "TipoPedal"
Cohesion: 0.15
Nodes (6): TipoPedal, Sostenuto, Sustain, UnaCorda, Formato, Smf

### Community 125 - "WaitMode"
Cohesion: 0.22
Nodes (3): 2026-11-17 · Fase 7 · Tutoriales y práctica, ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, WaitMode

### Community 126 - "Conversiones"
Cohesion: 0.21
Nodes (3): Conversiones, Terminada, TrabajoConversion

### Community 127 - "practice/src/index.ts"
Cohesion: 0.24
Nodes (10): PracticeState, rebuild(), Hand, FingeringOptions, avg(), HandOptions, separateHands(), PracticeChord (+2 more)

### Community 128 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 129 - "visualizer.ts"
Cohesion: 0.18
Nodes (9): ADR-0010, frameLayout(), installLabelFont(), makeBeamTexture(), makeGlowTexture(), makeHaloTexture(), makeNoteTexture(), NOTE_NAMES (+1 more)

### Community 130 - "LiveListener"
Cohesion: 0.36
Nodes (3): LiveListener, resample(), MODEL_RATE

### Community 131 - "web/vite.config.ts"
Cohesion: 0.15
Nodes (7): vite@catalog:, brandDir, isolation, vite, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 133 - ".renderFrame"
Cohesion: 0.20
Nodes (7): KeyboardLayout, isSounding(), noteRect(), labelFor(), lighten(), luminance(), Pool

### Community 168 - "Take"
Cohesion: 0.10
Nodes (30): ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, Beat, Finger, MediaRef (+22 more)

### Community 169 - "Decodificar.kt"
Cohesion: 0.22
Nodes (3): Decodificar, Floats, Pcm

### Community 173 - ".iniciar"
Cohesion: 0.22
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 174 - "ExportarPantalla.kt"
Cohesion: 0.16
Nodes (9): ExportarPantalla(), Formato, Cuadrado, Horizontal, Vertical, par(), VistaPrevia(), compartirArchivo() (+1 more)

### Community 176 - "src/worker.ts"
Cohesion: 0.43
Nodes (5): post(), prepare(), run(), WorkerMessage, WorkerRequest

### Community 177 - "keyboard-layout.ts"
Cohesion: 0.50
Nodes (6): BLACK, BLACK_OFFSET, BLACK_WIDTH, isBlack(), layoutKeyboard(), normalizeRange()

### Community 178 - "practice.test.ts"
Cohesion: 0.50
Nodes (3): fixtures, melody(), note()

### Community 179 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 180 - "Etapa"
Cohesion: 0.29
Nodes (6): Etapa, Armando, Escuchando, Esperando, Leyendo, Preparando

## Knowledge Gaps
- **53 isolated node(s):** `ADR-0004`, `ADR-0004`, `ADR-0010`, `Ia`, `Quieta` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 999 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **65 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BUG-004 · Celular: la app se cierra al convertir una grabación` connect `align.ts` to `.transcribeComoPython`?**
  _High betweenness centrality (0.280) - this node is a cross-community bridge._
- **What connects `ADR-0004`, `ADR-0004`, `ADR-0010` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07585568917668825 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06970128022759602 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `ui/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Should `catalog` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._