# Graph Report - impromptu  (2026-11-17)

## Corpus Check
- 229 files · ~98,840 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 52 file(s) not represented in the graph (top: .css 32, .xml 10, (none) 5)

## Summary
- 1842 nodes · 3884 edges · 124 communities (91 shown, 33 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5bcc590f`
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
- ImpromptuMidiPlugin.java
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
- mobile/README.md
- LivePanel.tsx
- ExportDialog.tsx
- align.ts
- createNoteEvent
- transkun/worker.ts
- transcribe/README.md
- core/src/index.ts
- VideoSection.tsx
- midi.ts
- Celular.tsx
- core/package.json
- desktop/package.json
- main.tsx
- notation/package.json
- devDependencies
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
- model.test.ts
- vite.config.ts
- ownAudio.ts
- web/package.json
- DECISIONES (ADRs)
- compilerOptions
- store.ts
- transcribe/tsconfig.json
- Recorder
- @impromptu/media@workspace:*
- notation/tsconfig.json
- dev.mjs
- video.ts
- ScoreTab.tsx
- scripts
- nsis
- Estudio.tsx
- core/src/index.ts
- @impromptu/practice@workspace:*
- sync.mjs
- audio.ts
- validate.ts
- ref_node_fs
- musicxml.ts
- @impromptu/ui@workspace:*
- @impromptu/notation@workspace:*
- visualizer.ts
- opensheetmusicdisplay
- react@catalog:

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 43 edges
2. `Button()` - 40 edges
3. `useStudio` - 39 edges
4. `NoteEvent` - 38 edges
5. `Take` - 38 edges
6. `Visualizer` - 38 edges
7. `createNoteEvent()` - 36 edges
8. `catalog` - 27 edges
9. `createTrack()` - 25 edges
10. `AudioEngine` - 23 edges

## Surprising Connections (you probably didn't know these)
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createNoteEvent()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (124 total, 33 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (26): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+18 more)

### Community 1 - "transcribeStore.ts"
Cohesion: 0.08
Nodes (39): LiveListener, resample(), mb(), Model, nextAudioName(), PIANO_MODEL_URL, Store, TranscribeState (+31 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @capacitor/core@8.6.0, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/export@workspace:*, @impromptu/midi@workspace:*, @impromptu/transcribe@workspace:*, lucide-react@catalog: (+9 more)

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
Cohesion: 0.11
Nodes (36): beatGrid(), correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key, MAJOR, MAJOR_FIFTHS (+28 more)

### Community 20 - "edit.ts"
Cohesion: 0.06
Nodes (45): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+37 more)

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

### Community 30 - "ImpromptuMidiPlugin.java"
Cohesion: 0.07
Nodes (5): ExampleInstrumentedTest, ImpromptuMidiPlugin, MidiManager.DeviceCallback, MainActivity, ExampleUnitTest

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

### Community 54 - "LivePanel.tsx"
Cohesion: 0.15
Nodes (20): refreshTakes(), METER_OPTIONS, MetronomeControls(), saveForTests(), SOURCE_ICON, SOURCE_TEXT, STATUS_TEXT, TakeRow() (+12 more)

### Community 55 - "ExportDialog.tsx"
Cohesion: 0.15
Nodes (28): ASPECTS, PHASES, RATES, RESOLUTIONS, State, chooseFormat(), DecodedFrame, ExportError (+20 more)

### Community 56 - "align.ts"
Cohesion: 0.12
Nodes (23): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas), align(), alignAudioToNotes(), Alignment, alignNear() (+15 more)

### Community 57 - "createNoteEvent"
Cohesion: 0.26
Nodes (13): CHORDS, createDemoPiece(), MELODY, piece(), createDemoTake(), createNoteEvent(), createTake(), createTrack() (+5 more)

### Community 60 - "transkun/worker.ts"
Cohesion: 0.07
Nodes (46): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, typescript@catalog: (+38 more)

### Community 62 - "core/src/index.ts"
Cohesion: 0.08
Nodes (25): startCameraRecording(), stopCameraRecording(), liveNow(), LiveSession, LiveState, MidiStatus, readRecordMic(), click() (+17 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.17
Nodes (18): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+10 more)

### Community 64 - "midi.ts"
Cohesion: 0.11
Nodes (11): isNativeApp, ADR-0018, ImpromptuMidiPlugin, installNativeMidi(), MessageHandler, Midi, NativeAccess, NativeDevice (+3 more)

### Community 65 - "Celular.tsx"
Cohesion: 0.10
Nodes (26): Girar(), Miniatura(), Mode, MODES, Pieza(), ScoreTab, Screen, SOURCE (+18 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+7 more)

### Community 68 - "main.tsx"
Cohesion: 0.14
Nodes (12): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, requestConvertAudio(), ADR-0018, Window, root (+4 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, vitest@catalog:, @types/node (+5 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.13
Nodes (18): dependencies, @capacitor/android@8.6.0, @capacitor/core@8.6.0, @capacitor/screen-orientation@8.0.2, description, devDependencies, @capacitor/cli@8.6.0, @capacitor/core (+10 more)

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
Cohesion: 0.13
Nodes (14): Intro(), ColorField(), Props, BACKGROUNDS, HAND_SIZES, KEYBOARDS, LAYOUTS, NOTE_STYLES (+6 more)

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
Cohesion: 0.10
Nodes (12): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd (+4 more)

### Community 85 - "Take"
Cohesion: 0.27
Nodes (10): describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, openLocalPiece(), openMidiFile(), prettyName(), Take (+2 more)

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "model.test.ts"
Cohesion: 0.12
Nodes (18): 2026-11-16 · Fase 0 · Cimientos, KEYBOARD_61, NoteInput, sortNotes(), ADR-0003, WithCrypto, Beat, Instrument (+10 more)

### Community 88 - "vite.config.ts"
Cohesion: 0.18
Nodes (6): vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, brandDir, isolation, vite-plugin-pwa, @vitejs/plugin-react

### Community 89 - "ownAudio.ts"
Cohesion: 0.19
Nodes (18): AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, analyzeAudio(), attachTakeAudio(), audioOffset(), OwnAudio (+10 more)

### Community 90 - "web/package.json"
Cohesion: 0.17
Nodes (11): @capacitor/screen-orientation@8.0.2, @impromptu/render@workspace:*, react-dom@catalog:, description, @capacitor/screen-orientation, @impromptu/render, name, private (+3 more)

### Community 91 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (18): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión (+10 more)

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "store.ts"
Cohesion: 0.17
Nodes (13): Aspect, onTakeEdited(), setTakeEditedListener(), StudioState, takeEdited(), ADR-0010, View, withKeyboard() (+5 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "Recorder"
Cohesion: 0.28
Nodes (6): sortPedals(), NoteEvent, PedalEvent, RawTrack, Recorder, toMicro()

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 100 - "video.ts"
Cohesion: 0.23
Nodes (13): deleteMedia(), folder(), loadMedia(), saveMedia(), attachTakeVideo(), currentTakeId(), loadElement(), setTakeIdGetter() (+5 more)

### Community 101 - "ScoreTab.tsx"
Cohesion: 0.21
Nodes (9): ScoreTab, download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, midiFileName(), saveMidi() (+1 more)

### Community 102 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 103 - "nsis"
Cohesion: 0.40
Nodes (5): nsis, allowToChangeInstallationDirectory, artifactName, oneClick, shortcutName

### Community 104 - "Estudio.tsx"
Cohesion: 0.17
Nodes (24): onMenuAction(), Ajustes(), Grabando(), Inicio(), ASPECTS, Estudio(), SPEEDS, TABS (+16 more)

### Community 105 - "core/src/index.ts"
Cohesion: 0.28
Nodes (7): countOutOfRange(), fitKeyboardRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount(), rawToNotes(), takeFromTranscription()

### Community 108 - "audio.ts"
Cohesion: 0.06
Nodes (30): AudioEngine, AudioState, AudioStatus, lowerBound(), ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`, note(), LivePlayer, Strikeable (+22 more)

### Community 109 - "validate.ts"
Cohesion: 0.71
Nodes (6): isInt(), isTime(), validateNoteEvent(), validatePedalEvent(), validateTake(), validateTrack()

### Community 110 - "ref_node_fs"
Cohesion: 0.33
Nodes (3): brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 111 - "musicxml.ts"
Cohesion: 0.60
Nodes (5): spell(), esc(), noteXml(), pedalXml(), toMusicXml()

### Community 115 - "visualizer.ts"
Cohesion: 0.05
Nodes (58): HeroVisualizer(), ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, BLACK, BLACK_LENGTH (+50 more)

## Knowledge Gaps
- **30 isolated node(s):** `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json`, `ADR-0018`, `ADR-0018` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 723 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `electron` connect `desktop/package.json` to `main.cts`, `dev.mjs`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0841813135985199 - nodes in this community are weakly interconnected._
- **Why does `Take` connect `Take` to `transcribeStore.ts`, `notation/src/index.ts`, `edit.ts`, `LivePanel.tsx`, `ExportDialog.tsx`, `createNoteEvent`, `core/src/index.ts`, `core/src/index.ts`, `import.ts`, `model.test.ts`, `ownAudio.ts`, `store.ts`, `Recorder`, `video.ts`, `ScoreTab.tsx`, `core/src/index.ts`, `audio.ts`, `validate.ts`, `musicxml.ts`, `visualizer.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `transcribeStore.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07673469387755102 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `package.json` to `ref_node_fs`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._