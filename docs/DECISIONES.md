# DECISIONES (ADRs)

Formato: contexto → decisión → consecuencias. Para agregar una, copia la plantilla al final.

### ADR-001 · Web primero, una sola base de código
- **Contexto:** se quiere web, escritorio y celular, y un solo desarrollador con agentes.
- **Decisión:** app en TypeScript; escritorio con Tauri envolviendo la misma app; celular como app instalable (ver ADR-008, que reemplaza la idea de usar la PWA en el celular).
- **Consecuencias:** Safari e iPhone quedan sin MIDI al inicio. En macOS de escritorio se usa `tauri-plugin-midi`.

### ADR-002 · Todo se procesa en el equipo del usuario
- **Contexto:** la herramienta debe ser gratis sin costos de servidor.
- **Decisión:** render, audio, exportación y transcripción corren en el navegador o la app (WebGL/WebGPU, WebCodecs, Web Workers, ONNX/TF.js).
- **Consecuencias:** los modelos de IA se descargan a demanda y se guardan en caché. Los equipos lentos tardan más. Un plan pago futuro podría ofrecer nube opcional.

### ADR-003 · Modelo de datos con mano, dedo, pedal e instrumento desde el inicio
- **Contexto:** los diferenciadores (digitación, pedal, partitura, otros instrumentos) llegan en fases posteriores.
- **Decisión:** `NoteEvent` y `Track` incluyen esos campos desde la fase 0 (ver ARQUITECTURA).
- **Consecuencias:** se evita reescribir el núcleo después. Los campos valen `null` hasta su fase.

### ADR-004 · Exportación por render offline determinista
- **Contexto:** grabar la pantalla da cuadros perdidos y desincronización.
- **Decisión:** cada cuadro se calcula solo a partir de t = N/fps y se codifica con WebCodecs + Mediabunny.
- **Consecuencias:** partículas con semilla. Exportar puede ser más rápido o más lento que el tiempo real según el equipo.

### ADR-005 · PixiJS para el visualizador
- **Contexto:** miles de notas a 60 fps con partículas y brillo.
- **Decisión:** PixiJS (WebGL con WebGPU cuando esté disponible) en lugar de DOM, SVG o Canvas 2D.
- **Consecuencias:** la UI (React) y el lienzo (Pixi) van separados. El render también corre en OffscreenCanvas para exportar.

### ADR-006 · Identidad C3 · Consola ámbar
- **Contexto:** se compararon tres direcciones (Ébano y fieltro, Partitura, Consola ámbar) en interfaz completa y en logos.
- **Decisión:** Jacobo eligió C3: Martian Mono + Archivo, carbón con ámbar y botones de tecla física (DESIGN.md).
- **Consecuencias:** el tema "Sala" del visualizador conserva la estética de la dirección A como opción para los videos.

### ADR-007 · Licencias no comerciales fuera del núcleo
- **Contexto:** MuScriptor es el mejor modelo abierto multi-instrumento, pero sus pesos son CC BY-NC 4.0.
- **Decisión:** el núcleo solo usa modelos con licencias permisivas (Basic Pitch y ByteDance, Apache-2.0). MuScriptor queda, como mucho, como complemento opcional que descarga el usuario, y solo tras revisión legal.
- **Consecuencias:** la transcripción de varios instrumentos será menos precisa al principio.

### ADR-008 · Tres productos: web, PC y celular instalable, sin conexión
- **Contexto:** ADR-001 dejaba el celular como la misma PWA. Jacobo aclaró (2026-11-16) que quiere tres productos distintos: la web, una app instalable en PC y una app instalable en el celular. El celular **no** debe ser una página web, y debe funcionar sin internet en todo lo que se pueda.
- **Decisión:**
  - La interfaz se escribe una sola vez (`apps/web` y `packages/*`) y se empaqueta tres veces:
    - `apps/web`: la web.
    - `apps/desktop`: Tauri 2 para Windows, macOS y Linux.
    - `apps/mobile`: APK de Android instalable.
  - Para el celular se usa Tauri 2 móvil o Capacitor. La elección se hace en la fase 8 con una prueba aislada de Web MIDI por OTG.
  - Todo va **dentro del instalador**: interfaz, fuentes, ícono y piano Salamander. La app abre, graba, reproduce, edita y exporta sin red.
  - Los modelos de IA (fase 5) se descargan una sola vez desde la app y quedan guardados. Si su tamaño lo permite, se evalúa incluirlos en el APK.
  - No se hace una app nativa aparte (Kotlin o React Native) porque duplicaría cada función. Hacerla de forma nativa no aporta nada para trabajar sin conexión.
- **Consecuencias:**
  - Cambia la fase 2: la vista de celular se diseña como pantalla de la app (DESIGN §5), no como "la misma PWA".
  - Cambia la fase 8: se hacen los dos instaladores.
  - Ninguna función básica puede depender de un servidor (ya lo exigía ADR-002).
  - La PWA queda solo para la versión web.
  - iPhone sigue fuera de alcance por ahora.

### ADR-009 · Piano propio con Web Audio en lugar de `@tonejs/piano`
- **Contexto:** `@tonejs/piano` está sin mantenimiento desde 2022 y pide Tone 14 (hoy va en 15). Además, descarga las muestras en cada uso y corre en el contexto en tiempo real de Tone, lo que complica el render offline de la fase 3.
- **Decisión:** `packages/audio` implementa su propio sampler sobre Web Audio, con las muestras MP3 del Salamander Grand. Detalles:
  - Usa 5 de las 16 capas de fuerza, unos 30 MB, con ganancia continua dentro de cada capa.
  - Las muestras se descargan la primera vez y se guardan en la Cache Storage, así que después funciona sin conexión (ADR-008).
  - Los pedales se resuelven antes de sonar, con una función pura que tiene pruebas: el sustain, el sostenuto solo para las notas atrapadas, la una corda y la repetición de una misma tecla.
  - El reloj del estudio pasa a ser el del AudioContext, corregido por la latencia de salida, para que imagen y sonido no se separen.
- **Consecuencias:**
  - No depende de Tone.js.
  - El mismo `Piano` funciona con un `OfflineAudioContext` para exportar.
  - Hoy las muestras vienen de una copia pública (PROVISIONAL, P15); antes de la v0.1 hay que servirlas desde un espejo propio.

### ADR-010 · Estilo y brillo de las notas en `VisualProject.effects`
- **Contexto:** Jacobo vio las notas "solo color" y pidió efectos como los de los videos de referencia. También pidió más brillo y más chispas que el máximo de entonces.
- **Decisión:** se agregan dos campos a `VisualProject.effects`:
  - `noteStyle: 'flat' | 'glow'`. Con 'glow', la nota lleva un cuerpo con degradado, un borde de luz y un halo aditivo de su color.
  - `noteGlow` (0–200 %): la intensidad de ese halo.
  - Además, `sparks` y `keyGlow` pasan de 0–100 a 0–200 %. El 100 % nuevo es más intenso que el máximo anterior, y al sonar una tecla sube un haz de luz.
- **Consecuencias:**
  - Todo sigue dependiendo solo de t (ADR-004).
  - Los ajustes guardados de antes se completan con los valores por defecto al cargarse.
  - En la vista plana (celulares lentos) el halo no se dibuja.

### ADR-011 · Líneas de compás y pulso en el visualizador
- **Contexto:** Jacobo pidió ver el compás y el tempo "bajando" detrás de las notas.
- **Decisión:**
  - Se agrega `VisualProject.effects.beatGuides: boolean`.
  - `@impromptu/core` calcula la cuadrícula de pulsos y compases (`beatGrid`) a partir de `tempoMap` y `timeSignature`, y respeta los cambios de tempo aunque caigan a mitad de un pulso.
  - El visualizador dibuja una línea por pulso y una línea más marcada, con el número, por compás.
  - El transporte muestra el compás, el pulso y el tempo actuales.
- **Consecuencias:**
  - Las tomas sin tempo (las grabadas en vivo) no muestran cuadrícula hasta que haya detección de tempo (fase 6).
  - Por ahora solo se usa el primer compás del MIDI; los cambios de compás quedan para la fase 6.

---
### Plantilla
```
### ADR-0XX · Título
- **Contexto:**
- **Decisión:**
- **Consecuencias:**
```
