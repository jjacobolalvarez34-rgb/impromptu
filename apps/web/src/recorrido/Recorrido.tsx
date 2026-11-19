import { Button } from '@impromptu/ui';
import {
  AudioLines,
  Check,
  Compass,
  Film,
  FileMusic,
  Music2,
  SlidersHorizontal,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import styles from './Recorrido.module.css';

/**
 * Recorrido opcional al empezar (pedido 37 de Jacobo): no todo cabe en la pantalla de inicio,
 * así que la primera vez se ofrece un recorrido corto que cada persona elige si hace o no.
 */
const CLAVE = 'impromptu-recorrido';

const PASOS: { icono: ReactNode; titulo: string; texto: string }[] = [
  {
    icono: <Music2 />,
    titulo: 'Elige tu instrumento',
    texto:
      'Piano, guitarra, bajo o batería. En el estudio se cambia con el botón de arriba, y la vista, los sonidos y la partitura cambian con él.',
  },
  {
    icono: <AudioLines />,
    titulo: 'Trae tu música',
    texto:
      'Conecta tu instrumento por USB, graba con el micrófono, abre un MIDI o convierte un audio. Con una canción completa, Impromptu separa tu instrumento del resto antes de pasarlo a notas.',
  },
  {
    icono: <SlidersHorizontal />,
    titulo: 'Míralo caer y ajústalo',
    texto:
      'Reproduce, cambia la velocidad o repite una sección. A la derecha están los temas y lo de cada instrumento: flechas de rasgueo, vista de batería real, pulso del tempo. Arrastra sobre las notas para moverlas o cambiarles la mano.',
  },
  {
    icono: <FileMusic />,
    titulo: 'La partitura se escribe sola',
    texto:
      'En la pestaña Partitura (o Tablatura) toca una nota para cambiarla. También puedes grabar directo en la hoja y exportar MusicXML, PDF o un video de la partitura.',
  },
  {
    icono: <Film />,
    titulo: 'Exporta tu video',
    texto:
      'Elige el formato y dale a Exportar. Puedes seguir usando la app: el video se arma en segundo plano (la burbuja de abajo muestra el avance) y se descarga solo.',
  },
  {
    icono: <Check />,
    titulo: '¡Listo!',
    texto: 'Puedes volver a ver este recorrido cuando quieras desde la página principal.',
  },
];

const leer = () => {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return 'no';
  }
};
const guardar = (v: string) => {
  try {
    localStorage.setItem(CLAVE, v);
  } catch {
    // Sin almacenamiento: se ofrecerá otra vez.
  }
};

/** Tarjeta que ofrece el recorrido (solo la primera vez) y el recorrido en sí. */
export function Recorrido() {
  const navigate = useNavigate();
  const pedido = new URLSearchParams(window.location.search).has('recorrido');
  const [oferta, setOferta] = useState(() => !pedido && leer() === null);
  const [abierto, setAbierto] = useState(pedido);
  const [paso, setPaso] = useState(0);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  const cerrar = (visto: boolean) => {
    guardar(visto ? 'visto' : 'no');
    setAbierto(false);
    setOferta(false);
  };
  const ultimo = paso === PASOS.length - 1;
  const actual = PASOS[paso]!;

  return (
    <>
      {oferta && (
        <aside className={styles.oferta} aria-label="Recorrido de la app">
          <Compass aria-hidden="true" className={styles.brujula} />
          <div className={styles.textoOferta}>
            <strong>¿Primera vez?</strong>
            <span className="ui-secundario">
              Haz el recorrido: un minuto y sabes dónde está todo.
            </span>
          </div>
          <div className={styles.botones}>
            <Button
              variant="primary"
              onClick={() => {
                setPaso(0);
                setAbierto(true);
              }}
            >
              Empezar
            </Button>
            <Button onClick={() => cerrar(false)}>Ahora no</Button>
          </div>
        </aside>
      )}
      <dialog
        ref={ref}
        className={styles.dialogo}
        aria-labelledby="recorrido-titulo"
        onCancel={(e) => {
          e.preventDefault();
          cerrar(true);
        }}
      >
        <div className={styles.paso} key={paso}>
          <div className={styles.icono} aria-hidden="true">
            {actual.icono}
          </div>
          <p className="ui-etiqueta">
            Paso {paso + 1} de {PASOS.length}
          </p>
          <h2 id="recorrido-titulo">{actual.titulo}</h2>
          <p className={styles.texto}>{actual.texto}</p>
        </div>
        <div className={styles.puntos} aria-hidden="true">
          {PASOS.map((p, i) => (
            <span key={p.titulo} data-activo={i === paso} />
          ))}
        </div>
        <div className={styles.acciones}>
          {!ultimo && <Button onClick={() => cerrar(true)}>Saltar</Button>}
          {paso > 0 && <Button onClick={() => setPaso(paso - 1)}>Anterior</Button>}
          {ultimo ? (
            <Button
              variant="primary"
              onClick={() => {
                cerrar(true);
                navigate('/estudio');
              }}
            >
              Empezar a usar
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setPaso(paso + 1)}>
              Siguiente
            </Button>
          )}
        </div>
      </dialog>
    </>
  );
}
