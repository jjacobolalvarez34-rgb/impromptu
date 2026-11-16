# VERIFICACIONES — antes de decir "listo"

Marca cada punto en la entrada de la BITÁCORA. Lo que no aplica se marca "N/A" con el motivo.

## 1. Siempre
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde.
- [ ] Playwright en verde, con capturas de las pantallas tocadas (artefacto "playwright" del CI o `test-results/capturas/`).
- [ ] Sin `any` nuevos ni `console.log` olvidados.
- [ ] Dependencias nuevas registradas en `LICENCIAS.md`.
- [ ] Entrada en `BITACORA.md`, incluyendo "pedidos no atendidos".
- [ ] Grafo actualizado (`/graphify . --update` o el hook).

## 2. Interfaz
- [ ] Solo tokens y componentes de `DESIGN.md`; nada de colores sueltos.
- [ ] Ámbar solo en lo activo; un solo botón principal por vista.
- [ ] Foco visible con teclado en todo; se puede usar sin mouse.
- [ ] Contraste AA y toques de 44 px en celular.
- [ ] Se ve bien a 390 px de ancho y a 1440 px.
- [ ] Textos en español, verbo al inicio, sin "por favor" ni exclamaciones.
- [ ] Ninguna regla del "No" de DESIGN §6.

## 3. Modelo de datos y tiempo
- [ ] Ningún cambio al modelo sin ADR.
- [ ] Todo evento en segundos sobre el mismo reloj.
- [ ] Pruebas con: notas sin note-off, velocity 0, pedal con valores intermedios, tempo variable.

## 4. MIDI y teclado real
- [ ] Conectar y desconectar en caliente sin colgarse.
- [ ] Mensaje claro si no hay permiso o si el navegador no soporta MIDI.
- [ ] **Prueba con el Yamaha PSR-E343 de Jacobo** (anotar en BITÁCORA): notas, fuerza, pedal y latencia percibida.

## 5. Visualizador y exportación
- [ ] 60 fps con 2.000 notas visibles (medido, cifra en la BITÁCORA).
- [ ] Mismo t = mismo cuadro: dos exportaciones iguales dan cuadros idénticos.
- [ ] Audio y video sincronizados al inicio, a la mitad y al final (±1 cuadro).
- [ ] Exporta 16:9, 9:16 y 1:1, y el MP4 abre en el reproductor del celular y sube a YouTube e Instagram.

## 6. Transcripción (fase 5+)
- [ ] F1 de ataques contra fixtures, anotado.
- [ ] Cancelar funciona y no deja el worker colgado.
- [ ] Archivos de 10 minutos no se quedan sin memoria.

## 7. Privacidad
- [ ] Ningún archivo, audio o video sale del equipo.
- [ ] Los permisos se piden solo al usar la función.
