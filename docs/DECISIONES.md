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

### ADR-012 · Digitación con algoritmo propio en lugar de portar PianoPlayer
- **Contexto:** el ROADMAP proponía portar a TypeScript el algoritmo de PianoPlayer (MIT). Mientras la licencia del proyecto no esté decidida (P1), CLAUDE.md pide no copiar código de otros proyectos.
- **Decisión:** `packages/practice` implementa su propia digitación:
  - Usa programación dinámica (Viterbi) sobre los dedos de cada nota o acorde.
  - Las distancias cómodas entre pares de dedos salen del modelo publicado de Parncutt et al. (1997). Son datos de un artículo, no código.
  - Agrega reglas propias: el pulgar y el meñique en tecla negra, el paso del pulgar, el mismo dedo en otra tecla, y que la distancia entre dedos de un acorde siga la de las notas.
  - Tiene tamaño de mano configurable (pequeña, mediana, grande) y respeta los dedos que fija el usuario como anclas.
  - La separación de manos también es propia: cuesta el registro, la continuidad y la apertura máxima.
- **Consecuencias:**
  - Sin obligaciones de licencia de terceros.
  - La calidad se mide con Jacobo en 3 piezas: el porcentaje que cambiaría queda en la BITÁCORA.
  - Si en el futuro conviene comparar con PianoPlayer, se hace como prueba externa, no copiando su código.

### ADR-013 · Transcripción con Basic Pitch; el modelo de piano con pedal queda para después
- **Contexto:** la fase 5 pide Basic Pitch para todo y el modelo de piano de ByteDance (con pedal) convertido a ONNX. Esa conversión necesita Python, PyTorch y el modelo original (cerca de 170 MB), y es un [VERIFICAR] de ARQUITECTURA. El paquete `@spotify/basic-pitch` (Apache-2.0) ya trae su modelo (900 KB) y corre con TensorFlow.js.
- **Decisión:** se usa el plan B de ARQUITECTURA.
  - Basic Pitch para todo, piano incluido, en un Web Worker, con el modelo empaquetado en la app (sin conexión).
  - El pedal no se detecta todavía.
  - El modelo de ByteDance se evaluará aparte: conversión a ONNX en D:, tamaño y velocidad. Si conviene, entra como opción "Piano con pedal", que se descarga a demanda.
- **Consecuencias:**
  - Transcribir funciona ya en todos los equipos.
  - En piano, Basic Pitch es menos preciso que un modelo especializado y no da pedal.
  - La F1 de ataques contra las grabaciones de Jacobo queda en la BITÁCORA para comparar después.

### ADR-014 · Modelo de piano con pedal (Kong et al.) en ONNX
- **Contexto:**
  - Jacobo probó Basic Pitch con el micrófono: confunde el ventilador y la voz con notas y se le escapan notas suaves.
  - Contra sus MIDI, Basic Pitch encuentra el 55 % de las notas.
  - Él pidió que se reconozca el pedal y que todo quede en MIDI.
- **Decisión:**
  - Se agrega el modelo de piano de Kong et al. 2021 (ByteDance, *High-resolution piano transcription with pedals*). Pesos CC BY 4.0 (Zenodo 4034264), código de inferencia MIT.
  - Se exportó a ONNX (154 MB, fp32) con un script local (`D:\.cache\claude-tmp\kong_onnx.py`). La versión int8 fue más lenta y menos precisa: se descartó.
  - Corre con `onnxruntime-web` 1.31 (MIT) en un worker, en el procesador (WASM, varios hilos).
  - Para los hilos, la app se sirve aislada: `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: credentialless` en Vite y en Vercel.
  - El posprocesado (notas, fuerza y pedal) se portó a TypeScript. Una prueba local lo compara con el Python original: mismas 264 notas y 10 pedales en 25 s de Consuelo.
  - Basic Pitch queda como modelo "Rápido".
- **Medidas** (portátil de Jacobo, Intel i5-4300M de 2014, 2 núcleos):

  | Dónde | Velocidad |
  |---|---|
  | ONNX nativo | 1,2× tiempo real |
  | PyTorch | 0,28× tiempo real |
  | Navegador, WASM con 4 hilos | ~0,12× tiempo real (80 s por cada 10 s de audio) |
  | Navegador, WebGPU (Intel HD 4600) | no avanzó en 15 min y congeló la página; no se usa |

- **Precisión** (Consuelo, contra su MIDI):
  - Encuentra el 96 % de las notas; Basic Pitch, el 55 %.
  - La precisión no se puede medir con ese MP3: tiene reverb y sustain de Cakewalk que no están en el MIDI.
  - Falta la prueba con teclado y micrófono a la vez (BITÁCORA).
- **Consecuencias:**
  - En el navegador de un equipo viejo, el modelo preciso no sirve para tiempo real ni para piezas largas.
  - La app de PC (fase 8) debe correrlo nativo (ONNX Runtime desde Rust), cerca del tiempo real.
  - El modelo no va en el repositorio.
    - En desarrollo se sirve desde `D:\.cache\models` (`/modelos/`).
    - Para publicarlo hace falta un lugar (P21).

### ADR-015 · Transkun V2 reemplaza al modelo de Kong para "Piano con pedal"
- **Contexto:** Jacobo probó el modelo de Kong (ADR-014). Encuentra casi todas las notas, pero agrega muchas que no se tocaron. Él pidió buscar uno mejor, porque de esto depende la partitura.
- **Medida** (primeros 30 s de Consuelo, contra su MIDI, misma tecla y ±50 ms):

  | Modelo | Precisión | Exhaustividad | F1 |
  |---|---|---|---|
  | Basic Pitch | 45 % | 69 % | 54 % |
  | Kong et al. | 49 % | 97 % | 65 % |
  | Transkun V2 (Python) | 100 % | 97 % | 99 % |
  | **Transkun V2 en el navegador (este port)** | **99 %** | **98 %** | **99 %** |

  Transkun no confunde el reverb ni el sustain de Cakewalk con notas repetidas, y no inventa pedal: 2 eventos donde Kong veía 142.
- **Decisión:**
  - "Piano con pedal" pasa a ser Transkun V2. Viene del paquete de pip `transkun` 2.0.1, licencia MIT, © 2021 Yujia Yan, y los pesos vienen dentro del paquete.
  - Se exporta a ONNX en dos partes, con un script local en D:. El exportador nuevo de PyTorch necesitó pasar la atención de 5D a 4D; es el mismo cálculo.
    - Red: de las características a los puntajes del semi-CRF y el contexto (52,6 MB).
    - Cabezas: fuerza y ajuste fino de inicio y fin (3,4 MB).
  - El espectro (6 ventanas, FFT de 4096, banco mel de 229) y la decodificación se portaron a TypeScript:
    - Viterbi del semi-CRF.
    - Bernoulli continua para el ajuste fino.
    - Unión de segmentos de 16 s que avanzan de a 8 s.
  - Pruebas contra el Python original: misma ruta de Viterbi en los 90 símbolos, y espectro con error menor a 0,001. En el navegador da la misma F1 que el original.
  - Transkun se entrenó sin alargar las notas por el pedal: el final de cada nota es el soltar de la tecla, así que no hace falta el recorte que se usaba con Kong.
  - Se quitó el código de Kong.
- **Velocidad en el portátil de Jacobo** (i5-4300M):
  - ONNX nativo: 2,3× tiempo real.
  - Navegador (WASM, 4 hilos): unos 25 s por cada 8 s de audio, más ~100 s de preparación la primera vez.
  - En equipos nuevos y en la app de PC (nativo) será mucho más rápido.
- **Consecuencias:** el paquete del modelo pesa ~58 MB y se descarga una vez. Dónde se publica sigue en P21.

### ADR-016 · Partitura propia (tempo, cuantización, MusicXML) y OpenSheetMusicDisplay para dibujarla
- **Contexto:**
  - La fase 6 pide partitura desde cualquier toma: MIDI de un DAW, grabación del teclado o audio transcrito.
  - Jacobo pidió que la duración de las notas salga del ritmo y no del sonido, sobre todo con pedal.
  - Sus MIDI son de dos tipos:
    - Con metrónomo: Still learning a 134 BPM, Sorry a 140.
    - Tocados libres, que quedaron con el 120 por defecto de Cakewalk: Consuelo y Nostalgia.
- **Decisión:**
  - `packages/notation`, sin dependencias, con algoritmos conocidos:
    - Tempo por autocorrelación de los ataques y pulsos por programación dinámica (Ellis 2007). Rigidez 30: sigue algo del rubato sin deformar los compases.
    - El tempo del archivo se usa solo si sus notas caen en su cuadrícula. Si la cuadrícula viene corrida (Still learning: 1/4 de pulso), se realinea.
    - Cuantización por pulso a semicorcheas o tresillos (los tresillos solo si encajan claramente mejor).
    - Duración escrita: hasta la siguiente nota de la mano si el hueco es menor que una negra, o hasta soltar el pedal.
    - Figuras sin cruzar el pulso salvo desde uno, ligaduras entre compases, silencios y silencio de compás completo.
    - Dos pentagramas por mano y armadura por los perfiles de Krumhansl-Kessler.
    - Pedal con línea, con "Ped." al pisar, una muesca en cada cambio y un gancho al soltar.
  - Exportar MusicXML 4.0 y MIDI cuantizado. El PDF sale de imprimir la hoja (el navegador ofrece "Guardar como PDF"); no hacen falta dependencias.
  - Dibujo con OpenSheetMusicDisplay 2.2.1 (BSD-3), que se carga solo al abrir la pestaña. El cursor sigue la reproducción.
  - Metrónomo al grabar con el teclado: la toma guarda su tempo y su compás exactos. Es la forma fiable de tener una partitura limpia de lo que se toca.
  - beat_this (detección de pulsos con IA) queda para después: el método clásico basta con metrónomo o con MIDI de DAW, y en el rubato fuerte ningún método lo resuelve del todo.
- **Consecuencias:**
  - Una sola voz por pentagrama: en un acorde con notas de distinta duración, todas duran lo mismo.
  - Con rubato fuerte (Consuelo), el ritmo escrito sale aproximado. Tempo y compás se pueden corregir en la pestaña.
  - Jacobo valida la legibilidad.

### ADR-017 · Tutorial: modo espera, mano que se practica y pedal grande
- **Contexto:** la fase 7 pide practicar con la app: que espere a que se toque bien, manos por separado, repetir una sección, velocidad, dedos y pedal grandes, precisión sin juegos y video tutorial.
- **Decisión:**
  - `WaitMode` en `packages/practice`:
    - La pieza se agrupa en acordes (notas a menos de 40 ms) de la mano elegida.
    - La reproducción se detiene en cada acorde y sigue cuando se tocaron todas sus teclas, en cualquier orden.
    - Una tecla equivocada solo cuenta como error.
    - Precisión: acordes tocados sin errores sobre acordes tocados.
  - El audio deja de tocar la mano que se practica (o las dos). "La otra mano la toca la app" es un interruptor.
  - Mientras el tutorial está activo, tocar el teclado no lleva a la vista en vivo: la pieza se queda a la vista.
  - Repetir una sección y la velocidad usan lo que ya había (repetición de la línea de tiempo y velocidad del transporte).
  - `show.bigPedal` (opcional) en el modelo visual: la franja del pedal pasa de 3 % a 7 % del alto. Cambio de modelo compatible: si falta, es falso.
  - Video tutorial: opción del diálogo de exportar que activa números de dedo y pedal grande solo para ese video.
- **Consecuencias:**
  - El modo espera necesita el teclado conectado por USB (Web MIDI).
  - Sin teclado se puede practicar mirando, con la mano silenciada y la velocidad baja.

---
### Plantilla
```
### ADR-0XX · Título
- **Contexto:**
- **Decisión:**
- **Consecuencias:**
```
