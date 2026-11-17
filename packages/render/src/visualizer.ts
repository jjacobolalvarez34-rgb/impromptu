import { Application, Container, Graphics, NineSliceSprite, Sprite, Text, Texture } from 'pixi.js';
import { beatGrid } from '@impromptu/core';
import type { Beat, NoteEvent, PedalEvent, Take } from '@impromptu/core';
import { layoutKeyboard } from './keyboard-layout';
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
      this.guides,
      this.barLabels,
      this.beamLayer,
      this.haloLayer,
      this.noteLayer,
      this.keys,
      this.glowLayer,
      this.sparkLayer,
      this.pedal,
      this.pedalLabel,
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
    return new Visualizer(app, opts.width, opts.height);
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  setTake(take: Take | null): void {
    this.direction = 'fall';
    this.index = indexNotes(take?.tracks ?? []);
    this.pedals = (take?.tracks ?? []).flatMap((t) => t.pedals).sort((a, b) => a.time - b.time);
    this.keyboard = layoutKeyboard(take?.keyboardRange ?? { low: 36, high: 96 });
    this.beats = take ? beatGrid(take.tempoMap, take.timeSignature, take.duration + 2) : [];
  }

  /**
   * Modo en vivo: las notas suben desde la tecla. `notes` va en orden de inicio y las que
   * siguen abajo tienen end = Infinity. Se llama en cada cuadro con el búfer reciente.
   */
  setLive(notes: NoteEvent[], pedals: PedalEvent[], range: Take['keyboardRange']): void {
    this.direction = 'rise';
    this.index = { notes, maxDuration: Infinity };
    this.pedals = pedals;
    const r = this.keyboard.range;
    if (r.low !== range.low || r.high !== range.high) this.keyboard = layoutKeyboard(range);
  }

  setSettings(settings: VisualSettings): void {
    this.settings = settings;
    this.theme = getTheme(settings.themeId);
    this.applyBackground();
    this.layout = frameLayout(this.layout.width, this.layout.height, settings.effects.fallSpeed);
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
    this.layout = frameLayout(width, height, this.settings.effects.fallSpeed);
  }

  /** Dibuja el instante t. Determinista: mismo t, mismo cuadro. */
  render(t: number): void {
    const L = this.layout;
    const { effects, colors } = this.settings;
    const scale = L.height / 1080;

    this.drawGuides(t);

    // Notas que caen
    this.notePool.begin();
    this.haloPool.begin();
    this.active.clear();
    const glowStyle = effects.noteStyle === 'glow';
    const noteTexture = this.noteTextures[glowStyle ? 'glow' : 'flat'];
    const halo = glowStyle ? effects.noteGlow / 100 : 0; // 0–2
    const span = L.keyLineY / L.pps;
    const [from, to] = this.direction === 'fall' ? [t, t + span] : [t - span, t];
    forEachNoteIn(this.index, from, to, (note) => {
      const rect = noteRect(note, t, L, this.keyboard, 3, this.direction);
      if (rect) {
        const tint = this.color(noteColor(note, colors));
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
        sprite.alpha = 0.72 + 0.28 * v;
      }
      if (isSounding(note, t)) this.active.set(note.pitch, note);
    });
    this.notePool.end();
    this.haloPool.end();

    this.drawKeyboard(colors);

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
        const tint = this.color(noteColor(note, colors));
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
        const tint = lighten(this.color(noteColor(note, colors)), 0.55);
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

    this.drawPedal(t);
    this.app.render();
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

  private drawKeyboard(colors: VisualSettings['colors']): void {
    const L = this.layout;
    const g = this.keys.clear();
    const th = this.theme;
    const lineH = Math.max(2, Math.round(L.height * 0.003));

    for (const key of this.keyboard.keys) {
      const x = key.x * L.width;
      const w = key.width * L.width;
      const note = this.active.get(key.pitch);
      const lit = note ? this.color(noteColor(note, colors)) : undefined;
      if (!key.black) {
        g.rect(x + 0.5, L.keyLineY, w - 1, L.keyboardHeight).fill(lit ?? th.whiteKey);
        g.rect(x + 0.5, L.keyLineY + L.keyboardHeight - 3, w - 1, 3).fill(th.whiteKeyEdge);
      } else {
        g.rect(x, L.keyLineY, w, L.blackKeyHeight).fill(lit ?? th.blackKey);
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
