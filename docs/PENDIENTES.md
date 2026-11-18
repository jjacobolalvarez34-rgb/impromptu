# PENDIENTES — decisiones e insumos de Jacobo

Claude Code: si algo de esta lista bloquea tu tarea, usa el valor provisional, marca el código con `// PROVISIONAL(Pn)` y sigue. Jacobo: cuando decidas, cambia el estado y anota la fecha.

| # | Pendiente | Provisional | Estado |
|---|---|---|---|
| P1 | **Licencia del proyecto.** Opciones: GPL-3.0 (las copias deben seguir abiertas), MPL-2.0 (punto medio) o MIT (permisiva). Recomendación: **GPL-3.0**, que protege que nadie lo cierre y lo venda. Como dueño del código, igual puedes tener un plan pago tuyo. | GPL-3.0 | Abierto |
| P2 | Nombre en GitHub (usuario u organización) y dominio (revisar disponibilidad de impromptu.app, .studio, .music) | `impromptu` | Abierto |
| P3 | Revisión de marca "Impromptu" en Colombia (SIC) antes de lanzar la v0.1 | — | Abierto |
| P4 | **Fixtures reales:** grabar 5 piezas en el PSR-E343 con MIDI + WAV + video desde arriba (lenta, rápida, mucho pedal, acordes, mano cruzada) y subirlas a `fixtures/` | MIDIs sintéticos | Abierto |
| P5 | Modelo de celular Android para probar (y si tienes cable OTG) | — | Abierto |
| P6 | Soporte para la cámara desde arriba (trípode o brazo) | — | Abierto |
| P7 | Activar GitHub Sponsors (necesita cuenta bancaria en Colombia y datos tributarios) | — | Abierto |
| P8 | Idioma de la interfaz: solo español al inicio, o español e inglés desde la v0.1 | Español con textos preparados para traducir | Abierto |
| P9 | ¿Telemetría opcional y anónima para saber qué se usa? | No | Abierto |
| P10 | Temas extra del visualizador que quieras para la v0.1 (nombres y colores) | Ámbar, Sala, Medianoche, Tinta | Abierto |
| P11 | ¿Se publican en el repo (público) las grabaciones de `fixtures/jacobo/`? Hoy hay 4 piezas copiadas de `C:\Cakewalk Projects` (Consuelo, Nostalgia, Sorry I filed you, I'm still learning to be better), en MIDI y MP3 | Fuera de git (`.gitignore`); las pruebas de CI usan MIDIs sintéticos | Abierto |
| P12 | **Celular como app instalable, no web, y sin conexión en todo lo posible** | Resuelto en ADR-008: misma interfaz empaquetada como APK (Tauri 2 móvil o Capacitor, se elige en la fase 8) | Decidido 2026-11-16 |
| P13 | Yamaha: Jacobo tiene el controlador USB-MIDI de Yamaha en Descargas. Ver en la fase 2 si Windows reconoce el PSR-E343 sin él | Probar primero sin el controlador | Abierto |
| P14 | Logo y video de marca (pedirlo cuando se quiera, no antes): (1) la nota ámbar de la "i" parece tocar el palo; DESIGN §1 pide que vaya separada. Se corrige en `Logo.module.css` y en la constante `WORD_NOTE` de `LogoIntro.tsx` a la vez. (2) Otros formatos del MP4: `pnpm intro:mp4 1080 1920` (vertical) y `pnpm intro:mp4 1080 1080` (cuadrado) | Tal como está | En espera de Jacobo |
| P15 | Espejo propio de las muestras del Salamander (hoy se descargan de tambien.github.io/Piano). Opciones: GitHub Pages del repo, release de GitHub o un CDN gratuito | Copia pública actual | Abierto, antes de v0.1 |
| P16 | **Rediseñar la interfaz de celular**: Jacobo eligió "Piezas primero" con la pieza en horizontal (DESIGN §5) | Diseño elegido 2026-11-17 | Decidido; falta construirla (fase 8) |
| P17 | Probar `/en-vivo` en OBS (captura de ventana con fondo verde y clave de croma; fuente de navegador con fondo transparente) y resolver el [VERIFICAR] de ARQUITECTURA | — | En espera de Jacobo |
| P18 | Probar el sostenuto y la una corda con un teclado que los tenga (Jacobo solo tiene sustain): testers | Pruebas automáticas | Abierto |
| P19 | Interruptor "Reducir animaciones" dentro de la app, para quien se marea con el movimiento. Hoy las animaciones se ven siempre, aunque el sistema las tenga apagadas (Jacobo lo pidió así) | Animaciones siempre | Abierto |
| P21 | **Dónde se publica el modelo de piano con pedal** (154 MB) para la web y las apps: Hugging Face (gratis, permite descarga desde el navegador), un release de GitHub (no permite descarga directa desde el navegador por CORS) u otro. Se descarga una sola vez y queda guardado | Solo en desarrollo, desde `D:\.cache\models` | Abierto |
| P22 | **Destacar "de MP3 a MIDI" en la página de inicio**: para quien no sabe de dónde sacar partituras o MIDI, Impromptu saca el MIDI de un audio (Convertir un audio → Guardar MIDI). Texto y lugar en la página | Sin destacar | Abierto |
| P20 | **Impromptu es un producto de Mamut Herd** (la empresa de Jacobo; kit de marca en `mamut-herd-kit-de-marca.zip`). Falta: (1) visto bueno de dónde va el sello "Un producto de Mamut Herd"; (2) la web de Mamut Herd (`MAMUT_HERD_URL` del kit), que da Jacobo; (3) P1 sigue abierta: el código puede ser abierto y la marca de Mamut Herd | Sello en el pie de la página de inicio y en "Acerca de"; © 2026 Mamut Herd | Decidido el dueño 2026-11-17; ubicación en espera de Jacobo |

## Lo que queda (resumen al 2026-11-17)

### Para que pruebe Jacobo
1. **App de Android nativa** (`apps/mobile/release/Impromptu-0.1.0.apk`, 2026-11-18). Antes, desinstalar la de Capacitor. Nada está verificado en un celular todavía:
   1. Primera vez: presentación → "Elige qué instalar" → descargar el piano (~90 MB). Probar Cancelar a mitad y volver a descargar: debe seguir desde donde iba.
   2. Grabar: conectar el Yamaha por OTG (su nombre sale en la franja ámbar), que suene el piano con el pedal, grabar, "Detener y guardar": abre la pieza en horizontal.
   3. Pieza: tocar/pausa, barra de tiempo, velocidades. Volver y el atrás de Android vuelven al inicio, no cierran la app (BUG-003).
   4. Micrófono: grabar 20–30 s; probar Cancelar mientras convierte (BUG-002). "Audio a notas" con un MP3. Ver si la app se cierra (BUG-004) y cuánto tarda.
   5. Partitura y Video desde la pieza; el video queda en Películas/Impromptu.
   6. Ajustes: sustain sin pedal.
2. **App de PC** (`apps/desktop/release/Impromptu-0.0.0-instalador.exe`): instalarla, conectar el Yamaha, probar el menú Archivo y convertir un audio sin internet. Windows avisará que el instalador no está firmado.
3. **Piano con pedal (Transkun)** con su piano: grabar con "Grabar también el sonido" y "Guardar para pruebas", para medirlo contra lo que tocó.
4. **Micrófono en vivo** (las notas suben al tocar) y **sustain sin pedal**.
5. **Metrónomo al grabar**: grabar algo con clic y mirar su partitura.
6. **"Mi audio" sincronizado** con Consuelo y Still learning (BUG-001).
7. **Partitura**: que la revise alguien que lea partitura seguido.
8. **Tutorial** (modo espera con el teclado): más adelante, como pidió Jacobo.

### Por construir
- **Fase 8 (apps), lo que falta:**
  - El sonido del piano (Salamander) todavía se baja de internet la primera vez: meterlo en las apps para que funcionen 100 % sin conexión (P15).
  - En la app de PC, el modelo de piano corriendo nativo (`onnxruntime-node`): de ~0,15× a ~2× tiempo real en el portátil de Jacobo.
  - Ícono, pantalla de arranque y firma del APK; firma del instalador de Windows (sin firma, Windows avisa).
  - Actualizaciones automáticas de las apps.
  - App de Android **nativa**: hecha el 2026-11-18 (ADR-019), sin verificar en un celular.
- **Fase 9:** guitarra (tablatura) y batería.
- **Fase 10:** editor de partitura, video de la partitura y grabar directo en la partitura.
- **Al final:** teclado realista por niveles (sombras y teclas que bajan según la fuerza).
- **Mejoras conocidas:**
  - Partitura: varias voces por pentagrama; ritmo más fino con rubato (evaluar beat_this).
  - Transcripción: más rápida en el navegador (WebGPU en equipos nuevos).

### Decisiones de Jacobo abiertas
P1 (licencia del código), P2 (nombre en GitHub y dominio), P3 (marca en la SIC), P7 (donaciones), P11 (publicar sus grabaciones de prueba), P14 (logo y formatos del video de marca), P15 (dónde alojar las muestras del piano), P17 (prueba en OBS), P18 (sostenuto y una corda con testers), P19 (interruptor para reducir animaciones), P20 (web de Mamut Herd), P21 (dónde publicar el modelo de piano para la web), P22 (destacar "de MP3 a MIDI" en la página de inicio).

### Pedidos de Jacobo después de probar las apps (2026-11-17)
En la app de Android nativa (2026-11-18) se hicieron la presentación, el inicio nuevo, el ícono con el logo, la memoria (BUG-004), BUG-002 y BUG-003, **sin verificar en un celular**. En la web y la app de PC siguen sin empezar:
- **Mejorar muchísimo las apps** ("toca mejorar supremamente la app").
- **Agregar la página de presentación (landing)** también en las apps.
- **Mejorar la pestaña principal** (el Estudio).
- **La app de celular no tiene el logo**: falta el ícono de la app (sale el de Capacitor) y revisar el logo dentro de la app y la pantalla de arranque.
- **Revisar si la app de celular gasta demasiada memoria RAM**: medir con el celular conectado (Chrome remoto o perfil de Android Studio). Sospechosos: el modelo de piano cargado, las muestras del piano y el visualizador.
- **BUG-002**: al cancelar la conversión de una grabación, la app se queda "grabando" y se traba.
- **BUG-003**: no hay un botón claro para volver, y el atrás de Android cierra la app.

## App de Android NATIVA (decidido por Jacobo, 2026-11-17; construida el 2026-11-18, ADR-019, sin verificar en un celular)
- **Ya no Capacitor.** App totalmente nativa en Kotlin + Jetpack Compose (reemplaza `apps/mobile`; ADR-019 por escribir). La web queda como está por ahora (a Jacobo le gusta); la prioridad es que la app de celular funcione.
- **Primera vez que se abre:** presentación (landing) y luego elegir qué descargar: **Piano** (todo: sonido y modelo de IA), **Batería** y **Guitarra** como "pronto". Después, la pantalla principal rediseñada (la actual le parece fea).
- **Versión 1 trae todo:** grabar con el teclado (MIDI por OTG, con el piano sonando), ver y escuchar piezas (notas cayendo en horizontal, abrir y guardar MIDI), micrófono y MP3 a MIDI (Transkun con ONNX Runtime nativo), partitura (MusicXML generado en Kotlin y dibujado con OpenSheetMusicDisplay empaquetado) y exportar video (MediaCodec H.264 + AAC).
- **Toolchain listo en D::** Java 21 (`D:\tools\jdk-21.0.13+9`), SDK (`D:\Android\sdk`), Gradle (`D:\.cache\gradle`, AGP 8.13.0, Gradle 8.14.3 ya en caché).
- **Hay que resolver:** dónde se alojan los paquetes para descargarlos (P21, también las muestras P15).
- Se reutilizaron el ícono y la firma de la app Capacitor. La llave de firma (Mamut Herd) quedó en `D:\Android\keys\impromptu-release.jks` con su contraseña en `impromptu-release.properties`: **guardar copia, sin ella no se puede actualizar la app en Google Play.**
- Bugs de la app Capacitor que la nativa debe evitar: BUG-002, BUG-003, BUG-004 (se cerró por memoria al convertir una grabación).
