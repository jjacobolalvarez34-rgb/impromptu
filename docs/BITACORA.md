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

### 2026-11-16 · Fase 2 · Teclado en vivo, pedales y modo en vivo
- Hecho:
  - `packages/midi`, en vivo:
    - Adaptador Web MIDI: permiso explicado, lista de dispositivos y conexión y desconexión en caliente. Si Safari no tiene MIDI, se avisa (B-006).
    - Normalizador: B-001, B-003, B-004, B-005 y B-007.
    - Perfil del PSR-E343, que Windows muestra como "Digital Keyboard-1".
    - `Recorder`, que cierra las notas abiertas al parar (B-002).
  - `packages/audio`:
    - `LivePlayer`: sustain, sostenuto, una corda y repetición de tecla en vivo.
    - Polifonía máxima de 64 voces con robo de la voz más vieja; la prueba de 2.000 notas cortaba el sonido.
    - Al buscar o repetir una sección, se oyen las notas que ya sonaban (pedido de Jacobo).
  - `packages/render`:
    - Modo `rise`: en vivo, las notas nacen en la tecla y suben.
    - Fondo del tema, de color o transparente.
  - Estudio:
    - Conexión del teclado, que se reconecta sola si ya hay permiso.
    - Vista en vivo explícita: el indicador del teclado muestra el teclado limpio (pedido de Jacobo).
    - Grabar y Detener; tomas en IndexedDB que se pueden abrir, renombrar y borrar con confirmación.
    - Línea de tiempo con carriles (notas por mano y pedal): clic para buscar y arrastrar para repetir una sección. Estos dos puntos venían pendientes de la fase 1.
    - Botón de bocina para silenciar el piano de la app (B-009).
    - Ajustes visuales guardados entre sesiones.
  - `/en-vivo`: pantalla completa para OBS, con fondo verde, transparente o del tema y controles que se esconden solos.
  - `/celular`: vista Grabar de DESIGN §5, con Wake Lock al grabar (B-017). A la pantalla `/` se llega en el celular por el ancho.
- Pruebas: vitest core 27, midi 22, render 23 y audio 17 (89 en total); lint y typecheck en verde; CI verde en cada push.
- Probado por Jacobo (PSR-E343 por USB, Chrome en Windows, sin el controlador de Yamaha):
  - Lo reconoció de inmediato. Retraso tecla → luz "muy poco". El sonido no se siente con retraso.
  - Grabó, reprodujo y repitió secciones.
  - Pedal: no lo había encontrado; solo tiene sustain.
- Pendiente:
  - Prueba del sustain con el FC4/FC5.
  - P16: rediseñar la vista de celular, que a Jacobo no le gustó; se retoma al final.
  - P17: prueba en OBS.
  - P18: sostenuto y una corda con testers.
  - Probar en un celular Android real necesita https (fase 3, despliegue).
- Pedidos del usuario no atendidos: ninguno. Lo que pidió dejar para después está anotado en P16, P17 y P18.

### 2026-11-16 · Fase 1 · Visualizador desde un MIDI
- Hecho:
  - `packages/midi`: lector de .mid con `midi-file`. Maneja velocity 0, notas sin cerrar, repeticiones FIFO, tempo variable en cualquier pista, SMPTE, compás y armadura, y canal 10 como batería. Aplica a la pista del piano el pedal que viene en una pista aparte, y quita pistas duplicadas aunque una esté cuantizada (caso Nostalgia).
  - `packages/core`: rangos de 61, 76 y 88 teclas y ajuste automático (B-015).
  - `packages/render`, con PixiJS 8:
    - Geometría del teclado con las negras ubicadas por clase de nota (B-014).
    - Notas cayendo recortadas en la línea, teclas iluminadas, brillo, guías de octava y barra de pedal continua.
    - Chispas con semilla sin estado (B-012) y pools de objetos (B-013).
    - Temas Ámbar y Sala; colores por mano personalizables, que pueden ser iguales.
  - `packages/audio`: piano Salamander propio con Web Audio (ADR-009). Resuelve sustain, sostenuto, una corda y la repetición de una tecla. Descarga 5 capas una sola vez y las guarda en caché.
  - Pantalla Estudio:
    - Abrir MIDI o arrastrarlo; las piezas locales de Jacobo y una prueba de 2.000 notas.
    - Formato 16:9, 9:16 o 1:1; teclado Auto, 61, 76 u 88.
    - Panel de tema, notas, efectos y pedales.
    - Transporte con LCD, buscar, velocidad de 0,5× a 1,5× y botón para silenciar.
  - Animación de marca `/intro` y exportación a MP4 (`pnpm intro:mp4`), hecha por un agente.
- Pruebas: vitest de core 27, midi 14, render 22 y audio 11; las 4 piezas reales pasan. CI verde en cada push.
- Probado por Jacobo (Chrome, Windows): abrió sus MIDIs, se ve fluido, suena y "funciona todo correcto".
  - Arreglado a partir de su prueba: el lienzo salía en blanco por perderse el contexto WebGL en el doble montaje de desarrollo; el selector de color trababa la pantalla; el botón de sonido estaba en un lugar confuso.
- Pendiente:
  - "Repetir sección" y la línea de tiempo con carriles (MD, MI, pedal y video) pasan a la fase 2, porque ahí se graban las tomas.
  - Falta la cifra de fps con la prueba de 2.000 notas medida por Jacobo (el contador aparece al abrir esa prueba).
  - El teclado realista queda para el final.
  - P14 (detalles del logo) y P15 (espejo del piano).
- Pedidos del usuario no atendidos: "repetir sección" y "línea de tiempo con carriles" del prompt de la fase 1 no se hicieron todavía; se harán en la fase 2.

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
