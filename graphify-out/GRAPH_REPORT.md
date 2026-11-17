# Graph Report - impromptu  (2026-11-17)

## Corpus Check
- 181 files · ~77,236 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 32 file(s) not represented in the graph (top: .css 29, (none) 3)

## Summary
- 1465 nodes · 3109 edges · 105 communities (79 shown, 26 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `de4a404f`
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
- LivePlayer
- DECISIONES (ADRs)
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
- ExportDialog.tsx
- ownAudio.ts
- align.ts
- LiveSession
- transcribe/package.json
- transcribe/README.md
- midi/src/index.ts
- VideoSection.tsx
- import.ts
- Celular.tsx
- core/package.json
- SettingsPanel.tsx
- Piano
- Estudio.tsx
- devDependencies
- LogoIntro.tsx
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- AudioEngine
- Flujos principales
- core/src/index.ts
- createNoteEvent
- store.ts
- keyboard.ts
- Transport
- piano.ts
- video.ts
- NoteEvent
- vite.config.ts
- LivePanel.tsx
- web/package.json
- Componentes.tsx
- scripts
- eslint.config.js
- transcribe/tsconfig.json
- @playwright/test
- @impromptu/media@workspace:*
- @impromptu/render@workspace:*
- BUGS — trampas conocidas y registro
- Take
- @impromptu/export@workspace:*
- react-dom
- @types/react-dom@catalog:
- engines

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 40 edges
2. `Visualizer` - 38 edges
3. `Take` - 34 edges
4. `useStudio` - 32 edges
5. `NoteEvent` - 32 edges
6. `Button()` - 31 edges
7. `createNoteEvent()` - 29 edges
8. `catalog` - 27 edges
9. `AudioEngine` - 21 edges
10. `Piano` - 21 edges

## Surprising Connections (you probably didn't know these)
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `sortNotes()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (105 total, 26 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.09
Nodes (19): Intro(), ColorField(), Props, ButtonProps, IconButtonProps, ChipOption, ChipsProps, LcdProps (+11 more)

### Community 1 - "transcribeStore.ts"
Cohesion: 0.05
Nodes (66): db(), deleteTake(), listTakes(), loadTake(), renameTake(), run(), saveTake(), sourceOf() (+58 more)

### Community 2 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @impromptu/core@workspace:*, @impromptu/practice@workspace:*, @impromptu/transcribe@workspace:*, @impromptu/ui@workspace:*, lucide-react@catalog:, react@catalog:, react-router@catalog: (+6 more)

### Community 3 - "package.json"
Cohesion: 0.15
Nodes (16): description, devDependencies, eslint@catalog:, prettier@catalog:, turbo@catalog:, @types/node@catalog:, typescript@catalog:, @types/node (+8 more)

### Community 4 - "ui/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @fontsource/archivo@catalog:, @fontsource/martian-mono@catalog:, description, devDependencies, react@catalog:, @types/react@catalog:, typescript@catalog: (+17 more)

### Community 5 - "catalog"
Cohesion: 0.06
Nodes (32): allowBuilds, core-js, protobufjs, catalog, eslint, @eslint/js, eslint-plugin-react-hooks, @fontsource/archivo (+24 more)

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

### Community 18 - "LivePlayer"
Cohesion: 0.20
Nodes (3): LivePlayer, Strikeable, PedalKind

### Community 19 - "DECISIONES (ADRs)"
Cohesion: 0.12
Nodes (15): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano` (+7 more)

### Community 20 - "fingering.ts"
Cohesion: 0.09
Nodes (36): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+28 more)

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
Nodes (59): ADR-0006, NoteEvent, PedalEvent, RawTrack, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect (+51 more)

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "ref_react"
Cohesion: 0.12
Nodes (22): MAMUT_HERD, MamutHerdSello(), PROPORCION, HeroVisualizer(), useReveal(), Acerca(), CREDITOS, COMING (+14 more)

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

### Community 54 - "ExportDialog.tsx"
Cohesion: 0.15
Nodes (26): ASPECTS, PHASES, RATES, RESOLUTIONS, State, chooseFormat(), DecodedFrame, ExportError (+18 more)

### Community 55 - "ownAudio.ts"
Cohesion: 0.18
Nodes (17): AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, analyzeAudio(), attachTakeAudio(), audioOffset(), OwnAudio (+9 more)

### Community 56 - "align.ts"
Cohesion: 0.17
Nodes (20): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, align(), alignAudioToNotes(), Alignment, alignNear(), audioChroma(), audioOnsets(), CHROMA_HOP (+12 more)

### Community 57 - "LiveSession"
Cohesion: 0.17
Nodes (4): liveNow(), LiveSession, LiveEvent, WebMidiInput

### Community 60 - "transcribe/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, typescript@catalog: (+17 more)

### Community 62 - "midi/src/index.ts"
Cohesion: 0.17
Nodes (17): startCameraRecording(), stopCameraRecording(), LiveState, MidiStatus, TakeSummary, KeyboardRange, applyCurve(), normalizeMessage() (+9 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.17
Nodes (18): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+10 more)

### Community 64 - "import.ts"
Cohesion: 0.11
Nodes (17): IdFactory, importMidi(), ImportOptions, MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack(), sameNotes() (+9 more)

### Community 65 - "Celular.tsx"
Cohesion: 0.16
Nodes (17): root, Celular(), Grabar(), Tab, TABS, BackgroundChoice, BACKGROUNDS, EnVivo() (+9 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "SettingsPanel.tsx"
Cohesion: 0.20
Nodes (8): BACKGROUNDS, HAND_SIZES, KEYBOARDS, LAYOUTS, NOTE_STYLES, PANEL_SUSTAIN, PEDALS, KeyboardMode

### Community 68 - "Piano"
Cohesion: 0.25
Nodes (9): allSampleNames(), DEFAULT_LAYERS, DEFAULT_SAMPLE_BASE, layerFor(), layerGain(), NAMES, nearestSample(), SAMPLED_PITCHES (+1 more)

### Community 69 - "Estudio.tsx"
Cohesion: 0.18
Nodes (23): ASPECTS, Estudio(), SPEEDS, TABS, useAudio, EditBar(), useEditShortcuts(), ExportDialog() (+15 more)

### Community 70 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @types/node@catalog:, @types/react@catalog:, typescript@catalog:, vite@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog: (+7 more)

### Community 71 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

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

### Community 77 - "AudioEngine"
Cohesion: 0.17
Nodes (3): AudioEngine, lowerBound(), Piano

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "core/src/index.ts"
Cohesion: 0.23
Nodes (10): midiFileName(), saveMidi(), exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), note() (+2 more)

### Community 81 - "createNoteEvent"
Cohesion: 0.16
Nodes (18): CHORDS, createDemoPiece(), MELODY, ids(), piece(), createDemoTake(), withKeyboard(), 2026-11-16 · Fase 0 · Cimientos (+10 more)

### Community 82 - "store.ts"
Cohesion: 0.13
Nodes (18): AudioState, AudioStatus, Aspect, onTakeEdited(), setTakeEditedListener(), StudioState, takeEdited(), transport (+10 more)

### Community 83 - "keyboard.ts"
Cohesion: 0.53
Nodes (4): countOutOfRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount()

### Community 84 - "Transport"
Cohesion: 0.12
Nodes (9): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, BITÁCORA (+1 more)

### Community 85 - "piano.ts"
Cohesion: 0.27
Nodes (11): ActiveVoice, LiveVoiceHandle, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), pedalDownRanges() (+3 more)

### Community 86 - "video.ts"
Cohesion: 0.26
Nodes (12): deleteMedia(), folder(), loadMedia(), saveMedia(), attachTakeVideo(), currentTakeId(), loadElement(), openVideo() (+4 more)

### Community 87 - "NoteEvent"
Cohesion: 0.12
Nodes (23): ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, Beat, Instrument, MediaRef (+15 more)

### Community 88 - "vite.config.ts"
Cohesion: 0.15
Nodes (5): brandDir, isolation, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 89 - "LivePanel.tsx"
Cohesion: 0.24
Nodes (8): refreshTakes(), SOURCE_ICON, SOURCE_TEXT, STATUS_TEXT, TakeRow(), TakesSection(), formatTime(), IconButton()

### Community 90 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/audio@workspace:*, @impromptu/midi@workspace:*, description, @impromptu/audio, @impromptu/midi, name, private, type (+1 more)

### Community 91 - "Componentes.tsx"
Cohesion: 0.18
Nodes (10): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+2 more)

### Community 92 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 93 - "eslint.config.js"
Cohesion: 0.22
Nodes (8): @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, typescript-eslint@catalog:, @eslint/js, eslint-plugin-react-hooks, globals, typescript-eslint

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "BUGS — trampas conocidas y registro"
Cohesion: 0.50
Nodes (3): BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas)

### Community 102 - "Take"
Cohesion: 0.24
Nodes (10): describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, openLocalPiece(), openMidiFile(), prettyName(), Take (+2 more)

## Knowledge Gaps
- **23 isolated node(s):** `ADR-0008`, `ADR-0010`, `ADR-0013`, `ADR-0014`, `../../tsconfig.base.json` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 580 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@playwright/test` connect `@playwright/test` to `vite.config.ts`, `package.json`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `ADR-0008`, `ADR-0010`, `ADR-0013` to the rest of the system?**
  _23 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09446693657219973 - nodes in this community are weakly interconnected._
- **Why does `NoteEvent` connect `visualizer.ts` to `import.ts`, `transcribeStore.ts`, `Take`, `core/src/index.ts`, `createNoteEvent`, `fingering.ts`, `piano.ts`, `video.ts`, `NoteEvent`, `align.ts`, `LiveSession`, `midi/src/index.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `transcribeStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053297199638663056 - nodes in this community are weakly interconnected._
- **Why does `Take` connect `Take` to `import.ts`, `transcribeStore.ts`, `core/src/index.ts`, `createNoteEvent`, `store.ts`, `keyboard.ts`, `fingering.ts`, `piano.ts`, `video.ts`, `ownAudio.ts`, `NoteEvent`, `LiveSession`, `ExportDialog.tsx`, `visualizer.ts`, `midi/src/index.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._