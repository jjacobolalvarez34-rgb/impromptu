# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 259 files · ~128,171 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 51 file(s) not represented in the graph (top: .css 32, .xml 8, (none) 5)

## Summary
- 2566 nodes · 5634 edges · 176 communities (115 shown, 61 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 173 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6eb2502f`
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
- main.ts
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
- ExportarPantalla.kt
- LivePanel.tsx
- piano.ts
- align.ts
- Transkun.kt
- transcribe/package.json
- transcribe/README.md
- ScoreTab.tsx
- VideoSection.tsx
- MainActivity.kt
- Celular.tsx
- core/package.json
- desktop/package.json
- AvanceSuave
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
- store.ts
- score.ts
- main.cts
- import.ts
- Transport
- cursor.ts
- compilerOptions
- EnVivo.tsx
- Sampler
- LiveSession
- export/src/export.ts
- Transkun.kt
- compilerOptions
- AvanceSuave
- transcribe/tsconfig.json
- Origen
- Motor
- notation/tsconfig.json
- dev.mjs
- Impromptu.kt
- DECISIONES (ADRs)
- build
- Comun.kt
- Estudio.tsx
- core/src/index.ts
- ServicioTrabajos.kt
- MicrofonoPantalla
- notation/src/index.ts
- edit.ts
- key.ts
- Navegador
- Pedal
- mobile/tsconfig.json
- visualizer.ts
- AudioEngine
- ExportDialog.tsx
- transkun/worker.ts
- Exportador.kt
- InicioPantalla.kt
- LivePlayer
- Renderizador.kt
- Icono
- leerRecorrido
- object@L130
- WaitMode
- Conversiones.kt
- .shouldInterceptRequest
- scripts
- devDependencies
- LiveListener
- web/vite.config.ts
- CopiarModelos
- midi/src/export.ts
- @playwright/test
- Take
- Take
- .transcribeComoPython
- Piano
- scripts
- scripts
- Formato
- gradle.mjs

## God Nodes (most connected - your core abstractions)
1. `Estudio()` - 43 edges
2. `useStudio` - 41 edges
3. `Visualizer` - 38 edges
4. `NoteEvent` - 38 edges
5. `Take` - 37 edges
6. `createNoteEvent()` - 36 edges
7. `react` - 35 edges
8. `Transkun` - 27 edges
9. `Button()` - 27 edges
10. `catalog` - 27 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `WaitMode`  [INFERRED]
  docs/BITACORA.md → packages/practice/src/wait.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `Recorder`  [INFERRED]
  docs/BITACORA.md → packages/midi/src/live/recorder.ts

## Import Cycles
- None detected.

## Communities (176 total, 61 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (27): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+19 more)

### Community 1 - "transcribe/src/index.ts"
Cohesion: 0.16
Nodes (22): RawNote, DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), peakLevel(), prepareTranscriber(), queue (+14 more)

### Community 2 - "web/package.json"
Cohesion: 0.09
Nodes (28): dependencies, @impromptu/audio@workspace:*, @impromptu/export@workspace:*, @impromptu/media@workspace:*, @impromptu/midi@workspace:*, @impromptu/practice@workspace:*, @impromptu/render@workspace:*, @impromptu/transcribe@workspace:* (+20 more)

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
Cohesion: 0.11
Nodes (20): dependencies, @impromptu/core@workspace:*, midi-file@catalog:, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+12 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 18 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

### Community 19 - "main.ts"
Cohesion: 0.11
Nodes (6): aTake(), baseMs, mostrar(), PiezaWeb, Puente, ADR-0019

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
Cohesion: 0.10
Nodes (9): TipoPedal, Sostenuto, Sustain, UnaCorda, Control, EventoMidi, Off, On (+1 more)

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "ref_react"
Cohesion: 0.09
Nodes (22): MAMUT_HERD, MamutHerdSello(), PROPORCION, connectDesktopMenu(), useReveal(), root, Acerca(), CREDITOS (+14 more)

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
Nodes (32): live, LiveState, MidiStatus, readRecordMic(), refreshTakes(), useLive, KeyboardSection(), METER_OPTIONS (+24 more)

### Community 55 - "piano.ts"
Cohesion: 0.16
Nodes (19): note(), ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, PianoOptions, allSampleNames(), DEFAULT_LAYERS (+11 more)

### Community 56 - "align.ts"
Cohesion: 0.11
Nodes (26): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas), align() (+18 more)

### Community 57 - "Transkun.kt"
Cohesion: 0.08
Nodes (6): Etapa, Armando, Escuchando, Esperando, Leyendo, Preparando

### Community 60 - "transcribe/package.json"
Cohesion: 0.08
Nodes (30): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, typescript@catalog: (+22 more)

### Community 62 - "ScoreTab.tsx"
Cohesion: 0.16
Nodes (8): download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, esc(), pedalXml(), toMusicXml()

### Community 63 - "VideoSection.tsx"
Cohesion: 0.10
Nodes (39): AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, CalibrateDialog(), NAMES, noteName(), PitchField() (+31 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.05
Nodes (12): Ajustes, Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono, Pantalla (+4 more)

### Community 65 - "Celular.tsx"
Cohesion: 0.10
Nodes (26): lockOrientation(), Ajustes(), Celular(), Girar(), Grabando(), Miniatura(), Mode, MODES (+18 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+7 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "core/src/index.ts"
Cohesion: 0.15
Nodes (17): IdFactory, KeyboardRange, ImportOptions, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE (+9 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.11
Nodes (22): description, devDependencies, @impromptu/core@workspace:*, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, vite@catalog: (+14 more)

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
Cohesion: 0.17
Nodes (12): useAudio, ColorField(), Props, BACKGROUNDS, HAND_SIZES, KEYBOARDS, LAYOUTS, NOTE_STYLES (+4 more)

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "store.ts"
Cohesion: 0.13
Nodes (18): AudioState, AudioStatus, audioOffset(), KeyboardMode, onTakeEdited(), setTakeEditedListener(), StudioState, takeEdited() (+10 more)

### Community 81 - "score.ts"
Cohesion: 0.22
Nodes (18): buildScore(), DIV, FIGURES, Measure, measureEvents(), mergePedalChanges(), NoteType, quantizeOnsets() (+10 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), inside(), ISOLATION, menu(), send(), serve(), ADR-0018

### Community 83 - "import.ts"
Cohesion: 0.11
Nodes (22): 2026-11-16 · Fase 0 · Cimientos, createTrack(), sortPedals(), isPedalDown(), PEDAL_CC, pedalKindFromCC(), pedalValueAt(), importMidi() (+14 more)

### Community 84 - "Transport"
Cohesion: 0.10
Nodes (14): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd (+6 more)

### Community 85 - "cursor.ts"
Cohesion: 0.21
Nodes (8): cuadro(), aRedondas(), FinesDeRenglon, LineaDeLectura, posicionEn(), PuntoCursor, fines, puntos

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "EnVivo.tsx"
Cohesion: 0.18
Nodes (11): BackgroundChoice, BACKGROUNDS, EnVivo(), TO_BACKGROUND, Aspect, syncVideo(), Props, RATIO (+3 more)

### Community 88 - "Sampler"
Cohesion: 0.24
Nodes (3): Salamander, Sampler, Voz

### Community 89 - "LiveSession"
Cohesion: 0.12
Nodes (7): startCameraRecording(), stopCameraRecording(), liveNow(), LiveSession, click(), Clicker, WebMidiInput

### Community 90 - "export/src/export.ts"
Cohesion: 0.19
Nodes (24): chooseFormat(), DecodedFrame, ExportError, ExportFailure, ExportOptions, ExportProgress, ExportResult, exportVideo() (+16 more)

### Community 91 - "Transkun.kt"
Cohesion: 0.13
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

### Community 95 - "Origen"
Cohesion: 0.12
Nodes (7): Origen, Audio, Microfono, Midi, Teclado, Pieza, Piezas

### Community 97 - "Motor"
Cohesion: 0.08
Nodes (10): E, Motor, Secuencia, Bajando, Estado, Fallo, Instalacion, Lista (+2 more)

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.15
Nodes (9): electron, require, desktopEnv, inherited, installer, r, require, r (+1 more)

### Community 100 - "Impromptu.kt"
Cohesion: 0.13
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.10
Nodes (19): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión (+11 more)

### Community 102 - "build"
Cohesion: 0.12
Nodes (17): build, appId, copyright, directories, extraResources, files, nsis, productName (+9 more)

### Community 103 - "Comun.kt"
Cohesion: 0.27
Nodes (6): Avance(), BotonIcono(), Confirmar(), Encabezado(), Panel(), PedirTexto()

### Community 104 - "Estudio.tsx"
Cohesion: 0.11
Nodes (30): DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window, Inicio() (+22 more)

### Community 105 - "core/src/index.ts"
Cohesion: 0.09
Nodes (26): CHORDS, createDemoPiece(), MELODY, HeroVisualizer(), ids(), piece(), createDemoTake(), createNoteEvent() (+18 more)

### Community 106 - "ServicioTrabajos.kt"
Cohesion: 0.05
Nodes (9): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando, ServicioTrabajos, C3 (+1 more)

### Community 107 - "MicrofonoPantalla"
Cohesion: 0.22
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 108 - "notation/src/index.ts"
Cohesion: 0.42
Nodes (8): alignPhase(), beatsOf(), estimateTempo(), gridFit(), onsetEnvelope(), steadyBeats(), straightFit(), trackBeats()

### Community 109 - "edit.ts"
Cohesion: 0.09
Nodes (37): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+29 more)

### Community 110 - "key.ts"
Cohesion: 0.17
Nodes (12): correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key, MAJOR, MAJOR_FIFTHS, MINOR (+4 more)

### Community 111 - "Navegador"
Cohesion: 0.10
Nodes (30): formatoTiempo(), App(), Navegador, AjustesPantalla(), ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros() (+22 more)

### Community 112 - "Pedal"
Cohesion: 0.14
Nodes (7): Nota, Pedal, Formato, Leido, Smf, Grabacion, SmfTest

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "visualizer.ts"
Cohesion: 0.05
Nodes (62): CameraState, CameraVideo, ADR-0006, 2026-11-17 · Fase 7 · Tutoriales y práctica, Beat, KeyboardCalibration, PedalEvent, Seconds (+54 more)

### Community 115 - "AudioEngine"
Cohesion: 0.18
Nodes (4): AudioEngine, lowerBound(), LiveVoiceHandle, takeVoices()

### Community 116 - "ExportDialog.tsx"
Cohesion: 0.11
Nodes (6): ASPECTS, PHASES, RATES, RESOLUTIONS, State, PROPORCION

### Community 117 - "transkun/worker.ts"
Cohesion: 0.18
Nodes (21): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+13 more)

### Community 118 - "Exportador.kt"
Cohesion: 0.09
Nodes (7): Decodificar, Floats, Pcm, Banco, Limitador, Exportador, Paquete

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.08
Nodes (7): Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), PuntoRec()

### Community 120 - "LivePlayer"
Cohesion: 0.20
Nodes (3): LivePlayer, Strikeable, PedalKind

### Community 121 - "Renderizador.kt"
Cohesion: 0.19
Nodes (3): esNegra(), Opciones, Renderizador

### Community 125 - "WaitMode"
Cohesion: 0.15
Nodes (7): PracticeState, rebuild(), ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, PracticeChord, practiceChords(), WaitMode, WaitStats

### Community 126 - "Conversiones.kt"
Cohesion: 0.12
Nodes (3): Conversiones, Terminada, TrabajoConversion

### Community 128 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 129 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog: (+6 more)

### Community 130 - "LiveListener"
Cohesion: 0.36
Nodes (3): LiveListener, resample(), MODEL_RATE

### Community 131 - "web/vite.config.ts"
Cohesion: 0.16
Nodes (5): brandDir, isolation, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 133 - "midi/src/export.ts"
Cohesion: 0.26
Nodes (9): midiFileName(), saveMidi(), exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), Timed (+1 more)

### Community 168 - "Take"
Cohesion: 0.15
Nodes (18): KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, Instrument, MediaRef, NoteEvent, TempoPoint (+10 more)

### Community 169 - "Take"
Cohesion: 0.28
Nodes (8): describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName(), Take, ImportResult, ImportWarning

### Community 172 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 173 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, apk, apk:firmado, partitura, pruebas, typecheck

### Community 174 - "Formato"
Cohesion: 0.50
Nodes (4): Formato, Cuadrado, Horizontal, Vertical

## Knowledge Gaps
- **53 isolated node(s):** `ADR-0018`, `Ia`, `Quieta`, `Lista`, `PreparandoIa` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 973 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **61 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BUG-004 · Celular: la app se cierra al convertir una grabación` connect `align.ts` to `.transcribeComoPython`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `Ia`, `Quieta` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0782312925170068 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09113300492610837 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `ui/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Should `catalog` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._