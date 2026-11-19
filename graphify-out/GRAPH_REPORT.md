# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 278 files · ~148,745 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 75 file(s) not represented in the graph (top: .css 33, .flac 18, .xml 8)

## Summary
- 2837 nodes · 6079 edges · 205 communities (125 shown, 80 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `653aaade`
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
- Celular.tsx
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
- Estudio.tsx
- export/src/export.ts
- align.ts
- Transkun.kt
- transcribe/package.json
- transcribe/README.md
- musicxml.ts
- store.ts
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
- ColaPanel.kt
- Flujos principales
- studio/live.ts
- notation/src/index.ts
- main.cts
- import.ts
- Transport
- cursor.ts
- compilerOptions
- Estado
- Sampler
- LiveSession
- typescript
- Transkun.kt
- compilerOptions
- build
- transcribe/tsconfig.json
- musicxml.ts
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
- Conversiones.kt
- mobile/tsconfig.json
- scene.test.ts
- SettingsPanel.tsx
- web/vite.config.ts
- transkun/worker.ts
- Nota
- InicioPantalla.kt
- .asignar
- Renderizador
- Icono
- Comun.kt
- object@L132
- ScoreTab.tsx
- Conversiones
- demos-midi.mjs
- scripts
- visualizer.ts
- sintes.ts
- web/vite.config.ts
- CopiarModelos
- .renderFrame
- LivePlayer
- @playwright/test
- .iniciar
- audio/src/index.ts
- midi/src/export.ts
- Take
- Exportador
- TranskunTest.kt
- .leer
- audio.test.ts
- BasicPitch
- DetectorBateria
- key.ts
- NoteEvent
- scripts
- .shouldInterceptRequest
- meter.ts
- Sintes
- Piano
- keyboard-layout.ts
- Motor.kt
- Sampler
- Etapa
- scripts
- gradle.mjs
- LEEME.md
- Exportador.kt
- TipoPedal
- EventoMidi
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
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `WaitMode`  [INFERRED]
  docs/BITACORA.md → packages/practice/src/wait.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `frameLayout()`  [INFERRED]
  docs/BITACORA.md → packages/render/src/scene.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `Recorder`  [INFERRED]
  docs/BITACORA.md → packages/midi/src/live/recorder.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `sortNotes()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (205 total, 80 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.07
Nodes (34): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+26 more)

### Community 1 - "transcribe/src/index.ts"
Cohesion: 0.06
Nodes (42): LiveListener, resample(), AvanceSuave, EtapaDeEspera, fraseDeEspera(), FRASES, textoRestante(), Bandas (+34 more)

### Community 2 - "web/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @impromptu/export@workspace:*, @impromptu/media@workspace:*, @impromptu/midi@workspace:*, @impromptu/practice@workspace:*, @impromptu/render@workspace:*, @impromptu/transcribe@workspace:*, @impromptu/ui@workspace:* (+17 more)

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

### Community 14 - "Celular.tsx"
Cohesion: 0.11
Nodes (20): lockOrientation(), Ajustes(), Celular(), Girar(), Grabando(), Miniatura(), Mode, MODES (+12 more)

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
Cohesion: 0.11
Nodes (20): Inicio(), subscribe(), fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES (+12 more)

### Community 19 - "audio.ts"
Cohesion: 0.11
Nodes (9): zustand@catalog:, AudioState, AudioStatus, practice, PracticeHand, PracticeState, transport, WaitStats (+1 more)

### Community 20 - "transcribeStore.ts"
Cohesion: 0.07
Nodes (21): conInstrumento(), tomaDeGolpes(), EstadoMic(), FilaConversion(), LevelMeter(), MODELS, avances, avanceVisible() (+13 more)

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
Cohesion: 0.08
Nodes (29): react-router@catalog:, MAMUT_HERD, MamutHerdSello(), PROPORCION, HeroVisualizer(), useReveal(), root, Acerca() (+21 more)

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
Cohesion: 0.06
Nodes (41): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window (+33 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.08
Nodes (46): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+38 more)

### Community 56 - "align.ts"
Cohesion: 0.09
Nodes (34): analyzeAudio(), attachTakeAudio(), OwnAudio, OwnAudioState, SyncQuality, BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app (+26 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.11
Nodes (20): @impromptu/core@workspace:*, @impromptu/core@workspace:*, dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description (+12 more)

### Community 62 - "musicxml.ts"
Cohesion: 0.15
Nodes (16): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar() (+8 more)

### Community 63 - "store.ts"
Cohesion: 0.05
Nodes (57): AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, CalibrateDialog(), NAMES, noteName(), PitchField() (+49 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.06
Nodes (12): Ajustes, Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono, Pantalla (+4 more)

### Community 65 - "edit.ts"
Cohesion: 0.21
Nodes (17): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+9 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+7 more)

### Community 68 - "Sintes"
Cohesion: 0.24
Nodes (7): Sintes, Timbre, Acero, Bajo, Electrica, Nylon, Voz

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "midi/src/index.ts"
Cohesion: 0.18
Nodes (14): KeyboardRange, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE, profileFor(), PROFILES (+6 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.13
Nodes (17): description, devDependencies, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, name, private (+9 more)

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

### Community 77 - "ColaPanel.kt"
Cohesion: 0.15
Nodes (5): ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), AvanceSuave

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "studio/live.ts"
Cohesion: 0.09
Nodes (31): startCameraRecording(), stopCameraRecording(), LiveState, MidiStatus, readRecordMic(), refreshTakes(), METER_OPTIONS, MetronomeControls() (+23 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.14
Nodes (28): quantizedTake(), note(), buildScore(), DIV, FIGURES, Measure, measureEvents(), mergePedalChanges() (+20 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), inside(), ISOLATION, menu(), send(), serve(), ADR-0018

### Community 83 - "import.ts"
Cohesion: 0.08
Nodes (21): midi-file@catalog:, importMidi(), ImportOptions, ImportResult, ImportWarning, instrumentoDePista(), MAJOR_KEYS, meterAndKey() (+13 more)

### Community 84 - "Transport"
Cohesion: 0.10
Nodes (14): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura (+6 more)

### Community 85 - "cursor.ts"
Cohesion: 0.16
Nodes (9): aRedondas(), CursorOsmd, FinesDeRenglon, leerRecorrido(), LineaDeLectura, posicionEn(), PuntoCursor, fines (+1 more)

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 90 - "typescript"
Cohesion: 0.20
Nodes (10): vite@catalog:, @impromptu/audio@workspace:*, vite@catalog:, devDependencies, @impromptu/audio@workspace:*, typescript@catalog:, vite@catalog:, vitest@catalog: (+2 more)

### Community 91 - "Transkun.kt"
Cohesion: 0.12
Nodes (6): Cancelada, Constantes, Decodificacion, Espectro, Evento, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "build"
Cohesion: 0.12
Nodes (17): build, appId, copyright, directories, extraResources, files, nsis, productName (+9 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "musicxml.ts"
Cohesion: 0.22
Nodes (13): spell(), ALTERADAS, bateriaXml(), documento(), esc(), Escritura, guitarraXml(), metronomo() (+5 more)

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 100 - "Paquetes"
Cohesion: 0.23
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (17): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-010 · Estilo y brillo de las notas en `VisualProject.effects` (+9 more)

### Community 102 - "Visualizer"
Cohesion: 0.15
Nodes (4): noteColor(), VisualSettings, hexToNumber(), Visualizer

### Community 103 - "MicrofonoPantalla"
Cohesion: 0.22
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 104 - "Decodificar.kt"
Cohesion: 0.18
Nodes (3): Decodificar, Floats, Pcm

### Community 105 - "createNoteEvent"
Cohesion: 0.14
Nodes (22): CHORDS, createDemoPiece(), MELODY, piece(), 2026-11-16 · Fase 0 · Cimientos, createNoteEvent(), createTake(), createTrack() (+14 more)

### Community 107 - "Pieza"
Cohesion: 0.15
Nodes (6): Origen, Audio, Microfono, Midi, Teclado, Pieza

### Community 108 - "render/src/index.ts"
Cohesion: 0.17
Nodes (12): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, DEFAULT_THEME, getTheme(), Theme (+4 more)

### Community 109 - "edit.ts"
Cohesion: 0.08
Nodes (28): rebuild(), ADR-0012, ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, chordOptions(), FingeringOptions, FINGERS, HandSize, isBlack() (+20 more)

### Community 110 - "instrumentos.ts"
Cohesion: 0.27
Nodes (9): Carriles, carriles(), carrilesBateria(), carrilesCuerdas(), COLOR_CUERDA, COLOR_PIEZA, teclas(), KeyboardLayout (+1 more)

### Community 111 - "Tecla"
Cohesion: 0.09
Nodes (32): formatoTiempo(), App(), Navegador, AjustesPantalla(), Avance(), BotonIcono(), Confirmar(), Encabezado() (+24 more)

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "scene.test.ts"
Cohesion: 0.17
Nodes (13): BLACK_LENGTH, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, isSounding(), lowerBound(), NoteIndex (+5 more)

### Community 115 - "SettingsPanel.tsx"
Cohesion: 0.07
Nodes (18): AudioEngine, lowerBound(), useAudio, ColorField(), Props, AFINACIONES_UI, BACKGROUNDS, HAND_SIZES (+10 more)

### Community 116 - "web/vite.config.ts"
Cohesion: 0.13
Nodes (7): r, { version }, brandDir, isolation, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 117 - "transkun/worker.ts"
Cohesion: 0.18
Nodes (21): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+13 more)

### Community 118 - "Nota"
Cohesion: 0.29
Nodes (4): Nota, Pedal, Grabacion, SmfTest

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.12
Nodes (7): Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), SelectorInstrumento()

### Community 120 - ".asignar"
Cohesion: 0.32
Nodes (5): Bateria, Forma, Guitarra, Pieza, Posicion

### Community 121 - "Renderizador"
Cohesion: 0.23
Nodes (3): esNegra(), Opciones, Renderizador

### Community 122 - "Icono"
Cohesion: 0.14
Nodes (3): Punto(), Icono(), Iconos

### Community 125 - "ScoreTab.tsx"
Cohesion: 0.08
Nodes (15): aTake(), baseMs, mostrar(), PiezaWeb, Puente, download(), Meter, METERS (+7 more)

### Community 126 - "Conversiones"
Cohesion: 0.12
Nodes (8): Instrumento, Bajo, Bateria, Guitarra, Piano, Conversiones, Terminada, TrabajoConversion

### Community 127 - "demos-midi.mjs"
Cohesion: 0.20
Nodes (10): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+2 more)

### Community 128 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 129 - "visualizer.ts"
Cohesion: 0.18
Nodes (14): frameLayout(), burstSeed(), noteSparks(), rng(), Spark, SPARK_LIFE, SparkOptions, installLabelFont() (+6 more)

### Community 130 - "sintes.ts"
Cohesion: 0.18
Nodes (10): Activa, cuerda(), golpe(), MUESTRAS_BATERIA, pasoAlto(), pasoBajo(), ruido(), Timbre (+2 more)

### Community 131 - "web/vite.config.ts"
Cohesion: 0.18
Nodes (11): devDependencies, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog:, @types/react (+3 more)

### Community 133 - ".renderFrame"
Cohesion: 0.24
Nodes (5): noteRect(), labelFor(), lighten(), luminance(), Pool

### Community 134 - "LivePlayer"
Cohesion: 0.19
Nodes (3): 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, LivePlayer, Strikeable

### Community 163 - ".iniciar"
Cohesion: 0.21
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 164 - "audio/src/index.ts"
Cohesion: 0.27
Nodes (11): ActiveVoice, LiveVoiceHandle, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), pedalDownRanges() (+3 more)

### Community 167 - "midi/src/export.ts"
Cohesion: 0.20
Nodes (7): exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), Timed, toTrack()

### Community 168 - "Take"
Cohesion: 0.14
Nodes (21): KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, Instrument, MediaRef, PedalEvent, PedalKind (+13 more)

### Community 169 - "Exportador"
Cohesion: 0.16
Nodes (4): Banco, Limitador, Exportador, Paquete

### Community 171 - ".leer"
Cohesion: 0.25
Nodes (3): Formato, Leido, Smf

### Community 172 - "audio.test.ts"
Cohesion: 0.21
Nodes (10): note(), allSampleNames(), DEFAULT_LAYERS, DEFAULT_SAMPLE_BASE, layerFor(), layerGain(), NAMES, nearestSample() (+2 more)

### Community 174 - "DetectorBateria"
Cohesion: 0.42
Nodes (3): Bandas, DetectorBateria, Golpe

### Community 175 - "key.ts"
Cohesion: 0.20
Nodes (10): correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key, MAJOR, MAJOR_FIFTHS, MINOR (+2 more)

### Community 176 - "NoteEvent"
Cohesion: 0.25
Nodes (5): ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, IdFactory, NoteEvent, Recorder, Step

### Community 177 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 183 - "meter.ts"
Cohesion: 0.33
Nodes (7): ADR-011 · Líneas de compás y pulso en el visualizador, Beat, beatAt(), beatGrid(), tempoAt(), Seconds, TempoPoint

### Community 188 - "keyboard-layout.ts"
Cohesion: 0.26
Nodes (8): instrumentoDe(), BLACK, BLACK_OFFSET, BLACK_WIDTH, isBlack(), layoutKeyboard(), normalizeRange(), indexNotes()

### Community 191 - "Etapa"
Cohesion: 0.29
Nodes (6): Etapa, Armando, Escuchando, Esperando, Leyendo, Preparando

### Community 192 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, apk, apk:firmado, partitura, pruebas, typecheck

### Community 196 - "TipoPedal"
Cohesion: 0.33
Nodes (4): TipoPedal, Sostenuto, Sustain, UnaCorda

### Community 197 - "EventoMidi"
Cohesion: 0.33
Nodes (4): Control, EventoMidi, Off, On

### Community 198 - "Formato"
Cohesion: 0.50
Nodes (4): Formato, Cuadrado, Horizontal, Vertical

## Knowledge Gaps
- **59 isolated node(s):** `Quieta`, `Horizontal`, `Vertical`, `Cuadrado`, `ADR-0019` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1079 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **80 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BUG-004 · Celular: la app se cierra al convertir una grabación` connect `align.ts` to `TranskunTest.kt`?**
  _High betweenness centrality (0.304) - this node is a cross-community bridge._
- **What connects `Quieta`, `Horizontal`, `Vertical` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06704260651629072 - nodes in this community are weakly interconnected._
- **Should `transcribe/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10153846153846154 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Should `ui/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._