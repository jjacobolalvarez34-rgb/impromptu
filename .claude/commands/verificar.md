---
description: Recorre VERIFICACIONES.md y reporta el estado real
---
1. Corre `pnpm lint`, `pnpm typecheck`, `pnpm test` y las pruebas de Playwright afectadas.
2. Recorre cada sección de `docs/VERIFICACIONES.md` que aplique al cambio y marca ✔, ✘ o N/A con evidencia (salida de comando, ruta de captura, cifra medida).
3. Si algo requiere al músico (teclado real, pedal, sensación al tocar), escríbelo como "Pendiente de prueba de Jacobo" con los pasos exactos.
4. No digas "listo" si hay un ✘. Arregla o explica por qué no.
