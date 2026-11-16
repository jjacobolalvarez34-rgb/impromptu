# DECISIONES (ADRs)

Formato: contexto → decisión → consecuencias. Para agregar una, copia la plantilla al final.

### ADR-001 · Web primero, una sola base de código
- **Contexto:** se quiere web, escritorio y celular, y un solo desarrollador con agentes.
- **Decisión:** PWA en TypeScript; escritorio con Tauri envolviendo la misma app; celular con la PWA y, si hace falta, Capacitor.
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

---
### Plantilla
```
### ADR-0XX · Título
- **Contexto:**
- **Decisión:**
- **Consecuencias:**
```
