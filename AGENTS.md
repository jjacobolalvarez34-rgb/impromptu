# AGENTS.md — Impromptu

Este archivo es para cualquier agente de código (Codex, Antigravity, Cursor, Claude Code u otro). Las reglas completas están en `CLAUDE.md`; aquí va lo esencial para que todos trabajen igual.

## Antes de tocar código
1. Lee `CLAUDE.md`, `docs/ROADMAP.md` (fase actual) y las últimas entradas de `docs/BITACORA.md`.
2. Consulta el grafo de Graphify (`graphify-out/GRAPH_REPORT.md` o `/graphify query "..."`) antes de buscar archivo por archivo.
3. Revisa `docs/PENDIENTES.md`: si tu tarea depende de una decisión abierta, usa el valor provisional indicado.

## Reglas
- Trabaja solo en la fase y el paso asignados.
- Rama `f<fase>/<slug>`, PR, CI verde. Nunca commits directos a `main`.
- Tipos estrictos (TypeScript `strict`). Sin `any` salvo en los bordes con librerías sin tipos, documentado.
- Pruebas: unitarias (Vitest) para la lógica; end-to-end (Playwright) para flujos de pantalla. Capturas de pantalla como evidencia en el PR.
- Dependencias nuevas: revisa y actualiza `docs/LICENCIAS.md` en el mismo PR.
- Interfaz: solo tokens y componentes de `docs/DESIGN.md`.
- Al terminar: entrada en `docs/BITACORA.md` (qué hiciste, qué falta, qué probó Jacobo).

## Roles sugeridos para subagentes
| Rol | Qué revisa |
|---|---|
| Revisor | Que el PR cumpla `docs/VERIFICACIONES.md` y no rompa el modelo de datos |
| QA | Corre Playwright, revisa capturas, prueba atajos de teclado y celular |
| Auditor de licencias | Cada dependencia, modelo, fuente o sonido contra `docs/LICENCIAS.md` |
| Rendimiento | Mide fps del visualizador y tiempo de exportación contra los presupuestos de `docs/ARQUITECTURA.md` |
| Músico (Jacobo) | Lo que solo un pianista valida: digitación, pedal, partitura, sensación al tocar |
