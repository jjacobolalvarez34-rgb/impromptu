import type { PedalKind } from '@impromptu/core';
import { THEMES } from '@impromptu/render';
import { Chips, Slider, Switch } from '@impromptu/ui';
import { ColorField } from './ColorField';
import { useStudio } from './store';
import type { KeyboardMode } from './store';
import styles from './SettingsPanel.module.css';

const KEYBOARDS = [
  { value: 'auto', label: 'Auto' },
  { value: '61', label: '61' },
  { value: '76', label: '76' },
  { value: '88', label: '88' },
] as const;

const NOTE_STYLES = [
  { value: 'glow', label: 'Brillante' },
  { value: 'flat', label: 'Plano' },
] as const;

const LAYOUTS = [
  { value: 'visualizer', label: 'Solo visualizador' },
  { value: 'camera-inset', label: 'Cámara en recuadro' },
  { value: 'background', label: 'Fondo' },
] as const;

const BACKGROUNDS = [
  { value: 'video', label: 'Video' },
  { value: 'blur', label: 'Desenfoque' },
  { value: 'color', label: 'Color' },
] as const;

const PEDALS: { kind: PedalKind; label: string }[] = [
  { kind: 'sustain', label: 'Sustain' },
  { kind: 'sostenuto', label: 'Sostenuto' },
  { kind: 'soft', label: 'Una corda' },
];

/** Ajustes del visualizador: tema, colores, teclado, efectos y pedales visibles. */
export function SettingsPanel() {
  const settings = useStudio((s) => s.settings);
  const keyboard = useStudio((s) => s.keyboard);
  const { setSettings, setKeyboard } = useStudio.getState();

  const setEffect = (patch: Partial<typeof settings.effects>) =>
    setSettings({ effects: { ...settings.effects, ...patch } });
  // Lee los colores del estado al aplicar, no del render: así no se pierde un cambio.
  const setColor = (hand: keyof typeof settings.colors) => (hex: string) => {
    const current = useStudio.getState().settings.colors;
    setSettings({ colors: { ...current, [hand]: hex } });
  };
  const togglePedal = (kind: PedalKind) => (on: boolean) =>
    setSettings({
      show: {
        ...settings.show,
        pedals: on
          ? [...settings.show.pedals, kind]
          : settings.show.pedals.filter((k) => k !== kind),
      },
    });

  return (
    <>
      <h2 className="ui-etiqueta">Plantilla</h2>
      <Chips
        label="Plantilla"
        options={LAYOUTS}
        value={settings.layout === 'camera-top' ? 'camera-inset' : settings.layout}
        onChange={(layout) =>
          setSettings({
            layout,
            ...(layout === 'background' && !settings.background
              ? { background: { kind: 'video' as const, value: '' } }
              : {}),
          })
        }
      />
      {settings.layout === 'background' && (
        <>
          <Chips
            label="Fondo"
            options={BACKGROUNDS}
            value={(settings.background?.kind ?? 'video') as 'video' | 'blur' | 'color'}
            onChange={(kind) =>
              setSettings({
                background: { kind, value: kind === 'color' ? '#1C1C1A' : '' },
              })
            }
          />
          {settings.background?.kind === 'color' && (
            <div className={styles.colores}>
              <ColorField
                label="Color de fondo"
                value={settings.background.value || '#1C1C1A'}
                onChange={(value) => setSettings({ background: { kind: 'color', value } })}
              />
            </div>
          )}
        </>
      )}

      <h2 className="ui-etiqueta">Tema</h2>
      <Chips
        label="Tema"
        options={Object.values(THEMES).map((t) => ({ value: t.id, label: t.name }))}
        value={settings.themeId}
        onChange={(themeId) => {
          const theme = THEMES[themeId];
          setSettings({ themeId, ...(theme ? { colors: { ...theme.notes } } : {}) });
        }}
      />

      <h2 className="ui-etiqueta">Notas</h2>
      <div className={styles.colores}>
        <ColorField
          label="Mano derecha"
          value={settings.colors.right}
          onChange={setColor('right')}
        />
        <ColorField
          label="Mano izquierda"
          value={settings.colors.left}
          onChange={setColor('left')}
        />
        <ColorField
          label="Sin asignar"
          value={settings.colors.unassigned}
          onChange={setColor('unassigned')}
        />
      </div>

      <h2 className="ui-etiqueta">Teclado</h2>
      <Chips
        label="Teclado"
        options={KEYBOARDS}
        value={keyboard}
        onChange={(v) => setKeyboard(v as KeyboardMode)}
      />

      <h2 className="ui-etiqueta">Efectos</h2>
      <Chips
        label="Estilo de las notas"
        options={NOTE_STYLES}
        value={settings.effects.noteStyle}
        onChange={(noteStyle) => setEffect({ noteStyle })}
      />
      {settings.effects.noteStyle === 'glow' && (
        <Slider
          label="Brillo de las notas"
          max={200}
          value={settings.effects.noteGlow}
          onChange={(noteGlow) => setEffect({ noteGlow })}
          format={(v) => `${v} %`}
        />
      )}
      <Slider
        label="Chispas al tocar"
        max={200}
        value={settings.effects.sparks}
        onChange={(sparks) => setEffect({ sparks })}
        format={(v) => `${v} %`}
      />
      <Slider
        label="Brillo de la tecla"
        max={200}
        value={settings.effects.keyGlow}
        onChange={(keyGlow) => setEffect({ keyGlow })}
        format={(v) => `${v} %`}
      />
      <Slider
        label="Velocidad de caída"
        value={settings.effects.fallSpeed}
        min={0.5}
        max={2}
        step={0.1}
        onChange={(fallSpeed) => setEffect({ fallSpeed })}
        format={(v) => `${v.toFixed(1)}×`}
      />
      <Switch
        label="Guías de octava"
        checked={settings.effects.octaveGuides}
        onChange={(octaveGuides) => setEffect({ octaveGuides })}
      />
      <Switch
        label="Compases y pulsos"
        checked={settings.effects.beatGuides}
        onChange={(beatGuides) => setEffect({ beatGuides })}
      />

      <h2 className="ui-etiqueta">Pedales</h2>
      {PEDALS.map((p) => (
        <Switch
          key={p.kind}
          label={p.label}
          checked={settings.show.pedals.includes(p.kind)}
          onChange={togglePedal(p.kind)}
        />
      ))}
    </>
  );
}
