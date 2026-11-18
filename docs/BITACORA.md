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

### 2026-11-18 (tarde) · Pedidos de Jacobo tras probar la app
- Probado por Jacobo en su celular (verificado): la conversión ya no cierra la app, el teclado suena sin retraso, el micrófono graba bien con su piano vertical y la partitura sale muy bien.
- Decisiones de Jacobo: **licencia GPL-3.0** (`LICENSE`); muestras y modelo en **Hugging Face con la cuenta de Mamut Herd** (falta que Jacobo cree la cuenta y deje el token; pasos en PENDIENTES).
- Hecho, paso 1 (sus comentarios). **Sin verificar en el celular** salvo lo marcado:
  - **Cursor suave de la partitura** (web y celular): ya no salta de nota en nota. Se lee una vez dónde cae cada nota y una línea ámbar propia se desliza a 60 fps (`packages/notation/src/cursor.ts`); la hoja baja con suavidad al cambiar de renglón. En el celular, Kotlin manda el reloj y la página extrapola entre avisos.
  - **Barra continua con mensajes** (web y celular): entre avisos de la IA la barra sigue al ritmo promedio de los tramos y espera antes del final del tramo si todavía no termina (la idea de Jacobo); debajo, frases que se turnan y "Faltan unos N s". La IA ahora avisa varias veces por tramo. `packages/transcribe/src/avance.ts` y `AvanceSuave.kt`.
  - **Cola de conversiones** (web y celular): se puede grabar otra o convertir otro audio mientras la anterior trabaja; se hacen de a una para no llenar la memoria. En el celular el audio se guarda hasta convertirse: si la app se cierra, la cola se retoma al abrirla.
  - **Segundo plano en el celular**: servicio en primer plano con notificación de avance (como las descargas de WhatsApp) mientras hay conversiones o un video armándose.
  - **Pantalla del micrófono nueva**: estado "Grabando" que late, tiempo grande, onda en vivo, botón con anillo, consejos y la cola debajo.
  - **Exportar video rediseñado**: vista previa animada con la forma del formato, opciones compactas, tiempo restante; en tableta, centrado.
  - **Animaciones**: transiciones entre pantallas, tarjetas que se hunden al tocarlas, lista de piezas animada, barra "trabajando" que va y viene. **Tableta**: inicio en dos columnas.
  - **"Cuenta y nube · Próximamente"** en Ajustes (P23).
- Pruebas: notación 16/16 (cursor), transcripción (avance) 4/4, web e2e de transcripción y partitura en verde; app: Gradle BUILD SUCCESSFUL y JUnit 6/6 (Transkun igual a Python, +685 MB).
- Pendiente: llevar a la web y la PC la presentación y la pantalla principal de la PC; vista previa al exportar en web y PC; guitarra; batería; fase 10; fase 11; integrar y compilar.

---

### 2026-11-18 · Fase 8 · App de Android nativa (Kotlin + Compose)
- Hecho (ADR-019). **Todo esto está sin verificar en un celular**: no hubo teléfono conectado ni emulador (falta el controlador de virtualización de Windows).
  - Se quitó Capacitor: `apps/mobile` es ahora una app nativa en Kotlin + Jetpack Compose. Se borraron `apps/web/src/native/{install,midi}.ts` y las dependencias `@capacitor/*`; la web no cambia.
  - **Presentación** la primera vez (notas que caen sobre un teclado, el logo y cuatro líneas de qué hace la app) y **elegir instrumentos**: Piano trae todo (sonido Salamander, ~90 MB, se descarga una vez y se puede cancelar y retomar; IA Transkun, viene dentro del APK). Batería y Guitarra: "pronto".
  - **Inicio nuevo** ("Piezas primero"): franja LCD con el teclado conectado, cuatro formas de crear (Grabar, Micrófono, Audio a notas, Abrir MIDI) y la lista de piezas con renombrar, guardar MIDI, video y borrar (con confirmación). Aviso de la conversión en curso.
  - **Motor de sonido propio** en AudioTrack de baja latencia a la frecuencia del celular: muestras decodificadas una vez a PCM y leídas con memoria mapeada; sustain, sostenuto, una corda, sustain sin pedal (Ajustes), 64 voces y limitador.
  - **Teclado MIDI por USB (OTG)** con la API MIDI de Android y **grabación** con notas que suben del teclado; al detener se guarda y se abre la pieza.
  - **Pieza en horizontal**: notas cayendo a 60 fps (mismo dibujo para pantalla y video), tocar/pausa, ir al comienzo, barra de tiempo, velocidad 50/75/100 %, ocultar controles con un toque.
  - **Micrófono** (fuente sin procesar si el celular la tiene) y **audio a notas** (MP3, WAV, M4A…) con **Transkun nativo en ONNX Runtime**: espectro, Viterbi y unión de segmentos portados a Kotlin.
  - **Partitura** en un WebView con el mismo paquete de notación de la web y OpenSheetMusicDisplay (`apps/mobile/partitura`): compás, tocar con cursor que sigue lo que suena, compartir MusicXML.
  - **Exportar video** en el celular (H.264 + AAC): horizontal, vertical o cuadrado; 1080p o 720p; 4 s de cola con fundido; queda en Películas/Impromptu y se puede compartir. Sigue aunque se salga de la pantalla.
  - **Abrir y guardar MIDI** (tipo 1, PPQ 480, con pedales), también abrir un .mid desde otra app.
  - **BUG-002, BUG-003 y BUG-004**: arreglos hechos (ver BUGS).
  - Ícono de la app con el logo, tema C3 (Archivo y Martian Mono), íconos al estilo Lucide.
  - APK firmado con la llave de Mamut Herd: `apps/mobile/release/Impromptu-0.1.0.apk` (~100 MB, solo celulares de 64 bits).
  - VS Code: la extensión de Gradle ya no importa el proyecto por su cuenta (escribía su caché en C:).
- Pruebas (en la PC):
  - Gradle `assembleDebug` y `assembleRelease`: BUILD SUCCESSFUL. Firma verificada con apksigner (CN=Mamut Herd).
  - `pnpm --filter @impromptu/mobile pruebas` (JUnit): 6/6. **Transkun en Kotlin contra Python** con 30 s de Consuelo: 153 notas contra 153, F1 100 %, fuerza idéntica; Viterbi igual nota a nota; MIDI de ida y vuelta; secuencia y grabación.
  - Memoria de Transkun medida en esa prueba: de +2,5 GB a +0,67 GB (BUG-004).
  - `pnpm lint`, `pnpm typecheck` y `pnpm test`: verdes.
- Probado por Jacobo: todavía no. Pasos en PENDIENTES ("Para que pruebe Jacobo").
- Pendiente para la próxima:
  - Lo que diga Jacobo al probar el APK.
  - Velocidad real de la conversión en su celular (en la PC: 30 s de audio en ~58 s).
  - Dónde alojar las muestras (P15) y el modelo (P21); hoy el modelo va dentro del APK.
- Pedidos del usuario no atendidos: ninguno de la V1 pedida (grabar con el teclado, ver y escuchar, micrófono y MP3 a MIDI, partitura y exportar video, presentación, paquetes, inicio nuevo). Todo está hecho pero sin verificar en un celular.

### 2026-11-17 · Fase 8 · Apps de PC y Android
- Hecho (ADR-018):
  - **Diseño:** cuatro propuestas navegables en un lienzo. Jacobo eligió PC "Estudio directo" y celular "Piezas primero", con la pieza en horizontal (DESIGN §5).
  - **App de PC con Electron**, todo en D:: protocolo propio con COOP/COEP, MIDI, micrófono y cámara permitidos, modelo de piano adentro, menú Archivo/Editar/Ver/Ayuda con atajos, bienvenida al abrir e instalador NSIS (175 MB).
  - **Animación del logo sin trabas:** el resto espera a que termine (57 cuadros por segundo) y la app usa la GPU aunque esté en la lista de bloqueo.
  - **App de Android de prueba con Capacitor**, todo en D: (Java 21, SDK, Gradle): puente MIDI nativo (`ImpromptuMidi`) con relleno de `navigator.requestMIDIAccess` y APK de 62 MB con el modelo de piano.
  - **Interfaz de celular "Piezas primero"**: inicio en vertical; pieza y grabación en horizontal (Ver, Partitura, Practicar, Exportar).
  - Exportar deja 4 s de cola con desvanecido. La sección marcada se quita con un clic fuera o con Esc.
  - El remoto de git quedó fijo con la cuenta jjacobolalvarez34-rgb.
- Pruebas:
  - lint, typecheck y pruebas unitarias en verde (separador de mensajes MIDI incluido).
  - App de PC con Playwright: aislada, MIDI disponible, modelo servido, animación y bienvenida.
  - Celular con Playwright: inicio, aviso de girar, pieza, partitura y práctica en horizontal.
  - APK: Gradle BUILD SUCCESSFUL.
- Errores en el camino (corregidos):
  - VS Code deja `ELECTRON_RUN_AS_NODE=1`, y con eso Electron arrancaba como Node.
  - Una ruta mal escrita dejó la caché de Electron dentro del proyecto; se movió a D:.
  - Capacitor 8 pide Java 21, no 17.
  - Hay que llamar a `.\gradlew.bat` con su ruta.
- Probado por Jacobo: pendiente (APK e instalador de PC). Ver "Lo que queda" en PENDIENTES.
- Pendiente para la próxima: lo que diga Jacobo de las apps; sonido del piano dentro de las apps; modelo nativo en la PC.
- Pedidos del usuario no atendidos: ninguno de esta fase.

---

### 2026-11-17 · Fase 7 · Tutoriales y práctica
- Hecho (ADR-017):
  - Pestaña **Tutorial**:
    - Mano que se practica (las dos, derecha o izquierda) y si la otra la toca la app.
    - **Modo espera**: se detiene en cada acorde y sigue al tocarlo bien. Muestra qué notas faltan, con su nombre en español.
    - Precisión discreta ("Precisión 92 % · 24 acordes · 2 teclas equivocadas") y "Empezar de nuevo".
    - Accesos a números de dedo, nombres de nota y **pedal grande**.
  - Exportar: opción **Video tutorial** (dedos y pedal grande).
  - ROADMAP: **fase 10**, editor de partitura y video de la partitura, pedidos por Jacobo.
- Pruebas:
  - 3 pruebas nuevas de `WaitMode` (acordes por mano, avanza en cualquier orden, errores, reubicar al repetir).
  - Pedal grande en `frameLayout`.
  - Local (`scripts/local/tutorial-check.mjs`): con Still learning y mano derecha, la reproducción se detiene en el primer acorde y pide "La♯3"; el pedal grande y los dedos se ven.
- Probado por Jacobo: pendiente.
  - Modo espera con el Yamaha: que avance al tocar el acorde correcto y cuente bien los errores.
  - Practicar una mano con la otra sonando.
  - Exportar un video tutorial.
- Pendiente para la próxima: fase 8 (escritorio y Android).
- Pedidos del usuario no atendidos: ninguno de la fase.

---

### 2026-11-17 · Fase 6 · Partitura
- Hecho:
  - `packages/notation` (ADR-016): tempo y pulsos, cuantización con tresillos, figuras, ligaduras, silencios, dos pentagramas por mano, armadura, pedal con línea, MusicXML 4.0 y MIDI cuantizado.
  - Pestaña **Partitura**:
    - OpenSheetMusicDisplay 2.2.1, con el cursor siguiendo la reproducción.
    - Tempo editable (detectado o del archivo) y compás 4/4, 3/4, 2/4 o 6/8.
    - Exportar MusicXML, MIDI cuantizado e imprimir o guardar PDF.
  - **Metrónomo al grabar** con el teclado (tempo y compás; el primer compás es de cuenta).
  - Cuadrícula del archivo realineada cuando viene corrida: Still learning pasó de tresillos falsos a negras y corcheas.
- Pruebas:
  - 13 pruebas de `notation`:
    - Tempo a ±3 %.
    - Tresillos solo donde encajan.
    - Ligadura en la barra.
    - El pedal alarga la nota escrita.
    - Cambio de pedal.
    - Armaduras de re mayor y la menor.
    - MusicXML bien formado.
    - Cuadrícula corrida.
    - Compases vacíos del comienzo.
  - Playwright `partitura.spec.ts`: un MIDI de 5 notas se escribe y el MusicXML trae las 5.
  - Local: Consuelo y Still learning se dibujan en 2 a 9 s, y el cursor avanza al reproducir (`scripts/local/score-check.mjs`, `cursor-check.mjs`).
- Probado por Jacobo: pendiente. Tiene que juzgar si la partitura se ve como una que él tocaría.
  - Still learning: negras y acordes en 3/4, con pedal.
  - Consuelo: tocada con rubato; el ritmo sale aproximado.
  - Grabar algo nuevo con el metrónomo y mirar su partitura.
- Pendiente para la próxima: fase 7 (tutoriales y práctica).
- Pedidos del usuario no atendidos:
  - Varias voces por pentagrama: hoy, una sola voz.
  - beat_this: se dejó para después (ADR-016).

---

### 2026-11-17 · Fase 5 (continuación) · Piano con pedal, micrófono en vivo y Mamut Herd
- Hecho:
  - **Transkun V2 como "Piano con pedal" (ADR-015).**
    - En 30 s de Consuelo, contra su MIDI: F1 99 % en el navegador, igual que el original en Python.
    - Kong (ADR-014) daba 65 % y Basic Pitch 54 %.
    - Red y cabezas en ONNX; espectro y decodificación portados a TypeScript, con pruebas contra Python.
    - Se quitó Kong.
  - **Micrófono en vivo:** las notas suben mientras se toca, con ~1 s de retraso (IA rápida por bloques). Al detener, el modelo elegido repasa todo.
  - Las grabaciones del micrófono quedan como "Grabación de audio N", con su audio, en "Tus grabaciones".
  - **Panel del estudio ordenado** en bloques:
    - Grabar, Tus grabaciones, Abrir y Con esta pieza.
    - Aviso de avance fijo arriba.
    - Íconos de origen en cada grabación.
    - "Ver todas" cuando hay muchas.
  - **Grabar con el teclado y a la vez el sonido con el micrófono** (interruptor).
    - En desarrollo, "Guardar para pruebas" deja el MIDI y el audio en `fixtures/jacobo/pares/`.
  - **Guardar MIDI**: cualquier pieza a .mid tipo 1, con tempo, compás, una pista por mano y pedales CC64/66/67.
  - **Sustain sin pedal** (como el botón SUSTAIN del PSR-E343): corto, medio o largo; limitador para que no sature.
  - **Mamut Herd** (P20):
    - Sello en el pie de la página de inicio y de la app.
    - Pantalla "Acerca de" (`/acerca`) con contacto y créditos.
    - © 2026 Mamut Herd.
    - El enlace va al correo de la empresa, por ahora.
  - **BUG-001:** la sincronía de "Mi audio" y del video tenía el desfase con el signo al revés.
  - **CI rojo desde la fase 5:** pnpm bloqueaba los scripts de instalación de core-js y protobufjs. Ya se ignoran.
- Pruebas:
  - lint, typecheck y pruebas unitarias en verde.
  - 14/14 de Playwright con las cabeceras COOP/COEP.
  - Transkun en el navegador (`scripts/local/piano-check.mjs`): F1 99 % contra el MIDI.
  - Micrófono en vivo con un micrófono simulado (15 s de Consuelo): notas en cada bloque.
  - Grabación de audio: se guarda, se recarga y vuelve con su audio.
- Probado por Jacobo:
  - Basic Pitch con micrófono: confundía el ventilador y se le escapaban notas.
  - Kong: mejor, pero metía notas.
  - Con pedal pisado, las notas se veían larguísimas. Con Transkun el final es el soltar de la tecla.
- Pendiente de prueba de Jacobo:
  - Transkun con su piano, idealmente con "Grabar también el sonido" y "Guardar para pruebas" para medirlo.
  - Micrófono en vivo.
  - Sustain sin pedal.
  - Revisar que "Mi audio" ahora suena sincronizado (BUG-001).
- Pendiente para la próxima:
  - Fase 6 (partitura): la duración de las notas sale del ritmo, como pidió Jacobo.
  - P21: dónde publicar el modelo (~58 MB). Sin eso, en la web publicada solo está el modelo rápido.
- Pedidos del usuario no atendidos:
  - Instantáneo como el MIDI no se pudo: en su portátil el retraso mínimo es ~1 s, y el modelo preciso corre a ~0,2× tiempo real en el navegador. En la app de PC (nativo) debería ir cerca de 2× tiempo real.

### 2026-11-17 · Fase 5 · Audio a notas
- Hecho:
  - `packages/transcribe`: Basic Pitch (Spotify, Apache-2.0) con TensorFlow.js en un Web Worker. El modelo (900 KB) va empaquetado con la app y entra en la caché de la PWA, así que funciona sin conexión. Cancelar termina el worker de inmediato.
  - Sección "Audio a notas" en el Estudio: convertir un archivo (MP3, WAV, M4A, FLAC, OGG) o grabar con el micrófono. La pieza se abre con manos y dedos sugeridos, y el audio original queda como "Mi audio", sincronizado con desfase 0.
  - Umbrales ajustados con las grabaciones de Jacobo: ataque 0,6, cuadro 0,4, largo mínimo 8 cuadros. Quedan como parámetros de `transcribe()` para un control de sensibilidad más adelante.
  - Pedal y modelo de piano de ByteDance: quedan para después (ADR-013).
  - **BUG-001 arreglado** (commit aparte): la sincronía de "Mi audio" y del video usaba el desfase con el signo al revés. Apareció al medir la transcripción.
- Pruebas:
  - `pnpm lint`, `pnpm typecheck` y `pnpm test` en verde (133 pruebas).
  - Playwright `transcribir.spec.ts`: un WAV sintético (do, mi, sol) da exactamente esas 3 notas y abre la pieza (34 s; captura `test-results/capturas/transcribir-escritorio.png`).
  - F1 de ataques (misma tecla, ±50 ms) contra el MIDI de Jacobo, con `scripts/local/transcribe-f1.mjs`:

    | Pieza | Umbrales de Basic Pitch (0,5 / 0,3 / 5) | Umbrales elegidos (0,6 / 0,4 / 8) | Tiempo |
    |---|---|---|---|
    | Consuelo (138 s) | 54 % | **58 %** (precisión 61 %, exhaustividad 55 %) | 67 s |
    | Still learning (102 s) | 52 % | **61 %** (precisión 52 %, exhaustividad 72 %) | 34 s |

  - Análisis de errores (Consuelo):
    - No hay deriva entre el MP3 y el MIDI: −0,40 ± 0,02 s en todas las ventanas de 20 s.
    - Casi no hay errores de octava.
    - De las notas falsas, 2 de cada 3 son re-ataques de una tecla que ya suena. Un filtro para unirlas no mejoró la F1, así que no se agregó.
    - Para piano, el techo de Basic Pitch está cerca del 60 %. Un modelo especializado (ByteDance) es el paso siguiente si hace falta más.
- Probado por Jacobo: pendiente.
  - Convertir una grabación suya de piano (celular o MP3 sin MIDI) y decir si las notas sirven como punto de partida para editar.
  - Probar "Grabar con el micrófono".
  - Revisar que "Mi audio" ahora suene sincronizado con Consuelo y Still learning (BUG-001).
- Pendiente para la próxima: fase 6 (partitura).
- Pedidos del usuario no atendidos: ninguno.

### 2026-11-17 · Fase 4 · Manos y dedos
- Hecho:
  - `packages/practice`, con algoritmo propio (ADR-012):
    - Separación de manos por acordes, con costo de registro, continuidad, apertura máxima y cruce. Respeta lo que fija el usuario.
    - Digitación con Viterbi y las distancias de Parncutt et al. (1997), con reglas de pulgar y meñique en tecla negra, paso del pulgar y acordes. Tiene tamaño de mano (pequeña, mediana, grande) y los dedos fijados actúan como anclas.
  - Al abrir una toma sin manos (un MIDI de una pista o una toma en vivo), se asignan solas manos y dedos. "Deshacer" recupera la original.
  - Visualizador:
    - Número de dedo y nombre de la nota (Do, Re, Mi…) sobre cada nota, en texto de mapa de bits, con contraste automático.
    - Selección con borde ámbar y búsqueda de la nota bajo el cursor según el último cuadro.
  - Editor:
    - Con la pieza pausada, clic en una nota (Shift suma).
    - Barra con mano, dedo (o automático), mover, alargar o acortar, subir o bajar un semitono y borrar.
    - Atajos: I/D, 1–5, 0, flechas, Supr, Esc, Ctrl+Z y Ctrl+Y.
    - Deshacer y rehacer (50 pasos). Las ediciones de una toma guardada se guardan solas.
  - Ajustes, sección "Manos y dedos": interruptores de dedos y nombres, tamaño de mano y "Recalcular manos y dedos".
- Pruebas:
  - Practice 13, con las piezas de Jacobo: todas las notas con mano y dedo en menos de 1 s.
  - Edición: 9 pruebas. En total hay 135.
  - Captura con *Consuelo*: dedos y nombres visibles, selección y barra funcionando.
- Pendiente de Jacobo (prueba de la fase):
  - Revisar la digitación sugerida en 3 piezas que conozca y anotar aquí el porcentaje de notas que cambiaría.
  - Revisar si la separación de manos de *Consuelo* tiene sentido.
- Pedidos del usuario no atendidos: ninguno.

### 2026-11-17 · Fase 3 · Cámara, plantillas, exportar y publicar (v0.1)
- Hecho:
  - `packages/export`: MP4 (H.264 + AAC, o WebM VP9 + Opus si falta H.264, B-011) cuadro por cuadro con Mediabunny.
    - El piano se toca en un OfflineAudioContext por tramos de 5 s, con progreso y Cancelar inmediato.
    - Se puede exportar con el audio propio en vez del piano.
    - Se puede exportar con el video de la cámara: cada cuadro sale decodificado con `CanvasSink` en el instante exacto.
  - `packages/media`: sincronía audio ↔ MIDI con cromagrama más el afinado por ataques y una segunda opinión. Los umbrales se midieron con las grabaciones de Jacobo.
  - Audio propio (MP3/WAV): sincronía automática con aviso si no es la misma pieza, ajuste fino de ±500 ms, carril de onda, y reproducción y exportación con ese audio.
  - Video de las manos:
    - Importarlo, con sincronía por su sonido o ajuste manual de ±2 s.
    - Cámara en vivo con getUserMedia: se ve al tocar y se graba con la toma (MediaRecorder VP8). El desfase sale de performance.now y el video queda guardado con la toma en OPFS (MediaRef).
    - Calibración de teclas (primera, última y línea) sobre el video o sobre la cámara.
    - Plantillas: solo visualizador, cámara en recuadro, cámara arriba (las notas caen sobre las teclas reales) y fondo (video, desenfoque o color).
  - Visualizador:
    - Notas brillantes (degradado, borde y halo), haz de luz desde la tecla, chispas del color de la nota; brillo y chispas hasta 200 % (ADR-010).
    - Líneas de compás y pulso que caen, y LCD de compás y tempo (ADR-011).
  - Página principal (`/`):
    - Presentación con el visualizador en vivo de fondo y el título que cae letra por letra.
    - Qué es, cómo funciona, descargas (web activa; PC y Android en "Próximamente") y donaciones (P7 provisional).
    - Intro del logo una vez por sesión.
    - La app pasa a `/app` y el estudio a `/estudio`.
  - Apariciones animadas por tipo de elemento, visibles aunque el sistema tenga las animaciones apagadas (P19).
  - Publicación: `vercel.json` (Jacobo publica en Vercel); GitHub Pages queda como flujo manual. README para usuarios.
  - Arreglos encontrados en las pruebas:
    - El visualizador se congelaba al terminar la pieza (recursión en `Transport.now`).
    - Exportar fallaba con un pedal que nunca se suelta (release infinito).
    - El sonido se cortaba con 2.000 notas: polifonía de 64 voces.
    - La intro se trababa por la descarga del piano; el piano ahora se descarga después.
    - La cámara grababa vacío en VP9; se cambió a VP8.
- Pruebas:
  - Vitest: core 32, midi 22, render 26, audio 18, media 6, export 4 y web 5 (113 en total).
  - Lint y typecheck en verde; CI en verde.
  - Exportaciones de prueba con video (recuadro y cámara arriba), verificadas cuadro por cuadro.
  - Cámara simulada: graba y guarda en OPFS.
- Probado por Jacobo:
  - Exportó *Sorry I filed you* (3:35) en unos 2 minutos, más rápido que el tiempo real.
  - La sincronía MIDI + MP3 se probó con sus archivos: Consuelo +0,39 s y Still learning −0,89 s coinciden por dos métodos.
- Pendiente de Jacobo:
  - Publicar en Vercel.
  - Grabar un video de sus manos y probar la calibración y "Cámara arriba".
  - Probar en el celular Android con OTG una vez publicado (https).
  - Revisar la deriva de la sincronía de oído al final de una pieza.
  - P16 (rediseño de celular), P17 (OBS), P14 (logo).
- Pedidos del usuario no atendidos: ninguno de esta fase. El teclado realista sigue para el final, por decisión de Jacobo.

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
