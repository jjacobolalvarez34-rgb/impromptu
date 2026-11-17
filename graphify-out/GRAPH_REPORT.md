# Graph Report - impromptu  (2026-11-17)

## Corpus Check
- 209 files · ~94,456 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 34 file(s) not represented in the graph (top: .css 31, (none) 3)

## Summary
- 1722 nodes · 3674 edges · 116 communities (88 shown, 28 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c427fa60`
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
- LogoIntro.tsx
- notation/src/index.ts
- edit.ts
- VERIFICACIONES — antes de decir "listo"
- pages.yml
- web/tsconfig.json
- practice/tsconfig.json
- ui/tsconfig.json
- Cómo empezar (para Jacobo)
- HERRAMIENTAS — Graphify, plugins y skills
- INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026)
- AGENTS.md — Impromptu
- .renderFrame
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
- Piano
- ExportDialog.tsx
- align.ts
- createNoteEvent
- transcribe/package.json
- transcribe/README.md
- core/src/index.ts
- VideoSection.tsx
- LiveSession
- Celular.tsx
- core/package.json
- desktop/package.json
- ref_react
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
- build
- main.cts
- import.ts
- Transport
- Take
- compilerOptions
- model.test.ts
- vite.config.ts
- store.ts
- web/package.json
- DECISIONES (ADRs)
- compilerOptions
- 2026-11-16 · Fase 0 · Cimientos
- transcribe/tsconfig.json
- Recorder
- @impromptu/media@workspace:*
- notation/tsconfig.json
- dev.mjs
- react-dom
- @impromptu/export@workspace:*
- scripts
- nsis
- Estudio.tsx
- @impromptu/core@workspace:*
- @impromptu/practice@workspace:*
- Visualizer
- piano.ts
- render/src/index.ts
- scene.test.ts
- scene.ts
- visualizer.ts
- @impromptu/ui@workspace:*
- ref_vitest
- render/src/index.ts

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 46 edges
2. `useStudio` - 38 edges
3. `NoteEvent` - 38 edges
4. `Take` - 38 edges
5. `Visualizer` - 38 edges
6. `Button()` - 37 edges
7. `createNoteEvent()` - 36 edges
8. `catalog` - 27 edges
9. `createTrack()` - 25 edges
10. `AudioEngine` - 23 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createNoteEvent()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createTrack()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createTake()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (116 total, 28 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (34): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+26 more)

### Community 1 - "transcribeStore.ts"
Cohesion: 0.05
Nodes (66): LiveListener, resample(), mb(), Model, nextAudioName(), PIANO_MODEL_URL, Store, TranscribeState (+58 more)

### Community 2 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @impromptu/midi@workspace:*, @impromptu/notation@workspace:*, @impromptu/transcribe@workspace:*, lucide-react@catalog:, opensheetmusicdisplay@2.2.1, react@catalog:, react-router@catalog: (+6 more)

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
Cohesion: 0.11
Nodes (20): dependencies, @impromptu/core@workspace:*, midi-file@catalog:, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+12 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 18 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

### Community 19 - "notation/src/index.ts"
Cohesion: 0.07
Nodes (49): download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, midiFileName(), saveMidi(), correlation() (+41 more)

### Community 20 - "edit.ts"
Cohesion: 0.06
Nodes (48): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+40 more)

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

### Community 30 - ".renderFrame"
Cohesion: 0.22
Nodes (6): isSounding(), noteRect(), labelFor(), lighten(), luminance(), Pool

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "ref_react"
Cohesion: 0.12
Nodes (22): MAMUT_HERD, MamutHerdSello(), PROPORCION, useReveal(), Acerca(), CREDITOS, COMING, delay() (+14 more)

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

### Community 55 - "ExportDialog.tsx"
Cohesion: 0.15
Nodes (28): ASPECTS, PHASES, RATES, RESOLUTIONS, State, chooseFormat(), DecodedFrame, ExportError (+20 more)

### Community 56 - "align.ts"
Cohesion: 0.07
Nodes (50): deleteMedia(), folder(), loadMedia(), saveMedia(), analyzeAudio(), attachTakeAudio(), OwnAudio, OwnAudioState (+42 more)

### Community 57 - "createNoteEvent"
Cohesion: 0.19
Nodes (15): CHORDS, createDemoPiece(), MELODY, HeroVisualizer(), ids(), piece(), createDemoTake(), note() (+7 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, typescript@catalog: (+17 more)

### Community 62 - "core/src/index.ts"
Cohesion: 0.15
Nodes (18): LiveState, MidiStatus, readRecordMic(), TakeSummary, KeyboardRange, applyCurve(), LiveEvent, normalizeMessage() (+10 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.22
Nodes (15): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, chunks, startCamera() (+7 more)

### Community 64 - "LiveSession"
Cohesion: 0.13
Nodes (7): startCameraRecording(), stopCameraRecording(), liveNow(), LiveSession, click(), Clicker, MetronomeState

### Community 65 - "Celular.tsx"
Cohesion: 0.12
Nodes (17): Grabar(), Tab, TABS, BackgroundChoice, BACKGROUNDS, EnVivo(), TO_BACKGROUND, live (+9 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+7 more)

### Community 68 - "ref_react"
Cohesion: 0.14
Nodes (8): root, Celular(), Inicio(), subscribe(), Intro(), LcdProps, LogoProps, SliderProps

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog: (+9 more)

### Community 71 - "AudioEngine"
Cohesion: 0.20
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

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "core/src/index.ts"
Cohesion: 0.29
Nodes (8): exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), note(), Timed, toTrack()

### Community 81 - "build"
Cohesion: 0.17
Nodes (12): build, appId, copyright, directories, extraResources, files, productName, win (+4 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), ADR-0018, inside(), ISOLATION, menu(), send(), serve()

### Community 83 - "import.ts"
Cohesion: 0.11
Nodes (17): IdFactory, importMidi(), ImportOptions, MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack(), sameNotes() (+9 more)

### Community 84 - "Transport"
Cohesion: 0.11
Nodes (11): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura (+3 more)

### Community 85 - "Take"
Cohesion: 0.17
Nodes (14): describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName(), withKeyboard(), countOutOfRange(), fitKeyboardRange() (+6 more)

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "model.test.ts"
Cohesion: 0.15
Nodes (19): KEYBOARD_61, NoteInput, sortPedals(), ADR-0003, WithCrypto, Hand, Instrument, MediaRef (+11 more)

### Community 88 - "vite.config.ts"
Cohesion: 0.16
Nodes (5): brandDir, isolation, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 89 - "store.ts"
Cohesion: 0.08
Nodes (37): AudioState, AudioStatus, engine, useAudio, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT (+29 more)

### Community 90 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/audio@workspace:*, @impromptu/render@workspace:*, description, @impromptu/audio, @impromptu/render, name, private, type (+1 more)

### Community 91 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (17): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión (+9 more)

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "2026-11-16 · Fase 0 · Cimientos"
Cohesion: 0.57
Nodes (5): 2026-11-16 · Fase 0 · Cimientos, isPedalDown(), PEDAL_CC, pedalKindFromCC(), pedalValueAt()

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 102 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 103 - "nsis"
Cohesion: 0.40
Nodes (5): nsis, allowToChangeInstallationDirectory, artifactName, oneClick, shortcutName

### Community 104 - "Estudio.tsx"
Cohesion: 0.11
Nodes (31): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window (+23 more)

### Community 107 - "Visualizer"
Cohesion: 0.13
Nodes (7): CameraState, CameraVideo, KeyboardCalibration, noteColor(), VisualSettings, hexToNumber(), Visualizer

### Community 108 - "piano.ts"
Cohesion: 0.17
Nodes (19): ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), allSampleNames(), DEFAULT_LAYERS (+11 more)

### Community 109 - "render/src/index.ts"
Cohesion: 0.29
Nodes (5): ADR-0006, DEFAULT_THEME, getTheme(), Theme, THEMES

### Community 110 - "scene.test.ts"
Cohesion: 0.23
Nodes (10): BASE_LOOKAHEAD, pedalLevels(), kb, layout, burstSeed(), noteSparks(), rng(), Spark (+2 more)

### Community 111 - "scene.ts"
Cohesion: 0.25
Nodes (9): NoteEvent, PedalEvent, RawTrack, Direction, forEachNoteIn(), FrameLayout, lowerBound(), NoteIndex (+1 more)

### Community 112 - "visualizer.ts"
Cohesion: 0.24
Nodes (10): frameLayout(), DEFAULT_SETTINGS, installLabelFont(), makeBeamTexture(), makeGlowTexture(), makeHaloTexture(), makeNoteTexture(), NOTE_NAMES (+2 more)

### Community 114 - "ref_vitest"
Cohesion: 0.25
Nodes (7): ADR-011 · Líneas de compás y pulso en el visualizador, Beat, beatAt(), beatGrid(), tempoAt(), Seconds, indexNotes()

### Community 115 - "render/src/index.ts"
Cohesion: 0.23
Nodes (14): calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, BLACK, BLACK_LENGTH, BLACK_OFFSET, BLACK_WIDTH (+6 more)

## Knowledge Gaps
- **29 isolated node(s):** `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json`, `ADR-0018`, `ADR-0008` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 685 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `electron` connect `desktop/package.json` to `main.cts`, `dev.mjs`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08078231292517007 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `package.json` to `vite.config.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `transcribeStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05362517099863201 - nodes in this community are weakly interconnected._
- **Why does `Take` connect `Take` to `LiveSession`, `transcribeStore.ts`, `AudioEngine`, `piano.ts`, `scene.ts`, `core/src/index.ts`, `visualizer.ts`, `ref_vitest`, `notation/src/index.ts`, `edit.ts`, `ExportDialog.tsx`, `import.ts`, `model.test.ts`, `align.ts`, `store.ts`, `Recorder`, `core/src/index.ts`, `createNoteEvent`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._