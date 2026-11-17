import { KEYBOARD_PRESETS, fitKeyboardRange } from '@impromptu/core';
import type { Take } from '@impromptu/core';
import { DEFAULT_SETTINGS } from '@impromptu/render';
import type { VisualSettings } from '@impromptu/render';
import { create } from 'zustand';
import { Transport } from './transport';
import type { LoopRange } from './transport';

export type Aspect = '16:9' | '9:16' | '1:1';
export type KeyboardMode = 'auto' | '61' | '76' | '88';
/** Qué muestra el visualizador: la toma abierta o lo que se toca en vivo. */
export type View = 'take' | 'live';

interface StudioState {
  take: Take | null;
  /** Avisos del último archivo abierto, ya en español para el usuario. */
  notices: string[];
  settings: VisualSettings;
  aspect: Aspect;
  keyboard: KeyboardMode;
  view: View;
  /** Sección marcada en la línea de tiempo y si se está repitiendo. */
  loop: LoopRange | null;
  loopOn: boolean;
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

export const useStudio = create<StudioState>((set, get) => ({
  take: null,
  notices: [],
  settings: DEFAULT_SETTINGS,
  aspect: '16:9',
  keyboard: 'auto',
  view: 'take',
  loop: null,
  loopOn: false,
  playing: false,
  speed: 1,
  open: (take, notices = []) => {
    transport.pause();
    transport.duration = take.duration;
    transport.loop = null;
    transport.seek(0);
    set({
      take: withKeyboard(take, get().keyboard),
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
}));

/** El teclado elegido vive en Take.keyboardRange (no hace falta cambiar el modelo). */
function withKeyboard(take: Take, mode: KeyboardMode): Take {
  const keyboardRange =
    mode === 'auto'
      ? fitKeyboardRange(take.tracks.flatMap((t) => t.notes.map((n) => n.pitch)))
      : { ...KEYBOARD_PRESETS[Number(mode) as 61 | 76 | 88] };
  return { ...take, keyboardRange };
}
