# CLAUDE.md — Impromptu (léelo SIEMPRE al empezar)

## Qué construimos
**Impromptu** es una herramienta **gratuita y open source** para hacer videos de piano con notas cayendo (estilo Rousseau / Patrik Pietschmann), pero que va mucho más allá:

1. Visualizador de notas cayendo con temas, efectos y video de las manos.
2. Grabación directa desde el teclado MIDI, con **pedales** (sustain, sostenuto, una corda).
3. Audio (WAV/MP3) o micrófono → notas, con IA que corre en el equipo del usuario.
4. Partitura formal exportable (MusicXML, PDF, MIDI).
5. Tutoriales: digitación (qué dedo), marcas de pedal y modo práctica.
6. Modo en vivo para transmitir (OBS).
7. Después: guitarra (tablaturas) y batería.

Público inicial: **gente que hace videos de música**. El dueño del proyecto, Jacobo, es pianista y es el primer usuario y probador. Su teclado: **Yamaha PSR-E343** (61 teclas, sensible a la fuerza, USB TO HOST, pedal FC4/FC5 de encendido/apagado).

Plataformas: **tres productos con una sola base de código**: la web, una app instalable de PC (Tauri) y una app instalable de celular (Android, sin conexión en todo lo posible). Ver ADR-008.

## Regla de producto número 1
**No estamos haciendo otro Rousseau.** Cada fase tiene que dejar espacio para lo que nos diferencia: pedal visible, digitación, partitura, tutoriales, audio→notas, otros instrumentos, gratis. Por eso el modelo de datos guarda **mano, dedo, pedal e instrumento desde el día 1** (ver `docs/ARQUITECTURA.md`), aunque la fase 1 no los muestre.

## Dónde está cada cosa
| Archivo | Para qué |
|---|---|
| `docs/PRODUCTO.md` | Visión, usuarios, funciones, diferenciadores |
| `docs/ARQUITECTURA.md` | Stack, módulos, modelo de datos, flujos |
| `docs/DESIGN.md` | Identidad visual: logo, colores, tipografía, componentes, reglas anti "hecho con IA" |
| `docs/ROADMAP.md` | Fases y el prompt listo para cada una |
| `docs/PENDIENTES.md` | Decisiones que son de Jacobo, no tuyas |
| `docs/BITACORA.md` | Qué se hizo en cada sesión |
| `docs/DECISIONES.md` | ADRs (decisiones técnicas con su porqué) |
| `docs/VERIFICACIONES.md` | Checklists antes de dar algo por terminado |
| `docs/BUGS.md` | Trampas conocidas y registro de bugs |
| `docs/LICENCIAS.md` | Qué librería, modelo o sonido se puede usar y bajo qué licencia |
| `docs/INVESTIGACION.md` | Hallazgos y fuentes de la investigación inicial |
| `docs/HERRAMIENTAS.md` | Graphify, plugins y skills que usamos |

## Protocolo de cada sesión
1. Empieza con `/inicio-sesion`. Termina con `/fin-sesion` (o cuando notes el contexto lleno).
2. Antes de buscar en el código, consulta el grafo: `/graphify query "..."`. Solo si no alcanza, busca a mano.
3. Trabaja la fase y el paso que diga `docs/ROADMAP.md`. No adelantes fases.
4. Trabajo directo en `main` (decisión de Jacobo, 2026-11-16): commits pequeños y frecuentes, cada uno con lint, typecheck y pruebas en verde, y push al terminar cada paso para que Jacobo lo previsualice. El CI corre en cada push a `main`; si sale rojo, se arregla antes de seguir.
5. Antes de decir "listo": `/verificar`. **Nada de "debería funcionar"**: pruebas que corren, capturas con Playwright y, si toca MIDI real, pídele a Jacobo que pruebe con su Yamaha y anota el resultado.
6. Si una decisión es de producto, licencia, marca o dinero, **no la inventes**: agrégala a `docs/PENDIENTES.md`, usa un valor provisional marcado `// PROVISIONAL(Pn)` y sigue.
7. Decisión técnica relevante → ADR en `docs/DECISIONES.md`.
8. Si una tarea larga trae varios pedidos, haz una lista al inicio y al final marca cuáles se hicieron. Si algo quedó sin hacer, **dilo explícitamente**; no lo omitas en silencio.

## Reglas de oro técnicas
- **Todo corre en el equipo del usuario** (transcripción, render de video, audio). Sin servidores de pago: así el producto puede ser gratis.
- **En el equipo de Jacobo, todo en D:** dependencias, cachés, navegadores, SDKs y temporales. Nada en C:. Ver `docs/HERRAMIENTAS.md`.
- **Licencias primero**: antes de agregar una dependencia, modelo o sonido, revisa `docs/LICENCIAS.md`. Nada con licencia no comercial (por ejemplo, los pesos de MuScriptor) en el núcleo.
- **No copies código GPL** de otros visualizadores (Neothesia, Pianorium) mientras no esté decidida la licencia del proyecto (P1).
- **El tiempo manda**: todo evento (nota, pedal, cuadro de video, muestra de audio) vive en segundos sobre un mismo reloj. Nunca sincronices "a ojo".
- **Rendimiento**: el visualizador va a 60 fps con miles de notas. Nada de DOM por nota; todo en el renderer (ver ARQUITECTURA).
- **Accesible**: botones reales, foco visible, contraste AA, toques de 44 px en celular.
- **Español** en interfaz y documentos. Código e identificadores en inglés.

## Diseño
Identidad aprobada: **C3 · Consola ámbar** (ver `docs/DESIGN.md`). Usa solo sus tokens y componentes. Para diseñar o revisar pantallas usa el plugin **UI UX Pro Max** (accesibilidad, estados y patrones). Íconos: **Lucide**. Si un plugin contradice `docs/DESIGN.md`, gana DESIGN.md.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
