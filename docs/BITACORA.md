# BITÁCORA

Una entrada por sesión, la más reciente arriba.

## Plantilla
```
### AAAA-MM-DD · Fase N · <tema>
- Hecho:
- Pruebas: (comandos y resultado)
- Probado por Jacobo: (qué, con qué equipo, resultado) / no aplica
- Pendiente para la próxima:
- Pedidos del usuario no atendidos: (ninguno / cuáles y por qué)
```

---

### 2026-11-16 · Fase 0 · Cimientos
- Hecho:
  - Kit descomprimido y commit inicial en `main`. Toda la fase va en la rama `f0/cimientos`. Git configurado solo para este repo (Jacobo, jjacobolalvarez34@gmail.com).
  - Monorepo pnpm + Turborepo: `apps/web` (Vite 8 + React 19 + PWA con `vite-plugin-pwa`) y `packages/{core,midi,render,audio,export,media,ui}`. `transcribe`, `notation`, `practice`, `apps/desktop` y `apps/mobile` son carpetas con un README de una línea.
  - `packages/core`: tipos copiados exactos de ARQUITECTURA, más utilidades sin DOM: `createNoteEvent`, `createTrack`, `createTake`, `sortNotes`, `sortPedals`, `validate*`, `PEDAL_CC`, `pedalKindFromCC`, `isPedalDown` y `pedalValueAt`. El modelo no cambió, así que no hace falta ADR.
  - `packages/ui`: tokens exactos de DESIGN §2, Martian Mono y Archivo empaquetadas con `@fontsource`, y los 9 componentes de §4 más `<Logo size variant>`. `Logo` acepta un tamaño fluido (`clamp()`) para que quepa a 390 px.
  - Página `/componentes`, armada como el lienzo de identidad: logo, color, tipografía y componentes.
  - `assets/brand/icon.svg` como favicon y como ícono de la PWA. Los PNG de 192 y 512 se generan con `pnpm brand:icons`. Íconos de la interfaz con `lucide-react`.
  - ESLint 10 + typescript-eslint, Prettier, TypeScript 6.0 `strict` + `noUncheckedIndexedAccess`, Vitest, Playwright (escritorio 1440 y celular 390) y CI en GitHub Actions.
  - Graphify: `graphify install --project` (skill, sección en CLAUDE.md y hooks en `.claude/settings.json`) y `graphify hook install` (post-commit, post-checkout y post-merge). Primer grafo AST: 567 nodos y 673 aristas. Falta la pasada semántica de los documentos con `/graphify .`, porque gasta tokens de IA.
  - Regla nueva: todo en D:. El store y la caché de pnpm, la caché de npm y los navegadores de Playwright quedaron configurados en D: (ver HERRAMIENTAS).
  - Fixtures: 4 piezas copiadas, sin mover nada, de `C:\Cakewalk Projects` a `fixtures/jacobo/` (MIDI y MP3). Quedan fuera de git hasta decidir P11.
- Pruebas:
  - `pnpm lint`: verde.
  - `pnpm typecheck`: 8/8 paquetes.
  - `pnpm test`: 22/22, con velocity 0, pedal intermedio, tempo variable y desorden.
  - `pnpm e2e`: 13 pasan y 1 se omite (toques de 44 px solo aplica en celular).
  - Contraste AA medido: el par más bajo es blanco sobre `--grabacion`, con 5,76:1.
  - Capturas en `test-results/capturas/componentes-{escritorio,celular}.png`.
- Probado por Jacobo: no aplica todavía (no hay MIDI). Pendiente: comparar `/componentes` con el lienzo de identidad.
- Notas técnicas:
  - TypeScript se queda en 6.0 porque typescript-eslint aún no soporta TS 7.
  - pnpm 12 agregó `minimumReleaseAgeExclude` para typescript-eslint 8.73.0, por ser una versión muy reciente.
  - Playwright corre con 1 worker en local porque la máquina se satura, y bloquea el service worker en las pruebas.
  - La primera corrida de e2e falló por 36 px de desborde del logo a 390 px. Se arregló.
- Pendiente para la próxima:
  - Decidir P12 (app de celular instalable, no web), que cambia ADR-001 y las fases 2 y 8.
  - Hacer push y abrir el PR cuando exista el remoto.
  - Hacer la pasada semántica de Graphify.
  - Agregar el aviso "Hay una versión nueva. Recargar" (B-016) en la fase 3.
- Pedidos del usuario no atendidos: ninguno de la Fase 0. No se hizo push porque el remoto de GitHub aún no existe (lo crea Jacobo).

### 2026-11-16 · Planeación
- Investigación, producto, identidad (C3 · Consola ámbar) y documentos iniciales listos en chat.
- Siguiente: Fase 0.
