# Graph Report - impromptu  (2026-11-18)

## Corpus Check
- 273 files · ~139,343 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 74 file(s) not represented in the graph (top: .css 32, .flac 18, .xml 8)

## Summary
- 2721 nodes · 5807 edges · 195 communities (128 shown, 67 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 158 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `178f781a`
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
- vitest
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
- Estudio.tsx
- export/src/export.ts
- align.ts
- Transkun.kt
- transcribe/package.json
- transcribe/README.md
- musicxml.ts
- VideoSection.tsx
- MainActivity.kt
- edit.ts
- core/package.json
- desktop/package.json
- PiezaPantalla
- notation/package.json
- midi/src/index.ts
- mobile/package.json
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- SettingsPanel.tsx
- Flujos principales
- studio/live.ts
- score.ts
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
- Recorder
- Motor
- notation/tsconfig.json
- dev.mjs
- Impromptu.kt
- DECISIONES (ADRs)
- Visualizer
- MicrofonoPantalla
- Decodificar.kt
- createNoteEvent
- Impromptu
- ref_node_fs
- render/src/index.ts
- edit.ts
- instrumentos.ts
- Tecla
- Origen
- mobile/tsconfig.json
- scene.test.ts
- AudioEngine
- store.ts
- transkun/worker.ts
- .leer
- InicioPantalla.kt
- LivePlayer
- Renderizador.kt
- Icono
- Comun.kt
- object@L130
- main.ts
- Conversiones
- demos-midi.mjs
- scripts
- visualizer.ts
- LiveListener
- web/vite.config.ts
- CopiarModelos
- .renderFrame
- @playwright/test
- Take
- Exportador.kt
- TranskunTest.kt
- AvanceSuave
- piano.ts
- sintes.ts
- Take
- musicxml.ts
- .iniciar
- scripts
- TipoPedal
- Theme.kt
- Piano
- .shouldInterceptRequest
- notation/src/index.ts
- key.ts
- scene.ts
- avance.ts
- Sintes
- audio/src/index.ts
- keyboard-layout.ts
- bateria.ts
- transkun/transcribe.ts
- src/worker.ts
- scripts
- gradle.mjs
- LEEME.md

## God Nodes (most connected - your core abstractions)
1. `useStudio` - 47 edges
2. `Visualizer` - 36 edges
3. `Estudio()` - 35 edges
4. `react` - 35 edges
5. `createNoteEvent()` - 34 edges
6. `vitest` - 32 edges
7. `NoteEvent` - 29 edges
8. `Transkun` - 27 edges
9. `catalog` - 27 edges
10. `Impromptu` - 25 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-17 · Fase 7 · Tutoriales y práctica` --references--> `WaitMode`  [INFERRED]
  docs/BITACORA.md → packages/practice/src/wait.ts
- `ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande` --references--> `WaitMode`  [INFERRED]
  docs/DECISIONES.md → packages/practice/src/wait.ts
- `2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo` --references--> `LivePlayer`  [INFERRED]
  docs/BITACORA.md → packages/audio/src/live.ts

## Import Cycles
- None detected.

## Communities (195 total, 67 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.07
Nodes (37): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+29 more)

### Community 1 - "transcribe/src/index.ts"
Cohesion: 0.19
Nodes (18): RawNote, DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), MODEL_RATE, peakLevel(), prepareTranscriber() (+10 more)

### Community 2 - "web/package.json"
Cohesion: 0.10
Nodes (26): dependencies, @impromptu/export@workspace:*, @impromptu/media@workspace:*, @impromptu/midi@workspace:*, @impromptu/practice@workspace:*, @impromptu/render@workspace:*, @impromptu/transcribe@workspace:*, @impromptu/ui@workspace:* (+18 more)

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

### Community 14 - "Celular.tsx"
Cohesion: 0.11
Nodes (20): lockOrientation(), Girar(), Grabando(), Inicio(), Miniatura(), Mode, MODES, Screen (+12 more)

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

### Community 19 - "vitest"
Cohesion: 0.15
Nodes (8): DEMO_PIECES, demoPieces, describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName(), vitest

### Community 20 - "transcribeStore.ts"
Cohesion: 0.08
Nodes (23): Ajustes(), tomaDeGolpes(), EstadoMic(), FilaConversion(), LevelMeter(), MicSection(), MODELS, TranscribeStatus() (+15 more)

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
Nodes (25): MAMUT_HERD, MamutHerdSello(), PROPORCION, useReveal(), root, Acerca(), CREDITOS, Celular() (+17 more)

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
Nodes (26): connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction, onMenuAction(), requestConvertAudio(), ADR-0018, Window (+18 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.07
Nodes (45): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+37 more)

### Community 56 - "align.ts"
Cohesion: 0.11
Nodes (26): BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas), align() (+18 more)

### Community 57 - "Transkun.kt"
Cohesion: 0.10
Nodes (6): Etapa, Armando, Escuchando, Esperando, Leyendo, Preparando

### Community 60 - "transcribe/package.json"
Cohesion: 0.11
Nodes (20): @impromptu/core@workspace:*, @impromptu/core@workspace:*, dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description (+12 more)

### Community 62 - "musicxml.ts"
Cohesion: 0.15
Nodes (15): HIHAT_ABIERTO, PiezaBateria, PIEZAS_BATERIA, POR_NOTA, Afinacion, AFINACIONES, agrupar(), asignarTrastes() (+7 more)

### Community 63 - "VideoSection.tsx"
Cohesion: 0.12
Nodes (28): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, CameraState, chunks (+20 more)

### Community 64 - "MainActivity.kt"
Cohesion: 0.06
Nodes (20): Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono (+12 more)

### Community 65 - "edit.ts"
Cohesion: 0.24
Nodes (15): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+7 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.14
Nodes (15): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+7 more)

### Community 68 - "PiezaPantalla"
Cohesion: 0.18
Nodes (10): formatoTiempo(), Formato, Cuadrado, Horizontal, Vertical, VistaPrevia(), GrabarPantalla(), BarraTiempo() (+2 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "midi/src/index.ts"
Cohesion: 0.18
Nodes (14): KeyboardRange, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE, profileFor(), PROFILES (+6 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.12
Nodes (19): description, devDependencies, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, vite@catalog:, name (+11 more)

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
Cohesion: 0.11
Nodes (16): useAudio, ColorField(), Props, AFINACIONES_UI, BACKGROUNDS, HAND_SIZES, KEYBOARDS, LAYOUTS (+8 more)

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "studio/live.ts"
Cohesion: 0.08
Nodes (33): startCameraRecording(), stopCameraRecording(), conInstrumento(), LiveState, MidiStatus, refreshTakes(), KeyboardSection(), METER_OPTIONS (+25 more)

### Community 81 - "score.ts"
Cohesion: 0.16
Nodes (14): buildScore(), DIV, FIGURES, Measure, measureEvents(), mergePedalChanges(), NoteType, quantizeOnsets() (+6 more)

### Community 82 - "main.cts"
Cohesion: 0.31
Nodes (7): createWindow(), inside(), ISOLATION, menu(), send(), serve(), ADR-0018

### Community 83 - "import.ts"
Cohesion: 0.09
Nodes (21): midi-file@catalog:, importMidi(), ImportOptions, ImportResult, ImportWarning, instrumentoDePista(), MAJOR_KEYS, meterAndKey() (+13 more)

### Community 84 - "Transport"
Cohesion: 0.10
Nodes (13): Transport, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1), 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura (+5 more)

### Community 85 - "cursor.ts"
Cohesion: 0.17
Nodes (8): CursorOsmd, FinesDeRenglon, leerRecorrido(), LineaDeLectura, posicionEn(), PuntoCursor, fines, puntos

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.22
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 88 - "Sampler"
Cohesion: 0.24
Nodes (3): Salamander, Sampler, Voz

### Community 90 - "typescript"
Cohesion: 0.20
Nodes (10): @impromptu/audio@workspace:*, typescript@catalog:, typescript@catalog:, devDependencies, @impromptu/audio@workspace:*, typescript@catalog:, vite@catalog:, vitest@catalog: (+2 more)

### Community 91 - "Transkun.kt"
Cohesion: 0.14
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

### Community 95 - "Recorder"
Cohesion: 0.24
Nodes (4): 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, IdFactory, Recorder, toMicro()

### Community 97 - "Motor"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.15
Nodes (9): electron, require, desktopEnv, inherited, installer, r, require, r (+1 more)

### Community 100 - "Impromptu.kt"
Cohesion: 0.14
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.09
Nodes (24): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-010 · Estilo y brillo de las notas en `VisualProject.effects` (+16 more)

### Community 102 - "Visualizer"
Cohesion: 0.16
Nodes (5): Carriles, noteColor(), VisualSettings, hexToNumber(), Visualizer

### Community 103 - "MicrofonoPantalla"
Cohesion: 0.22
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 104 - "Decodificar.kt"
Cohesion: 0.22
Nodes (3): Decodificar, Floats, Pcm

### Community 105 - "createNoteEvent"
Cohesion: 0.11
Nodes (25): CHORDS, createDemoPiece(), MELODY, HeroVisualizer(), ids(), piece(), note(), createNoteEvent() (+17 more)

### Community 107 - "ref_node_fs"
Cohesion: 0.29
Nodes (3): brand, outDir, [width = 1920, height = 1080, fps = 60]

### Community 108 - "render/src/index.ts"
Cohesion: 0.23
Nodes (11): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, DEFAULT_THEME, getTheme(), Theme (+3 more)

### Community 109 - "edit.ts"
Cohesion: 0.08
Nodes (32): PracticeState, rebuild(), ADR-0012, ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, Finger, NoteEvent, chordOptions(), FingeringOptions (+24 more)

### Community 110 - "instrumentos.ts"
Cohesion: 0.15
Nodes (9): carriles(), carrilesBateria(), carrilesCuerdas(), COLOR_CUERDA, COLOR_PIEZA, instrumentoDe(), teclas(), KeyRect (+1 more)

### Community 111 - "Tecla"
Cohesion: 0.09
Nodes (17): ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), Avance(), AvanceExportacion(), Cabeza(), PaquetesPantalla() (+9 more)

### Community 112 - "Origen"
Cohesion: 0.15
Nodes (10): Nota, Origen, Audio, Microfono, Midi, Teclado, Pedal, Pieza (+2 more)

### Community 113 - "mobile/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 114 - "scene.test.ts"
Cohesion: 0.29
Nodes (9): FrameLayout, kb, layout, burstSeed(), noteSparks(), rng(), Spark, SPARK_LIFE (+1 more)

### Community 116 - "store.ts"
Cohesion: 0.05
Nodes (45): Pieza(), BackgroundChoice, BACKGROUNDS, TO_BACKGROUND, AudioState, AudioStatus, engine, AudioSection() (+37 more)

### Community 117 - "transkun/worker.ts"
Cohesion: 0.20
Nodes (19): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+11 more)

### Community 118 - ".leer"
Cohesion: 0.24
Nodes (3): Formato, Leido, Smf

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.14
Nodes (6): Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe()

### Community 120 - "LivePlayer"
Cohesion: 0.20
Nodes (3): LivePlayer, Strikeable, PedalKind

### Community 121 - "Renderizador.kt"
Cohesion: 0.19
Nodes (3): esNegra(), Opciones, Renderizador

### Community 123 - "Comun.kt"
Cohesion: 0.14
Nodes (5): BotonIcono(), Confirmar(), Encabezado(), Panel(), PedirTexto()

### Community 125 - "main.ts"
Cohesion: 0.13
Nodes (9): aTake(), baseMs, cuadro(), mostrar(), PiezaWeb, Puente, ADR-0019, aRedondas() (+1 more)

### Community 126 - "Conversiones"
Cohesion: 0.12
Nodes (4): Piezas, Conversiones, Terminada, TrabajoConversion

### Community 127 - "demos-midi.mjs"
Cohesion: 0.20
Nodes (10): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+2 more)

### Community 128 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 129 - "visualizer.ts"
Cohesion: 0.17
Nodes (10): ADR-0004, 2026-11-17 · Fase 7 · Tutoriales y práctica, frameLayout(), installLabelFont(), makeBeamTexture(), makeGlowTexture(), makeHaloTexture(), makeNoteTexture() (+2 more)

### Community 131 - "web/vite.config.ts"
Cohesion: 0.12
Nodes (13): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, vite-plugin-pwa@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog:, brandDir (+5 more)

### Community 133 - ".renderFrame"
Cohesion: 0.21
Nodes (6): isSounding(), pedalLevels(), labelFor(), lighten(), luminance(), Pool

### Community 168 - "Take"
Cohesion: 0.13
Nodes (23): 2026-11-16 · Fase 0 · Cimientos, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, KEYBOARD_61, NoteInput, sortPedals(), ADR-0003, WithCrypto, Instrument (+15 more)

### Community 169 - "Exportador.kt"
Cohesion: 0.14
Nodes (4): Banco, Limitador, Exportador, Paquete

### Community 172 - "piano.ts"
Cohesion: 0.27
Nodes (11): ActiveVoice, MAX_VOICES, allSampleNames(), DEFAULT_LAYERS, DEFAULT_SAMPLE_BASE, layerFor(), layerGain(), NAMES (+3 more)

### Community 173 - "sintes.ts"
Cohesion: 0.19
Nodes (10): Activa, cuerda(), golpe(), MUESTRAS_BATERIA, pasoAlto(), pasoBajo(), ruido(), Timbre (+2 more)

### Community 174 - "Take"
Cohesion: 0.16
Nodes (13): download(), ScoreTab(), midiFileName(), saveMidi(), Take, exportMidi(), noteEvents(), PEDAL_CC (+5 more)

### Community 175 - "musicxml.ts"
Cohesion: 0.25
Nodes (15): piezaDeNota(), spell(), ALTERADAS, bateriaXml(), documento(), esc(), Escritura, guitarraXml() (+7 more)

### Community 176 - ".iniciar"
Cohesion: 0.20
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 177 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, compile, dev, dist, electron:get, typecheck

### Community 178 - "TipoPedal"
Cohesion: 0.33
Nodes (4): TipoPedal, Sostenuto, Sustain, UnaCorda

### Community 182 - "notation/src/index.ts"
Cohesion: 0.39
Nodes (10): ScoreOptions, alignPhase(), Beats, beatsOf(), estimateTempo(), gridFit(), onsetEnvelope(), steadyBeats() (+2 more)

### Community 183 - "key.ts"
Cohesion: 0.20
Nodes (10): correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key, MAJOR, MAJOR_FIFTHS, MINOR (+2 more)

### Community 184 - "scene.ts"
Cohesion: 0.22
Nodes (9): BLACK_LENGTH, KeyboardLayout, BASE_LOOKAHEAD, Direction, forEachNoteIn(), lowerBound(), NoteIndex, noteRect() (+1 more)

### Community 185 - "avance.ts"
Cohesion: 0.25
Nodes (5): AvanceSuave, EtapaDeEspera, fraseDeEspera(), FRASES, textoRestante()

### Community 187 - "audio/src/index.ts"
Cohesion: 0.29
Nodes (7): LiveVoiceHandle, LoadProgress, PANEL_SUSTAIN_MAX, PianoOptions, takeVoices(), rangeAt(), resolveVoices()

### Community 188 - "keyboard-layout.ts"
Cohesion: 0.50
Nodes (6): BLACK, BLACK_OFFSET, BLACK_WIDTH, isBlack(), layoutKeyboard(), normalizeRange()

### Community 189 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 190 - "transkun/transcribe.ts"
Cohesion: 0.29
Nodes (7): PEDAL_OF, toRate(), transcribeTranskun(), TRANSKUN_RATE, TranskunStage, TranskunMessage, TranskunRequest

### Community 191 - "src/worker.ts"
Cohesion: 0.43
Nodes (5): post(), prepare(), run(), WorkerMessage, WorkerRequest

### Community 192 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, apk, apk:firmado, partitura, pruebas, typecheck

## Knowledge Gaps
- **51 isolated node(s):** `Ia`, `Quieta`, `On`, `Partitura`, `Presentacion` (+46 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1049 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **67 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BUG-004 · Celular: la app se cierra al convertir una grabación` connect `align.ts` to `TranskunTest.kt`?**
  _High betweenness centrality (0.295) - this node is a cross-community bridge._
- **What connects `Ia`, `Quieta`, `On` to the rest of the system?**
  _51 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0701344243132671 - nodes in this community are weakly interconnected._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09686609686609686 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `ui/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Should `catalog` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._