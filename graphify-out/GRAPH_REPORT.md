# Graph Report - impromptu  (2026-11-16)

## Corpus Check
- 85 files · ~17,674 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 14 file(s) not represented in the graph (top: .css 11, (none) 3)

## Summary
- 569 nodes · 684 edges · 62 communities (40 shown, 22 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.93)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5435ab3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ui/src/index.ts
- model.test.ts
- web/package.json
- package.json
- ui/package.json
- catalog
- with
- compilerOptions
- Funciones por bloque
- core/package.json
- ARQUITECTURA — Impromptu
- tasks
- ROADMAP — Impromptu
- audio/package.json
- export/package.json
- media/package.json
- midi/package.json
- render/package.json
- CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)
- DECISIONES (ADRs)
- DESIGN — Identidad de Impromptu
- VERIFICACIONES — antes de decir "listo"
- scripts
- web/tsconfig.json
- LICENCIAS — qué se puede usar
- ui/tsconfig.json
- Cómo empezar (para Jacobo)
- HERRAMIENTAS — Graphify, plugins y skills
- INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026)
- AGENTS.md — Impromptu
- impromptu
- BITÁCORA
- BUGS — trampas conocidas y registro
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

## God Nodes (most connected - your core abstractions)
1. `catalog` - 23 edges
2. `compilerOptions` - 16 edges
3. `Componentes()` - 13 edges
4. `ROADMAP — Impromptu` - 11 edges
5. `2026-11-16 · Fase 0 · Cimientos` - 10 edges
6. `ARQUITECTURA — Impromptu` - 9 edges
7. `DECISIONES (ADRs)` - 9 edges
8. `scripts` - 9 edges
9. `CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)` - 8 edges
10. `DESIGN — Identidad de Impromptu` - 8 edges

## Surprising Connections (you probably didn't know these)
- `2026-11-16 · Fase 0 · Cimientos` --references--> `Logo()`  [INFERRED]
  docs/BITACORA.md → packages/ui/src/components/Logo.tsx
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createNoteEvent()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createTrack()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `createTake()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts
- `2026-11-16 · Fase 0 · Cimientos` --references--> `sortNotes()`  [INFERRED]
  docs/BITACORA.md → packages/core/src/factory.ts

## Import Cycles
- None detected.

## Communities (62 total, 22 thin omitted)

### Community 0 - "ui/src/index.ts"
Cohesion: 0.07
Nodes (33): root, COLORES, Componentes(), Formato, FORMATOS, Muestra(), Pestana, PESTANAS (+25 more)

### Community 1 - "model.test.ts"
Cohesion: 0.10
Nodes (37): 2026-11-16 · Fase 0 · Cimientos, ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio, createNoteEvent(), createTake(), createTrack(), IdFactory, KEYBOARD_61, NoteInput (+29 more)

### Community 2 - "web/package.json"
Cohesion: 0.06
Nodes (37): dependencies, @impromptu/core@workspace:*, @impromptu/ui@workspace:*, lucide-react@catalog:, react@catalog:, react-dom@catalog:, react-router@catalog:, description (+29 more)

### Community 3 - "package.json"
Cohesion: 0.09
Nodes (28): description, devDependencies, eslint@catalog:, @eslint/js@catalog:, eslint-plugin-react-hooks@catalog:, globals@catalog:, @playwright/test@catalog:, prettier@catalog: (+20 more)

### Community 4 - "ui/package.json"
Cohesion: 0.10
Nodes (25): dependencies, @fontsource/archivo@catalog:, @fontsource/martian-mono@catalog:, description, devDependencies, react@catalog:, @types/react@catalog:, typescript@catalog: (+17 more)

### Community 5 - "catalog"
Cohesion: 0.08
Nodes (25): catalog, eslint, @eslint/js, eslint-plugin-react-hooks, @fontsource/archivo, @fontsource/martian-mono, globals, lucide-react (+17 more)

### Community 6 - "with"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, verificar, name, on, pull_request (+15 more)

### Community 7 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, isolatedModules, lib, module, moduleResolution, noEmit, noFallthroughCasesInSwitch, noImplicitOverride (+8 more)

### Community 8 - "Funciones por bloque"
Cohesion: 0.12
Nodes (15): Celular, El problema, En vivo, Estudio (crear videos) — primero, Fuera de alcance por ahora, Funciones por bloque, Lo que nos diferencia (no negociable), Modelo de sostenibilidad (+7 more)

### Community 9 - "core/package.json"
Cohesion: 0.15
Nodes (14): description, devDependencies, typescript@catalog:, vitest@catalog:, exports, name, private, scripts (+6 more)

### Community 10 - "ARQUITECTURA — Impromptu"
Cohesion: 0.14
Nodes (13): ARQUITECTURA — Impromptu, En vivo y OBS, Estructura del monorepo, Exportar video, Flujos principales, Grabar en vivo, Modelo de datos (packages/core), Plataformas (+5 more)

### Community 11 - "tasks"
Cohesion: 0.15
Nodes (12): dependsOn, outputs, cache, persistent, $schema, tasks, build, dev (+4 more)

### Community 12 - "ROADMAP — Impromptu"
Cohesion: 0.17
Nodes (11): Fase 0 — Cimientos, Fase 1 — Visualizador desde un MIDI, Fase 2 — Teclado en vivo, pedales y modo en vivo, Fase 3 — Cámara, plantillas y exportar (v0.1), Fase 4 — Manos y dedos, Fase 5 — Audio o micrófono a notas, Fase 6 — Partitura, Fase 7 — Tutoriales y práctica (+3 more)

### Community 13 - "audio/package.json"
Cohesion: 0.18
Nodes (11): description, devDependencies, typescript@catalog:, exports, typescript, name, private, scripts (+3 more)

### Community 14 - "export/package.json"
Cohesion: 0.18
Nodes (11): description, devDependencies, typescript@catalog:, exports, typescript, name, private, scripts (+3 more)

### Community 15 - "media/package.json"
Cohesion: 0.18
Nodes (11): description, devDependencies, typescript@catalog:, exports, typescript, name, private, scripts (+3 more)

### Community 16 - "midi/package.json"
Cohesion: 0.18
Nodes (11): description, devDependencies, typescript@catalog:, exports, typescript, name, private, scripts (+3 more)

### Community 17 - "render/package.json"
Cohesion: 0.18
Nodes (11): description, devDependencies, typescript@catalog:, exports, typescript, name, private, scripts (+3 more)

### Community 18 - "CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)"
Cohesion: 0.22
Nodes (8): CLAUDE.md — Impromptu (léelo SIEMPRE al empezar), Diseño, Dónde está cada cosa, graphify, Protocolo de cada sesión, Qué construimos, Regla de producto número 1, Reglas de oro técnicas

### Community 19 - "DECISIONES (ADRs)"
Cohesion: 0.22
Nodes (8): ADR-001 · Web primero, una sola base de código, ADR-002 · Todo se procesa en el equipo del usuario, ADR-004 · Exportación por render offline determinista, ADR-005 · PixiJS para el visualizador, ADR-006 · Identidad C3 · Consola ámbar, ADR-007 · Licencias no comerciales fuera del núcleo, DECISIONES (ADRs), Plantilla

### Community 20 - "DESIGN — Identidad de Impromptu"
Cohesion: 0.22
Nodes (8): 1. Logo, 2. Color (tokens), 3. Tipografía, 4. Componentes, 5. Pantallas de referencia, 6. Reglas para que no parezca hecho con IA, 7. Voz de la interfaz, DESIGN — Identidad de Impromptu

### Community 21 - "VERIFICACIONES — antes de decir "listo""
Cohesion: 0.22
Nodes (8): 1. Siempre, 2. Interfaz, 3. Modelo de datos y tiempo, 4. MIDI y teclado real, 5. Visualizador y exportación, 6. Transcripción (fase 5+), 7. Privacidad, VERIFICACIONES — antes de decir "listo"

### Community 22 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, brand:icons, build, dev, e2e, format, lint, test (+1 more)

### Community 23 - "web/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, jsx, lib, types, extends, include, ../../tsconfig.base.json

### Community 24 - "LICENCIAS — qué se puede usar"
Cohesion: 0.25
Nodes (7): Algoritmos y datos, Créditos visibles en la app, Librerías, Licencia del proyecto, LICENCIAS — qué se puede usar, Modelos de IA, Proyectos que NO se copian

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

### Community 30 - "impromptu"
Cohesion: 0.40
Nodes (4): Apoyar el proyecto, impromptu, Principios, Qué hace (cuando esté completo)

### Community 31 - "BITÁCORA"
Cohesion: 0.50
Nodes (3): 2026-11-16 · Planeación, BITÁCORA, Plantilla

### Community 32 - "BUGS — trampas conocidas y registro"
Cohesion: 0.50
Nodes (3): BUGS — trampas conocidas y registro, Registro de bugs, Trampas conocidas (léelas antes de tocar estas áreas)

### Community 33 - "audio/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 34 - "core/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 35 - "export/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 36 - "media/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 37 - "midi/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 38 - "render/tsconfig.json"
Cohesion: 0.50
Nodes (3): extends, include, ../../tsconfig.base.json

### Community 39 - ".prettierrc.json"
Cohesion: 0.50
Nodes (3): printWidth, singleQuote, trailingComma

## Knowledge Gaps
- **10 isolated node(s):** `ADR-0003`, `ADR-0003`, `../../tsconfig.base.json`, `../../tsconfig.base.json`, `../../tsconfig.base.json` (+5 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 337 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `2026-11-16 · Fase 0 · Cimientos` connect `model.test.ts` to `ui/src/index.ts`, `BITÁCORA`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `ADR-0003`, `ADR-0003`, `../../tsconfig.base.json` to the rest of the system?**
  _10 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ui/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07320024198427103 - nodes in this community are weakly interconnected._
- **Why does `Logo()` connect `ui/src/index.ts` to `model.test.ts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `model.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10083256244218317 - nodes in this community are weakly interconnected._
- **Why does `@playwright/test` connect `package.json` to `web/package.json`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `web/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.059800664451827246 - nodes in this community are weakly interconnected._