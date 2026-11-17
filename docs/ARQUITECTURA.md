# ARQUITECTURA — Impromptu

> Lo marcado **[VERIFICAR]** es una suposición razonable que hay que comprobar con una prueba pequeña antes de construir encima. Si resulta falsa, registra un ADR con la alternativa.

## Principios
1. **Una sola base de código** (web) que se empaqueta para escritorio (Tauri) y celular.
2. **Todo en el equipo del usuario**: render, audio, exportación y transcripción. Cero servidores obligatorios.
3. **Un reloj para todo**: segundos (`number`, coma flotante) desde el inicio de la toma.
4. **El modelo de datos es el contrato**: lo usan el visualizador, el editor, la exportación, la partitura y los tutoriales. Cambiarlo requiere ADR.
5. **Adaptadores en los bordes**: MIDI, cámara, almacenamiento y transcripción tienen una interfaz propia y una implementación por plataforma.

## Stack
| Capa | Elección | Nota |
|---|---|---|
| Lenguaje | TypeScript `strict` | |
| Monorepo | pnpm + Turborepo | |
| App web | Vite + React + PWA | Estado con Zustand |
| Estilos | CSS con variables (tokens de `DESIGN.md`) + CSS Modules | Sin Tailwind para no pelear con la identidad |
| Visualizador | PixiJS (WebGL/WebGPU) | Notas, teclado y partículas en GPU |
| Audio | Web Audio API + `@tonejs/piano` (Salamander, con pedal) | Licencias en `LICENCIAS.md` |
| Archivos MIDI | `@tonejs/midi` | Leer y escribir .mid **[VERIFICAR licencia]** |
| Exportar video | WebCodecs + Mediabunny (MPL-2.0) | Render cuadro por cuadro, no captura de pantalla |
| Cámara | `getUserMedia` + `MediaRecorder` | |
| Almacenamiento | IndexedDB (tomas, ajustes) + OPFS (video y audio) | |
| Transcripción | Web Workers + Basic Pitch (TF.js) y modelo de piano de ByteDance en ONNX Runtime Web | Fase 5 |
| Partitura | Escritor propio de MusicXML + OpenSheetMusicDisplay (BSD-3) para mostrar | Fase 6 |
| Tablaturas | alphaTab (MPL-2.0) | Fase 9 |
| Digitación | Algoritmo propio (Viterbi + distancias de Parncutt et al., ADR-012) | Fase 4 |
| Escritorio | Tauri 2 + `tauri-plugin-midi` (MIT, emula Web MIDI con `midir`) | Fase 8 |
| Pruebas | Vitest + Playwright | |

## Estructura del monorepo
```
apps/
  web/            app principal (PWA): estudio, en vivo, celular
  desktop/        Tauri: envuelve apps/web y agrega MIDI nativo y archivos
packages/
  core/           modelo de datos, reloj, utilidades musicales (sin DOM)
  midi/           adaptadores de entrada MIDI (Web MIDI, Tauri) y parser .mid
  render/         visualizador PixiJS, temas, efectos, teclado virtual
  audio/          sampler de piano, mezcla, render offline
  export/         exportación de video (WebCodecs + Mediabunny)
  media/          cámara, importación y alineación de video y audio
  transcribe/     workers de audio→notas (fase 5)
  notation/       cuantización, MusicXML, PDF (fase 6)
  practice/       digitación, separación de manos, modo práctica (fases 4 y 7)
  ui/             tokens y componentes de DESIGN.md
tests/e2e/        Playwright
fixtures/         MIDI, WAV y video de prueba grabados por Jacobo
```

## Modelo de datos (packages/core)
```ts
type Seconds = number;
type Hand = 'L' | 'R';
type Finger = 1 | 2 | 3 | 4 | 5;
type Instrument = 'piano' | 'guitar' | 'bass' | 'drums';

interface NoteEvent {
  id: string;
  pitch: number;            // MIDI 0–127
  start: Seconds;
  end: Seconds;
  velocity: number;         // 1–127
  hand: Hand | null;        // null = sin asignar
  handSource: 'auto' | 'user' | null;
  finger: Finger | null;
  fingerSource: 'auto' | 'user' | null;
  voice?: number;           // para partitura
  string?: number;          // guitarra (fase 9)
  fret?: number;            // guitarra (fase 9)
  drumPiece?: string;       // batería (fase 9)
  origin: 'midi-live' | 'midi-file' | 'audio' | 'edit';
}

type PedalKind = 'sustain' | 'sostenuto' | 'soft';   // CC64, CC66, CC67
interface PedalEvent { kind: PedalKind; time: Seconds; value: number /* 0–127 */ }

interface Track {
  id: string;
  instrument: Instrument;
  name: string;
  notes: NoteEvent[];       // ordenadas por start
  pedals: PedalEvent[];     // ordenados por time
}

interface TempoPoint { time: Seconds; bpm: number }
interface MediaRef {
  kind: 'video' | 'audio';
  storageKey: string;       // OPFS
  offset: Seconds;          // dónde empieza respecto a la toma
  calibration?: KeyboardCalibration;  // solo video de cámara
}
interface KeyboardCalibration {
  lowKey: { pitch: number; x: number; y: number };   // coordenadas normalizadas 0–1
  highKey: { pitch: number; x: number; y: number };
  keyLineY: number;          // altura de la línea donde "aterrizan" las notas
}

interface Take {
  id: string;
  title: string;
  createdAt: string;
  duration: Seconds;
  tracks: Track[];
  tempoMap: TempoPoint[];          // vacío = sin tempo detectado
  timeSignature?: [number, number];
  keySignature?: string;
  media: MediaRef[];
  keyboardRange: { low: number; high: number };  // ej. 36–96 para 61 teclas
  device?: { name: string; manufacturer?: string };
}

interface VisualProject {
  takeId: string;
  themeId: string;
  layout: 'visualizer' | 'camera-top' | 'camera-inset' | 'background';
  aspect: '16:9' | '9:16' | '1:1';
  effects: { sparks: number; keyGlow: number; fallSpeed: number; octaveGuides: boolean;
             noteGlow: number; noteStyle: 'flat' | 'glow';     // ADR-010
             beatGuides: boolean };                            // ADR-011
  show: { fingers: boolean; noteNames: boolean; pedals: PedalKind[] };
  colors: { right: string; left: string; unassigned: string };
  background?: { kind: 'color' | 'image' | 'video' | 'blur'; value: string };
}
```
Reglas:
- `hand` y `finger` existen desde la fase 1 aunque valgan `null`.
- Un *note-on* con velocidad 0 es un *note-off* (ver BUGS).
- Notas sin *note-off* al detener la grabación se cierran con el tiempo de parada.

## Flujos principales

### Grabar en vivo
```
Teclado → adaptador MIDI → normalizador (note on/off, CC64/66/67, velocity 0)
       → Recorder (timestamps del evento, mismo reloj que performance.now)
       → Take en memoria → visualizador en tiempo real
       → al detener: IndexedDB + (si hay cámara) video en OPFS con su offset
```
- **Compatibilidad entre marcas:** MIDI es estándar (notas, CC64/66/67), así que casi todo teclado funciona sin configurar nada. Para las rarezas hay **perfiles por dispositivo** (`packages/midi/profiles`), identificados por nombre y fabricante: invertir pedal, rango de teclas, curva de velocidad y canal. Perfil inicial: Yamaha PSR-E343. Los usuarios pueden aportar perfiles por PR.
- `MIDIMessageEvent.timeStamp` está en el mismo reloj que `performance.now()`: úsalo, no la hora de llegada al handler.
- El video de cámara se alinea guardando `performance.now()` al arrancar el `MediaRecorder` y ajustando con el primer cuadro. Además, un botón "ajustar sincronía" (±1 ms a ±500 ms) con vista previa.

### Exportar video
```
Take + VisualProject → render offline cuadro por cuadro (PixiJS en OffscreenCanvas)
                     → VideoEncoder (WebCodecs)
audio: OfflineAudioContext (sampler o audio importado) → AudioEncoder
                     → Mediabunny (MP4) → descarga
```
- El render es **determinista**: el cuadro N depende solo de t = N / fps. Partículas con semilla fija.
- Nunca grabes la pantalla para exportar.

### En vivo y OBS
- Ruta `/en-vivo` con fondo transparente o verde. En el navegador: captura de ventana en OBS.
- **[VERIFICAR, P17]** si la fuente de navegador de OBS puede usar Web MIDI. Mientras tanto: captura de ventana de `/en-vivo?fondo=verde` con clave de croma. Si no, en escritorio la app levanta un servidor local que reenvía los eventos a la fuente de OBS por WebSocket.

### Transcripción (fase 5)
```
Audio → remuestreo (16 o 22 kHz mono) → Worker
  piano: modelo de ByteDance (ONNX, WebGPU o WASM) → notas + pedal
  otros: Basic Pitch → notas
→ separación de manos → Take con origin 'audio'
```
- Archivos largos por ventanas con solapamiento y barra de progreso; cancelable.
- **[VERIFICAR]** que el modelo de ByteDance convierta bien a ONNX y su tamaño final. Plan B: Basic Pitch también para piano, con pedal desactivado.

## Plataformas
| Plataforma | MIDI | Notas |
|---|---|---|
| Chrome, Edge, Firefox de escritorio | Web MIDI (pide permiso) | Objetivo principal |
| Safari macOS | No tiene Web MIDI | Mostrar aviso y sugerir Chrome o la app de escritorio |
| Chrome Android (PWA) | Web MIDI con cable OTG | Celular, fase 2 |
| iPhone | Sin Web MIDI | Solo micrófono al inicio |
| Tauri Windows, macOS y Linux | `tauri-plugin-midi` | En macOS el WebView no trae Web MIDI |
| Android empaquetado (Capacitor) | **[VERIFICAR]** si el WebView soporta Web MIDI; si no, plugin nativo | Fase 8 |

## Presupuestos de rendimiento
| Qué | Meta |
|---|---|
| Visualizador en vivo | 60 fps estables con 2.000 notas en pantalla, en un portátil de gama media |
| Latencia tecla → luz | ≤ 20 ms percibidos |
| Arranque de la app web | < 2 s en conexión normal; los modelos de IA se descargan solo cuando se usan |
| Exportar 1080p60 | Al menos tiempo real en escritorio de gama media |
| Memoria con toma de 10 min y video | < 1,5 GB |

## Seguridad y privacidad
- Nada sale del equipo. Sin analítica por defecto; si se agrega, que sea opcional y anónima.
- Permisos (MIDI, cámara, micrófono) solo cuando el usuario toca la función.
