import {
  BlurFilter,
  Container,
  Graphics,
  NineSliceSprite,
  Sprite,
  Texture,
  TilingSprite,
} from 'pixi.js';
import { Pool } from './pool';

/**
 * Estilos de nota con volumen (pedido 64): aprobados por Jacobo el 2026-11-25 a partir de sus
 * capturas de SeeMusic y Rousseau (maqueta en el artefacto "Notas para elegir"). Ninguno es
 * plano: los reflejos se mueven mientras la nota cae. El color lo pone el usuario aparte
 * (pedido 65); cada estilo solo decide la forma, la luz y el material.
 */
export const ESTILOS_NUEVOS = [
  'vidrio',
  'bloque',
  'gema',
  'oro',
  'diamante',
  'luz',
  'claro',
  'chispa',
] as const;
export type EstiloNuevo = (typeof ESTILOS_NUEVOS)[number];

export function esEstiloNuevo(s: string): s is EstiloNuevo {
  return (ESTILOS_NUEVOS as readonly string[]).includes(s);
}

/** Qué parte del ancho de la tecla ocupa la nota (Jacobo: gemas, diamantes y claro, delgados). */
export const DELGADEZ: Record<EstiloNuevo, number> = {
  vidrio: 1,
  bloque: 1,
  gema: 0.6,
  oro: 1,
  diamante: 0.6,
  luz: 1,
  claro: 0.62,
  chispa: 0.7,
};

/** Cuánto halo de color lleva cada estilo (se multiplica por "Brillo de las notas"). */
export const HALO: Record<EstiloNuevo, number> = {
  vidrio: 0.9,
  bloque: 0.75,
  gema: 0.9,
  oro: 0.55,
  diamante: 0.6,
  luz: 1.4,
  claro: 0,
  chispa: 1,
};

/** Color de las notas del tema claro: oscuras, el color va en las teclas. */
const NOTA_CLARO = 0x262626;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InfoNota {
  t: number;
  id: number;
  /** Línea de golpe (px). */
  tope: number;
  /** Escala respecto a 1080 px de alto. */
  escala: number;
  /** La nota todavía no llega al teclado. */
  cae: boolean;
}

type Ctx = CanvasRenderingContext2D;

function lienzo(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
}

function aclarar(c: number, k: number): number {
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  const f = (v: number) => Math.round(v + (255 - v) * k);
  return (f(r) << 16) | (f(g) << 8) | f(b);
}

function oscurecer(c: number, k: number): number {
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  const f = (v: number) => Math.round(v * (1 - k));
  return (f(r) << 16) | (f(g) << 8) | f(b);
}

const fract = (v: number) => v - Math.floor(v);

/** Franjas del oro pulido (luz del entorno), de arriba abajo: [posición, brillo 0–1]. */
const FRANJAS_ORO: [number, number][] = [
  [0, 0.18],
  [0.12, 0.45],
  [0.16, 0.95],
  [0.2, 1],
  [0.24, 0.72],
  [0.38, 0.5],
  [0.42, 0.1],
  [0.5, 0.16],
  [0.53, 0.62],
  [0.6, 0.92],
  [0.63, 1],
  [0.66, 0.68],
  [0.8, 0.38],
  [0.84, 0.06],
  [0.92, 0.55],
  [1, 0.95],
];

/** Pinta los estilos nuevos con objetos reutilizables (nada por nota en el DOM, ADR del render). */
export class PintorNotas {
  /** Va encima de las notas normales y debajo del teclado. */
  readonly capa = new Container();
  /** Línea de luz ondulada sobre el teclado (va encima del teclado). */
  readonly linea = new Container();

  private readonly costados: Pool<NineSliceSprite>;
  private readonly cuerpos: Pool<NineSliceSprite>;
  private readonly metalCapa = new Container();
  private readonly mascaraMetal = new Graphics();
  private readonly metales: Pool<TilingSprite>;
  private readonly metalBrillos: Pool<TilingSprite>;
  private readonly sombras: Pool<Sprite>;
  private readonly luces: Pool<NineSliceSprite>;
  private readonly bandas: Pool<TilingSprite>;
  private readonly brillos: Pool<Sprite>;
  private readonly lineaBrillo = new Graphics();
  private readonly lineaNucleo = new Graphics();
  private readonly texturas = new Map<string, Texture>();
  private metalUsado = false;

  constructor() {
    const capa = (aditiva: boolean) => {
      const c = new Container();
      if (aditiva) c.blendMode = 'add';
      this.capa.addChild(c);
      return c;
    };
    const nine = () => new NineSliceSprite({ texture: Texture.WHITE });
    this.costados = new Pool(capa(false), nine);
    this.cuerpos = new Pool(capa(false), nine);
    this.capa.addChild(this.metalCapa, this.mascaraMetal);
    this.metalCapa.mask = this.mascaraMetal;
    this.metales = new Pool(this.metalCapa, () => new TilingSprite({ texture: this.tex('oro') }));
    this.metalBrillos = new Pool(this.metalCapa, () => {
      const s = new TilingSprite({ texture: this.tex('oro-brillo') });
      s.blendMode = 'add';
      return s;
    });
    this.sombras = new Pool(this.metalCapa, () => new Sprite(Texture.WHITE));
    this.luces = new Pool(capa(true), nine);
    this.bandas = new Pool(capa(true), () => new TilingSprite({ texture: this.tex('banda') }));
    this.brillos = new Pool(capa(true), () => new Sprite(Texture.WHITE));
    this.lineaBrillo.filters = [new BlurFilter({ strength: 6, quality: 2 })];
    this.lineaBrillo.blendMode = 'add';
    this.lineaNucleo.blendMode = 'add';
    this.linea.addChild(this.lineaBrillo, this.lineaNucleo);
  }

  begin(): void {
    this.costados.begin();
    this.cuerpos.begin();
    this.metales.begin();
    this.metalBrillos.begin();
    this.sombras.begin();
    this.luces.begin();
    this.bandas.begin();
    this.brillos.begin();
    this.mascaraMetal.clear();
    this.metalUsado = false;
  }

  end(): void {
    this.costados.end();
    this.cuerpos.end();
    this.metales.end();
    this.metalBrillos.end();
    this.sombras.end();
    this.luces.end();
    this.bandas.end();
    this.brillos.end();
    this.metalCapa.visible = this.metalUsado;
  }

  /** Dibuja una nota. `rect` ya viene con la delgadez del estilo aplicada. */
  nota(estilo: EstiloNuevo, rect: Rect, color: number, info: InfoNota): void {
    const { x, y, width: w, height: h } = rect;
    if (w < 1 || h < 1) return;
    const m = Math.min(w, h);
    switch (estilo) {
      case 'vidrio': {
        const r = Math.max(2, Math.min(12, Math.round(m * 0.42)));
        this.pieza(this.cuerpos, this.tex('vidrio', r), r + 5, rect, color, 1);
        this.pieza(this.luces, this.tex('vidrio-luz', r), r + 5, rect, aclarar(color, 0.6), 0.55);
        // Brillo que recorre la pieza al caer.
        const k = fract(info.t * 0.6 + y / (260 * info.escala) + info.id * 0.37);
        const largo = Math.max(3, h * 0.28);
        const b = this.brillos.next();
        b.texture = Texture.WHITE;
        b.position.set(x + w * 0.24, y + 2 + (h - 4 - largo) * k);
        b.width = Math.max(1, 1.6 * info.escala);
        b.height = largo;
        b.tint = 0xffffff;
        b.alpha = 0.8;
        break;
      }
      case 'bloque': {
        const dx = Math.max(-4, Math.min(4, -(x + w / 2 - this.mitad) * 0.012)) * info.escala;
        const lado = this.pieza(
          this.costados,
          this.tex('bloque', 4),
          6,
          rect,
          oscurecer(color, 0.55),
          1,
        );
        lado.position.set(x + dx, y - 3 * info.escala);
        this.pieza(this.cuerpos, this.tex('bloque', 4), 6, rect, color, 1);
        this.pieza(this.luces, this.tex('bloque-luz', 4), 6, rect, aclarar(color, 0.5), 0.6);
        // Reflejo diagonal que cambia con la altura.
        const banda = this.bandas.next();
        banda.position.set(x + 1, y + 1);
        banda.width = Math.max(1, w - 2);
        banda.height = Math.max(1, h - 2);
        // El reflejo queda a media altura de la nota y se corre de lado mientras baja.
        banda.tilePosition.set(fract(y / (info.tope * 0.9) + info.id * 0.21) * 96, h / 2 - 512);
        banda.alpha = 0.55;
        break;
      }
      case 'gema': {
        this.pieza(this.cuerpos, this.tex('gema'), 7, rect, aclarar(color, 0.15), 1);
        this.pieza(this.luces, this.tex('gema-luz'), 7, rect, aclarar(color, 0.55), 0.7);
        if (h > 8) {
          const f = fract(y / (180 * info.escala) + info.id * 0.43);
          const b = this.brillos.next();
          b.texture = this.tex('rombo');
          const lado = Math.min(w * 0.5, 8 * info.escala);
          b.width = lado;
          b.height = lado * 1.4;
          b.position.set(x + 3 + (w - 6 - lado) * f, y + 3);
          b.tint = 0xffffff;
          b.alpha = 0.9;
        }
        break;
      }
      case 'oro': {
        const r = Math.min(4, w * 0.28, h / 2);
        this.mascaraMetal.roundRect(x, y, w, h, r).fill(0xffffff);
        this.metalUsado = true;
        // Las franjas quedan fijas en la pantalla: al bajar, se deslizan por la barra.
        const escalaY = (info.tope * 0.9) / 256;
        const desde = -info.tope * 0.15 + Math.sin(info.t * 0.6) * 14 * info.escala;
        const base = this.metales.next();
        base.position.set(x, y);
        base.width = w;
        base.height = h;
        base.tileScale.set(1, escalaY);
        base.tilePosition.set(0, desde - y);
        base.tint = color;
        const luz = this.metalBrillos.next();
        luz.position.set(x, y);
        luz.width = w;
        luz.height = h;
        luz.tileScale.set(1, escalaY);
        luz.tilePosition.set(0, desde - y);
        luz.tint = aclarar(color, 0.75);
        luz.alpha = 0.8;
        // Volumen de barra: bordes en sombra.
        const s = this.sombras.next();
        s.texture = this.tex('cilindro');
        s.blendMode = 'normal';
        s.position.set(x, y);
        s.width = w;
        s.height = h;
        s.tint = 0xffffff;
        s.alpha = 1;
        // La punta se enciende al acercarse al teclado.
        const cerca = 1 - Math.min(1, Math.max(0, (info.tope - (y + h)) / (70 * info.escala)));
        if (cerca > 0) {
          const brillo = this.sombras.next();
          brillo.texture = this.tex('subida');
          brillo.blendMode = 'add';
          const alto = Math.min(h, 40 * info.escala);
          brillo.position.set(x, y + h - alto);
          brillo.width = w;
          brillo.height = alto;
          brillo.tint = aclarar(color, 0.85);
          brillo.alpha = 0.85 * cerca;
        }
        this.pieza(this.luces, this.tex('filo', 4), 6, rect, aclarar(color, 0.7), 0.6);
        break;
      }
      case 'diamante': {
        const vuelta = Math.floor(fract(y / (140 * info.escala) + info.id * 0.29) * 4);
        this.pieza(this.cuerpos, this.tex(`diamante-${vuelta}`), 6, rect, color, 1);
        const brillo = Math.pow(Math.max(0, Math.sin(info.t * 3 + info.id * 1.7)), 10);
        if (brillo > 0.02) {
          const b = this.brillos.next();
          b.texture = this.tex('cruz');
          const lado = (10 + 14 * brillo) * info.escala;
          b.width = b.height = lado;
          b.position.set(x + w / 2 - lado / 2, y + h * 0.35 - lado / 2);
          b.tint = 0xffffff;
          b.alpha = brillo;
        }
        break;
      }
      case 'luz': {
        const r = Math.max(2, Math.min(12, Math.round(m * 0.45)));
        const lat = Math.sin(info.t * 4 + info.id) * 0.8 * info.escala;
        const halo = this.pieza(this.luces, this.tex('suave', r), r + 2, rect, color, 0.75);
        halo.position.set(x - lat, y - lat);
        halo.width = w + lat * 2;
        halo.height = h + lat * 2;
        if (w > 5 && h > 5) {
          const nucleo = this.pieza(
            this.luces,
            this.tex('suave', r),
            r + 2,
            rect,
            aclarar(color, 0.82),
            0.9,
          );
          const p = 2.5 * info.escala;
          nucleo.position.set(x + p, y + p);
          nucleo.width = w - p * 2;
          nucleo.height = h - p * 2;
        }
        break;
      }
      case 'claro': {
        const r = Math.max(1, Math.min(8, Math.round(m * 0.22)));
        // Rastro de movimiento hacia arriba y la nota oscura (el color va en las teclas).
        for (const [sube, alfa] of [
          [5, 0.12],
          [2, 0.18],
        ] as const) {
          const rastro = this.pieza(
            this.costados,
            this.tex('solida', r),
            r + 2,
            rect,
            NOTA_CLARO,
            alfa,
          );
          rastro.position.set(x, y - sube * info.escala);
          rastro.height = h + sube * info.escala;
        }
        this.pieza(this.cuerpos, this.tex('solida', r), r + 2, rect, NOTA_CLARO, 0.88);
        break;
      }
      case 'chispa': {
        const r = Math.max(1, Math.min(10, Math.round(m * 0.32)));
        this.pieza(this.luces, this.tex('solida', r), r + 2, rect, color, 0.85);
        if (w > 4 && h > 4) {
          const nucleo = this.pieza(
            this.luces,
            this.tex('solida', r),
            r + 2,
            rect,
            aclarar(color, 0.75),
            0.5,
          );
          nucleo.position.set(x + w * 0.3, y + r * 0.6);
          nucleo.width = w * 0.4;
          nucleo.height = Math.max(1, h - r * 1.2);
        }
        break;
      }
    }
  }

  /** Centro horizontal de la pantalla (los bloques muestran el costado hacia el centro). */
  mitad = 960;

  /** Línea de luz ondulada sobre el teclado (no en el tema claro). */
  lineaLuz(
    ancho: number,
    y: number,
    color: number,
    t: number,
    escala: number,
    visible: boolean,
  ): void {
    const g = this.lineaBrillo.clear();
    const n = this.lineaNucleo.clear();
    this.linea.visible = visible;
    if (!visible) return;
    const paso = Math.max(4, 6 * escala);
    const puntos: number[] = [0, y];
    for (let x = 0; x <= ancho + paso; x += paso) {
      const ola =
        Math.sin((x * 0.012) / escala + t * 5) * 0.8 + Math.sin((x * 0.005) / escala - t * 3) * 0.8;
      puntos.push(x, y - (2.5 + Math.abs(ola) * 1.6) * escala);
    }
    puntos.push(ancho, y);
    g.poly(puntos).fill({ color, alpha: 0.9 });
    g.rect(0, y - 6 * escala, ancho, 6 * escala).fill({ color, alpha: 0.35 });
    n.poly(puntos).fill({ color: aclarar(color, 0.55), alpha: 0.85 });
  }

  private pieza(
    pool: Pool<NineSliceSprite>,
    textura: Texture,
    corte: number,
    rect: Rect,
    tint: number,
    alpha: number,
  ): NineSliceSprite {
    const s = pool.next();
    s.texture = textura;
    const c = Math.min(corte, Math.floor(textura.width / 2) - 1);
    s.leftWidth = s.rightWidth = s.topHeight = s.bottomHeight = c;
    s.position.set(rect.x, rect.y);
    s.width = rect.width;
    s.height = rect.height;
    s.tint = tint;
    s.alpha = alpha;
    return s;
  }

  /** Texturas hechas una vez (por radio cuando hace falta). */
  private tex(nombre: string, r = 0): Texture {
    const clave = `${nombre}:${r}`;
    let t = this.texturas.get(clave);
    if (!t) {
      t = Texture.from(dibujar(nombre, r));
      this.texturas.set(clave, t);
    }
    return t;
  }
}

function dibujar(nombre: string, r: number): HTMLCanvasElement {
  switch (nombre) {
    case 'vidrio': {
      const c = r + 5;
      const S = c * 2 + 4;
      const [cv, ctx] = lienzo(S, S);
      rr(ctx, 1, 1, S - 2, S - 2, r);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fill();
      rr(ctx, 3.5, 3.5, S - 7, S - 7, r - 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(255,255,255,0.32)';
      ctx.stroke();
      rr(ctx, 1.1, 1.1, S - 2.2, S - 2.2, r);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      return cv;
    }
    case 'vidrio-luz': {
      const c = r + 5;
      const S = c * 2 + 4;
      const [cv, ctx] = lienzo(S, S);
      rr(ctx, 1.1, 1.1, S - 2.2, S - 2.2, r);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      rr(ctx, 3.5, 3.5, S - 7, S - 7, r - 3);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.stroke();
      return cv;
    }
    case 'bloque': {
      const [cv, ctx] = lienzo(16, 16);
      const g = ctx.createLinearGradient(0, 0, 16, 16);
      g.addColorStop(0, 'rgb(190,190,190)');
      g.addColorStop(1, '#ffffff');
      rr(ctx, 0, 0, 16, 16, r);
      ctx.fillStyle = g;
      ctx.fill();
      return cv;
    }
    case 'bloque-luz':
    case 'filo': {
      const [cv, ctx] = lienzo(16, 16);
      rr(ctx, 0.5, 0.5, 15, 15, r);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      return cv;
    }
    case 'banda': {
      // Un solo reflejo diagonal, centrado en el alto del mosaico: en notas largas no se repite.
      const [cv, ctx] = lienzo(96, 1024);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 12;
      for (const d of [-96, 0, 96]) {
        ctx.beginPath();
        ctx.moveTo(d, 512 + 48);
        ctx.lineTo(d + 96, 512 - 48);
        ctx.stroke();
      }
      return cv;
    }
    case 'gema':
    case 'gema-luz': {
      // Talla rectangular (esmeralda): esquinas apenas cortadas, facetas alrededor y la mesa.
      const S = 18;
      const k = 3;
      const b = 4;
      const [cv, ctx] = lienzo(S, S);
      const cara = (pts: [number, number][], color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        pts.forEach(([a, c], i) => (i ? ctx.lineTo(a, c) : ctx.moveTo(a, c)));
        ctx.closePath();
        ctx.fill();
      };
      const luz = nombre === 'gema-luz';
      if (!luz) {
        cara(
          [
            [k, 0],
            [S - k, 0],
            [S, k],
            [S, S - k],
            [S - k, S],
            [k, S],
            [0, S - k],
            [0, k],
          ],
          'rgb(180,180,180)',
        );
        cara(
          [
            [0, k],
            [b, b],
            [b, S - b],
            [0, S - k],
          ],
          'rgb(215,215,215)',
        );
        cara(
          [
            [S, k],
            [S, S - k],
            [S - b, S - b],
            [S - b, b],
          ],
          'rgb(140,140,140)',
        );
        cara(
          [
            [k, S],
            [S - k, S],
            [S - b, S - b],
            [b, S - b],
          ],
          'rgb(100,100,100)',
        );
        const g = ctx.createLinearGradient(0, b, 0, S - b);
        g.addColorStop(0, 'rgb(235,235,235)');
        g.addColorStop(1, 'rgb(170,170,170)');
        ctx.fillStyle = g;
        ctx.fillRect(b, b, S - b * 2, S - b * 2);
      }
      cara(
        [
          [k, 0],
          [S - k, 0],
          [S - b, b],
          [b, b],
        ],
        luz ? 'rgba(255,255,255,0.9)' : '#ffffff',
      );
      return cv;
    }
    case 'rombo': {
      const [cv, ctx] = lienzo(16, 22);
      const g = ctx.createRadialGradient(8, 11, 0, 8, 11, 9);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(16, 11);
      ctx.lineTo(8, 22);
      ctx.lineTo(0, 11);
      ctx.closePath();
      ctx.fill();
      return cv;
    }
    case 'oro':
    case 'oro-brillo': {
      const [cv, ctx] = lienzo(4, 256);
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      for (const [p, v] of FRANJAS_ORO) {
        if (nombre === 'oro') {
          const c = Math.round(v * 255);
          g.addColorStop(p, `rgb(${c},${c},${c})`);
        } else {
          // Solo los picos de luz, para que lleguen casi a blanco.
          const a = Math.max(0, (v - 0.85) / 0.15);
          g.addColorStop(p, `rgba(255,255,255,${a.toFixed(3)})`);
        }
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 4, 256);
      return cv;
    }
    case 'cilindro': {
      const [cv, ctx] = lienzo(32, 1);
      const g = ctx.createLinearGradient(0, 0, 32, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.5)');
      g.addColorStop(0.18, 'rgba(0,0,0,0)');
      g.addColorStop(0.75, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 1);
      return cv;
    }
    case 'subida': {
      const [cv, ctx] = lienzo(1, 64);
      const g = ctx.createLinearGradient(0, 0, 0, 64);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, '#ffffff');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 1, 64);
      return cv;
    }
    case 'cruz': {
      const [cv, ctx] = lienzo(32, 32);
      for (const [w, h] of [
        [32, 2],
        [2, 32],
      ]) {
        const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(16 - w! / 2, 16 - h! / 2, w!, h!);
      }
      return cv;
    }
    case 'suave':
    case 'solida': {
      const c = r + 2;
      const S = c * 2 + 4;
      const [cv, ctx] = lienzo(S, S);
      rr(ctx, 0, 0, S, S, r);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      return cv;
    }
    default: {
      // diamante-0 … diamante-3: talla rectangular; el brillo pasa de faceta en faceta.
      const vuelta = Number(nombre.split('-')[1] ?? 0);
      const S = 16;
      const m = 5;
      const [cv, ctx] = lienzo(S, S);
      const g = ctx.createLinearGradient(0, 0, S, S);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.5, 'rgb(214,224,238)');
      g.addColorStop(1, 'rgb(154,167,188)');
      rr(ctx, 0, 0, S, S, 1.5);
      ctx.fillStyle = g;
      ctx.fill();
      const tonos = [
        'rgba(255,255,255,0.55)',
        'rgba(40,55,80,0.18)',
        'rgba(40,55,80,0.32)',
        'rgba(255,255,255,0.2)',
      ];
      const tono = (i: number) => tonos[(i + vuelta) % 4]!;
      const cara = (pts: [number, number][], color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
        ctx.closePath();
        ctx.fill();
      };
      cara(
        [
          [0, 0],
          [S, 0],
          [S - m, m],
          [m, m],
        ],
        tono(0),
      );
      cara(
        [
          [S, 0],
          [S, S],
          [S - m, S - m],
          [S - m, m],
        ],
        tono(1),
      );
      cara(
        [
          [S, S],
          [0, S],
          [m, S - m],
          [S - m, S - m],
        ],
        tono(2),
      );
      cara(
        [
          [0, S],
          [0, 0],
          [m, m],
          [m, S - m],
        ],
        tono(3),
      );
      ctx.strokeStyle = 'rgba(120,135,160,0.6)';
      ctx.lineWidth = 0.7;
      ctx.strokeRect(m, m, S - m * 2, S - m * 2);
      return cv;
    }
  }
}
