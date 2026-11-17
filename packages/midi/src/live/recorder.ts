import {
  createNoteEvent,
  createTake,
  createTrack,
  fitKeyboardRange,
  sortPedals,
} from '@impromptu/core';
import type { IdFactory, NoteEvent, PedalEvent, Take } from '@impromptu/core';
import type { LiveEvent } from './normalize';

/** Nota que todavía suena (sin note-off): su `end` es el instante actual. */
export interface OpenNote {
  pitch: number;
  velocity: number;
  start: number;
}

/**
 * Arma una toma con los eventos del teclado. Los tiempos se guardan relativos al
 * inicio de la grabación, todos sobre el reloj de performance.now() (ARQUITECTURA).
 */
export class Recorder {
  private origin = 0;
  private readonly notes: NoteEvent[] = [];
  private readonly pedals: PedalEvent[] = [];
  private readonly open = new Map<number, OpenNote[]>();

  constructor(private readonly newId?: IdFactory) {}

  /** Empieza a grabar; `time` en segundos del mismo reloj que los eventos. */
  start(time: number): void {
    this.origin = time;
    this.notes.length = 0;
    this.pedals.length = 0;
    this.open.clear();
  }

  push(event: LiveEvent): void {
    const t = toMicro(Math.max(0, event.time - this.origin));
    const key = event.channel * 128 + (event.type === 'pedal' ? 0 : event.pitch);
    switch (event.type) {
      case 'noteon': {
        const list = this.open.get(key) ?? [];
        list.push({ pitch: event.pitch, velocity: event.velocity, start: t });
        this.open.set(key, list);
        break;
      }
      case 'noteoff': {
        const on = this.open.get(key)?.shift();
        if (on) this.close(on, t);
        break;
      }
      case 'pedal':
        this.pedals.push({ kind: event.kind, time: t, value: event.value });
        break;
    }
  }

  /** Notas que siguen abajo, para dibujarlas mientras se toca. */
  openNotes(): OpenNote[] {
    return [...this.open.values()].flat();
  }

  closedNotes(): readonly NoteEvent[] {
    return this.notes;
  }

  /** Termina la grabación. Las notas sin note-off se cierran con el tiempo de parada (B-002). */
  stop(time: number, title: string, device?: Take['device']): Take {
    const end = toMicro(Math.max(0, time - this.origin));
    for (const list of this.open.values()) for (const on of list) this.close(on, end);
    this.open.clear();
    const track = createTrack(
      { name: 'Piano', notes: [...this.notes], pedals: sortPedals(this.pedals) },
      this.newId,
    );
    return createTake(
      {
        title,
        tracks: [track],
        duration: end,
        keyboardRange: fitKeyboardRange(track.notes.map((n) => n.pitch)),
        ...(device ? { device } : {}),
      },
      this.newId,
    );
  }

  private close(on: OpenNote, end: number): void {
    this.notes.push(
      createNoteEvent(
        {
          pitch: on.pitch,
          start: on.start,
          end: Math.max(end, on.start),
          velocity: on.velocity,
          origin: 'midi-live',
        },
        this.newId,
      ),
    );
  }
}

/** Redondeo al microsegundo: evita restos de coma flotante (100,6 − 100 = 0,5999…). */
const toMicro = (t: number) => Math.round(t * 1e6) / 1e6;
