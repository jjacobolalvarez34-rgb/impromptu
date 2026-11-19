import type { PedalKind } from '@impromptu/core';
import { THEMES, instrumentoDe } from '@impromptu/render';
import { Button, Chips, Slider, Switch } from '@impromptu/ui';
import { useAudio } from './audio';
import { autoAssign } from './edit';
import { ColorField } from './ColorField';
import { useStudio } from './store';
import type { KeyboardMode } from './store';
import styles from './SettingsPanel.module.css';

const TIMBRES = [
  { value: 'nylon', label: 'Nylon' },
  { value: 'acero', label: 'Acero' },
  { value: 'electrica', label: 'Eléctrica' },
] as const;

const AFINACIONES_UI = [
  { value: 'estandar', label: 'Estándar' },
  { value: 'drop-d', label: 'Drop D' },
  { value: 'medio-tono-abajo', label: 'Medio tono abajo' },
] as const;

const SENSIBILIDAD = [
  { value: '0.6', label: 'Baja' },
  { value: '1', label: 'Media' },
  { value: '1.4', label: 'Alta' },
] as const;

/** Pedido 42: un color por mano o el mismo para todas las notas. */
const MODOS_COLOR = [
  { value: 'mano', label: 'Por mano' },
  { value: 'uno', label: 'Uno solo' },
] as const;

/** Pedido 41: qué sale al tocar. */
const PARTICULAS = [
  { value: 'ambas', label: 'Chispas y humo' },
  { value: 'chispas', label: 'Chispas' },
  { value: 'humo', label: 'Humo' },
  { value: 'ninguna', label: 'Nada' },
] as const;

const ESTILOS_TECLADO = [
  { value: 'realista', label: 'Realista' },
  { value: 'plano', label: 'Plano' },
] as const;

/** Fase 11 (pedido 17): carriles o una batería como la de verdad. */
const VISTAS_BATERIA = [
  { value: 'carriles', label: 'Carriles' },
  { value: 'kit', label: 'Batería real' },
] as const;

const KEYBOARDS = [
  { value: 'auto', label: 'Auto' },
  { value: '61', label: '61' },
  { value: '76', label: '76' },
  { value: '88', label: '88' },
] as const;

/** Sustain de panel (s): para quien no tiene pedal. Ver Piano.panelSustain. */
const PANEL_SUSTAIN = [
  { value: '0', label: 'Apagado' },
  { value: '1', label: 'Corto' },
  { value: '2.5', label: 'Medio' },
  { value: '4', label: 'Largo' },
] as const;

const NOTE_STYLES = [
  { value: 'glow', label: 'Brillante' },
  { value: 'flat', label: 'Plano' },
] as const;

const LAYOUTS = [
  { value: 'visualizer', label: 'Solo visualizador' },
  { value: 'camera-inset', label: 'Cámara en recuadro' },
  { value: 'camera-top', label: 'Cámara arriba' },
  { value: 'background', label: 'Fondo' },
] as const;

const BACKGROUNDS = [
  { value: 'video', label: 'Video' },
  { value: 'blur', label: 'Desenfoque' },
  { value: 'color', label: 'Color' },
] as const;

const HAND_SIZES = [
  { value: 'small', label: 'Pequeña' },
  { value: 'medium', label: 'Mediana' },
  { value: 'large', label: 'Grande' },
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
  const handSize = useStudio((s) => s.handSize);
  const hasTake = useStudio((s) => s.take !== null);
  // Las opciones dependen del instrumento: el de la pieza abierta o, sin pieza, el elegido.
  const instrumento = useStudio((s) => (s.take ? instrumentoDe(s.take) : s.instrumento));
  const piano = instrumento === 'piano';
  const guitarra = useStudio((s) => s.guitarra);
  const sensibilidad = useStudio((s) => s.sensibilidadBateria);
  const { setSettings, setKeyboard } = useStudio.getState();

  const setEffect = (patch: Partial<typeof settings.effects>) =>
    setSettings({ effects: { ...settings.effects, ...patch } });
  // Lee los colores del estado al aplicar, no del render: así no se pierde un cambio.
  const setEstilo = (patch: NonNullable<typeof settings.estilo>) =>
    setSettings({ estilo: { ...useStudio.getState().settings.estilo, ...patch } });
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
        value={settings.layout}
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

      {(instrumento === 'guitar' || instrumento === 'bass') && (
        <>
          <h2 className="ui-etiqueta">{instrumento === 'bass' ? 'Bajo' : 'Guitarra'}</h2>
          <p className="ui-secundario">
            Cada nota cae sobre el traste y la cuerda donde se pisa, con el color de su cuerda y el
            número de traste.
          </p>
          {instrumento === 'guitar' && (
            <Switch
              label="Flechas de rasgueo"
              checked={settings.show.strums !== false}
              onChange={(strums) => setSettings({ show: { ...settings.show, strums } })}
            />
          )}
          {instrumento === 'guitar' && (
            <>
              <Chips
                label="Sonido de la guitarra"
                options={TIMBRES}
                value={guitarra.timbre}
                onChange={(timbre) => useStudio.getState().setGuitarra({ timbre })}
              />
              <Chips
                label="Afinación"
                options={AFINACIONES_UI}
                value={guitarra.afinacion}
                onChange={(afinacion) => useStudio.getState().setGuitarra({ afinacion })}
              />
            </>
          )}
        </>
      )}
      {instrumento === 'drums' && (
        <>
          <h2 className="ui-etiqueta">Batería</h2>
          <p className="ui-secundario">
            {settings.show.drumView === 'kit'
              ? 'Cada pieza está donde va en una batería: los golpes bajan hasta ella.'
              : 'Cada pieza tiene su carril y su color: los golpes caen sobre su parche.'}
          </p>
          <Chips
            label="Vista de la batería"
            options={VISTAS_BATERIA}
            value={settings.show.drumView ?? 'carriles'}
            onChange={(drumView) => setSettings({ show: { ...settings.show, drumView } })}
          />
          {/* Pedido 40: con qué se toca cada golpe (D derecha, I izquierda, P pie). */}
          <Switch
            label="Baquetas (R, L)"
            checked={settings.show.sticking !== false}
            onChange={(sticking) => setSettings({ show: { ...settings.show, sticking } })}
          />
          <span className="ui-secundario">Sensibilidad del micrófono</span>
          <Chips
            label="Sensibilidad del micrófono"
            options={SENSIBILIDAD}
            value={String(sensibilidad) as '0.6' | '1' | '1.4'}
            onChange={(v) => useStudio.getState().setSensibilidadBateria(Number(v))}
          />
        </>
      )}
      {piano && (
        <>
          <h2 className="ui-etiqueta">Notas</h2>
          {/* Pedido 42: un color por mano o el mismo para las dos. */}
          <Chips
            label="Color de las notas"
            options={MODOS_COLOR}
            value={settings.estilo?.colorUnico ? 'uno' : 'mano'}
            onChange={(modo) =>
              setEstilo({ colorUnico: modo === 'uno' ? settings.colors.right : null })
            }
          />
          <div className={styles.colores}>
            {settings.estilo?.colorUnico ? (
              <ColorField
                label="Color de todas las notas"
                value={settings.estilo.colorUnico}
                onChange={(colorUnico) => setEstilo({ colorUnico })}
              />
            ) : (
              <>
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
              </>
            )}
          </div>

          <h2 className="ui-etiqueta">Manos y dedos</h2>
          <Switch
            label="Números de dedo"
            checked={settings.show.fingers}
            onChange={(fingers) => setSettings({ show: { ...settings.show, fingers } })}
          />
          <Switch
            label="Nombres de las notas"
            checked={settings.show.noteNames}
            onChange={(noteNames) => setSettings({ show: { ...settings.show, noteNames } })}
          />
          <Chips
            label="Tamaño de mano"
            options={HAND_SIZES}
            value={handSize}
            onChange={(size) => useStudio.getState().setHandSize(size)}
          />
          <Button
            disabled={!hasTake}
            onClick={() => {
              const { edit, handSize: size } = useStudio.getState();
              edit((t) => autoAssign(t, size));
            }}
          >
            Recalcular manos y dedos
          </Button>
          <p className="ui-secundario">
            Pausa y haz clic en una nota para cambiar su mano o su dedo. Lo que fijes se respeta al
            recalcular.
          </p>

          <h2 className="ui-etiqueta">Teclado</h2>
          <Chips
            label="Teclado"
            options={KEYBOARDS}
            value={keyboard}
            onChange={(v) => setKeyboard(v as KeyboardMode)}
          />
        </>
      )}

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
      {/* Pedidos 41 y 42: el acabado de las notas, partículas y teclado, por partes. */}
      <Slider
        label="Redondeo de las notas"
        max={100}
        value={settings.estilo?.redondeo ?? 55}
        onChange={(redondeo) => setEstilo({ redondeo })}
        format={(v) => `${v} %`}
      />
      <Slider
        label="Brillo dentro de la nota"
        max={100}
        value={settings.estilo?.brilloInterno ?? 60}
        onChange={(brilloInterno) => setEstilo({ brilloInterno })}
        format={(v) => `${v} %`}
      />
      <Chips
        label="Al tocar"
        options={PARTICULAS}
        value={settings.estilo?.particulas ?? 'ambas'}
        onChange={(particulas) => setEstilo({ particulas })}
      />
      <Slider
        label="Cantidad de chispas y humo"
        max={200}
        value={settings.effects.sparks}
        onChange={(sparks) => setEffect({ sparks })}
        format={(v) => `${v} %`}
      />
      {piano && (
        <Chips
          label="Teclado"
          options={ESTILOS_TECLADO}
          value={settings.estilo?.teclado ?? 'realista'}
          onChange={(teclado) => setEstilo({ teclado })}
        />
      )}
      <Slider
        label="Altura del teclado"
        max={40}
        value={Math.round((settings.estilo?.elevacion ?? 0) * 100)}
        onChange={(v) => setEstilo({ elevacion: v / 100 })}
        format={(v) => (v === 0 ? 'Abajo' : `${v} % más arriba`)}
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
      <Switch
        label="Pulso en una esquina"
        checked={!!settings.show.pulse}
        onChange={(pulse) => setSettings({ show: { ...settings.show, pulse } })}
      />
      {settings.show.pulse && (
        <Switch
          label="Que suene el pulso"
          checked={!!settings.show.pulseSound}
          onChange={(pulseSound) => setSettings({ show: { ...settings.show, pulseSound } })}
        />
      )}

      {piano && (
        <>
          <h2 className="ui-etiqueta">Pedales</h2>
          {PEDALS.map((p) => (
            <Switch
              key={p.kind}
              label={p.label}
              checked={settings.show.pedals.includes(p.kind)}
              onChange={togglePedal(p.kind)}
            />
          ))}
          <PanelSustain />
          <CalidadDelPiano />
        </>
      )}
    </>
  );
}

const CALIDADES = [
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'maxima', label: 'Máxima' },
] as const;

/** Calidad del piano (pedido 33): más capas de fuerza para quien toca en serio. */
function CalidadDelPiano() {
  const calidad = useAudio((s) => s.calidad);
  const status = useAudio((s) => s.status);
  const progress = useAudio((s) => s.progress);
  return (
    <>
      <p className={styles.rotulo} aria-hidden="true">
        Calidad del piano
      </p>
      <Chips
        label="Calidad del piano"
        options={CALIDADES}
        value={calidad}
        onChange={(c) => useAudio.getState().setCalidad(c)}
      />
      <p className="ui-secundario" role="status">
        {status === 'loading'
          ? `Descargando el piano… ${Math.round(progress * 100)} %`
          : calidad === 'normal'
            ? '5 capas de fuerza (unos 30 MB). Alta: 8 capas (48 MB); Máxima: las 16 (96 MB), más matices entre suave y fuerte.'
            : calidad === 'alta'
              ? '8 capas de fuerza (unos 48 MB): más matices entre suave y fuerte.'
              : 'Las 16 capas del Salamander (unos 96 MB): todos los matices. Se baja una vez.'}
      </p>
    </>
  );
}

/** Sustain sin pedal: cada nota se apaga sola al soltarla, como el botón SUSTAIN del Yamaha. */
function PanelSustain() {
  const panelSustain = useAudio((s) => s.panelSustain);
  const setPanelSustain = useAudio((s) => s.setPanelSustain);
  const value = PANEL_SUSTAIN.find((o) => Number(o.value) === panelSustain)?.value ?? '0';
  return (
    <>
      <p className={styles.rotulo} aria-hidden="true">
        Sustain sin pedal
      </p>
      <Chips
        label="Sustain sin pedal"
        options={PANEL_SUSTAIN}
        value={value}
        onChange={(v) => setPanelSustain(Number(v))}
      />
      <p className="ui-secundario">
        Para quien no tiene pedal: cada nota sigue sonando un rato al soltarla y se apaga sola, sin
        saturar. Suena al tocar y al exportar.
      </p>
    </>
  );
}
