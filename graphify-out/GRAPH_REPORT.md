# Graph Report - impromptu  (2026-11-17)

## Corpus Check
- 193 files · ~87,114 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 33 file(s) not represented in the graph (top: .css 30, (none) 3)

## Summary
- 1576 nodes · 3394 edges · 104 communities (77 shown, 27 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4ca59e67`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/src/index.ts
- transcribeStore.ts
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
- export/package.json
- media/package.json
- midi/package.json
- render/package.json
- PedalEvent
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
- visualizer.ts
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
- piano.ts
- ExportDialog.tsx
- align.ts
- createNoteEvent
- transcribe/package.json
- transcribe/README.md
- LiveSession
- VideoSection.tsx
- import.test.ts
- Estudio.tsx
- core/package.json
- ExportDialog.tsx
- studio/live.ts
- notation/package.json
- devDependencies
- AudioEngine
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- LivePlayer
- Flujos principales
- core/src/index.ts
- ref_vitest
- Celular.tsx
- import.ts
- Transport
- Take
- NoteEvent
- model.test.ts
- vite.config.ts
- Timeline.tsx
- web/package.json
- Piano
- scripts
- eslint.config.js
- transcribe/tsconfig.json
- @playwright/test
- @impromptu/media@workspace:*
- notation/tsconfig.json
- vite.config.ts
- @impromptu/core@workspace:*
- @impromptu/export@workspace:*
- @impromptu/notation@workspace:*
- @impromptu/practice@workspace:*

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 41 edges
2. `Visualizer` - 38 edges
3. `NoteEvent` - 37 edges
4. `Take` - 37 edges
5. `useStudio` - 34 edges
6. `createNoteEvent()` - 34 edges
7. `Button()` - 33 edges
8. `catalog` - 27 edges
9. `createTrack()` - 25 edges
10. `createTake()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createNoteEvent()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createTrack()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (104 total, 27 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.10
Nodes (18): PanelSustain(), SettingsPanel(), ButtonProps, IconButton(), IconButtonProps, ChipOption, Chips(), ChipsProps (+10 more)

### Community 1 - "transcribeStore.ts"
Cohesion: 0.06
Nodes (62): LiveListener, resample(), mb(), Model, nextAudioName(), PIANO_MODEL_URL, Store, TranscribeState (+54 more)

### Community 2 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @impromptu/midi@workspace:*, @impromptu/transcribe@workspace:*, @impromptu/ui@workspace:*, lucide-react@catalog:, opensheetmusicdisplay@2.2.1, react@catalog:, react-dom@catalog: (+7 more)

### Community 3 - "package.json"
Cohesion: 0.13
Nodes (18): description, devDependencies, eslint@catalog:, prettier@catalog:, turbo@catalog:, @types/node@catalog:, typescript@catalog:, engines (+10 more)

### Community 4 - "ui/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @fontsource/archivo@catalog:, @fontsource/martian-mono@catalog:, description, devDependencies, react@catalog:, @types/react@catalog:, typescript@catalog: (+17 more)

### Community 5 - "catalog"
Cohesion: 0.06
Nodes (33): allowBuilds, core-js, gl, protobufjs, catalog, eslint, @eslint/js, eslint-plugin-react-hooks (+25 more)

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
Cohesion: 0.18
Nodes (11): Fase 0 — Cimientos, Fase 1 — Visualizador desde un MIDI, Fase 2 — Teclado en vivo, pedales y modo en vivo, Fase 3 — Cámara, plantillas y exportar (v0.1), Fase 4 — Manos y dedos, Fase 5 — Audio o micrófono a notas, Fase 6 — Partitura, Fase 7 — Tutoriales y práctica (+3 more)

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
Cohesion: 0.11
Nodes (20): dependencies, @impromptu/core@workspace:*, midi-file@catalog:, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+12 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 18 - "PedalEvent"
Cohesion: 0.42
Nodes (7): 2026-11-16 · Fase 0 · Cimientos, PedalEvent, isPedalDown(), PEDAL_CC, pedalKindFromCC(), pedalValueAt(), RawTrack

### Community 19 - "notation/src/index.ts"
Cohesion: 0.05
Nodes (61): download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, midiFileName(), saveMidi(), ADR-001 · Web primero, una sola base de código (+53 more)

### Community 20 - "fingering.ts"
Cohesion: 0.06
Nodes (54): ColorField(), Props, autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes() (+46 more)

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

### Community 30 - "visualizer.ts"
Cohesion: 0.05
Nodes (61): HeroVisualizer(), CameraState, CameraVideo, ADR-0006, KeyboardCalibration, calibratedKeyboard(), calibratedKeyLine(), coverRect() (+53 more)

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "ref_react"
Cohesion: 0.07
Nodes (36): MAMUT_HERD, MamutHerdSello(), PROPORCION, useReveal(), Acerca(), CREDITOS, COMING, delay() (+28 more)

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

### Community 54 - "piano.ts"
Cohesion: 0.15
Nodes (20): note(), ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), allSampleNames() (+12 more)

### Community 55 - "ExportDialog.tsx"
Cohesion: 0.21
Nodes (21): chooseFormat(), DecodedFrame, ExportError, ExportFailure, ExportOptions, ExportProgress, ExportResult, exportVideo() (+13 more)

### Community 56 - "align.ts"
Cohesion: 0.12
Nodes (23): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas), align(), alignAudioToNotes(), Alignment, alignNear() (+15 more)

### Community 57 - "createNoteEvent"
Cohesion: 0.26
Nodes (15): CHORDS, createDemoPiece(), MELODY, piece(), createDemoTake(), createNoteEvent(), createTake(), createTrack() (+7 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, typescript@catalog: (+17 more)

### Community 62 - "LiveSession"
Cohesion: 0.10
Nodes (16): liveNow(), LiveSession, KeyboardRange, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE (+8 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.13
Nodes (28): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, chunks, startCamera() (+20 more)

### Community 64 - "import.test.ts"
Cohesion: 0.16
Nodes (11): isInt(), isTime(), validateNoteEvent(), validatePedalEvent(), validateTake(), validateTrack(), E, fixtures (+3 more)

### Community 65 - "Estudio.tsx"
Cohesion: 0.11
Nodes (28): root, Celular(), EnVivo(), ASPECTS, Estudio(), ScoreTab, SPEEDS, TABS (+20 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "ExportDialog.tsx"
Cohesion: 0.14
Nodes (25): AudioState, AudioStatus, engine, useAudio, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT (+17 more)

### Community 68 - "studio/live.ts"
Cohesion: 0.18
Nodes (22): LiveState, MidiStatus, readRecordMic(), refreshTakes(), saveForTests(), SOURCE_ICON, SOURCE_TEXT, STATUS_TEXT (+14 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog: (+9 more)

### Community 71 - "AudioEngine"
Cohesion: 0.22
Nodes (3): AudioEngine, lowerBound(), LiveVoiceHandle

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

### Community 77 - "LivePlayer"
Cohesion: 0.20
Nodes (3): LivePlayer, Strikeable, PedalKind

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "core/src/index.ts"
Cohesion: 0.29
Nodes (8): exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), note(), Timed, toTrack()

### Community 81 - "ref_vitest"
Cohesion: 0.53
Nodes (4): countOutOfRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount()

### Community 82 - "Celular.tsx"
Cohesion: 0.10
Nodes (24): Grabar(), Tab, TABS, COLORES, Componentes(), Formato, FORMATOS, Muestra() (+16 more)

### Community 83 - "import.ts"
Cohesion: 0.26
Nodes (11): sortPedals(), importMidi(), MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack(), sameNotes(), tempoPoints() (+3 more)

### Community 84 - "Transport"
Cohesion: 0.12
Nodes (10): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd (+2 more)

### Community 85 - "Take"
Cohesion: 0.24
Nodes (10): describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, openLocalPiece(), openMidiFile(), prettyName(), Take (+2 more)

### Community 86 - "NoteEvent"
Cohesion: 0.27
Nodes (5): IdFactory, NoteEvent, ImportOptions, Recorder, toMicro()

### Community 87 - "model.test.ts"
Cohesion: 0.14
Nodes (15): ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, KEYBOARD_61, NoteInput, sortNotes(), takeEnd(), ADR-0003, WithCrypto, Beat (+7 more)

### Community 88 - "vite.config.ts"
Cohesion: 0.29
Nodes (3): brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 89 - "Timeline.tsx"
Cohesion: 0.27
Nodes (6): transport, Lane, lanesFor(), Timeline(), token(), formatTime()

### Community 90 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/audio@workspace:*, @impromptu/render@workspace:*, description, @impromptu/audio, @impromptu/render, name, private, type (+1 more)

### Community 92 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 93 - "eslint.config.js"
Cohesion: 0.22
Nodes (8): @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, typescript-eslint@catalog:, @eslint/js, eslint-plugin-react-hooks, globals, typescript-eslint

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

## Knowledge Gaps
- **25 isolated node(s):** `ADR-0008`, `ADR-0010`, `ADR-0013`, `ADR-0014`, `ADR-0015` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 613 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@playwright/test` connect `@playwright/test` to `vite.config.ts`, `package.json`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `ADR-0008`, `ADR-0010`, `ADR-0013` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1006006006006006 - nodes in this community are weakly interconnected._
- **Why does `NoteEvent` connect `NoteEvent` to `import.test.ts`, `studio/live.ts`, `core/src/index.ts`, `PedalEvent`, `import.ts`, `fingering.ts`, `Take`, `piano.ts`, `model.test.ts`, `align.ts`, `createNoteEvent`, `notation/src/index.ts`, `visualizer.ts`, `LiveSession`, `VideoSection.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `transcribeStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05647517039922103 - nodes in this community are weakly interconnected._
- **Why does `DECISIONES (ADRs)` connect `notation/src/index.ts` to `Piano`, `model.test.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._