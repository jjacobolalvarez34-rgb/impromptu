import { Application, Container, Graphics, NineSliceSprite, Sprite, Text, Texture } from 'pixi.js';
import type { NoteEvent, PedalEvent, Take } from '@impromptu/core';
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
  effects: { sparks: 62, keyGlow: 48, fallSpeed: 1, octaveGuides: true },
  show: { fingers: false, noteNames: false, pedals: ['sustain', 'sostenuto', 'soft'] },
  colors: { right: '#FF9F1C', left: '#E8E4DC', unassigned: '#9A968C' },
};

const MAX_SPARKS = 2500;
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
  private readonly noteLayer = new Container();
  private readonly keys = new Graphics();
  private readonly glowLayer = new Container();
  private readonly sparkLayer = new Container();
  private readonly pedal = new Graphics();
  private readonly pedalLabel: Text;
  private readonly notePool: Pool<NineSliceSprite>;
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
    const glowTexture = makeGlowTexture();

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
    this.pedalLabel = new Text({
      text: 'Ped.',
      style: { fontFamily: 'Martian Mono, monospace', fontSize: 12, fill: 0xa39f95 },
    });

    app.stage.addChild(
      this.guides,
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

    this.drawGuides();

    // Notas que caen
    this.notePool.begin();
    this.active.clear();
    const span = L.keyLineY / L.pps;
    const [from, to] = this.direction === 'fall' ? [t, t + span] : [t - span, t];
    forEachNoteIn(this.index, from, to, (note) => {
      const rect = noteRect(note, t, L, this.keyboard, 3, this.direction);
      if (rect) {
        const sprite = this.notePool.next();
        sprite.position.set(rect.x, rect.y);
        sprite.width = rect.width;
        sprite.height = rect.height;
        sprite.tint = this.color(noteColor(note, colors));
        sprite.alpha = 0.72 + 0.28 * (note.velocity / 127);
      }
      if (isSounding(note, t)) this.active.set(note.pitch, note);
    });
    this.notePool.end();

    this.drawKeyboard(colors);

    // Brillo sobre las teclas que suenan
    this.glowPool.begin();
    if (effects.keyGlow > 0) {
      for (const note of this.active.values()) {
        const key = this.keyboard.key(note.pitch);
        if (!key) continue;
        const w = key.width * L.width;
        const glow = this.glowPool.next();
        glow.position.set(key.x * L.width + w / 2, L.keyLineY);
        glow.width = w * 5;
        glow.height = w * 3.2;
        glow.tint = this.color(noteColor(note, colors));
        glow.alpha = (effects.keyGlow / 100) * (0.45 + 0.55 * (note.velocity / 127));
      }
    }
    this.glowPool.end();

    // Chispas
    this.sparks.length = 0;
    if (effects.sparks > 0) {
      forEachNoteIn(this.index, t - SPARK_LIFE, t, (note) => {
        const key = this.keyboard.key(note.pitch);
        if (!key || this.sparks.length > MAX_SPARKS) return;
        const w = key.width * L.width;
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
      });
    }
    this.sparkPool.begin();
    for (const s of this.sparks.slice(0, MAX_SPARKS)) {
      const sprite = this.sparkPool.next();
      sprite.position.set(s.x, s.y);
      sprite.width = sprite.height = s.size;
      sprite.alpha = s.alpha;
      sprite.tint = this.theme.keyLine === 0x7a1f1a ? this.theme.pedal : 0xffc56b;
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

  private drawGuides(): void {
    const g = this.guides.clear();
    if (!this.settings.effects.octaveGuides) return;
    const L = this.layout;
    for (const key of this.keyboard.keys) {
      if (key.pitch % 12 !== 0) continue;
      g.rect(Math.round(key.x * L.width), 0, 1, L.keyLineY);
    }
    g.fill({ color: this.theme.guide, alpha: 0.7 });
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
