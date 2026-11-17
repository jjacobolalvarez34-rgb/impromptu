import { Button, Chips, Lcd, Switch } from '@impromptu/ui';
import { RotateCcw } from 'lucide-react';
import { useLive } from './live';
import { practice, usePractice } from './practice';
import type { PracticeHand } from './practice';
import { useStudio } from './store';
import styles from './LivePanel.module.css';

const HANDS = [
  { value: 'both', label: 'Las dos' },
  { value: 'R', label: 'Derecha' },
  { value: 'L', label: 'Izquierda' },
] as const;

const NAMES = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
/** Nombre en español con octava (Do4 = do central). */
export const noteName = (pitch: number) => `${NAMES[pitch % 12]}${Math.floor(pitch / 12) - 1}`;

/** Panel de la pestaña Tutorial (fase 7): qué se practica y cómo va. */
export function TutorialPanel() {
  const { hand, wait, otherHandPlays, waitingFor, stats, accuracy } = usePractice();
  const device = useLive((s) => s.device);
  const take = useStudio((s) => s.take);
  const settings = useStudio((s) => s.settings);
  const setSettings = useStudio((s) => s.setSettings);
  const show = (patch: Partial<typeof settings.show>) =>
    setSettings({ show: { ...settings.show, ...patch } });

  return (
    <>
      <section className={styles.seccion} aria-labelledby="practicar-titulo">
        <h2 id="practicar-titulo" className="ui-etiqueta">
          Practicar
        </h2>
        {!take && <p className="ui-secundario">Abre una pieza en el Estudio para practicarla.</p>}
        <Chips
          label="Mano que practicas"
          options={HANDS}
          value={hand}
          onChange={(v) => practice.set({ hand: v as PracticeHand })}
        />
        {hand !== 'both' && (
          <Switch
            label="La otra mano la toca la app"
            checked={otherHandPlays}
            onChange={(v) => practice.set({ otherHandPlays: v })}
          />
        )}
        <Switch
          label="Modo espera: avanza cuando tocas"
          checked={wait}
          onChange={(v) => practice.set({ wait: v })}
        />
        {wait && !device && (
          <p className="ui-secundario">
            Conecta el teclado (en el Estudio, bloque Grabar) para que la app sepa qué tocas.
          </p>
        )}
        {wait && waitingFor.length > 0 && (
          <div role="status" className={styles.espera}>
            <span className="ui-secundario">Toca</span>
            <Lcd size="md">{waitingFor.map(noteName).join(' · ')}</Lcd>
          </div>
        )}
        {wait && stats && stats.done > 0 && (
          <div className={styles.precision}>
            <p className="ui-secundario" role="status">
              Precisión {Math.round((accuracy ?? 0) * 100)} % · {stats.done}{' '}
              {stats.done === 1 ? 'acorde' : 'acordes'} · {stats.wrong}{' '}
              {stats.wrong === 1 ? 'tecla equivocada' : 'teclas equivocadas'}
            </p>
            <Button icon={<RotateCcw />} onClick={() => practice.restart()}>
              Empezar de nuevo
            </Button>
          </div>
        )}
        <p className="ui-secundario">
          Para repetir una parte, arrástrala en la línea de tiempo y activa la repetición. La
          velocidad está abajo a la derecha.
        </p>
      </section>

      <section className={styles.seccion} aria-labelledby="ver-titulo">
        <h2 id="ver-titulo" className="ui-etiqueta">
          Ver
        </h2>
        <Switch
          label="Números de dedo"
          checked={settings.show.fingers}
          onChange={(fingers) => show({ fingers })}
        />
        <Switch
          label="Nombres de las notas"
          checked={settings.show.noteNames}
          onChange={(noteNames) => show({ noteNames })}
        />
        <Switch
          label="Pedal grande"
          checked={settings.show.bigPedal === true}
          onChange={(bigPedal) => show({ bigPedal })}
        />
      </section>
    </>
  );
}
