# Graph Report - impromptu  (2026-11-25)

## Corpus Check
- 333 files · ~207,291 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 236 file(s) not represented in the graph (top: .flac 175, .css 36, .xml 8)

## Summary
- 3213 nodes · 7685 edges · 197 communities (139 shown, 58 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `90d4e4c7`
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
- Tecla
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
- ownAudio.ts
- export/src/export.ts
- align.ts
- .iniciar
- transcribe/package.json
- transcribe/README.md
- LiveSession
- .setTake
- video.ts
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
- EstiloNota.kt
- Flujos principales
- practice.ts
- notation/src/index.ts
- main.cts
- LiveSession
- DetectorBateria
- Comun.kt
- compilerOptions
- Estado
- Iconos.kt
- Secuencia
- Renderizador.kt
- Transkun.kt
- compilerOptions
- Piano
- transcribe/tsconfig.json
- createNoteEvent
- Nota
- notation/tsconfig.json
- dev.mjs
- practice/src/index.ts
- DECISIONES (ADRs)
- EstiloNota
- web/vite.config.ts
- MuestrasTest.kt
- AudioEngine
- LivePlayer
- SettingsPanel.tsx
- ServicioTrabajos.kt
- Nota
- transkun/transcribe.ts
- export/package.json
- Presentacion.kt
- web/package.json
- model.test.ts
- ScoreTab.tsx
- Landing.tsx
- colores.ts
- BasicPitch
- InicioPantalla.kt
- Transkun.kt
- Pieza
- Transport
- Impromptu
- LivePanel.tsx
- ExportDialog
- Conversiones
- demos-midi.mjs
- @impromptu/media@workspace:*
- @impromptu/notation@workspace:*
- audio/src/index.ts
- LineaDeLectura
- CopiarModelos
- render/src/index.ts
- JavascriptInterface
- @impromptu/transcribe@workspace:*
- editor.ts
- @playwright/test
- web/vite.config.ts
- opensheetmusicdisplay@2.2.1
- Pedal
- Videos.kt
- notes.ts
- GrabarPantalla.kt
- Error: Impromptu se cierra en la cola de conversiones (índice -1)
- musicxml.ts
- .normalizar
- MicrofonoPantalla.kt
- PiezaPantalla.kt
- SeparadorTest
- TranskunTest.kt
- build
- fingering.ts
- instrumentos.ts
- Paquetes
- keyboard.ts
- ref_node_fs
- .iniciar
- Sintes
- practice.test.ts
- src/worker.ts
- Sampler
- muestras.mjs
- .asignar
- volumen.ts
- visualizer.ts
- Formato
- Puente
- sources.ts
- @impromptu/export@workspace:*
- @impromptu/render@workspace:*
- Separador.kt
- LEEME.md
- Exportador.kt
- bateria.ts
- edit.ts
- MainActivity.kt
- avance.ts

## God Nodes (most connected - your core abstractions)
1. `Visualizer` - 66 edges
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
- `ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`` --references--> `Piano`  [INFERRED]
  docs/DECISIONES.md → packages/audio/src/piano.ts
- `Lo que dijo Jacobo al probar la app nativa (2026-11-18)` --references--> `GrupoTest`  [INFERRED]
  docs/PENDIENTES.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/GrupoTest.kt
- `2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería` --references--> `ManosYRasgueoTest`  [INFERRED]
  docs/BITACORA.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/ManosYRasgueoTest.kt
- `2026-11-19 (tarde) · Todo al celular, video en segundo plano, separar instrumentos y compilados` --references--> `SeparadorTest`  [INFERRED]
  docs/BITACORA.md → apps/mobile/app/src/test/java/com/mamutherd/impromptu/SeparadorTest.kt
- `2026-11-16 · Fase 0 · Cimientos` --references--> `sortNotes()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (197 total, 58 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.08
Nodes (22): COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS, Seccion() (+14 more)

### Community 1 - "separar/worker.ts"
Cohesion: 0.23
Nodes (17): BINS, cuadrosDe(), espectroCuadro(), F, Fft, HOP, mascara(), N_FFT (+9 more)

### Community 2 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @impromptu/core@workspace:*, @impromptu/practice@workspace:*, @impromptu/ui@workspace:*, lucide-react@catalog:, react@catalog:, react-dom@catalog:, react-router@catalog: (+6 more)

### Community 3 - "package.json"
Cohesion: 0.07
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
Cohesion: 0.15
Nodes (13): Fase 0 — Cimientos, Fase 10 — Editor de partitura y video de la partitura (pedido de Jacobo, 2026-11-17), Fase 11 — Gráficos mejores (pedido de Jacobo, 2026-11-18), Fase 1 — Visualizador desde un MIDI, Fase 2 — Teclado en vivo, pedales y modo en vivo, Fase 3 — Cámara, plantillas y exportar (v0.1), Fase 4 — Manos y dedos, Fase 5 — Audio o micrófono a notas (+5 more)

### Community 13 - "audio/package.json"
Cohesion: 0.13
Nodes (17): dependencies, @impromptu/core@workspace:*, description, devDependencies, typescript@catalog:, vitest@catalog:, exports, @impromptu/core (+9 more)

### Community 14 - "Estudio.tsx"
Cohesion: 0.10
Nodes (37): Ajustes(), Girar(), Grabando(), Pieza(), ScoreTab, EnVivo(), ASPECTS, ESCUCHAR (+29 more)

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
Cohesion: 0.12
Nodes (31): 2026-11-17 · Fase 5 · Audio a notas, PARTE_DE, SepararEtapa, separarInstrumento(), Parte, SepararMessage, SepararRequest, DEFAULT_PARAMS (+23 more)

### Community 19 - "Visualizer"
Cohesion: 0.09
Nodes (10): Rasgueo, VisualSettings, hexToNumber(), azar(), hashId(), lighten(), luminance(), makeCristalTexture() (+2 more)

### Community 20 - "Celular.tsx"
Cohesion: 0.09
Nodes (34): onMenuAction(), lockOrientation(), Inicio(), Miniatura(), Mode, MODES, Screen, SOURCE (+26 more)

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
Cohesion: 0.14
Nodes (5): Control, EventoMidi, Off, On, Teclado

### Community 31 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 32 - "Tecla"
Cohesion: 0.15
Nodes (20): ColaConversiones(), FilaEsperando(), FilaTrabajando(), relojDeCuadros(), Avance(), Confirmar(), Encabezado(), Panel() (+12 more)

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

### Community 54 - "ownAudio.ts"
Cohesion: 0.10
Nodes (29): BackgroundChoice, BACKGROUNDS, TO_BACKGROUND, AudioState, AudioStatus, engine, NOMBRE_BANCO, AudioSection() (+21 more)

### Community 55 - "export/src/export.ts"
Cohesion: 0.14
Nodes (34): ASPECTS, PHASES, RATES, RESOLUTIONS, State, ExportPreview(), PROPORCION, chooseFormat() (+26 more)

### Community 56 - "align.ts"
Cohesion: 0.09
Nodes (30): sonidos(), BUG-001 · El audio propio y el video se sincronizaban con el desfase al revés, BUG-002 · Celular: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba, BUG-003 · Celular: no hay un botón claro para volver, y el "atrás" de Android cierra la app, BUG-004 · Celular: la app se cierra al convertir una grabación, BUG-005 · Celular: el video exportado sale con el audio corrido (~2 s), BUG-006 · La tablatura del bajo salía con 6 líneas y las notas en cuerdas equivocadas, BUG-007 · En la web, la batería grabada nunca se escuchaba (sonaba la sintetizada) (+22 more)

### Community 60 - "transcribe/package.json"
Cohesion: 0.09
Nodes (27): dependencies, @impromptu/core@workspace:*, onnxruntime-web@1.31.1, @spotify/basic-pitch@1.0.1, @tensorflow/tfjs@3.21.0, description, devDependencies, @impromptu/audio@workspace:* (+19 more)

### Community 62 - "LiveSession"
Cohesion: 0.18
Nodes (14): KeyboardRange, applyCurve(), LiveEvent, normalizeMessage(), DeviceProfile, GENERIC_PROFILE, profileFor(), PROFILES (+6 more)

### Community 63 - ".setTake"
Cohesion: 0.28
Nodes (5): Beat, rasgueos(), nota(), pulsos, indexNotes()

### Community 65 - "video.ts"
Cohesion: 0.10
Nodes (35): CalibrateDialog(), NAMES, noteName(), PitchField(), Step, STEPS, chunks, startCamera() (+27 more)

### Community 66 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, typescript, vitest, name (+6 more)

### Community 67 - "desktop/package.json"
Cohesion: 0.10
Nodes (21): description, devDependencies, electron@44.10.1, electron-builder@26.18.1, @types/node@catalog:, typescript@catalog:, @types/node, typescript (+13 more)

### Community 68 - "Instrumento"
Cohesion: 0.14
Nodes (12): Sintes, Timbre, Acero, Bajo, Electrica, Nylon, Voz, Instrumento (+4 more)

### Community 69 - "notation/package.json"
Cohesion: 0.11
Nodes (21): dependencies, @impromptu/core@workspace:*, description, devDependencies, @impromptu/midi@workspace:*, @types/node@catalog:, typescript@catalog:, vitest@catalog: (+13 more)

### Community 70 - "import.ts"
Cohesion: 0.11
Nodes (18): IdFactory, importMidi(), ImportOptions, instrumentoDePista(), MAJOR_KEYS, meterAndKey(), MINOR_KEYS, readTrack() (+10 more)

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

### Community 77 - "EstiloNota.kt"
Cohesion: 0.17
Nodes (6): aclarar(), conAlfa(), frac(), oscurecer(), Paleta, PintorNotas

### Community 79 - "Flujos principales"
Cohesion: 0.40
Nodes (5): En vivo y OBS, Exportar video, Flujos principales, Grabar en vivo, Transcripción (fase 5)

### Community 80 - "practice.ts"
Cohesion: 0.20
Nodes (8): practice, PracticeHand, usePractice, transport, HANDS, NAMES, noteName(), TutorialPanel()

### Community 81 - "notation/src/index.ts"
Cohesion: 0.09
Nodes (41): ADR-011 · Líneas de compás y pulso en el visualizador, beatGrid(), Seleccion, partitura(), correlation(), estimateKey(), FLAT_ALTER, FLAT_NAMES (+33 more)

### Community 82 - "main.cts"
Cohesion: 0.29
Nodes (8): createSplash(), createWindow(), ADR-0018, inside(), ISOLATION, menu(), send(), serve()

### Community 83 - "LiveSession"
Cohesion: 0.14
Nodes (4): startCameraRecording(), liveNow(), LiveSession, Clicker

### Community 84 - "DetectorBateria"
Cohesion: 0.42
Nodes (3): Bandas, DetectorBateria, Golpe

### Community 86 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, module, moduleResolution, types, verbatimModuleSyntax, extends, include, ../../tsconfig.base.json

### Community 87 - "Estado"
Cohesion: 0.24
Nodes (7): Bajando, Estado, Fallo, Instalacion, Lista, PreparandoIa, Quieta

### Community 89 - "Secuencia"
Cohesion: 0.13
Nodes (3): E, Motor, Secuencia

### Community 91 - "Transkun.kt"
Cohesion: 0.15
Nodes (6): Cancelada, Constantes, Decodificacion, Espectro, Evento, Transkun

### Community 92 - "compilerOptions"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, outDir, rootDir, extends, ./tsconfig.json

### Community 93 - "Piano"
Cohesion: 0.10
Nodes (23): note(), cadenaMaestra(), VOLUMEN_EXTRA, ActiveVoice, LoadProgress, MAX_VOICES, PANEL_SUSTAIN_MAX, Piano (+15 more)

### Community 94 - "transcribe/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 95 - "createNoteEvent"
Cohesion: 0.12
Nodes (30): aTake(), CHORDS, createDemoBateria(), createDemoGuitarra(), createDemoPiece(), MELODY, HeroVisualizer(), piece() (+22 more)

### Community 97 - "Nota"
Cohesion: 0.29
Nodes (3): esNegra(), Opciones, Renderizador

### Community 98 - "notation/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, lib, types, extends, include, ../../tsconfig.base.json

### Community 99 - "dev.mjs"
Cohesion: 0.18
Nodes (7): electron, require, desktopEnv, inherited, installer, r, require

### Community 100 - "practice/src/index.ts"
Cohesion: 0.13
Nodes (12): PracticeState, rebuild(), ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande, FingeringOptions, HandSize, HandOptions, PracticeChord, practiceChords() (+4 more)

### Community 101 - "DECISIONES (ADRs)"
Cohesion: 0.10
Nodes (19): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, ADR-008 · Tres productos: web, PC y celular instalable, sin conexión (+11 more)

### Community 102 - "EstiloNota"
Cohesion: 0.13
Nodes (11): EstiloNota, Bloque, Chispa, Claro, Diamante, Gema, Luz, Oro (+3 more)

### Community 103 - "web/vite.config.ts"
Cohesion: 0.14
Nodes (7): @vitejs/plugin-react@catalog:, brandDir, CARPETAS_SONIDO, isolation, sonidosDir, @vitejs/plugin-react, brand

### Community 104 - "MuestrasTest.kt"
Cohesion: 0.12
Nodes (7): BancoGrabado, Capa, Manifiesto, Muestras, Zona, MuestrasTest, 2026-11-19 · Pedido 25: sonidos grabados de guitarra, bajo y batería

### Community 105 - "AudioEngine"
Cohesion: 0.14
Nodes (6): AudioEngine, lowerBound(), avisarDescarga(), terminarDescarga(), LiveVoiceHandle, takeVoices()

### Community 106 - "LivePlayer"
Cohesion: 0.19
Nodes (3): 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo, LivePlayer, Strikeable

### Community 107 - "SettingsPanel.tsx"
Cohesion: 0.09
Nodes (26): useAudio, ColorField(), Props, AFINACIONES_UI, BACKGROUNDS, BRILLO_DE, CalidadDelPiano(), CALIDADES (+18 more)

### Community 109 - "Nota"
Cohesion: 0.25
Nodes (6): Nota, Estado, Manos, Golpe, Rasgueo, ManosYRasgueoTest

### Community 110 - "transkun/transcribe.ts"
Cohesion: 0.20
Nodes (19): continuousBernoulliMean(), finishEvents(), Interval, mergeSegment(), segmentNotes(), TkNote, viterbiBackward(), fft() (+11 more)

### Community 111 - "export/package.json"
Cohesion: 0.11
Nodes (22): dependencies, @impromptu/audio@workspace:*, @impromptu/core@workspace:*, @impromptu/render@workspace:*, mediabunny@catalog:, description, devDependencies, typescript@catalog: (+14 more)

### Community 112 - "Presentacion.kt"
Cohesion: 0.08
Nodes (3): notasCayendo(), PresentacionPantalla(), Punto()

### Community 113 - "web/package.json"
Cohesion: 0.20
Nodes (9): @impromptu/audio@workspace:*, @impromptu/midi@workspace:*, description, @impromptu/audio, @impromptu/midi, name, private, type (+1 more)

### Community 114 - "model.test.ts"
Cohesion: 0.10
Nodes (30): PiezaWeb, KEYBOARD_61, NoteInput, ADR-0003, WithCrypto, beatAt(), tempoAt(), MediaRef (+22 more)

### Community 115 - "ScoreTab.tsx"
Cohesion: 0.11
Nodes (20): download(), Meter, METERS, ScoreTab(), SOURCE_TEXT, VISTAS_TAB, midiFileName(), saveMidi() (+12 more)

### Community 116 - "Landing.tsx"
Cohesion: 0.07
Nodes (39): MAMUT_HERD, MamutHerdSello(), PROPORCION, abrirPantalla(), connectDesktopMenu(), DesktopBridge, isDesktop(), MenuAction (+31 more)

### Community 117 - "colores.ts"
Cohesion: 0.18
Nodes (14): aHex(), AjustesColor, ARCOIRIS_12, colorSegunModo(), deGrupo(), hexRgb(), mezclar(), ModoColor (+6 more)

### Community 119 - "InicioPantalla.kt"
Cohesion: 0.12
Nodes (10): BotonIcono(), Accion(), EstadoTeclado(), FilaPieza(), FilaVideo(), InicioPantalla(), MiniAccion(), nombreDe() (+2 more)

### Community 121 - "Pieza"
Cohesion: 0.17
Nodes (6): Origen, Audio, Microfono, Midi, Teclado, Pieza

### Community 122 - "Transport"
Cohesion: 0.06
Nodes (24): Etapa, Armando, Descargando, Escuchando, Esperando, Leyendo, Preparando, Separando (+16 more)

### Community 123 - "Impromptu"
Cohesion: 0.13
Nodes (3): Banco, Piezas, Impromptu

### Community 124 - "LivePanel.tsx"
Cohesion: 0.12
Nodes (31): stopCameraRecording(), InsigniaInstrumento(), LiveState, MidiStatus, readRecordMic(), refreshTakes(), METER_OPTIONS, MetronomeControls() (+23 more)

### Community 125 - "ExportDialog"
Cohesion: 0.21
Nodes (13): Burbuja(), ExportDialog(), PantallaCarga(), actualizarTrabajo(), Descarga, quitarTrabajo(), saltarCarga(), terminarTrabajo() (+5 more)

### Community 126 - "Conversiones"
Cohesion: 0.12
Nodes (6): Decodificar, Pcm, AvanceSuave, Conversiones, Terminada, TrabajoConversion

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
Cohesion: 0.11
Nodes (23): CameraState, CameraVideo, ADR-0006, KeyboardCalibration, calibratedKeyboard(), calibratedKeyLine(), coverRect(), VideoRect (+15 more)

### Community 136 - "editor.ts"
Cohesion: 0.12
Nodes (20): Afinacion, AFINACIONES, agrupar(), asignarTrastes(), Forma, formas(), manosPara(), Posicion (+12 more)

### Community 139 - "web/vite.config.ts"
Cohesion: 0.13
Nodes (15): devDependencies, @types/node@catalog:, @types/react@catalog:, @types/react-dom@catalog:, typescript@catalog:, vite@catalog:, vite-plugin-pwa@catalog:, vitest@catalog: (+7 more)

### Community 141 - "Pedal"
Cohesion: 0.11
Nodes (11): Pedal, TipoPedal, Sostenuto, Sustain, UnaCorda, Formato, Leido, Smf (+3 more)

### Community 150 - "Videos.kt"
Cohesion: 0.17
Nodes (8): Grupo, Convertidas, Grabadas, Midi, Todo, Videos, VideoGuardado, Videos

### Community 152 - "notes.ts"
Cohesion: 0.36
Nodes (3): LiveListener, resample(), MODEL_RATE

### Community 155 - "GrabarPantalla.kt"
Cohesion: 0.07
Nodes (9): HojaEnVivo(), object@L218, WebViewClient, BarraVideo(), compartirArchivo(), compartirTexto(), PartituraPantalla(), WebViewClient (+1 more)

### Community 156 - "Error: Impromptu se cierra en la cola de conversiones (índice -1)"
Cohesion: 0.40
Nodes (4): Arreglo sugerido, Causa (probable), El error, Error: Impromptu se cierra en la cola de conversiones (índice -1)

### Community 157 - "musicxml.ts"
Cohesion: 0.30
Nodes (13): spell(), ALTERADAS, bateriaXml(), documento(), esc(), Escritura, guitarraXml(), metronomo() (+5 more)

### Community 159 - "MicrofonoPantalla.kt"
Cohesion: 0.16
Nodes (7): BotonGrabar(), Consejos(), EstadoGrabacion(), GrabadoraMic, MicrofonoPantalla(), Onda(), rememberPedirNotificaciones()

### Community 160 - "PiezaPantalla.kt"
Cohesion: 0.15
Nodes (7): formatoTiempo(), GrabarPantalla(), BarraTiempo(), Lienzo(), PanelDiseno(), PiezaPantalla(), Chip()

### Community 161 - "SeparadorTest"
Cohesion: 0.12
Nodes (11): SeparadorTest, 2026-11-19 (tarde) · Todo al celular, video en segundo plano, separar instrumentos y compilados, App de Android NATIVA (decidido por Jacobo, 2026-11-17; construida el 2026-11-18, ADR-019, sin verificar en un celular), Decisiones de Jacobo abiertas, Lo que dijo Jacobo al probar la app nativa (2026-11-18), Lo que queda (resumen al 2026-11-17), Para que pruebe Jacobo, Para subir a Hugging Face (P15 y P21) (+3 more)

### Community 163 - "build"
Cohesion: 0.12
Nodes (17): build, appId, copyright, directories, extraResources, files, nsis, productName (+9 more)

### Community 164 - "fingering.ts"
Cohesion: 0.21
Nodes (14): ADR-0012, Finger, chordOptions(), FINGERS, isBlack(), linkCost(), ownCost(), placementCost() (+6 more)

### Community 165 - "instrumentos.ts"
Cohesion: 0.13
Nodes (19): HIHAT_ABIERTO, PiezaBateria, piezaDeNota(), PIEZAS_BATERIA, POR_NOTA, Baqueta, baquetas(), PIES (+11 more)

### Community 166 - "Paquetes"
Cohesion: 0.12
Nodes (5): Avance, Ia, Modelo, Paquetes, Sonido

### Community 167 - "keyboard.ts"
Cohesion: 0.53
Nodes (4): countOutOfRange(), KEYBOARD_PRESETS, KeyboardSize, keyCount()

### Community 168 - "ref_node_fs"
Cohesion: 0.19
Nodes (6): androidEnv, r, r, { version }, outDir, [width = 1920, height = 1080, fps = 60]

### Community 169 - ".iniciar"
Cohesion: 0.22
Nodes (6): Estado, Exportacion, Fallo, Lista, Quieta, Trabajando

### Community 171 - "practice.test.ts"
Cohesion: 0.27
Nodes (8): Hand, alcance(), avg(), Estado, separateHands(), fixtures, melody(), note()

### Community 172 - "src/worker.ts"
Cohesion: 0.43
Nodes (5): post(), prepare(), run(), WorkerMessage, WorkerRequest

### Community 173 - "Sampler"
Cohesion: 0.20
Nodes (3): Salamander, Sampler, Voz

### Community 174 - "muestras.mjs"
Cohesion: 0.26
Nodes (11): BATERIA, bateria(), CAPAS_BATERIA, convertir(), cuerdas(), DESTINO, leerSfz(), nombreNota() (+3 more)

### Community 175 - ".asignar"
Cohesion: 0.21
Nodes (6): Bateria, Forma, Guitarra, Pieza, Posicion, InstrumentosTest

### Community 176 - "volumen.ts"
Cohesion: 0.38
Nodes (4): GANANCIA_MAXIMA, normalizar(), OBJETIVO, pico()

### Community 177 - "visualizer.ts"
Cohesion: 0.08
Nodes (39): 2026-11-17 · Fase 7 · Tutoriales y práctica, VisualProject, BLACK_LENGTH, KeyboardLayout, BASE_LOOKAHEAD, Direction, forEachNoteIn(), FrameLayout (+31 more)

### Community 178 - "Formato"
Cohesion: 0.50
Nodes (4): Formato, Cuadrado, Horizontal, Vertical

### Community 181 - "sources.ts"
Cohesion: 0.17
Nodes (13): DEMO_PIECES, demoPieces, describeWarning(), LOCAL_PIECES, localPieces, OpenedTake, prettyName(), StudioState (+5 more)

### Community 195 - "Exportador.kt"
Cohesion: 0.11
Nodes (4): Limitador, Exportador, Paquete, SuperficieGl

### Community 199 - "bateria.ts"
Cohesion: 0.39
Nodes (7): Bandas, bandas(), caida(), detectarBateria(), fft(), Golpe, golpesEnBanda()

### Community 208 - "edit.ts"
Cohesion: 0.23
Nodes (15): autoAssign(), hasNoHands(), mapNotes(), NoteMap, refinger(), removeNotes(), resizeNotes(), setFinger() (+7 more)

### Community 214 - "MainActivity.kt"
Cohesion: 0.06
Nodes (15): Ajustes, App(), Exportar, Grabar, importarMidi(), Inicio, MainActivity, Microfono (+7 more)

### Community 216 - "avance.ts"
Cohesion: 0.29
Nodes (4): AvanceSuave, fraseDeEspera(), FRASES, textoRestante()

## Knowledge Gaps
- **78 isolated node(s):** `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json`, `Presentacion`, `Partitura` (+73 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1086 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **58 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Lo que dijo Jacobo al probar la app nativa (2026-11-18)` connect `SeparadorTest` to `LineaDeLectura`, `EstiloNota`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **What connects `ADR-0018`, `./tsconfig.json`, `../../tsconfig.base.json` to the rest of the system?**
  _78 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08084163898117387 - nodes in this community are weakly interconnected._
- **Why does `LineaDeLectura` connect `LineaDeLectura` to `notation/src/index.ts`, `SeparadorTest`, `ScoreTab.tsx`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Why does `GrupoTest` connect `EstiloNota` to `SeparadorTest`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06538461538461539 - nodes in this community are weakly interconnected._