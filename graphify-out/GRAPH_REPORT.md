# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 282 files · ~153,459 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 75 file(s) not represented in the graph (top: .css 33, .flac 18, .xml 8)

## Summary
- 2888 nodes · 6210 edges · 203 communities (126 shown, 77 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 160 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b88a9805`
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
- main.ts
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
- MicrofonoPantalla.kt
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
- EnVivo.tsx
- Motor
- notation/tsconfig.json
- dev.mjs
- Paquetes
- DECISIONES (ADRs)
- AudioEngine
- typescript
- devDependencies
- notes.ts
- ServicioTrabajos.kt
- scripts
- render/src/index.ts
- edit.ts
- core/src/index.ts
- Tecla
- Impromptu.kt
- mobile/tsconfig.json
- scene.test.ts
- ExportDialog.tsx
- web/vite.config.ts
- transkun/worker.ts
- Nota
- InicioPantalla.kt
- .asignar
- scripts
- Iconos.kt
- Comun.kt
- meter.ts
- ScoreTab.tsx
- Conversiones
- demos-midi.mjs
- scripts
- gradle.mjs
- audio/src/index.ts
- cursor.ts
- CopiarModelos
- Visualizer
- LivePlayer
- @playwright/test
- avance.ts
- visualizer.ts
- midi/src/export.ts
- instrumentos.ts
- model.test.ts
- BasicPitch
- .renderFrame
- Nota
- Sampler.kt
- src/worker.ts
- sources.ts
- liveMic.ts
- transkun/transcribe.ts
- NoteEvent
- .shouldInterceptRequest
- bateria.ts
- .codificarAudio
- key.ts
- keyboard-layout.ts
- Motor.kt
- HeroVisualizer.tsx
- LEEME.md
- Exportador.kt

## God Nodes (most connected - your core abstractions)
1. `useStudio` - 49 edges
2. `Estudio()` - 40 edges
3. `Visualizer` - 39 edges
4. `react` - 36 edges
5. `vitest` - 33 edges
6. `Nota` - 31 edges
7. `createNoteEvent()` - 29 edges
8. `NoteEvent` - 27 edges
9. `Transkun` - 27 edges
10. `catalog` - 27 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `WaitMode`  [INFERRED]
  docs/BITACORA.md → packages/practice/src/wait.ts
- `ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande` --references--> `WaitMode`  [INFERRED]
  docs/DECISIONES.md → packages/practice/src/wait.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `Recorder`  [INFERRED]
  docs/BITACORA.md → packages/midi/src/live/recorder.ts

## Import Cycles
- None detected.

## Communities (203 total, 77 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.07
Nodes (34): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+26 more)

### Community 1 - "src/transcribe.ts"
Cohesion: 0.22
Nodes (16): DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), MODEL_RATE, peakLevel(), prepareTranscriber(), queue (+8 more)

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

### Community 14 - "main.ts"
Cohesion: 0.09
Nodes (14): aplicar(), aTake(), baseMs, compasActual, dibujar(), elegir(), futuro, guardar() (+6 more)

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

### Community 19 - "audio.ts"
Cohesion: 0.12
Nodes (20): zustand@catalog:, AudioState, AudioStatus, AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, ExportDialog() (+12 more)

### Community 20 - "transcribeStore.ts"
Cohesion: 0.07
Nodes (20): tomaDeGolpes(), EstadoMic(), FilaConversion(), LevelMeter(), MODELS, TranscribeStatus(), avances, avanceVisible() (+12 more)

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
Cohesion: 0.14
Nodes (5): Control, EventoMidi, Off, On, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "react"
Cohesion: 0.09
Nodes (24): MAMUT_HERD, MamutHerdSello(), PROPORCION, useReveal(), root, Acerca(), CREDITOS, Inicio() (+16 more)

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
Cohesion: 0.08
Nodes (34): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window (+26 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.08
Nodes (46): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+38 more)

### Community 56 - "align.ts"
Cohesion: 0.10
Nodes (28): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s), BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas, BUGS — trampas conocidas y registro, Registro de bugs (+20 more)

### Community 57 - "BasicPitch"
Cohesion: 0.09
Nodes (7): Etapa, Armando, Escuchando, Esperando, Leyendo, Preparando, Modelos

### Community 60 - "transcribe/package.json"
Cohesion: 0.11
Nodes (20): @impromptu/core@workspace:*, @impromptu/core@workspace:*, dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description (+12 more)

### Community 62 - "musicxml.ts"
Cohesion: 0.16
Nodes (15): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar() (+7 more)

### Community 63 - "video.ts"
Cohesion: 0.07
Nodes (41): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+33 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.06
Nodes (18): Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono (+10 more)

### Community 65 - "edit.ts"
Cohesion: 0.21
Nodes (15): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+7 more)

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
Nodes (17): description, devDependencies, @impromptu/notation@workspace:*, @types/node@catalog:, typescript@catalog:, name, private, type (+9 more)

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

### Community 77 - "MicrofonoPantalla.kt"
Cohesion: 0.13
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "Celular.tsx"
Cohesion: 0.06
Nodes (52): lockOrientation(), Ajustes(), Celular(), Girar(), Grabando(), Inicio(), Miniatura(), Mode (+44 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.13
Nodes (28): createTake(), Seleccion, partitura(), take(), buildScore(), DIV, FIGURES, Measure (+20 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), inside(), ISOLATION, menu(), send(), serve(), ADR-0018

### Community 83 - "import.ts"
Cohesion: 0.09
Nodes (21): midi-file@catalog:, importMidi(), ImportOptions, ImportResult, ImportWarning, instrumentoDePista(), MAJOR_KEYS, meterAndKey() (+13 more)

### Community 84 - "Transport"
Cohesion: 0.10
Nodes (13): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura (+5 more)

### Community 85 - "WaitMode"
Cohesion: 0.11
Nodes (12): rebuild(), ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, note(), createNoteEvent(), nota(), note(), note(), practiceChords() (+4 more)

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 88 - "Sampler"
Cohesion: 0.27
Nodes (3): Salamander, Sampler, Voz

### Community 89 - "LiveSession"
Cohesion: 0.15
Nodes (5): startCameraRecording(), stopCameraRecording(), liveNow(), LiveSession, Clicker

### Community 90 - "Test"
Cohesion: 0.11
Nodes (5): Bandas, DetectorBateria, Golpe, InstrumentosTest, TranskunTest

### Community 91 - "Transkun.kt"
Cohesion: 0.13
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

### Community 95 - "EnVivo.tsx"
Cohesion: 0.17
Nodes (7): BackgroundChoice, BACKGROUNDS, TO_BACKGROUND, engine, live, practice, PracticeHand

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.15
Nodes (9): electron, require, desktopEnv, inherited, installer, r, require, r (+1 more)

### Community 100 - "Paquetes"
Cohesion: 0.07
Nodes (8): Decodificar, Floats, Pcm, Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (17): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-010 · Estilo y brillo de las notas en `VisualProject.effects` (+9 more)

### Community 103 - "typescript"
Cohesion: 0.20
Nodes (10): vite@catalog:, @impromptu/audio@workspace:*, vite@catalog:, devDependencies, @impromptu/audio@workspace:*, typescript@catalog:, vite@catalog:, vitest@catalog: (+2 more)

### Community 104 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, @types/react@catalog:, @types/react-dom@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog:, @types/react, @types/react-dom (+2 more)

### Community 105 - "notes.ts"
Cohesion: 0.21
Nodes (10): countOutOfRange(), fitKeyboardRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount(), NotesOptions, RawNote, rawToNotes() (+2 more)

### Community 106 - "ServicioTrabajos.kt"
Cohesion: 0.05
Nodes (9): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando, ServicioTrabajos, C3 (+1 more)

### Community 107 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 108 - "render/src/index.ts"
Cohesion: 0.19
Nodes (12): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, KeyRect, DEFAULT_THEME, getTheme() (+4 more)

### Community 109 - "edit.ts"
Cohesion: 0.12
Nodes (24): PracticeState, ADR-0012, Hand, chordOptions(), FingeringOptions, FINGERS, HandSize, isBlack() (+16 more)

### Community 110 - "core/src/index.ts"
Cohesion: 0.15
Nodes (15): spell(), ALTERADAS, bateriaXml(), documento(), esc(), Escritura, guitarraXml(), metronomo() (+7 more)

### Community 111 - "Tecla"
Cohesion: 0.09
Nodes (28): formatoTiempo(), AjustesPantalla(), ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), AvanceExportacion(), ExportarPantalla() (+20 more)

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "scene.test.ts"
Cohesion: 0.15
Nodes (17): BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, lowerBound(), noteColor(), NoteIndex, pedalLevels() (+9 more)

### Community 115 - "ExportDialog.tsx"
Cohesion: 0.06
Nodes (23): useAudio, ColorField(), Props, ASPECTS, PHASES, RATES, RESOLUTIONS, State (+15 more)

### Community 116 - "web/vite.config.ts"
Cohesion: 0.16
Nodes (5): brandDir, isolation, brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 117 - "transkun/worker.ts"
Cohesion: 0.20
Nodes (19): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+11 more)

### Community 118 - "Nota"
Cohesion: 0.10
Nodes (5): Formato, Leido, Smf, Grabacion, SmfTest

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.13
Nodes (7): Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), SelectorInstrumento()

### Community 120 - ".asignar"
Cohesion: 0.29
Nodes (5): Bateria, Forma, Guitarra, Pieza, Posicion

### Community 121 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, apk, apk:firmado, partitura, pruebas, typecheck

### Community 123 - "Comun.kt"
Cohesion: 0.11
Nodes (7): Avance(), BotonIcono(), Confirmar(), Encabezado(), Panel(), PedirTexto(), PuntoRec()

### Community 124 - "meter.ts"
Cohesion: 0.33
Nodes (7): ADR-011 · Líneas de compás y pulso en el visualizador, Beat, beatAt(), beatGrid(), tempoAt(), Seconds, TempoPoint

### Community 125 - "ScoreTab.tsx"
Cohesion: 0.07
Nodes (26): opensheetmusicdisplay@2.2.1, opensheetmusicdisplay@2.2.1, download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, VISTAS_TAB (+18 more)

### Community 126 - "Conversiones"
Cohesion: 0.11
Nodes (9): Instrumento, Bajo, Bateria, Guitarra, Piano, AvanceSuave, Conversiones, Terminada (+1 more)

### Community 127 - "demos-midi.mjs"
Cohesion: 0.20
Nodes (10): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+2 more)

### Community 128 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 130 - "audio/src/index.ts"
Cohesion: 0.06
Nodes (32): ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`, ActiveVoice, LiveVoiceHandle, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, Piano, PianoOptions (+24 more)

### Community 131 - "cursor.ts"
Cohesion: 0.16
Nodes (9): aRedondas(), CursorOsmd, FinesDeRenglon, leerRecorrido(), LineaDeLectura, posicionEn(), PuntoCursor, fines (+1 more)

### Community 133 - "Visualizer"
Cohesion: 0.19
Nodes (3): Carriles, VisualSettings, Visualizer

### Community 134 - "LivePlayer"
Cohesion: 0.18
Nodes (4): 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, LivePlayer, Strikeable, PedalKind

### Community 139 - "avance.ts"
Cohesion: 0.25
Nodes (5): AvanceSuave, EtapaDeEspera, fraseDeEspera(), FRASES, textoRestante()

### Community 163 - "visualizer.ts"
Cohesion: 0.17
Nodes (10): ADR-0004, 2026-11-17 · Fase 7 · Tutoriales y práctica, frameLayout(), installLabelFont(), makeBeamTexture(), makeGlowTexture(), makeHaloTexture(), makeNoteTexture() (+2 more)

### Community 164 - "midi/src/export.ts"
Cohesion: 0.19
Nodes (7): exportMidi(), noteEvents(), PEDAL_CC, pedalEvents(), secondsToTicks(), Timed, toTrack()

### Community 167 - "instrumentos.ts"
Cohesion: 0.17
Nodes (8): carriles(), carrilesBateria(), carrilesCuerdas(), COLOR_CUERDA, COLOR_PIEZA, instrumentoDe(), teclas(), indexNotes()

### Community 168 - "model.test.ts"
Cohesion: 0.11
Nodes (30): CHORDS, MELODY, 2026-11-16 · Fase 0 · Cimientos, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, createTrack(), KEYBOARD_61, NoteInput, sortNotes() (+22 more)

### Community 170 - ".renderFrame"
Cohesion: 0.20
Nodes (7): KeyboardLayout, isSounding(), noteRect(), labelFor(), lighten(), luminance(), Pool

### Community 171 - "Nota"
Cohesion: 0.08
Nodes (17): esNegra(), Nota, Origen, Audio, Microfono, Midi, Teclado, Pedal (+9 more)

### Community 173 - "src/worker.ts"
Cohesion: 0.43
Nodes (5): post(), prepare(), run(), WorkerMessage, WorkerRequest

### Community 174 - "sources.ts"
Cohesion: 0.20
Nodes (7): DEMO_PIECES, demoPieces, describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName()

### Community 176 - "transkun/transcribe.ts"
Cohesion: 0.24
Nodes (8): TranscriptionCancelled, PEDAL_OF, toRate(), transcribeTranskun(), TRANSKUN_RATE, TranskunStage, TranskunMessage, TranskunRequest

### Community 177 - "NoteEvent"
Cohesion: 0.25
Nodes (4): IdFactory, NoteEvent, Recorder, toMicro()

### Community 183 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 186 - "key.ts"
Cohesion: 0.20
Nodes (10): correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key, MAJOR, MAJOR_FIFTHS, MINOR (+2 more)

### Community 188 - "keyboard-layout.ts"
Cohesion: 0.42
Nodes (7): BLACK, BLACK_LENGTH, BLACK_OFFSET, BLACK_WIDTH, isBlack(), layoutKeyboard(), normalizeRange()

### Community 193 - "HeroVisualizer.tsx"
Cohesion: 0.40
Nodes (3): createDemoPiece(), HeroVisualizer(), DEFAULT_SETTINGS

## Knowledge Gaps
- **59 isolated node(s):** `Sustain`, `Sostenuto`, `UnaCorda`, `Teclado`, `Microfono` (+54 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1104 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **77 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BUG-004 · Celular: la app se cierra al convertir una grabación` connect `align.ts` to `Test`?**
  _High betweenness centrality (0.306) - this node is a cross-community bridge._
- **What connects `Sustain`, `Sostenuto`, `UnaCorda` to the rest of the system?**
  _59 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07017543859649122 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.10153846153846154 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
- **Should `ui/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Should `catalog` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._