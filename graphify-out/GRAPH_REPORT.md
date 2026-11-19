# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 278 files · ~148,921 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 75 file(s) not represented in the graph (top: .css 33, .flac 18, .xml 8)

## Summary
- 2840 nodes · 6078 edges · 202 communities (127 shown, 75 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 159 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e8c78ad`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/src/index.ts
- src/transcribe.ts
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
- store.ts
- media/package.json
- midi/package.json
- render/package.json
- LogoIntro.tsx
- audio.ts
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
- react
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
- Estudio.tsx
- export/src/export.ts
- align.ts
- BasicPitch
- transcribe/package.json
- transcribe/README.md
- musicxml.ts
- video.ts
- MainActivity.kt
- edit.ts
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
- ExportDialog.tsx
- Flujos principales
- Celular.tsx
- notation/src/index.ts
- main.cts
- import.ts
- Transport
- WaitMode
- compilerOptions
- Estado
- Sampler
- LiveSession
- Test
- Transkun.kt
- compilerOptions
- build
- transcribe/tsconfig.json
- vitest
- Motor
- notation/tsconfig.json
- dev.mjs
- Paquetes
- DECISIONES (ADRs)
- Visualizer
- MicrofonoPantalla
- Decodificar.kt
- createNoteEvent
- ServicioTrabajos.kt
- Pieza
- render/src/index.ts
- edit.ts
- instrumentos.ts
- Tecla
- Impromptu.kt
- mobile/tsconfig.json
- scene.test.ts
- AudioEngine
- web/vite.config.ts
- transkun/worker.ts
- Pedal
- InicioPantalla.kt
- .asignar
- Renderizador
- Icono
- Comun.kt
- import.test.ts
- ScoreTab.tsx
- Conversiones
- demos-midi.mjs
- scripts
- visualizer.ts
- sintes.ts
- Plantilla
- CopiarModelos
- .renderFrame
- LivePlayer
- @playwright/test
- avance.ts
- .iniciar
- audio/src/index.ts
- midi/src/export.ts
- Take
- transcribe/src/index.ts
- Instrumento
- audio.test.ts
- src/worker.ts
- DetectorBateria
- liveMic.ts
- NoteEvent
- PedalEvent
- .shouldInterceptRequest
- bateria.ts
- Sintes
- Piano
- keyboard-layout.ts
- WebMidiInput
- LEEME.md
- Exportador.kt
- Formato

## God Nodes (most connected - your core abstractions)
1. `useStudio` - 49 edges
2. `Estudio()` - 40 edges
3. `Visualizer` - 38 edges
4. `react` - 36 edges
5. `vitest` - 32 edges
6. `Nota` - 30 edges
7. `createNoteEvent()` - 29 edges
8. `NoteEvent` - 27 edges
9. `Transkun` - 27 edges
10. `catalog` - 27 edges

## Surprising Connections (you probably didn't know these)
- `ADR-011 · Líneas de compás y pulso en el visualizador` --references--> `beatGrid()`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/meter.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande` --references--> `WaitMode`  [INFERRED]
  docs/DECISIONES.md → packages/practice/src/wait.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `Recorder`  [INFERRED]
  docs/BITACORA.md → packages/midi/src/live/recorder.ts
- `ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio` --references--> `Track`  [INFERRED]
  docs/DECISIONES.md → packages/core/src/model.ts

## Import Cycles
- None detected.

## Communities (202 total, 75 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.06
Nodes (38): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+30 more)

### Community 1 - "src/transcribe.ts"
Cohesion: 0.20
Nodes (15): 2026-11-17 · Fase 5 · Audio a notas, DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), peakLevel(), prepareTranscriber(), queue (+7 more)

### Community 2 - "web/package.json"
Cohesion: 0.06
Nodes (40): dependencies, @impromptu/audio@workspace:*, @impromptu/export@workspace:*, @impromptu/media@workspace:*, @impromptu/midi@workspace:*, @impromptu/practice@workspace:*, @impromptu/render@workspace:*, @impromptu/transcribe@workspace:* (+32 more)

### Community 3 - "package.json"
Cohesion: 0.11
Nodes (24): description, devDependencies, eslint@catalog:, @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, @playwright/test@catalog:, prettier@catalog: (+16 more)

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

### Community 14 - "store.ts"
Cohesion: 0.06
Nodes (29): startCameraRecording(), stopCameraRecording(), live, MidiStatus, readRecordMic(), click(), Clicker, MetronomeState (+21 more)

### Community 15 - "media/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 16 - "midi/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, midi-file@catalog:, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (19): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+11 more)

### Community 18 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

### Community 19 - "audio.ts"
Cohesion: 0.12
Nodes (20): AudioState, AudioStatus, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, analyzeAudio(), attachTakeAudio() (+12 more)

### Community 20 - "transcribeStore.ts"
Cohesion: 0.07
Nodes (25): conInstrumento(), tomaDeGolpes(), refreshTakes(), saveMedia(), saveTake(), EstadoMic(), FilaConversion(), LevelMeter() (+17 more)

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

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "react"
Cohesion: 0.11
Nodes (22): MAMUT_HERD, MamutHerdSello(), PROPORCION, useReveal(), root, Acerca(), CREDITOS, COMING (+14 more)

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

### Community 54 - "Estudio.tsx"
Cohesion: 0.05
Nodes (55): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window (+47 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.07
Nodes (46): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+38 more)

### Community 56 - "align.ts"
Cohesion: 0.10
Nodes (28): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s), BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas, BUGS — trampas conocidas y registro, Registro de bugs (+20 more)

### Community 57 - "BasicPitch"
Cohesion: 0.09
Nodes (7): Etapa, Armando, Escuchando, Esperando, Leyendo, Preparando, BasicPitch

### Community 60 - "transcribe/package.json"
Cohesion: 0.11
Nodes (20): @impromptu/core@workspace:*, @impromptu/core@workspace:*, dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description (+12 more)

### Community 62 - "musicxml.ts"
Cohesion: 0.16
Nodes (15): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar() (+7 more)

### Community 63 - "video.ts"
Cohesion: 0.13
Nodes (28): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+20 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.06
Nodes (18): formatoTiempo(), Ajustes, App(), Exportar, Grabar, Inicio, MainActivity, Microfono (+10 more)

### Community 65 - "edit.ts"
Cohesion: 0.25
Nodes (14): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+6 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.10
Nodes (21): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+13 more)

### Community 68 - "Sintes"
Cohesion: 0.24
Nodes (7): Sintes, Timbre, Acero, Bajo, Electrica, Nylon, Voz

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "midi/src/index.ts"
Cohesion: 0.26
Nodes (12): KeyboardRange, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE, profileFor(), PROFILES (+4 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.09
Nodes (26): description, devDependencies, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, vite@catalog:, name (+18 more)

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

### Community 77 - "ExportDialog.tsx"
Cohesion: 0.06
Nodes (17): ASPECTS, PHASES, RATES, RESOLUTIONS, State, PROPORCION, AFINACIONES_UI, BACKGROUNDS (+9 more)

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "Celular.tsx"
Cohesion: 0.08
Nodes (36): lockOrientation(), Girar(), Grabando(), Inicio(), Miniatura(), Mode, MODES, Screen (+28 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.06
Nodes (59): beatGrid(), aRedondas(), CursorOsmd, FinesDeRenglon, leerRecorrido(), LineaDeLectura, posicionEn(), PuntoCursor (+51 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), inside(), ISOLATION, menu(), send(), serve(), ADR-0018

### Community 83 - "import.ts"
Cohesion: 0.14
Nodes (14): importMidi(), ImportOptions, ImportResult, ImportWarning, instrumentoDePista(), MAJOR_KEYS, meterAndKey(), MINOR_KEYS (+6 more)

### Community 85 - "WaitMode"
Cohesion: 0.13
Nodes (10): PracticeState, rebuild(), 2026-11-17 · Fase 7 · Tutoriales y práctica, ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, PracticeChord, practiceChords(), note(), notes (+2 more)

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 88 - "Sampler"
Cohesion: 0.16
Nodes (4): Limitador, Salamander, Sampler, Voz

### Community 91 - "Transkun.kt"
Cohesion: 0.10
Nodes (7): Cancelada, Constantes, Decodificacion, Espectro, Evento, Modelos, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "build"
Cohesion: 0.12
Nodes (17): build, appId, copyright, directories, extraResources, files, nsis, productName (+9 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 97 - "Motor"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.12
Nodes (11): electron, require, desktopEnv, inherited, installer, r, require, androidEnv (+3 more)

### Community 100 - "Paquetes"
Cohesion: 0.12
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (18): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-010 · Estilo y brillo de las notas en `VisualProject.effects` (+10 more)

### Community 102 - "Visualizer"
Cohesion: 0.15
Nodes (6): Carriles, KeyboardLayout, noteColor(), VisualSettings, hexToNumber(), Visualizer

### Community 103 - "MicrofonoPantalla"
Cohesion: 0.18
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 104 - "Decodificar.kt"
Cohesion: 0.18
Nodes (3): Decodificar, Floats, Pcm

### Community 105 - "createNoteEvent"
Cohesion: 0.09
Nodes (29): CHORDS, createDemoPiece(), MELODY, HeroVisualizer(), ids(), piece(), note(), createNoteEvent() (+21 more)

### Community 107 - "Pieza"
Cohesion: 0.15
Nodes (6): Origen, Audio, Microfono, Midi, Teclado, Pieza

### Community 108 - "render/src/index.ts"
Cohesion: 0.20
Nodes (12): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, DEFAULT_THEME, getTheme(), Theme (+4 more)

### Community 109 - "edit.ts"
Cohesion: 0.13
Nodes (22): ADR-0012, Finger, chordOptions(), FingeringOptions, FINGERS, HandSize, isBlack(), linkCost() (+14 more)

### Community 110 - "instrumentos.ts"
Cohesion: 0.19
Nodes (9): carriles(), carrilesBateria(), carrilesCuerdas(), COLOR_CUERDA, COLOR_PIEZA, instrumentoDe(), teclas(), KeyRect (+1 more)

### Community 111 - "Tecla"
Cohesion: 0.12
Nodes (25): AjustesPantalla(), ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), Avance(), BotonIcono(), Confirmar() (+17 more)

### Community 112 - "Impromptu.kt"
Cohesion: 0.12
Nodes (3): Banco, Piezas, Impromptu

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "scene.test.ts"
Cohesion: 0.15
Nodes (17): BLACK_LENGTH, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, lowerBound(), NoteIndex, pedalLevels() (+9 more)

### Community 116 - "web/vite.config.ts"
Cohesion: 0.12
Nodes (11): vite@catalog:, brandDir, isolation, devDependencies, typescript@catalog:, vite@catalog:, vitest@catalog:, vite (+3 more)

### Community 117 - "transkun/worker.ts"
Cohesion: 0.18
Nodes (21): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+13 more)

### Community 118 - "Pedal"
Cohesion: 0.09
Nodes (14): Pedal, TipoPedal, Sostenuto, Sustain, UnaCorda, Formato, Leido, Smf (+6 more)

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.13
Nodes (7): Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), SelectorInstrumento()

### Community 120 - ".asignar"
Cohesion: 0.40
Nodes (5): Bateria, Forma, Guitarra, Pieza, Posicion

### Community 121 - "Renderizador"
Cohesion: 0.24
Nodes (4): esNegra(), Nota, Opciones, Renderizador

### Community 122 - "Icono"
Cohesion: 0.13
Nodes (5): notasCayendo(), PresentacionPantalla(), Punto(), Icono(), Iconos

### Community 123 - "Comun.kt"
Cohesion: 0.06
Nodes (3): PuntoRec(), C3, Tipos

### Community 124 - "import.test.ts"
Cohesion: 0.18
Nodes (5): E, fixtures, ids(), imp(), real()

### Community 125 - "ScoreTab.tsx"
Cohesion: 0.12
Nodes (6): aTake(), baseMs, mostrar(), PiezaWeb, Puente, ADR-0019

### Community 126 - "Conversiones"
Cohesion: 0.12
Nodes (4): AvanceSuave, Conversiones, Terminada, TrabajoConversion

### Community 127 - "demos-midi.mjs"
Cohesion: 0.20
Nodes (10): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+2 more)

### Community 128 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 129 - "visualizer.ts"
Cohesion: 0.20
Nodes (9): ADR-0010, frameLayout(), installLabelFont(), makeBeamTexture(), makeGlowTexture(), makeHaloTexture(), makeNoteTexture(), NOTE_NAMES (+1 more)

### Community 130 - "sintes.ts"
Cohesion: 0.18
Nodes (10): Activa, cuerda(), golpe(), MUESTRAS_BATERIA, pasoAlto(), pasoBajo(), ruido(), Timbre (+2 more)

### Community 131 - "Plantilla"
Cohesion: 0.18
Nodes (10): 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura, 2026-11-17 · Fase 8 · Apps de PC y Android, 2026-11-18 · Fase 8 · App de Android nativa (Kotlin + Compose), 2026-11-18 (tarde) · Pedidos de Jacobo tras probar la app (+2 more)

### Community 133 - ".renderFrame"
Cohesion: 0.22
Nodes (6): isSounding(), noteRect(), labelFor(), lighten(), luminance(), Pool

### Community 134 - "LivePlayer"
Cohesion: 0.19
Nodes (3): 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, LivePlayer, Strikeable

### Community 139 - "avance.ts"
Cohesion: 0.25
Nodes (5): AvanceSuave, EtapaDeEspera, fraseDeEspera(), FRASES, textoRestante()

### Community 163 - ".iniciar"
Cohesion: 0.22
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 164 - "audio/src/index.ts"
Cohesion: 0.27
Nodes (11): ActiveVoice, LiveVoiceHandle, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), pedalDownRanges() (+3 more)

### Community 167 - "midi/src/export.ts"
Cohesion: 0.25
Nodes (7): exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), Timed, toTrack()

### Community 168 - "Take"
Cohesion: 0.16
Nodes (18): Beat, beatAt(), tempoAt(), Hand, Instrument, MediaRef, PedalKind, Seconds (+10 more)

### Community 169 - "transcribe/src/index.ts"
Cohesion: 0.31
Nodes (6): NotesOptions, RawNote, rawToNotes(), takeFromTranscription(), toRate(), transcribeTranskun()

### Community 171 - "Instrumento"
Cohesion: 0.22
Nodes (6): Instrumento, Bajo, Bateria, Guitarra, Piano, importarMidi()

### Community 172 - "audio.test.ts"
Cohesion: 0.27
Nodes (7): allSampleNames(), DEFAULT_LAYERS, DEFAULT_SAMPLE_BASE, layerGain(), NAMES, SAMPLED_PITCHES, sampleName()

### Community 173 - "src/worker.ts"
Cohesion: 0.31
Nodes (7): TranscribeOptions, post(), prepare(), run(), TranscribeParams, WorkerMessage, WorkerRequest

### Community 174 - "DetectorBateria"
Cohesion: 0.42
Nodes (3): Bandas, DetectorBateria, Golpe

### Community 175 - "liveMic.ts"
Cohesion: 0.36
Nodes (3): LiveListener, resample(), MODEL_RATE

### Community 176 - "NoteEvent"
Cohesion: 0.16
Nodes (8): ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, IdFactory, KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, NoteEvent, Recorder

### Community 177 - "PedalEvent"
Cohesion: 0.50
Nodes (6): 2026-11-16 · Fase 0 · Cimientos, PedalEvent, isPedalDown(), PEDAL_CC, pedalKindFromCC(), pedalValueAt()

### Community 183 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 186 - "Piano"
Cohesion: 0.23
Nodes (4): ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`, Piano, layerFor(), nearestSample()

### Community 188 - "keyboard-layout.ts"
Cohesion: 0.44
Nodes (6): BLACK, BLACK_OFFSET, BLACK_WIDTH, isBlack(), layoutKeyboard(), normalizeRange()

### Community 195 - "Exportador.kt"
Cohesion: 0.08
Nodes (4): object@L132, Exportador, Paquete, SuperficieGl

### Community 198 - "Formato"
Cohesion: 0.50
Nodes (4): Formato, Cuadrado, Horizontal, Vertical

## Knowledge Gaps
- **59 isolated node(s):** `Sustain`, `Sostenuto`, `UnaCorda`, `Teclado`, `Microfono` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1082 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **75 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BUG-004 · Celular: la app se cierra al convertir una grabación` connect `align.ts` to `Test`?**
  _High betweenness centrality (0.293) - this node is a cross-community bridge._
- **What connects `Sustain`, `Sostenuto`, `UnaCorda` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058173076923076925 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06463414634146342 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Should `ui/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Should `catalog` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._