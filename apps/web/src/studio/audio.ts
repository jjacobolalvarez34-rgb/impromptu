import { CAPAS_POR_CALIDAD, LivePlayer, Piano, Sintes, takeVoices } from '@impromptu/audio';
import type { CalidadPiano } from '@impromptu/audio';
import type { LiveVoiceHandle, Voice } from '@impromptu/audio';
import type { Beat, Hand, Take, Instrument } from '@impromptu/core';
import { beatGrid } from '@impromptu/core';
import { click } from './metronome';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { audioOffset, useOwnAudio } from './ownAudio';
import { avisarDescarga, terminarDescarga } from './trabajos';

/** Nombre de cada banco de sonidos, para la burbuja. */
const NOMBRE_BANCO = {
  nylon: 'guitarra de nylon',
  acero: 'guitarra de acero',
  electrica: 'guitarra eléctrica',
  bajo: 'bajo',
  bateria: 'batería',
} as const;
import { transport, useStudio } from './store';

/** Cuánto por delante se programa el audio y cada cuánto se revisa (s / ms). */
const HORIZON = 0.3;
const TICK_MS = 40;

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AudioState {
  status: AudioStatus;
  /** 0–1 mientras se descargan las muestras. */
  progress: number;
  /** "Sonido de la app": se apaga si el teclado ya suena por sus parlantes (BUGS B-009). */
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  /** Sustain de panel en segundos (0 = apagado), como el botón SUSTAIN del PSR-E343. */
  panelSustain: number;
  setPanelSustain: (seconds: number) => void;
  /** Calidad del piano (pedido 33): cuántas capas de fuerza se bajan. */
  calidad: CalidadPiano;
  setCalidad: (c: CalidadPiano) => void;
}

export const useAudio = create<AudioState>()(
  persist(
    (set) => ({
      status: 'idle',
      progress: 0,
      enabled: true,
      setEnabled: (enabled) => {
        set({ enabled });
        if (!enabled) engine.live?.reset();
        engine.reschedule();
      },
      panelSustain: 0,
      setPanelSustain: (panelSustain) => {
        set({ panelSustain });
        engine.applyPanelSustain();
      },
      calidad: 'normal',
      setCalidad: (calidad) => {
        set({ calidad });
        void engine.recargarPiano();
      },
    }),
    // Se recuerdan el sustain de panel y la calidad; el resto es estado de la sesión.
    {
      name: 'impromptu-audio',
      partialize: (s) => ({ panelSustain: s.panelSustain, calidad: s.calidad }),
    },
  ),
);

/**
 * Programa las notas de la toma en el piano siguiendo el transporte. El reloj del
 * transporte pasa a ser el del AudioContext para que imagen y sonido no se separen.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private piano: Piano | null = null;
  /** Guitarra, bajo y batería sintetizados (fase 9): listos apenas hay contexto de audio. */
  sintes: Sintes | null = null;
  private voices: Voice[] = [];
  private cursor = 0;
  /** Pulsos de la toma, para que suene el pulso (fase 11, pedido 18). */
  private pulsos: Beat[] = [];
  private cursorPulso = 0;
  private timer = 0;
  private latency = 0;
  private livePlayer: LivePlayer<LiveVoiceHandle> | null = null;

  /** Cambió el sustain de panel: lo que ya está programado se vuelve a programar con la cola nueva. */
  applyPanelSustain(): void {
    if (this.piano) this.piano.panelSustain = useAudio.getState().panelSustain;
    this.reschedule();
  }

  /** Piano cargado (para exportar con sus muestras); null si aún no se descarga. */
  get loadedPiano(): Piano | null {
    return this.piano;
  }

  /** Piano para tocar en vivo; null si aún no carga o si el sonido de la app está apagado. */
  get live(): LivePlayer<LiveVoiceHandle> | null {
    return useAudio.getState().enabled ? this.livePlayer : null;
  }

  private ownSource: AudioBufferSourceNode | null = null;

  constructor() {
    transport.subscribe(() => this.reschedule());
    // Cambiar el audio propio, su ajuste fino o "Usar mi audio" reprograma lo que suena.
    useOwnAudio.subscribe(() => this.reschedule());
  }

  private loading: Promise<Piano | null> | null = null;
  private cargas = 0;
  private clockSwitched = false;

  /** Contexto de audio (para decodificar archivos propios con la misma frecuencia). */
  get audioContext(): AudioContext {
    return this.ensureContext();
  }

  /** ¿Suena el audio propio en vez del piano? Solo a 1×: a otra velocidad cambiaría de tono. */
  get usingOwnAudio(): boolean {
    const own = useOwnAudio.getState().audio;
    return !!own && own.use && transport.speed === 1;
  }

  private ensureContext(): AudioContext {
    this.context ??= new AudioContext({ latencyHint: 'interactive' });
    if (!this.sintes) {
      this.sintes = new Sintes(this.context);
      this.sintes.timbreGuitarra = useStudio.getState().guitarra.timbre;
      // Batería grabada sencilla (CC0, ~800 kB) mientras baja la completa.
      void this.sintes.cargarBateria(`${import.meta.env.BASE_URL}bateria/`).catch(() => undefined);
      // Sonidos grabados (pedido 25): se baja solo el banco del instrumento en uso.
      const bancos = `${import.meta.env.BASE_URL}instrumentos/`;
      const cargar = () => {
        const s = useStudio.getState();
        const sintes = this.sintes;
        if (!sintes) return;
        sintes.timbreGuitarra = s.guitarra.timbre;
        const usados = new Set([s.instrumento, ...(s.take?.tracks.map((t) => t.instrument) ?? [])]);
        for (const i of usados) {
          // Pedido 45: cada descarga se ve en la burbuja con su avance.
          let id = '';
          void sintes
            .cargarPara(bancos, i, (banco, v) => {
              id = `banco-${banco}`;
              avisarDescarga(id, `Sonidos: ${NOMBRE_BANCO[banco]}`, v);
            })
            .catch(() => undefined)
            .finally(() => {
              if (id) terminarDescarga(id);
            });
        }
      };
      cargar();
      useStudio.subscribe(cargar);
    }
    return this.context;
  }

  /** Cambió la calidad: se baja el piano con las capas nuevas y reemplaza al anterior. */
  recargarPiano(): Promise<Piano | null> {
    if (!this.loading) return this.preload();
    this.loading = null;
    return this.preload();
  }

  /**
   * Descarga el piano apenas se abre la app (pedido de Jacobo): bajar y decodificar no
   * necesita un gesto del usuario; sonar sí (B-008), y eso lo hace `start()`.
   */
  preload(): Promise<Piano | null> {
    if (this.loading) return this.loading;
    const piano = new Piano(this.ensureContext(), {
      panelSustain: useAudio.getState().panelSustain,
      layers: CAPAS_POR_CALIDAD[useAudio.getState().calidad],
    });
    useAudio.setState({ status: 'loading', progress: 0 });
    avisarDescarga('piano', 'Piano', 0);
    // Si se cambia la calidad a medio bajar, gana el último pedido.
    const carga = ++this.cargas;
    this.loading = piano
      .load(({ loaded, total }) => {
        useAudio.setState({ progress: loaded / total });
        avisarDescarga('piano', 'Piano', loaded / total);
      })
      .then(() => {
        if (carga !== this.cargas) return piano;
        this.piano = piano;
        this.livePlayer = new LivePlayer(piano);
        useAudio.setState({ status: 'ready', progress: 1 });
        terminarDescarga('piano');
        this.reschedule();
        return piano;
      })
      .catch(() => {
        useAudio.setState({ status: 'error' });
        terminarDescarga('piano');
        this.loading = null; // se puede reintentar
        return null;
      });
    return this.loading;
  }

  /** Activa el sonido en un gesto del usuario (BUGS B-008) y une el reloj del estudio al audio. */
  async start(): Promise<void> {
    const context = this.ensureContext();
    if (context.state === 'suspended') await context.resume();
    if (!this.clockSwitched && context.state === 'running') {
      this.clockSwitched = true;
      this.latency = context.outputLatency || context.baseLatency || 0;
      // Un AudioContext suspendido tiene el reloj quieto: solo se usa ya en marcha.
      transport.setClock(() => context.currentTime - this.latency);
    }
    void this.preload();
  }

  /** Apaga el audio por completo (al recargar este módulo en desarrollo). */
  dispose(): void {
    window.clearInterval(this.timer);
    this.piano?.stopAll();
    this.sintes?.stopAll();
    void this.context?.close();
  }

  private take: Take | null = null;
  /** Manos que la app no toca (tutorial: la mano que practica el usuario). */
  private muted = new Set<Hand>();

  setTake(take: Take | null): void {
    this.take = take;
    this.pulsos =
      take && take.tempoMap.length > 0
        ? beatGrid(take.tempoMap, take.timeSignature, take.duration + 1)
        : [];
    const voices = take ? takeVoices(take) : [];
    // Sin mano asignada cuenta como derecha (igual que en el modo espera).
    this.voices =
      this.muted.size === 0 ? voices : voices.filter((v) => !this.muted.has(v.note.hand ?? 'R'));
    this.reschedule();
  }

  /** Tutorial: la app deja de tocar estas manos (las toca el usuario). */
  setMutedHands(hands: readonly Hand[]): void {
    this.muted = new Set(hands);
    this.setTake(this.take);
  }

  /** Corta lo programado y vuelve a programar desde el instante actual. */
  reschedule(): void {
    this.piano?.stopAll();
    this.sintes?.stopAll();
    this.stopOwn();
    window.clearInterval(this.timer);
    const t = transport.now();
    this.cursor = lowerBound(this.voices, t);
    this.cursorPulso = this.primerPulso(t);
    if (!transport.playing || !useAudio.getState().enabled) return;
    if (this.usingOwnAudio) {
      this.startOwn(t);
    } else {
      if (!this.piano && !this.sintes) return;
      this.chase(t);
      this.tick();
    }
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  private primerPulso(t: number): number {
    let i = 0;
    while (i < this.pulsos.length && this.pulsos[i]!.time < t - 0.02) i++;
    return i;
  }

  /** Un clic por pulso (más fuerte al empezar el compás) si está pedido en los ajustes. */
  private sonarPulsos(t: number, horizon: number, loopEnd: number): void {
    const context = this.context;
    const pedido = useStudio.getState().settings.show.pulseSound;
    while (this.cursorPulso < this.pulsos.length) {
      const b = this.pulsos[this.cursorPulso]!;
      if (b.time > horizon || b.time >= loopEnd) break;
      this.cursorPulso++;
      if (!pedido || !context || b.time < t - 0.02) continue;
      click(context, transport.toClock(b.time) + this.latency, b.beat === 1);
    }
  }

  /** Hace sonar el audio propio desde el instante t de la toma, con su desfase. */
  private startOwn(t: number): void {
    const own = useOwnAudio.getState().audio;
    const context = this.context;
    if (!own || !context) return;
    const offset = audioOffset(own);
    let from = t - offset; // segundo del archivo que corresponde a t
    let at = transport.toClock(t) + this.latency;
    if (from < 0) {
      at = transport.toClock(offset) + this.latency;
      from = 0;
    }
    if (from >= own.buffer.duration) return;
    const source = context.createBufferSource();
    source.buffer = own.buffer;
    source.connect(context.destination);
    source.start(Math.max(context.currentTime, at), from);
    const loopEnd = transport.loop?.end;
    if (loopEnd !== undefined) source.stop(transport.toClock(loopEnd) + this.latency);
    this.ownSource = source;
  }

  private stopOwn(): void {
    try {
      this.ownSource?.stop();
    } catch {
      // Ya estaba detenido.
    }
    this.ownSource = null;
  }

  /**
   * Notas que ya sonaban en t (empezaron antes y su apagador aún no cae): se tocan desde
   * su punto medio para que al buscar o repetir una sección se oiga lo que se ve.
   */
  private chase(t: number): void {
    const loopEnd = transport.loop?.end ?? Infinity;
    for (let i = lowerBound(this.voices, t - CHASE_WINDOW); i < this.cursor; i++) {
      const v = this.voices[i]!;
      if (v.start >= t || v.release <= t + 0.02) continue;
      const release = Math.min(v.release, loopEnd);
      const elapsed = (t - v.start) / transport.speed;
      this.salida(v)?.play(
        v,
        transport.toClock(t) + this.latency,
        transport.toClock(release) + this.latency,
        elapsed,
      );
    }
  }

  private vivas = new Map<number, ReturnType<Sintes['strike']>>();

  /** En vivo con guitarra, bajo o batería (fase 9): la nota suena con el sintetizador. */
  tocarOtro(instrumento: Instrument, pitch: number, velocity: number): void {
    if (!useAudio.getState().enabled) return;
    this.ensureContext();
    const s = this.sintes!;
    const previa = this.vivas.get(pitch);
    if (previa && instrumento !== 'drums') s.damp(previa);
    this.vivas.set(pitch, s.strike(instrumento, pitch, velocity));
  }

  /** La batería suena entera; la cuerda se apaga al soltar. */
  soltarOtro(instrumento: Instrument, pitch: number): void {
    if (instrumento === 'drums') return;
    const v = this.vivas.get(pitch);
    if (v) this.sintes?.damp(v);
    this.vivas.delete(pitch);
  }

  /** Quién toca una voz: el piano, o el sintetizador de guitarra, bajo y batería. */
  private salida(v: Voice): Piano | Sintes | null {
    return !v.instrument || v.instrument === 'piano' ? this.piano : this.sintes;
  }

  private tick(): void {
    if (this.usingOwnAudio) {
      // Con audio propio solo hay que reiniciarlo cuando la sección vuelve a empezar.
      const t = transport.now();
      if (transport.playing && transport.wrapped(t)) {
        this.stopOwn();
        this.startOwn(t);
      }
      return;
    }
    if ((!this.piano && !this.sintes) || !transport.playing) return;
    const t = transport.now();
    if (transport.wrapped(t)) {
      this.piano?.stopAll();
      this.sintes?.stopAll();
      this.cursor = lowerBound(this.voices, t);
      this.cursorPulso = this.primerPulso(t);
      this.chase(t);
    }
    const horizon = t + HORIZON * transport.speed;
    const loopEnd = transport.loop?.end ?? Infinity;
    this.sonarPulsos(t, horizon, loopEnd);
    while (this.cursor < this.voices.length) {
      const v = this.voices[this.cursor]!;
      if (v.start > horizon || v.start >= loopEnd) break;
      this.cursor++;
      if (v.start < t - 0.02) continue; // ya pasó (después de buscar)
      const release = Math.min(v.release, loopEnd);
      this.salida(v)?.play(
        v,
        transport.toClock(v.start) + this.latency,
        transport.toClock(release) + this.latency,
      );
    }
  }
}

/** Duración máxima que se considera al buscar notas que ya sonaban (s). */
const CHASE_WINDOW = 30;

function lowerBound(voices: readonly Voice[], t: number): number {
  let lo = 0;
  let hi = voices.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (voices[mid]!.start < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export const engine = new AudioEngine();

import.meta.hot?.dispose(() => engine.dispose());
