# Graph Report - impromptu  (2026-11-25)

## Corpus Check
- 330 files · ~203,376 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 236 file(s) not represented in the graph (top: .flac 175, .css 36, .xml 8)

## Summary
- 3156 nodes · 7537 edges · 190 communities (133 shown, 57 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 147 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba4fe3e2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/src/index.ts
- separar/worker.ts
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
- Estudio.tsx
- media/package.json
- midi/package.json
- render/package.json
- transcribe/src/index.ts
- Visualizer
- Celular.tsx
- VERIFICACIONES — antes de decir "listo"
- pages.yml
- web/tsconfig.json
- practice/tsconfig.json
- ui/tsconfig.json
- Cómo empezar (para Jacobo)
- HERRAMIENTAS — Graphify, plugins y skills
- INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026)
- AGENTS.md — Impromptu
- Teclado.kt
- vercel.json
- .renderFrame
- audio/tsconfig.json
- core/tsconfig.json
- export/tsconfig.json
- media/tsconfig.json
- midi/tsconfig.json
- render/tsconfig.json
- .prettierrc.json
- .claude/CLAUDE.md
- LogoIntro.tsx
- audio/README.md
- export/README.md
- media/README.md
- midi/README.md
- render/README.md
- desktop/README.md
- estilos-nota.ts
- audio.ts
- export/src/export.ts
- align.ts
- HojaVideo.kt
- transcribe/package.json
- transcribe/README.md
- LiveSession
- visualizer.ts
- Transkun.kt
- store.ts
- core/package.json
- desktop/package.json
- Instrumento
- notation/package.json
- import.ts
- mobile/package.json
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DESIGN — Identidad de Impromptu
- LICENCIAS — qué se puede usar
- impromptu
- scripts
- PartituraPantalla.kt
- Flujos principales
- NoteEvent
- notation/src/index.ts
- main.cts
- transkun/transcribe.ts
- DetectorBateria
- Comun.kt
- compilerOptions
- Estado
- Iconos.kt
- Secuencia
- Presentacion.kt
- Transkun.kt
- compilerOptions
- Piano
- transcribe/tsconfig.json
- createNoteEvent
- Nota
- notation/tsconfig.json
- dev.mjs
- edit.ts
- DECISIONES (ADRs)
- Etapa
- web/vite.config.ts
- MuestrasTest.kt
- AudioEngine
- LivePlayer
- SettingsPanel.tsx
- ServicioTrabajos.kt
- Nota
- ColaPanel.kt
- export/package.json
- ExportarPantalla.kt
- web/package.json
- core/src/index.ts
- ScoreTab.tsx
- Landing.tsx
- colores.ts
- BasicPitch
- InicioPantalla.kt
- Impromptu.kt
- Pieza
- Transport
- Impromptu
- LivePanel.tsx
- transcribeStore.ts
- Conversiones
- demos-midi.mjs
- @impromptu/media@workspace:*
- @impromptu/notation@workspace:*
- audio/src/index.ts
- LineaDeLectura
- CopiarModelos
- render/src/index.ts
- fingering.ts
- @impromptu/transcribe@workspace:*
- .iniciar
- @playwright/test
- web/vite.config.ts
- opensheetmusicdisplay@2.2.1
- Smf
- Plantilla
- notes.ts
- GrabarPantalla.kt
- Error: Impromptu se cierra en la cola de conversiones (índice -1)
- editor.ts
- .normalizar
- MicrofonoPantalla.kt
- @impromptu/export@workspace:*
- @impromptu/render@workspace:*
- Sintes
- Muestras.kt
- scripts
- core/src/index.ts
- Salamander
- WaitMode
- practice/src/index.ts
- InstrumentosTest
- muestras.mjs
- .asignar
- visualizer.ts
- Puente
- PiezaPantalla.kt
- keyboard.ts
- musicxml.ts
- Separador.kt
- LEEME.md
- Exportador.kt
- bateria.ts
- Take
- MainActivity.kt
- avance.ts

## God Nodes (most connected - your core abstractions)
1. `Visualizer` - 64 edges
2. `createNoteEvent()` - 60 edges
3. `Estudio()` - 55 edges
4. `useStudio` - 52 edges
5. `Take` - 50 edges
6. `NoteEvent` - 48 edges
7. `Button()` - 47 edges
8. `createTrack()` - 43 edges
9. `Nota` - 41 edges
10. `createTake()` - 40 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-17 · Fase 5 · Audio a notas` --references--> `transcribe()`  [INFERRED]
  docs/BITACORA.md → packages/transcribe/src/transcribe.ts
- `2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería` --references--> `ManosYRasgueoTest`  [INFERRED]
  docs/BITACORA.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/ManosYRasgueoTest.kt
- `2026-11-19 (tarde) · Todo al celular, video en segundo plano, separar instrumentos y compilados` --references--> `SeparadorTest`  [INFERRED]
  docs/BITACORA.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/SeparadorTest.kt
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `sortPedals()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (190 total, 57 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (23): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+15 more)

### Community 1 - "separar/worker.ts"
Cohesion: 0.22
Nodes (18): BINS, cuadrosDe(), espectroCuadro(), F, Fft, HOP, mascara(), N_FFT (+10 more)

### Community 2 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @impromptu/core@workspace:*, @impromptu/practice@workspace:*, @impromptu/ui@workspace:*, lucide-react@catalog:, react@catalog:, react-dom@catalog:, react-router@catalog: (+6 more)

### Community 3 - "package.json"
Cohesion: 0.09
Nodes (28): description, devDependencies, eslint@catalog:, @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, @playwright/test@catalog:, prettier@catalog: (+20 more)

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

### Community 14 - "Estudio.tsx"
Cohesion: 0.16
Nodes (22): ASPECTS, ESCUCHAR, Estudio(), NOMBRE_HOJA, ScoreTab, SPEEDS, tabsPara(), EditBar() (+14 more)

### Community 15 - "media/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 16 - "midi/package.json"
Cohesion: 0.11
Nodes (20): dependencies, @impromptu/core@workspace:*, midi-file@catalog:, description, devDependencies, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+12 more)

### Community 17 - "render/package.json"
Cohesion: 0.12
Nodes (18): dependencies, @impromptu/core@workspace:*, pixi.js@catalog:, description, devDependencies, typescript@catalog:, vitest@catalog:, exports (+10 more)

### Community 18 - "transcribe/src/index.ts"
Cohesion: 0.14
Nodes (24): RawNote, DEFAULT_PARAMS, dropWorker(), getWorker(), isTranscriberReady(), MODEL_RATE, PARAMS_CUERDAS, peakLevel() (+16 more)

### Community 19 - "Visualizer"
Cohesion: 0.10
Nodes (8): CameraState, CameraVideo, KeyboardCalibration, Rasgueo, indexNotes(), VisualSettings, getTheme(), Visualizer

### Community 20 - "Celular.tsx"
Cohesion: 0.09
Nodes (34): onMenuAction(), lockOrientation(), Girar(), Grabando(), Miniatura(), Mode, MODES, Pieza() (+26 more)

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

### Community 30 - "Teclado.kt"
Cohesion: 0.12
Nodes (6): Control, EventoMidi, Grabacion, Off, On, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - ".renderFrame"
Cohesion: 0.15
Nodes (8): noteRect(), hexToNumber(), azar(), hashId(), lighten(), luminance(), makeCristalTexture(), makeRoundedNoteTexture()

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

### Community 41 - "LogoIntro.tsx"
Cohesion: 0.13
Nodes (17): fallDur(), FALLING_NOTES, iconKeyX(), KEY_STYLES, keyUnderLetter(), LETTER_STYLES, LETTERS, LogoIntroProps (+9 more)

### Community 48 - "estilos-nota.ts"
Cohesion: 0.12
Nodes (18): aclarar(), Ctx, DELGADEZ, dibujar(), esEstiloNuevo(), EstiloNuevo, ESTILOS_NUEVOS, fract() (+10 more)

### Community 54 - "audio.ts"
Cohesion: 0.20
Nodes (9): BackgroundChoice, BACKGROUNDS, TO_BACKGROUND, AudioState, AudioStatus, engine, NOMBRE_BANCO, live (+1 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.21
Nodes (27): chooseFormat(), DecodedFrame, ExportError, ExportFailure, ExportOptions, ExportProgress, ExportResult, exportVideo() (+19 more)

### Community 56 - "align.ts"
Cohesion: 0.09
Nodes (30): sonidos(), BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s), BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas, BUG-007 · En la web, la batería grabada nunca se escuchaba (sonaba la sintetizada) (+22 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.08
Nodes (32): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, @impromptu/audio@workspace:* (+24 more)

### Community 62 - "LiveSession"
Cohesion: 0.12
Nodes (4): liveNow(), LiveSession, WebMidiError, WebMidiInput

### Community 63 - "visualizer.ts"
Cohesion: 0.13
Nodes (19): Beat, rasgueos(), nota(), pulsos, COLOR_BAQUETA, installLabelFont(), labelFor(), makeBeamTexture() (+11 more)

### Community 65 - "store.ts"
Cohesion: 0.06
Nodes (64): AudioSection(), fmt(), openOwnAudio(), QUALITY_TEXT, CalibrateDialog(), NAMES, noteName(), PitchField() (+56 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.05
Nodes (38): build, appId, copyright, directories, extraResources, files, nsis, productName (+30 more)

### Community 68 - "Instrumento"
Cohesion: 0.15
Nodes (12): Sintes, Timbre, Acero, Bajo, Electrica, Nylon, Voz, Instrumento (+4 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "import.ts"
Cohesion: 0.12
Nodes (17): sortPedals(), importMidi(), instrumentoDePista(), MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack(), sameNotes() (+9 more)

### Community 71 - "mobile/package.json"
Cohesion: 0.10
Nodes (24): description, devDependencies, @impromptu/core@workspace:*, @impromptu/notation@workspace:*, opensheetmusicdisplay@2.2.1, @types/node@catalog:, typescript@catalog:, vite@catalog: (+16 more)

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

### Community 77 - "PartituraPantalla.kt"
Cohesion: 0.14
Nodes (5): BarraVideo(), compartirArchivo(), compartirTexto(), PartituraPantalla(), WebViewClient

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "NoteEvent"
Cohesion: 0.17
Nodes (17): IdFactory, KeyboardRange, NoteEvent, ImportOptions, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile (+9 more)

### Community 81 - "notation/src/index.ts"
Cohesion: 0.09
Nodes (39): 2026-11-18 (tarde) · Pedidos de Jacobo tras probar la app, Seleccion, partitura(), correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES, Key (+31 more)

### Community 82 - "main.cts"
Cohesion: 0.29
Nodes (8): createSplash(), createWindow(), ADR-0018, inside(), ISOLATION, menu(), send(), serve()

### Community 83 - "transkun/transcribe.ts"
Cohesion: 0.18
Nodes (21): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+13 more)

### Community 84 - "DetectorBateria"
Cohesion: 0.42
Nodes (3): Bandas, DetectorBateria, Golpe

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.20
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 89 - "Secuencia"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 90 - "Presentacion.kt"
Cohesion: 0.17
Nodes (3): notasCayendo(), PresentacionPantalla(), Punto()

### Community 91 - "Transkun.kt"
Cohesion: 0.13
Nodes (6): Cancelada, Constantes, Decodificacion, Espectro, Evento, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "Piano"
Cohesion: 0.09
Nodes (23): ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`, cadenaMaestra(), VOLUMEN_EXTRA, ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, Piano (+15 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "createNoteEvent"
Cohesion: 0.12
Nodes (32): aTake(), CHORDS, createDemoBateria(), createDemoGuitarra(), createDemoPiece(), MELODY, HeroVisualizer(), piece() (+24 more)

### Community 97 - "Nota"
Cohesion: 0.22
Nodes (3): esNegra(), Opciones, Renderizador

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.12
Nodes (11): electron, require, desktopEnv, inherited, installer, r, require, androidEnv (+3 more)

### Community 100 - "edit.ts"
Cohesion: 0.26
Nodes (13): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+5 more)

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.11
Nodes (17): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión, ADR-010 · Estilo y brillo de las notas en `VisualProject.effects` (+9 more)

### Community 102 - "Etapa"
Cohesion: 0.15
Nodes (11): Etapa, Armando, Descargando, Escuchando, Esperando, Leyendo, Preparando, Separando (+3 more)

### Community 103 - "web/vite.config.ts"
Cohesion: 0.17
Nodes (6): vite-plugin-pwa@catalog:, brandDir, CARPETAS_SONIDO, isolation, sonidosDir, vite-plugin-pwa

### Community 104 - "MuestrasTest.kt"
Cohesion: 0.22
Nodes (6): Capa, Manifiesto, Muestras, Zona, MuestrasTest, 2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería

### Community 105 - "AudioEngine"
Cohesion: 0.14
Nodes (5): AudioEngine, lowerBound(), avisarDescarga(), terminarDescarga(), LiveVoiceHandle

### Community 107 - "SettingsPanel.tsx"
Cohesion: 0.09
Nodes (26): useAudio, ColorField(), Props, AFINACIONES_UI, BACKGROUNDS, BRILLO_DE, CalidadDelPiano(), CALIDADES (+18 more)

### Community 109 - "Nota"
Cohesion: 0.22
Nodes (6): Nota, Estado, Manos, Golpe, Rasgueo, ManosYRasgueoTest

### Community 110 - "ColaPanel.kt"
Cohesion: 0.15
Nodes (4): ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros()

### Community 111 - "export/package.json"
Cohesion: 0.11
Nodes (22): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+14 more)

### Community 112 - "ExportarPantalla.kt"
Cohesion: 0.09
Nodes (22): AjustesPantalla(), Avance(), Confirmar(), Encabezado(), Panel(), PedirTexto(), AvanceExportacion(), ExportarPantalla() (+14 more)

### Community 113 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/audio@workspace:*, @impromptu/midi@workspace:*, description, @impromptu/audio, @impromptu/midi, name, private, type (+1 more)

### Community 114 - "core/src/index.ts"
Cohesion: 0.09
Nodes (22): ADR-011 · Líneas de compás y pulso en el visualizador, beatAt(), beatGrid(), tempoAt(), Hand, TempoPoint, exportMidi(), noteEvents() (+14 more)

### Community 115 - "ScoreTab.tsx"
Cohesion: 0.13
Nodes (21): download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, VISTAS_TAB, Burbuja(), midiFileName() (+13 more)

### Community 116 - "Landing.tsx"
Cohesion: 0.07
Nodes (40): MAMUT_HERD, MamutHerdSello(), PROPORCION, abrirPantalla(), connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction (+32 more)

### Community 117 - "colores.ts"
Cohesion: 0.18
Nodes (14): aHex(), AjustesColor, ARCOIRIS_12, colorSegunModo(), deGrupo(), hexRgb(), mezclar(), ModoColor (+6 more)

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.11
Nodes (8): BotonIcono(), Accion(), EstadoTeclado(), FilaPieza(), InicioPantalla(), MiniAccion(), nombreDe(), SelectorInstrumento()

### Community 120 - "Impromptu.kt"
Cohesion: 0.07
Nodes (8): Decodificar, Floats, Pcm, Avance, Ia, Modelo, Paquetes, Sonido

### Community 121 - "Pieza"
Cohesion: 0.11
Nodes (13): Origen, Audio, Microfono, Midi, Teclado, Pedal, Pieza, TipoPedal (+5 more)

### Community 124 - "LivePanel.tsx"
Cohesion: 0.08
Nodes (43): Ajustes(), Inicio(), EnVivo(), startCameraRecording(), stopCameraRecording(), conInstrumento(), InsigniaInstrumento(), textoConectar() (+35 more)

### Community 125 - "transcribeStore.ts"
Cohesion: 0.09
Nodes (23): avances, Conversion, mb(), Model, nextAudioName(), NOMBRE_INSTRUMENTO, pendientes, PIANO_MODEL_URL (+15 more)

### Community 126 - "Conversiones"
Cohesion: 0.10
Nodes (5): Piezas, AvanceSuave, Conversiones, Terminada, TrabajoConversion

### Community 127 - "demos-midi.mjs"
Cohesion: 0.17
Nodes (12): acordes, bajo, funk, guitarra, guitarraMelodia, melodia, midi(), piezas (+4 more)

### Community 130 - "audio/src/index.ts"
Cohesion: 0.17
Nodes (19): archivosDe(), Banco, bancoDe(), CapaBateria, golpeBateria(), Manifiesto, zonas, ZonaCuerda (+11 more)

### Community 131 - "LineaDeLectura"
Cohesion: 0.09
Nodes (24): aplicar(), baseMs, compasActual, cuadro(), dibujar(), elegir(), enVivo(), futuro (+16 more)

### Community 132 - "CopiarModelos"
Cohesion: 0.10
Nodes (7): CopiarModelos, compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 133 - "render/src/index.ts"
Cohesion: 0.15
Nodes (20): ADR-0006, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect, BLACK, BLACK_OFFSET, BLACK_WIDTH (+12 more)

### Community 134 - "fingering.ts"
Cohesion: 0.21
Nodes (14): ADR-0012, Finger, chordOptions(), FINGERS, isBlack(), linkCost(), ownCost(), placementCost() (+6 more)

### Community 136 - ".iniciar"
Cohesion: 0.22
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 137 - "@playwright/test"
Cohesion: 0.07
Nodes (5): @playwright/test, brand, outDir, [width = 1920, height = 1080, fps = 60], Escucha

### Community 139 - "web/vite.config.ts"
Cohesion: 0.13
Nodes (15): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, @vitejs/plugin-react@catalog:, vitest@catalog: (+7 more)

### Community 141 - "Smf"
Cohesion: 0.24
Nodes (3): Formato, Leido, Smf

### Community 150 - "Plantilla"
Cohesion: 0.07
Nodes (22): SeparadorTest, 2026-11-16 · Fase 1 · Visualizador desde un MIDI, 2026-11-16 · Planeación, 2026-11-17 · Fase 4 · Manos y dedos, 2026-11-17 · Fase 5 · Audio a notas, 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd, 2026-11-17 · Fase 6 · Partitura, 2026-11-17 · Fase 8 · Apps de PC y Android (+14 more)

### Community 152 - "notes.ts"
Cohesion: 0.24
Nodes (5): LiveListener, resample(), NotesOptions, rawToNotes(), takeFromTranscription()

### Community 155 - "GrabarPantalla.kt"
Cohesion: 0.13
Nodes (5): GrabarPantalla(), HojaEnVivo(), object@L218, WebViewClient, PuntoRec()

### Community 156 - "Error: Impromptu se cierra en la cola de conversiones (índice -1)"
Cohesion: 0.40
Nodes (4): Arreglo sugerido, Causa (probable), El error, Error: Impromptu se cierra en la cola de conversiones (índice -1)

### Community 157 - "editor.ts"
Cohesion: 0.10
Nodes (22): Afinacion, AFINACIONES, agrupar(), asignarTrastes(), Forma, formas(), manosPara(), Posicion (+14 more)

### Community 159 - "MicrofonoPantalla.kt"
Cohesion: 0.18
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 164 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, brand:icons, build, dev, e2e, format, intro:mp4, lint (+2 more)

### Community 165 - "core/src/index.ts"
Cohesion: 0.14
Nodes (18): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Baqueta, baquetas(), PIES (+10 more)

### Community 166 - "Salamander"
Cohesion: 0.24
Nodes (3): Salamander, Sampler, Voz

### Community 167 - "WaitMode"
Cohesion: 0.22
Nodes (3): rebuild(), ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, WaitMode

### Community 168 - "practice/src/index.ts"
Cohesion: 0.33
Nodes (7): FingeringOptions, HandSize, alcance(), avg(), HandOptions, separateHands(), PracticeChord

### Community 174 - "muestras.mjs"
Cohesion: 0.26
Nodes (11): BATERIA, bateria(), CAPAS_BATERIA, convertir(), cuerdas(), DESTINO, leerSfz(), nombreNota() (+3 more)

### Community 175 - ".asignar"
Cohesion: 0.36
Nodes (5): Bateria, Forma, Guitarra, Pieza, Posicion

### Community 177 - "visualizer.ts"
Cohesion: 0.12
Nodes (21): 2026-11-17 · Fase 7 · Tutoriales y práctica, BLACK_LENGTH, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout, frameLayout(), isSounding() (+13 more)

### Community 181 - "PiezaPantalla.kt"
Cohesion: 0.16
Nodes (4): formatoTiempo(), BarraTiempo(), Lienzo(), PiezaPantalla()

### Community 182 - "keyboard.ts"
Cohesion: 0.53
Nodes (4): countOutOfRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount()

### Community 183 - "musicxml.ts"
Cohesion: 0.30
Nodes (13): spell(), ALTERADAS, bateriaXml(), documento(), esc(), Escritura, guitarraXml(), metronomo() (+5 more)

### Community 195 - "Exportador.kt"
Cohesion: 0.09
Nodes (5): Banco, Limitador, Exportador, Paquete, SuperficieGl

### Community 199 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 208 - "Take"
Cohesion: 0.07
Nodes (37): PiezaWeb, StudioState, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, note(), Strikeable, pedalDownRanges(), KEYBOARD_61, NoteInput (+29 more)

### Community 214 - "MainActivity.kt"
Cohesion: 0.06
Nodes (14): Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono (+6 more)

### Community 216 - "avance.ts"
Cohesion: 0.29
Nodes (4): AvanceSuave, fraseDeEspera(), FRASES, textoRestante()

## Knowledge Gaps
- **64 isolated node(s):** `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json`, `Presentacion`, `Partitura` (+59 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1072 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **57 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SeparadorTest` connect `Plantilla` to `Transkun.kt`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json` to the rest of the system?**
  _64 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08139534883720931 - nodes in this community are weakly interconnected._
- **Why does `Plantilla` connect `Plantilla` to `Etapa`, `MuestrasTest.kt`, `LivePlayer`, `notation/src/index.ts`, `visualizer.ts`, `Transport`, `createNoteEvent`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `LineaDeLectura` connect `LineaDeLectura` to `notation/src/index.ts`, `ScoreTab.tsx`, `Plantilla`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09425287356321839 - nodes in this community are weakly interconnected._