import {
  AFINACIONES,
  asignarTrastes,
  createNoteEvent,
  createTake,
  createTrack,
} from '@impromptu/core';
import type { Instrument, Take } from '@impromptu/core';
import type { Golpe } from '@impromptu/transcribe';
import { Chips } from '@impromptu/ui';
import { ChevronDown, Drum, Guitar, Piano } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import own from './Instrumento.module.css';
import { useStudio } from './store';

/** Instrumentos que se eligen en el estudio (fase 9). */
export const INSTRUMENTOS = [
  { value: 'piano', label: 'Piano' },
  { value: 'guitar', label: 'Guitarra' },
  { value: 'bass', label: 'Bajo' },
  { value: 'drums', label: 'Batería' },
] as const satisfies readonly { value: Instrument; label: string }[];

/** "guitarra" o "guitar" en la dirección (?instrumento=…) → el instrumento. */
export function instrumentoDeTexto(texto: string | null): Instrument | null {
  const t = (texto ?? '').toLowerCase();
  if (t === 'piano') return 'piano';
  if (t === 'guitarra' || t === 'guitar') return 'guitar';
  if (t === 'bajo' || t === 'bass') return 'bass';
  if (t === 'bateria' || t === 'batería' || t === 'drums') return 'drums';
  return null;
}

/**
 * Pasa una toma al instrumento elegido: sus pistas quedan con él y, en guitarra y bajo, cada nota
 * con su cuerda y traste (el recorrido más cómodo para la mano).
 */
export function conInstrumento(take: Take, instrumento: Instrument): Take {
  if (instrumento === 'piano') return take;
  const afinacion =
    instrumento === 'bass'
      ? AFINACIONES.bajo
      : AFINACIONES[useStudio.getState().guitarra.afinacion];
  return {
    ...take,
    tracks: take.tracks.map((t) => ({
      ...t,
      instrument: instrumento,
      name: INSTRUMENTOS.find((i) => i.value === instrumento)!.label,
      notes: instrumento === 'drums' ? t.notes : asignarTrastes(t.notes, afinacion),
      pedals: [],
    })),
  };
}

/** Toma de batería a partir de los golpes detectados en un audio. */
export function tomaDeGolpes(golpes: readonly Golpe[], title: string, duration: number): Take {
  const notes = golpes.map((g) =>
    createNoteEvent({
      pitch: g.nota,
      start: g.tiempo,
      end: g.tiempo + 0.1,
      velocity: g.fuerza,
      origin: 'audio',
    }),
  );
  return createTake({
    title,
    tracks: [createTrack({ instrument: 'drums', name: 'Batería', notes })],
    duration: Math.max(duration, ...notes.map((n) => n.end), 0),
  });
}

/** Selector del instrumento con el que se graba y se convierte. */
export function ElegirInstrumento() {
  const instrumento = useStudio((s) => s.instrumento);
  return (
    <Chips
      label="Instrumento"
      options={INSTRUMENTOS}
      value={instrumento}
      onChange={(v) => useStudio.getState().setInstrumento(v)}
    />
  );
}

const DATOS: Record<Instrument, { icono: ReactNode; texto: string }> = {
  piano: { icono: <Piano />, texto: 'Teclado, pedales y partitura de dos pentagramas.' },
  guitar: { icono: <Guitar />, texto: 'Notas sobre el mástil, cuerda y traste, tablatura.' },
  bass: { icono: <Guitar />, texto: 'Cuatro cuerdas, mástil y tablatura.' },
  drums: { icono: <Drum />, texto: 'Carriles por pieza, parches y partitura de batería.' },
};

/**
 * Selector compacto de arriba (pedido de Jacobo, 2026-11-18): un botón con el instrumento; al
 * tocarlo se abre un tablero con las cuatro opciones grandes y se cierra al elegir. Así la
 * pantalla no se satura.
 */
export function SelectorInstrumento() {
  const instrumento = useStudio((s) => s.instrumento);
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false);
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', tecla);
    };
  }, [abierto]);
  const actual = INSTRUMENTOS.find((i) => i.value === instrumento)!;
  return (
    <div ref={caja} className={own.selector}>
      <button
        type="button"
        className={own.boton}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        aria-label={`Instrumento: ${actual.label}. Cambiar`}
        onClick={() => setAbierto(!abierto)}
      >
        {DATOS[instrumento].icono}
        {actual.label}
        <ChevronDown className={own.flecha} aria-hidden="true" />
      </button>
      {abierto && (
        <div className={own.tablero} role="radiogroup" aria-label="Elegir instrumento">
          {INSTRUMENTOS.map((i, k) => (
            <button
              key={i.value}
              type="button"
              role="radio"
              aria-checked={i.value === instrumento}
              className={own.tarjeta}
              style={{ '--retraso': `${k * 45}ms` } as CSSProperties}
              onClick={() => {
                useStudio.getState().setInstrumento(i.value);
                setAbierto(false);
              }}
            >
              {DATOS[i.value].icono}
              <strong>{i.label}</strong>
              <span>{DATOS[i.value].texto}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Anuncio animado sobre el visualizador cuando cambia el instrumento (no al abrir la página). */
export function AnuncioInstrumento() {
  const instrumento = useStudio((s) => s.instrumento);
  const [visto, setVisto] = useState<Instrument | null>(null);
  const [anunciar, setAnunciar] = useState<Instrument | null>(null);
  if (visto !== instrumento) {
    // Primera vez: solo se recuerda; después, cada cambio se anuncia.
    if (visto !== null) setAnunciar(instrumento);
    setVisto(instrumento);
  }
  if (!anunciar) return null;
  return (
    <div
      className={own.anuncio}
      key={anunciar}
      aria-hidden="true"
      onAnimationEnd={() => setAnunciar(null)}
    >
      <div>
        {DATOS[anunciar].icono}
        {INSTRUMENTOS.find((i) => i.value === anunciar)!.label}
      </div>
    </div>
  );
}

/** Insignia pequeña con el instrumento de una pieza (en las listas). */
export function InsigniaInstrumento({ instrumento }: { instrumento: Instrument }) {
  const label = INSTRUMENTOS.find((i) => i.value === instrumento)!.label;
  return (
    <span className={own.insignia} data-instrumento={instrumento}>
      {label}
    </span>
  );
}

/** Instrumento por el nombre de un MIDI de prueba (guitarra-…, bajo-…, bateria-…). */
export function instrumentoPorNombre(nombre: string): Instrument {
  const n = nombre.toLowerCase();
  if (n.startsWith('guitarra')) return 'guitar';
  if (n.startsWith('bajo')) return 'bass';
  if (n.startsWith('batería') || n.startsWith('bateria')) return 'drums';
  return 'piano';
}

/** "Conectar teclado", "Conectar batería" o "Conectar guitarra MIDI" según el instrumento. */
export function textoConectar(instrumento: Instrument): string {
  if (instrumento === 'drums') return 'Conectar batería';
  if (instrumento === 'guitar' || instrumento === 'bass') return 'Conectar guitarra MIDI';
  return 'Conectar teclado';
}
