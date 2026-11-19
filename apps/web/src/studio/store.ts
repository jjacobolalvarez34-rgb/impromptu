import { KEYBOARD_PRESETS, fitKeyboardRange } from '@impromptu/core';
import type { Instrument, Take } from '@impromptu/core';
import type { HandSize } from '@impromptu/practice';
import { autoAssign, hasNoHands } from './edit';
import { DEFAULT_SETTINGS, instrumentoDe } from '@impromptu/render';
import type { VisualSettings } from '@impromptu/render';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { attachTakeAudio, useOwnAudio } from './ownAudio';
import { attachTakeVideo, setTakeIdGetter, useVideo } from './video';
import { Transport } from './transport';
import type { LoopRange } from './transport';

export type Aspect = '16:9' | '9:16' | '1:1';
export type KeyboardMode = 'auto' | '61' | '76' | '88';
/** Qué muestra el visualizador: la toma abierta o lo que se toca en vivo. */
export type View = 'take' | 'live';

interface StudioState {
  take: Take | null;
  /**
   * Instrumento con el que se graba y se convierte (fase 9): lo que llega del teclado o la
   * batería electrónica suena con él, y las tomas nuevas quedan con él.
   */
  instrumento: Instrument;
  setInstrumento: (instrumento: Instrument) => void;
  /** Guitarra: sonido y afinación. */
  guitarra: {
    timbre: 'nylon' | 'acero' | 'electrica';
    afinacion: 'estandar' | 'drop-d' | 'medio-tono-abajo';
  };
  setGuitarra: (patch: Partial<StudioState['guitarra']>) => void;
  /** Batería: qué tan fácil se dispara el detector del micrófono (0,5 a 2). */
  sensibilidadBateria: number;
  setSensibilidadBateria: (v: number) => void;
  /** Avisos del último archivo abierto, ya en español para el usuario. */
  notices: string[];
  settings: VisualSettings;
  aspect: Aspect;
  keyboard: KeyboardMode;
  view: View;
  /** Sección marcada en la línea de tiempo y si se está repitiendo. */
  loop: LoopRange | null;
  loopOn: boolean;
  /** Mientras se exporta, el visualizador de la pantalla se pausa. */
  exporting: boolean;
  /** Tamaño de mano para la digitación sugerida. */
  handSize: HandSize;
  /** Notas seleccionadas para editar (ids). */
  selection: string[];
  /** Tomas anteriores (deshacer) y deshechas (rehacer). */
  history: Take[];
  future: Take[];
  /** Aplica una edición a la toma abierta y la guarda en el historial. */
  edit: (fn: (take: Take) => Take) => void;
  undo: () => void;
  redo: () => void;
  select: (ids: string[]) => void;
  setHandSize: (size: HandSize) => void;
  playing: boolean;
  speed: number;
  open: (take: Take, notices?: string[]) => void;
  setSettings: (patch: Partial<VisualSettings>) => void;
  setAspect: (aspect: Aspect) => void;
  setKeyboard: (mode: KeyboardMode) => void;
  setView: (view: View) => void;
  setLoop: (loop: LoopRange | null) => void;
  toggleLoop: () => void;
  togglePlay: () => void;
  setSpeed: (speed: number) => void;
}

/** Un solo reloj para todo el estudio (visualizador, LCD, audio). */
export const transport = new Transport();

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      take: null,
      instrumento: 'piano',
      setInstrumento: (instrumento) => set({ instrumento }),
      guitarra: { timbre: 'acero', afinacion: 'estandar' },
      setGuitarra: (patch) => set({ guitarra: { ...get().guitarra, ...patch } }),
      sensibilidadBateria: 1,
      setSensibilidadBateria: (sensibilidadBateria) => set({ sensibilidadBateria }),
      notices: [],
      settings: DEFAULT_SETTINGS,
      aspect: '16:9',
      keyboard: 'auto',
      view: 'take',
      loop: null,
      loopOn: false,
      exporting: false,
      handSize: 'medium',
      selection: [],
      history: [],
      future: [],
      edit: (fn) => {
        const take = get().take;
        if (!take) return;
        const next = fn(take);
        set({ take: next, history: [...get().history.slice(-49), take], future: [] });
        onTakeEdited(next);
      },
      undo: () => {
        const { history, take, future } = get();
        const prev = history[history.length - 1];
        if (!prev || !take) return;
        set({
          take: prev,
          history: history.slice(0, -1),
          future: [take, ...future],
          selection: [],
        });
        onTakeEdited(prev);
      },
      redo: () => {
        const { history, take, future } = get();
        const next = future[0];
        if (!next || !take) return;
        set({ take: next, history: [...history, take], future: future.slice(1), selection: [] });
        onTakeEdited(next);
      },
      select: (selection) => set({ selection }),
      setHandSize: (handSize) => set({ handSize }),
      playing: false,
      speed: 1,
      open: (take, notices = []) => {
        // Al abrir una pieza de guitarra, bajo o batería, el selector pasa a ese instrumento.
        const propio = instrumentoDe(take);
        if (propio !== 'piano') set({ instrumento: propio });
        useOwnAudio.getState().set(null);
        useVideo.getState().set(null);
        void attachTakeVideo(take);
        void attachTakeAudio(take, (id) => get().take?.id === id);
        transport.pause();
        transport.duration = take.duration;
        transport.loop = null;
        transport.seek(0);
        // Una toma sin manos (un MIDI de una sola pista, una toma en vivo) las recibe sola,
        // con sus dedos sugeridos (fase 4). Se puede deshacer.
        const prepared = hasNoHands(take) ? autoAssign(take, get().handSize) : take;
        set({
          take: withKeyboard(prepared, get().keyboard),
          selection: [],
          // La versión sin manos queda en el historial: "Deshacer" la recupera.
          history: prepared === take ? [] : [withKeyboard(take, get().keyboard)],
          future: [],
          notices,
          playing: false,
          view: 'take',
          loop: null,
          loopOn: false,
        });
      },
      setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),
      setAspect: (aspect) => set({ aspect }),
      setKeyboard: (keyboard) => {
        const take = get().take;
        set({ keyboard, take: take && withKeyboard(take, keyboard) });
      },
      setLoop: (loop) => {
        const valid = loop && loop.end - loop.start > 0.05 ? loop : null;
        transport.loop = valid;
        set({ loop: valid, loopOn: valid !== null });
      },
      toggleLoop: () => {
        const { loop, loopOn } = get();
        if (!loop) return;
        transport.loop = loopOn ? null : loop;
        if (!loopOn && (transport.now() < loop.start || transport.now() > loop.end)) {
          transport.seek(loop.start);
        }
        set({ loopOn: !loopOn });
      },
      setView: (view) => {
        if (view === 'live') transport.pause();
        set({ view, playing: transport.playing });
      },
      togglePlay: () => {
        if (!get().take) return;
        if (transport.playing) transport.pause();
        else transport.play();
        set({ playing: transport.playing, view: 'take' });
      },
      setSpeed: (speed) => {
        transport.setSpeed(speed);
        set({ speed: transport.speed });
      },
    }),
    {
      // Los ajustes visuales se recuerdan entre sesiones (y los usa /en-vivo). La toma no:
      // las tomas viven en IndexedDB.
      name: 'impromptu-estudio',
      version: 1,
      partialize: (s) => ({
        settings: s.settings,
        aspect: s.aspect,
        keyboard: s.keyboard,
        handSize: s.handSize,
        instrumento: s.instrumento,
        guitarra: s.guitarra,
        sensibilidadBateria: s.sensibilidadBateria,
      }),
      // Ajustes guardados por una versión anterior: se completan con los valores por defecto
      // (por ejemplo, el estilo y el brillo de las notas de ADR-010).
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<StudioState>;
        const settings = saved.settings ?? current.settings;
        return {
          ...current,
          ...saved,
          settings: {
            ...DEFAULT_SETTINGS,
            ...settings,
            effects: { ...DEFAULT_SETTINGS.effects, ...settings.effects },
            show: { ...DEFAULT_SETTINGS.show, ...settings.show },
            colors: { ...DEFAULT_SETTINGS.colors, ...settings.colors },
            estilo: { ...DEFAULT_SETTINGS.estilo, ...settings.estilo },
          },
        };
      },
    },
  ),
);

/** El teclado elegido vive en Take.keyboardRange (no hace falta cambiar el modelo). */
function withKeyboard(take: Take, mode: KeyboardMode): Take {
  const keyboardRange =
    mode === 'auto'
      ? fitKeyboardRange(take.tracks.flatMap((t) => t.notes.map((n) => n.pitch)))
      : { ...KEYBOARD_PRESETS[Number(mode) as 61 | 76 | 88] };
  return { ...take, keyboardRange };
}

setTakeIdGetter(() => useStudio.getState().take?.id);

let takeEdited: (take: Take) => void = () => undefined;
const onTakeEdited = (take: Take) => takeEdited(take);
/** Quien guarda las tomas (live.ts) se registra aquí para guardar las ediciones. */
export function setTakeEditedListener(listener: (take: Take) => void): void {
  takeEdited = listener;
}
