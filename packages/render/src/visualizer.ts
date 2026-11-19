import {
  Application,
  BitmapFont,
  BitmapText,
  BlurFilter,
  Container,
  Graphics,
  NineSliceSprite,
  Sprite,
  Text,
  Texture,
} from 'pixi.js';
import { PIEZAS_BATERIA, beatGrid } from '@impromptu/core';
import type {
  Beat,
  Instrument,
  KeyboardCalibration,
  NoteEvent,
  PedalEvent,
  Take,
} from '@impromptu/core';
import { calibratedKeyLine, calibratedKeyboard, coverRect } from './calibration';
import { layoutKeyboard } from './keyboard-layout';
import { COLOR_CUERDA, COLOR_PIEZA, carriles, instrumentoDe } from './instrumentos';
import type { Carriles } from './instrumentos';
import type { KeyboardLayout } from './keyboard-layout';
import {
  forEachNoteIn,
  frameLayout,
  indexNotes,
  isSounding,
  noteColor,
  noteRect,
  pedalLevels,
} from './scene';
import type { Direction, FrameLayout, NoteIndex, VisualSettings } from './scene';
import { SPARK_LIFE, noteSparks } from './sparks';
import type { Spark } from './sparks';
import { getTheme, hexToNumber } from './themes';
import type { Theme } from './themes';

/** 'theme', un color (0xRRGGBB) o 'transparent'. */
export type Background = 'theme' | 'transparent' | number;

export interface VisualizerOptions {
  /**
   * Animación de entrada al cambiar de instrumento o de teclado (teclas que suben, cuerdas que
   * se tienden, parches que saltan). Apagada al exportar: el video sale igual cuadro por cuadro.
   */
  animaciones?: boolean;
  canvas?: HTMLCanvasElement;
  width: number;
  height: number;
  /** Densidad de píxeles; por defecto la de la pantalla. */
  resolution?: number;
  /** Conservar la imagen tras dibujar, para que el codificador la lea (exportar). */
  preserveDrawingBuffer?: boolean;
}

export const DEFAULT_SETTINGS: VisualSettings = {
  themeId: 'ambar',
  effects: {
    sparks: 80,
    keyGlow: 80,
    fallSpeed: 1,
    octaveGuides: true,
    noteGlow: 70,
    noteStyle: 'glow',
    beatGuides: true,
  },
  layout: 'visualizer',
  show: { fingers: false, noteNames: false, pedals: ['sustain', 'sostenuto', 'soft'] },
  colors: { right: '#FF9F1C', left: '#E8E4DC', unassigned: '#9A968C' },
};

const MAX_SPARKS = 4000;
/** Borde (px) de la textura del halo que no se estira. */
const HALO_EDGE = 24;
const NOTE_RADIUS = 3;

/** Grupo de objetos reutilizables: nada se crea ni se destruye por cuadro (BUGS B-013). */
class Pool<T extends Container> {
  private items: T[] = [];
  private used = 0;
  constructor(
    private readonly parent: Container,
    private readonly make: () => T,
  ) {}
  begin() {
    this.used = 0;
  }
  next(): T {
    let item = this.items[this.used];
    if (!item) {
      item = this.make();
      this.items.push(item);
      this.parent.addChild(item);
    }
    item.visible = true;
    this.used++;
    return item;
  }
  end() {
    for (let i = this.used; i < this.items.length; i++) this.items[i]!.visible = false;
  }
}

/**
 * Visualizador de notas cayendo. `render(t)` dibuja el cuadro del instante t (segundos)
 * sin depender del cuadro anterior: sirve igual en vivo y para exportar (ADR-004).
 */
export class Visualizer {
  private index: NoteIndex = { notes: [], maxDuration: 0 };
  private pedals: PedalEvent[] = [];
  private direction: Direction = 'fall';
  private background: Background = 'theme';
  private keyboard: KeyboardLayout = layoutKeyboard({ low: 36, high: 96 });
  private settings: VisualSettings = DEFAULT_SETTINGS;
  private theme: Theme = getTheme('ambar');
  private layout: FrameLayout;
  private readonly colorCache = new Map<string, number>();
  private readonly sparks: Spark[] = [];
  private readonly active = new Map<number, NoteEvent>();
  /** Guitarra, bajo o batería (fase 9): carriles virtuales en vez de teclas. */
  private carriles: Carriles | null = null;
  /** Cuándo cambió la base (instrumento o teclado), en ms de reloj; para animar la entrada. */
  private entrada = Number.NEGATIVE_INFINITY;
  private animaciones = true;
  private firmaBase = '';

  /** Marca el cambio de base si el instrumento o el rango de teclas cambiaron. */
  private revisarBase(): void {
    const r = this.keyboard.range;
    const firma = `${this.carriles?.instrument ?? 'piano'}:${r.low}-${r.high}:${this.carriles?.trastes ?? 0}`;
    if (firma !== this.firmaBase) {
      this.firmaBase = firma;
      if (this.animaciones) this.entrada = globalThis.performance.now();
    }
  }

  /** Cuánto apareció el elemento i de n (0 a 1), escalonado de izquierda a derecha. */
  private aparecer(i: number, n: number, rebote = false): number {
    if (!this.animaciones) return 1;
    const p = (globalThis.performance.now() - this.entrada) / 900;
    if (p >= 1.8) return 1;
    const x = Math.min(1, Math.max(0, p * 1.8 - (i / Math.max(1, n)) * 0.8));
    if (!rebote) return 1 - Math.pow(1 - x, 3);
    // Sale un poco de más y vuelve (como algo que salta).
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
  }
  /** Nombres de las piezas sobre los parches de la batería. */
  private readonly nombresParches = new Container();

  private readonly guides = new Graphics();
  private readonly beamLayer = new Container();
  private readonly haloLayer = new Container();
  private readonly noteLayer = new Container();
  private readonly keys = new Graphics();
  private readonly glowLayer = new Container();
  private readonly sparkLayer = new Container();
  private readonly pedal = new Graphics();
  private readonly pedalLabel: Text;
  private readonly notePool: Pool<NineSliceSprite>;
  private readonly haloPool: Pool<NineSliceSprite>;
  private readonly beamPool: Pool<Sprite>;
  private readonly noteTextures: Record<'flat' | 'glow', Texture>;
  private readonly sparkTints: number[] = [];
  /** Pulsos y compases de la toma (vacío si no tiene tempo). */
  private beats: Beat[] = [];
  private readonly barLabels = new Container();
  /** Números de dedo y nombres de nota sobre las notas (fase 4). */
  private readonly noteLabels = new Container();
  private readonly noteLabelPool: Pool<BitmapText>;
  /** Fase 11 (pedido 15): el número de traste va en un círculo del color de la cuerda. */
  private readonly insignias = new Container();
  private readonly insigniaPool: Pool<Sprite>;
  /** Golpe de batería que se está dibujando (la gema no depende de la duración). */
  private readonly golpe = { pitch: 0, start: 0, end: 0 } as NoteEvent;
  /** Selección del editor y rectángulos del último cuadro (para saber qué nota hay bajo el cursor). */
  private selection: ReadonlySet<string> = new Set();
  private readonly selectionOutline = new Graphics();
  private hitRects: { id: string; x: number; y: number; width: number; height: number }[] = [];
  /** Video de la cámara o importado (plantillas de ARQUITECTURA: recuadro y fondo). */
  private readonly bgLayer = new Container();
  private readonly insetLayer = new Container();
  private readonly videoCanvas = document.createElement('canvas');
  private readonly videoTexture: Texture;
  private readonly videoSprite: Sprite;
  private readonly videoDim = new Graphics();
  private readonly videoBorder = new Graphics();
  private readonly videoBlur = new BlurFilter({ strength: 14, quality: 3 });
  private videoFrame: CanvasImageSource | null = null;
  private calibration: KeyboardCalibration | null = null;
  private videoSize = { width: 0, height: 0 };
  private readonly barLabelPool: Pool<Text>;
  private readonly glowPool: Pool<Sprite>;
  private readonly sparkPool: Pool<Sprite>;

  private constructor(
    private readonly app: Application,
    width: number,
    height: number,
  ) {
    this.layout = frameLayout(width, height, 1);
    const noteTexture = app.renderer.generateTexture(
      new Graphics().roundRect(0, 0, 16, 16, NOTE_RADIUS).fill(0xffffff),
    );
    this.noteTextures = { flat: noteTexture, glow: makeNoteTexture() };
    const glowTexture = makeGlowTexture();
    const haloTexture = makeHaloTexture();
    const beamTexture = makeBeamTexture();

    this.notePool = new Pool(
      this.noteLayer,
      () =>
        new NineSliceSprite({
          texture: noteTexture,
          leftWidth: NOTE_RADIUS + 1,
          rightWidth: NOTE_RADIUS + 1,
          topHeight: NOTE_RADIUS + 1,
          bottomHeight: NOTE_RADIUS + 1,
        }),
    );
    this.haloPool = new Pool(this.haloLayer, () => {
      const h = new NineSliceSprite({
        texture: haloTexture,
        leftWidth: HALO_EDGE,
        rightWidth: HALO_EDGE,
        topHeight: HALO_EDGE,
        bottomHeight: HALO_EDGE,
      });
      h.blendMode = 'add';
      return h;
    });
    this.beamPool = new Pool(this.beamLayer, () => {
      const b = new Sprite(beamTexture);
      b.anchor.set(0.5, 1);
      b.blendMode = 'add';
      return b;
    });
    this.glowPool = new Pool(this.glowLayer, () => {
      const s = new Sprite(glowTexture);
      s.anchor.set(0.5, 0.5);
      s.blendMode = 'add';
      return s;
    });
    this.sparkPool = new Pool(this.sparkLayer, () => {
      const s = new Sprite(Texture.WHITE);
      s.anchor.set(0.5);
      s.blendMode = 'add';
      return s;
    });
    this.videoCanvas.width = this.videoCanvas.height = 2;
    this.videoTexture = Texture.from(this.videoCanvas);
    this.videoSprite = new Sprite(this.videoTexture);
    const circulo = app.renderer.generateTexture(new Graphics().circle(32, 32, 32).fill(0xffffff));
    this.insigniaPool = new Pool(this.insignias, () => {
      const s = new Sprite(circulo);
      s.anchor.set(0.5);
      return s;
    });
    installLabelFont();
    this.noteLabelPool = new Pool(
      this.noteLabels,
      () => new BitmapText({ text: '', style: { fontFamily: LABEL_FONT, fontSize: 12 } }),
    );
    this.barLabelPool = new Pool(
      this.barLabels,
      () =>
        new Text({
          text: '',
          style: { fontFamily: 'Martian Mono, monospace', fontSize: 11, fill: 0xa39f95 },
        }),
    );
    this.pedalLabel = new Text({
      text: 'Ped.',
      style: { fontFamily: 'Martian Mono, monospace', fontSize: 12, fill: 0xa39f95 },
    });

    app.stage.addChild(
      this.bgLayer,
      this.guides,
      this.barLabels,
      this.beamLayer,
      this.haloLayer,
      this.noteLayer,
      this.insignias,
      this.noteLabels,
      this.selectionOutline,
      this.keys,
      this.glowLayer,
      this.sparkLayer,
      this.pedal,
      this.pedalLabel,
      this.nombresParches,
      this.insetLayer,
    );
  }

  static async create(opts: VisualizerOptions): Promise<Visualizer> {
    const app = new Application();
    await app.init({
      ...(opts.canvas ? { canvas: opts.canvas } : {}),
      width: opts.width,
      height: opts.height,
      resolution: opts.resolution ?? globalThis.devicePixelRatio ?? 1,
      autoDensity: true,
      antialias: true,
      autoStart: false,
      backgroundColor: getTheme('ambar').background,
      backgroundAlpha: 1,
      preference: 'webgl',
      preserveDrawingBuffer: opts.preserveDrawingBuffer ?? false,
    });
    app.ticker.stop();
    const v = new Visualizer(app, opts.width, opts.height);
    v.animaciones = opts.animaciones ?? true;
    return v;
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  setTake(take: Take | null): void {
    this.direction = 'fall';
    this.carriles = take ? carriles(take.tracks, instrumentoDe(take)) : null;
    this.index = this.carriles
      ? indexNotes([
          {
            id: 'carriles',
            instrument: this.carriles.instrument,
            name: '',
            notes: this.carriles.notas,
            pedals: [],
          },
        ])
      : indexNotes(take?.tracks ?? []);
    this.pedals = (take?.tracks ?? []).flatMap((t) => t.pedals).sort((a, b) => a.time - b.time);
    this.keyboard =
      this.carriles?.layout ?? layoutKeyboard(take?.keyboardRange ?? { low: 36, high: 96 });
    this.beats = take ? beatGrid(take.tempoMap, take.timeSignature, take.duration + 2) : [];
    this.revisarBase();
  }

  /**
   * Modo en vivo: las notas suben desde la tecla. `notes` va en orden de inicio y las que
   * siguen abajo tienen end = Infinity. Se llama en cada cuadro con el búfer reciente.
   */
  setLive(
    notes: NoteEvent[],
    pedals: PedalEvent[],
    range: Take['keyboardRange'],
    instrument: Instrument = 'piano',
  ): void {
    this.direction = 'rise';
    if (instrument !== 'piano') {
      // Batería electrónica o guitarra MIDI: sus carriles.
      this.carriles = carriles(
        [{ id: 'vivo', instrument, name: '', notes, pedals: [] }],
        instrument,
      );
      this.index = { notes: this.carriles?.notas ?? [], maxDuration: Infinity };
      this.pedals = [];
      if (this.carriles) this.keyboard = this.carriles.layout;
      this.revisarBase();
      return;
    }
    if (this.carriles) {
      this.carriles = null;
      this.keyboard = layoutKeyboard(range);
    }
    this.index = { notes, maxDuration: Infinity };
    this.pedals = pedals;
    const r = this.keyboard.range;
    if (r.low !== range.low || r.high !== range.high) this.keyboard = layoutKeyboard(range);
  }

  setSettings(settings: VisualSettings): void {
    this.settings = settings;
    this.theme = getTheme(settings.themeId);
    this.applyBackground();
    this.layout = frameLayout(
      this.layout.width,
      this.layout.height,
      settings.effects.fallSpeed,
      settings.show.bigPedal === true,
    );
  }

  /**
   * Fondo para transmitir (ruta /en-vivo): el del tema, un color sólido (verde para
   * recortar en OBS) o transparente (fuente de navegador de OBS).
   */
  setBackground(background: Background): void {
    this.background = background;
    this.applyBackground();
  }

  private applyBackground(): void {
    const bg = this.app.renderer.background;
    if (this.background === 'transparent') {
      bg.alpha = 0;
    } else {
      bg.color = this.background === 'theme' ? this.theme.background : this.background;
      bg.alpha = 1;
    }
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
    this.layout = frameLayout(
      width,
      height,
      this.settings.effects.fallSpeed,
      this.settings.show.bigPedal === true,
    );
  }

  /** Dibuja el instante t. Determinista: mismo t, mismo cuadro. */
  /**
   * Cuadro de video para el instante que se va a dibujar (o null si no hay video en ese
   * momento). En vivo es el <video> sincronizado; al exportar, el cuadro decodificado exacto.
   */
  /** Teclas reales marcadas sobre el video (plantilla "Cámara arriba"). */
  setCalibration(calibration: KeyboardCalibration | null): void {
    this.calibration = calibration;
  }

  /** ¿Las notas caen sobre las teclas del video en este cuadro? */
  private cameraTop(): boolean {
    const { width, height } = this.videoSize;
    return (
      this.settings.layout === 'camera-top' &&
      this.calibration !== null &&
      this.videoFrame !== null &&
      width > 0 &&
      height > 0
    );
  }

  /** Notas seleccionadas en el editor: se dibujan con borde ámbar. */
  setSelection(ids: ReadonlySet<string>): void {
    this.selection = ids;
  }

  /**
   * Id de la nota bajo un punto del lienzo (px CSS), según lo dibujado en el último cuadro.
   * Si hay varias encimadas, gana la de encima (la última dibujada).
   */
  noteAt(x: number, y: number): string | null {
    for (let i = this.hitRects.length - 1; i >= 0; i--) {
      const r = this.hitRects[i]!;
      if (x >= r.x - 2 && x <= r.x + r.width + 2 && y >= r.y - 2 && y <= r.y + r.height + 2)
        return r.id;
    }
    return null;
  }

  /** Notas visibles que tocan un rectángulo (seleccionar una zona arrastrando). */
  notesIn(x0: number, y0: number, x1: number, y1: number): string[] {
    const [ax, bx] = x0 < x1 ? [x0, x1] : [x1, x0];
    const [ay, by] = y0 < y1 ? [y0, y1] : [y1, y0];
    const ids = new Set<string>();
    for (const r of this.hitRects) {
      if (r.x + r.width >= ax && r.x <= bx && r.y + r.height >= ay && r.y <= by) ids.add(r.id);
    }
    return [...ids];
  }

  setVideoFrame(frame: CanvasImageSource | null, width = 0, height = 0): void {
    this.videoFrame = frame;
    if (frame) this.videoSize = { width, height };
  }

  render(t: number): void {
    const virtualLayout = this.layout;
    const virtualKeyboard = this.keyboard;
    const camera = this.cameraTop();
    if (camera) {
      // Las notas caen sobre las teclas reales: el marco y el teclado salen de la calibración.
      const rect = coverRect(
        virtualLayout.width,
        virtualLayout.height,
        this.videoSize.width,
        this.videoSize.height,
      );
      const keyLineY = calibratedKeyLine(this.calibration!, rect);
      this.layout = {
        ...virtualLayout,
        keyLineY,
        pps: (keyLineY / virtualLayout.keyLineY) * virtualLayout.pps,
      };
      this.keyboard = calibratedKeyboard(this.calibration!, rect, virtualLayout.width);
    }
    try {
      this.renderFrame(t, camera);
    } finally {
      this.layout = virtualLayout;
      this.keyboard = virtualKeyboard;
    }
  }

  private renderFrame(t: number, camera: boolean): void {
    const L = this.layout;
    const { effects, colors } = this.settings;
    const scale = L.height / 1080;

    this.drawVideo(scale, camera);

    this.drawGuides(t);

    // Notas que caen
    this.notePool.begin();
    this.haloPool.begin();
    this.noteLabelPool.begin();
    this.insigniaPool.begin();
    const { fingers: showFingers, noteNames: showNames } = this.settings.show;
    const esBateria = this.carriles?.instrument === 'drums';
    const esCuerda = !!this.carriles && !esBateria;
    // Gemas de batería (pedido 16): alto fijo, así los golpes seguidos no se pegan (pedido 15).
    const altoGema = Math.max(10, 20 * scale);
    this.hitRects.length = 0;
    const outline = this.selectionOutline.clear();
    this.active.clear();
    const glowStyle = effects.noteStyle === 'glow';
    const noteTexture = this.noteTextures[glowStyle ? 'glow' : 'flat'];
    const halo = glowStyle ? effects.noteGlow / 100 : 0; // 0–2
    const span = L.keyLineY / L.pps;
    const [from, to] = this.direction === 'fall' ? [t, t + span] : [t - span, t];
    forEachNoteIn(this.index, from, to, (note) => {
      let rect: ReturnType<typeof noteRect>;
      if (esBateria) {
        this.golpe.pitch = note.pitch;
        this.golpe.start = note.start;
        this.golpe.end = note.start;
        rect = noteRect(this.golpe, t, L, this.keyboard, altoGema, this.direction);
        if (rect) {
          // Más angosta que el carril y un poco más ancha con más fuerza.
          const ancho = rect.width * (0.42 + 0.22 * (note.velocity / 127));
          rect.x += (rect.width - ancho) / 2;
          rect.width = ancho;
          rect.height = Math.min(rect.height, altoGema);
        }
      } else rect = noteRect(note, t, L, this.keyboard, 3, this.direction);
      if (rect) {
        const tint = this.colorNota(note, colors);
        const v = note.velocity / 127;
        if (halo > 0) {
          // Halo aditivo del color de la nota (ADR-010).
          const pad = (6 + 10 * halo) * scale;
          const h = this.haloPool.next();
          h.position.set(rect.x - pad, rect.y - pad);
          h.width = rect.width + pad * 2;
          h.height = rect.height + pad * 2;
          h.tint = tint;
          h.alpha = Math.min(1, 0.4 * halo) * (0.6 + 0.4 * v);
        }
        const sprite = this.notePool.next();
        sprite.texture = noteTexture;
        sprite.position.set(rect.x, rect.y);
        sprite.width = rect.width;
        sprite.height = rect.height;
        sprite.tint = tint;
        sprite.alpha = esBateria ? 0.55 + 0.45 * v : 0.72 + 0.28 * v;
        if (esCuerda) {
          const traste = this.carriles?.meta.get(note.id)?.etiqueta;
          if (traste) this.insignia(traste, rect, tint, scale);
        } else if (!esBateria) {
          const text = labelFor(note, showFingers, showNames);
          if (text) this.placeLabel(text, rect, tint, scale);
        }
        this.hitRects.push({ id: note.id, ...rect });
        if (this.selection.has(note.id)) {
          outline
            .roundRect(rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4, 4)
            .stroke({ width: Math.max(2, 2 * scale), color: 0xff9f1c });
        }
      }
      if (isSounding(note, t)) this.active.set(note.pitch, note);
    });
    this.notePool.end();
    this.haloPool.end();
    this.noteLabelPool.end();
    this.insigniaPool.end();

    if (camera) this.keys.clear();
    else this.drawKeyboard(colors);

    // Brillo sobre las teclas que suenan
    this.glowPool.begin();
    this.beamPool.begin();
    const k = effects.keyGlow / 100; // 0–2
    if (k > 0) {
      for (const note of this.active.values()) {
        const key = this.keyboard.key(note.pitch);
        if (!key) continue;
        const w = key.width * L.width;
        const cx = key.x * L.width + w / 2;
        const tint = this.colorNota(note, colors);
        const v = note.velocity / 127;
        const glow = this.glowPool.next();
        glow.position.set(cx, L.keyLineY);
        glow.width = w * (4 + 2 * k);
        glow.height = w * (2.6 + 1.4 * k);
        glow.tint = tint;
        glow.alpha = Math.min(1, 0.6 * k * (0.45 + 0.55 * v));
        // Haz de luz que sube desde la tecla; más fuerte justo en el ataque.
        const attack = 1 + 1.2 * Math.max(0, 1 - (t - note.start) / 0.18);
        const beam = this.beamPool.next();
        beam.position.set(cx, L.keyLineY);
        beam.width = w * (1.1 + 0.5 * k);
        beam.height = L.keyLineY * Math.min(0.75, 0.2 + 0.25 * k);
        beam.tint = tint;
        beam.alpha = Math.min(1, 0.22 * k * attack * (0.5 + 0.5 * v));
      }
    }
    this.glowPool.end();
    this.beamPool.end();

    // Chispas
    this.sparks.length = 0;
    if (effects.sparks > 0) {
      forEachNoteIn(this.index, t - SPARK_LIFE, t, (note) => {
        const key = this.keyboard.key(note.pitch);
        if (!key || this.sparks.length > MAX_SPARKS) return;
        const w = key.width * L.width;
        const first = this.sparks.length;
        const tint = lighten(this.colorNota(note, colors), 0.55);
        noteSparks(
          note,
          t,
          {
            amount: effects.sparks,
            originX: key.x * L.width + w / 2,
            originY: L.keyLineY,
            keyWidth: w,
            scale,
          },
          this.sparks,
        );
        for (let i = first; i < this.sparks.length; i++) this.sparkTints[i] = tint;
      });
    }
    this.sparkPool.begin();
    const grow = 0.8 + 0.35 * (effects.sparks / 100);
    const count = Math.min(this.sparks.length, MAX_SPARKS);
    for (let i = 0; i < count; i++) {
      const spark = this.sparks[i]!;
      const sprite = this.sparkPool.next();
      sprite.position.set(spark.x, spark.y);
      sprite.width = sprite.height = spark.size * grow;
      sprite.alpha = spark.alpha;
      sprite.tint = this.sparkTints[i] ?? 0xffc56b;
    }
    this.sparkPool.end();

    if (camera || this.carriles) {
      // Con cámara, o en guitarra y batería (no tienen pedal), no se dibuja.
      this.pedal.clear();
      this.pedalLabel.visible = false;
    } else {
      this.drawPedal(t);
    }
    this.nombresParches.visible = this.carriles?.instrument === 'drums' && !camera;
    this.app.render();
  }

  /** Dedo o nombre al pie de la nota, si cabe; oscuro sobre notas claras y claro sobre oscuras. */
  /**
   * Número de traste legible (pedido 15): un círculo del color de la cuerda en la punta de la
   * nota, con tamaño propio (no depende de lo angosta que sea la nota).
   */
  private insignia(
    text: string,
    rect: { x: number; y: number; width: number; height: number },
    tint: number,
    scale: number,
  ): void {
    const d = Math.max(18, (text.length > 1 ? 34 : 30) * scale);
    const cx = rect.x + rect.width / 2;
    const cy = this.direction === 'fall' ? rect.y + rect.height - d / 2 : rect.y + d / 2;
    const c = this.insigniaPool.next();
    c.position.set(cx, cy);
    c.width = c.height = d;
    c.tint = tint;
    const label = this.noteLabelPool.next();
    label.text = text;
    label.style.fontSize = d * (text.length > 1 ? 0.5 : 0.6);
    label.tint = luminance(tint) > 0.55 ? 0x111110 : 0xf5f2ec;
    label.position.set(cx - label.width / 2, cy - label.height / 2);
  }

  private placeLabel(
    text: string,
    rect: { x: number; y: number; width: number; height: number },
    tint: number,
    scale: number,
  ): void {
    const size = Math.min(
      22 * scale,
      Math.max(8 * scale, rect.width * (text.length > 1 ? 0.42 : 0.62)),
    );
    if (rect.height < size + 4) return;
    const label = this.noteLabelPool.next();
    label.text = text;
    label.style.fontSize = size;
    label.tint = luminance(tint) > 0.55 ? 0x111110 : 0xf5f2ec;
    label.position.set(
      rect.x + (rect.width - label.width) / 2,
      rect.y + rect.height - size - 3 * scale,
    );
  }

  destroy(): void {
    this.app.destroy(false, { children: true, texture: true });
  }

  private color(hex: string): number {
    let c = this.colorCache.get(hex);
    if (c === undefined) {
      c = hexToNumber(hex);
      this.colorCache.set(hex, c);
    }
    return c;
  }

  /** Coloca el video según la plantilla: de fondo (oscurecido, con o sin desenfoque) o en recuadro. */
  private drawVideo(scale: number, camera = false): void {
    const L = this.layout;
    const { layout, background } = this.settings;
    const sprite = this.videoSprite;
    this.videoDim.clear();
    this.videoBorder.clear();
    sprite.removeFromParent();
    this.videoDim.removeFromParent();
    this.videoBorder.removeFromParent();

    if (layout === 'background' && background?.kind === 'color') {
      this.videoDim.rect(0, 0, L.width, L.height).fill(hexToNumber(background.value));
      this.bgLayer.addChild(this.videoDim);
      return;
    }
    const { width: fw, height: fh } = this.videoSize;
    if (!this.videoFrame || fw === 0 || fh === 0) return;
    const wantsVideo =
      camera ||
      layout === 'camera-inset' ||
      (layout === 'background' && (background?.kind === 'video' || background?.kind === 'blur'));
    if (!wantsVideo) return;

    // Copiar el cuadro a un lienzo propio (hasta 1920 px de ancho) y subirlo a la GPU.
    const cw = Math.min(1920, fw);
    const ch = Math.round((fh * cw) / fw);
    if (this.videoCanvas.width !== cw || this.videoCanvas.height !== ch) {
      this.videoCanvas.width = cw;
      this.videoCanvas.height = ch;
      this.videoTexture.source.resize(cw, ch);
    }
    this.videoCanvas.getContext('2d')!.drawImage(this.videoFrame, 0, 0, cw, ch);
    this.videoTexture.source.update();

    if (camera) {
      // Cámara arriba: el video ocupa todo el cuadro, sin oscurecer, y las notas caen sobre él.
      const r = coverRect(L.width, L.height, cw, ch);
      sprite.scale.set(r.width / cw);
      sprite.position.set(r.x, r.y);
      sprite.filters = [];
      this.bgLayer.addChild(sprite);
      return;
    }

    if (layout === 'background') {
      // Cubre todo el cuadro (recortando lo que sobre) y se oscurece para que las notas se lean.
      const s = Math.max(L.width / cw, L.height / ch);
      sprite.scale.set(s);
      sprite.position.set((L.width - cw * s) / 2, (L.height - ch * s) / 2);
      sprite.filters = background?.kind === 'blur' ? [this.videoBlur] : [];
      this.videoDim
        .rect(0, 0, L.width, L.height)
        .fill({ color: this.theme.background, alpha: 0.45 });
      this.bgLayer.addChild(sprite, this.videoDim);
      return;
    }

    // Recuadro arriba a la derecha.
    const w = L.width * 0.3;
    const h = (w * ch) / cw;
    const margin = 16 * scale;
    sprite.filters = [];
    sprite.scale.set(w / cw);
    sprite.position.set(L.width - w - margin, margin);
    this.videoBorder
      .rect(sprite.x - 1, sprite.y - 1, w + 2, h + 2)
      .stroke({ width: Math.max(1, scale), color: this.theme.guide });
    this.insetLayer.addChild(sprite, this.videoBorder);
  }

  private drawGuides(t: number): void {
    const g = this.guides.clear();
    const L = this.layout;
    const scale = L.height / 1080;
    if (this.settings.effects.octaveGuides) {
      for (const key of this.keyboard.keys) {
        if (key.pitch % 12 !== 0) continue;
        g.rect(Math.round(key.x * L.width), 0, 1, L.keyLineY);
      }
      g.fill({ color: this.theme.guide, alpha: 0.7 });
    }

    // Líneas de compás y de pulso que caen con la música (solo al reproducir una toma).
    this.barLabelPool.begin();
    if (this.settings.effects.beatGuides && this.direction === 'fall' && this.beats.length > 0) {
      const span = L.keyLineY / L.pps;
      const thin = Math.max(1, Math.round(scale));
      for (const b of this.beats) {
        if (b.time < t) continue;
        if (b.time > t + span) break;
        const y = Math.round(L.keyLineY - (b.time - t) * L.pps);
        if (b.beat === 1) {
          g.rect(0, y - thin, L.width, thin * 2).fill({ color: this.theme.label, alpha: 0.32 });
          const label = this.barLabelPool.next();
          label.text = String(b.bar);
          label.style.fontSize = Math.round(11 * Math.max(1, scale));
          label.style.fill = this.theme.label;
          label.alpha = 0.75;
          label.position.set(Math.round(6 * scale), y - label.height - 2);
        } else {
          g.rect(0, y, L.width, thin).fill({ color: this.theme.guide, alpha: 0.55 });
        }
      }
    }
    this.barLabelPool.end();
  }

  /** Color de una nota: por mano (piano), por cuerda (guitarra) o por pieza (batería). */
  private colorNota(note: NoteEvent, colors: VisualSettings['colors']): number {
    const propio = this.carriles?.meta.get(note.id)?.color;
    return this.color(propio ?? noteColor(note, colors));
  }

  /** Mástil (guitarra y bajo) o parches (batería) en lugar del teclado. */
  private drawCarriles(c: Carriles): void {
    const L = this.layout;
    const g = this.keys.clear();
    const top = L.keyLineY;
    const h = L.keyboardHeight;
    const lineH = Math.max(2, Math.round(L.height * 0.003));
    if (c.instrument === 'drums') {
      const w = L.width / c.trastes;
      g.rect(0, top, L.width, h).fill(this.theme.background);
      for (let i = 0; i < c.trastes; i++) {
        const color = this.color(COLOR_PIEZA[i]!);
        const activa = this.active.has(i);
        const r =
          Math.min(w * 0.4, h * 0.38) *
          (activa ? 1.08 : 1) *
          Math.max(0.001, this.aparecer(i, c.trastes, true));
        g.ellipse((i + 0.5) * w, top + h * 0.5, r, r * 0.8)
          .fill(activa ? color : 0x2e2e2b)
          .stroke({ width: Math.max(2, h * 0.03), color });
        let nombre = this.nombresParches.children[i] as Text | undefined;
        if (!nombre) {
          nombre = new Text({
            text: PIEZAS_BATERIA[i]!.nombre,
            style: {
              fontFamily: 'Archivo, sans-serif',
              fontSize: 12,
              fill: 0xe8e4dc,
              align: 'center',
            },
          });
          nombre.anchor.set(0.5);
          this.nombresParches.addChild(nombre);
        }
        nombre.style.fontSize = Math.max(9, Math.min(16, w * 0.12, h * 0.12));
        nombre.style.fill = activa ? 0x1c1c1a : 0xe8e4dc;
        nombre.position.set((i + 0.5) * w, top + h * 0.5);
      }
    } else {
      const col = L.width / c.trastes;
      g.rect(0, top, L.width, h).fill(0x2b2017);
      // Marcas del mástil (3, 5, 7, 9, 12 doble, 15…).
      for (const f of [3, 5, 7, 9, 12, 15, 17, 19, 21]) {
        if (f >= c.trastes) continue;
        const x = (f + 0.5) * col;
        const r = Math.min(col, h) * 0.07;
        if (f === 12) {
          g.circle(x, top + h * 0.3, r).fill(0x5a4a3a);
          g.circle(x, top + h * 0.7, r).fill(0x5a4a3a);
        } else g.circle(x, top + h * 0.5, r).fill(0x5a4a3a);
      }
      // Cejuela (más gruesa) y trastes.
      for (let f = 1; f < c.trastes; f++) {
        const ancho = f === 1 ? Math.max(4, col * 0.08) : Math.max(2, col * 0.04);
        const a = this.aparecer(f, c.trastes);
        g.rect(f * col - ancho / 2, top + (1 - a) * h * 0.5, ancho, h * a).fill({
          color: f === 1 ? 0xe8e4dc : 0x9a968c,
          alpha: a,
        });
      }
      // Cuerdas: la 1 arriba (como en la tablatura), más gruesas las graves.
      const fila = (cuerda: number) => top + (h * (cuerda - 0.5)) / c.cuerdas;
      for (let s = 1; s <= c.cuerdas; s++) {
        const grosor = Math.max(1, (0.6 + s * 0.35) * (h / 160));
        // Cada cuerda se tiende de izquierda a derecha, una tras otra.
        const a = this.aparecer(s, c.cuerdas + 2);
        g.rect(0, fila(s) - grosor / 2, L.width * a, grosor).fill(0xd8d4cc);
      }
      // Donde se pisa ahora: un punto del color de la cuerda.
      for (const pitch of this.active.keys()) {
        const traste = Math.floor(pitch / c.cuerdas);
        const cuerda = (pitch % c.cuerdas) + 1;
        const r = Math.min(col * 0.38, (h / c.cuerdas) * 0.42);
        g.circle((traste + 0.5) * col, fila(cuerda), r).fill(this.color(COLOR_CUERDA[cuerda - 1]!));
      }
    }
    g.rect(0, top - lineH, L.width, lineH).fill(this.theme.keyLine);
  }

  private drawKeyboard(colors: VisualSettings['colors']): void {
    if (this.carriles) {
      this.drawCarriles(this.carriles);
      return;
    }
    const L = this.layout;
    const g = this.keys.clear();
    const th = this.theme;
    const lineH = Math.max(2, Math.round(L.height * 0.003));

    for (const key of this.keyboard.keys) {
      const x = key.x * L.width;
      const w = key.width * L.width;
      const note = this.active.get(key.pitch);
      const lit = note ? this.colorNota(note, colors) : undefined;
      // Entrada: cada tecla sube desde abajo, de izquierda a derecha.
      const a = this.aparecer(key.x, 1);
      const dy = (1 - a) * L.keyboardHeight * 0.7;
      if (!key.black) {
        g.rect(x + 0.5, L.keyLineY + dy, w - 1, L.keyboardHeight).fill({
          color: lit ?? th.whiteKey,
          alpha: a,
        });
        g.rect(x + 0.5, L.keyLineY + dy + L.keyboardHeight - 3, w - 1, 3).fill({
          color: th.whiteKeyEdge,
          alpha: a,
        });
      } else {
        g.rect(x, L.keyLineY + dy, w, L.blackKeyHeight).fill({
          color: lit ?? th.blackKey,
          alpha: a,
        });
      }
    }
    // Línea de aterrizaje
    g.rect(0, L.keyLineY - lineH, L.width, lineH).fill(th.keyLine);
  }

  private drawPedal(t: number): void {
    const L = this.layout;
    const g = this.pedal.clear();
    if (this.background !== 'transparent') {
      const color = this.background === 'theme' ? this.theme.background : this.background;
      g.rect(0, L.pedalY, L.width, L.pedalHeight).fill(color);
    }
    const show = this.settings.show.pedals;
    if (show.length === 0) {
      this.pedalLabel.visible = false;
      return;
    }
    const levels = pedalLevels(this.pedals, t);
    const fontSize = Math.round(L.pedalHeight * 0.55);
    const label = this.pedalLabel;
    label.visible = true;
    label.style.fontSize = fontSize;
    label.style.fill = this.theme.label;
    label.position.set(Math.round(L.height * 0.012), L.pedalY + (L.pedalHeight - fontSize) / 2 - 1);

    // Barra continua: el largo es el valor del pedal (medio pedal incluido).
    const x0 = label.x + label.width + L.height * 0.012;
    const barH = Math.max(3, Math.round(L.pedalHeight * 0.32));
    const y = L.pedalY + (L.pedalHeight - barH) / 2;
    const kinds = show.filter((k) => k === 'sustain' || levels[k] > 0);
    const slot = (L.width - x0 - L.height * 0.012) / Math.max(1, kinds.length);
    kinds.forEach((kind, i) => {
      const x = x0 + i * slot;
      const w = slot - (kinds.length > 1 ? L.height * 0.012 : 0);
      g.rect(x, y, w, barH).fill(this.theme.pedalTrack);
      if (levels[kind] > 0) g.rect(x, y, w * levels[kind], barH).fill(this.theme.pedal);
    });
  }
}

/** Halo suave para el brillo de las teclas (solo dentro del visualizador, DESIGN §6). */
function makeGlowTexture(): Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(canvas);
}

/** Mezcla un color con blanco (0 = igual, 1 = blanco): chispas del color de la nota pero claras. */
function lighten(color: number, amount: number): number {
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return (mix((color >> 16) & 255) << 16) | (mix((color >> 8) & 255) << 8) | mix(color & 255);
}

/** Cuerpo de nota "brillante": borde de luz y un leve degradado (el color sale del tinte). */
function makeNoteTexture(): Texture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const r = NOTE_RADIUS + 1;
  const body = ctx.createLinearGradient(0, 0, 0, size);
  body.addColorStop(0, 'rgb(255,255,255)');
  body.addColorStop(0.5, 'rgb(225,225,225)');
  body.addColorStop(1, 'rgb(200,200,200)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fill();
  ctx.strokeStyle = 'rgb(255,255,255)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1, 1, size - 2, size - 2, r - 1);
  ctx.stroke();
  return Texture.from(canvas);
}

/** Halo suave alrededor de una nota (rectángulo redondeado desenfocado). */
function makeHaloTexture(): Texture {
  const size = HALO_EDGE * 2 + 8;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.filter = 'blur(' + HALO_EDGE / 3 + 'px)';
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.roundRect(
    HALO_EDGE * 0.6,
    HALO_EDGE * 0.6,
    size - HALO_EDGE * 1.2,
    size - HALO_EDGE * 1.2,
    6,
  );
  ctx.fill();
  return Texture.from(canvas);
}

/** Haz de luz vertical: brillante abajo (la tecla), transparente arriba y suave a los lados. */
function makeBeamTexture(): Texture {
  const w = 32;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const vertical = ctx.createLinearGradient(0, h, 0, 0);
  vertical.addColorStop(0, 'rgba(255,255,255,1)');
  vertical.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  vertical.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, w, h);
  // Bordes laterales suaves.
  ctx.globalCompositeOperation = 'destination-in';
  const sides = ctx.createLinearGradient(0, 0, w, 0);
  sides.addColorStop(0, 'rgba(0,0,0,0)');
  sides.addColorStop(0.5, 'rgba(0,0,0,1)');
  sides.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sides;
  ctx.fillRect(0, 0, w, h);
  return Texture.from(canvas);
}

const LABEL_FONT = 'impromptu-etiquetas';
const NOTE_NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];

/** Fuente de mapa de bits (Archivo 600, DESIGN §3) para dedos y nombres: se dibuja en la GPU. */
function installLabelFont(): void {
  if (BitmapFont.install && !installLabelFont.done) {
    BitmapFont.install({
      name: LABEL_FONT,
      style: {
        fontFamily: 'Archivo, system-ui, sans-serif',
        fontSize: 40,
        fontWeight: '600',
        fill: 0xffffff,
      },
      chars: [['0', '9'], 'DoReMiFaSolLaSi#·'],
      resolution: 2,
    });
    installLabelFont.done = true;
  }
}
installLabelFont.done = false;

/** Texto de la etiqueta de una nota: dedo, nombre o ambos ("3·Mi"). */
function labelFor(note: NoteEvent, fingers: boolean, names: boolean): string {
  const finger = fingers && note.finger ? String(note.finger) : '';
  const name = names ? NOTE_NAMES[note.pitch % 12]! : '';
  return finger && name ? `${finger}·${name}` : finger || name;
}

/** Luminancia relativa aproximada (0–1) de un color 0xRRGGBB. */
function luminance(color: number): number {
  const r = ((color >> 16) & 255) / 255;
  const g = ((color >> 8) & 255) / 255;
  const b = (color & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
