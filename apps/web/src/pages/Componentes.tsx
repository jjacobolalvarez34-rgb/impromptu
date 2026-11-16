import {
  Button,
  Chips,
  DeviceIndicator,
  IconButton,
  Lcd,
  Logo,
  Slider,
  Switch,
  Tabs,
} from '@impromptu/ui';
import { Download, Pause, Play, Repeat, Search, SkipBack, Square } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import styles from './Componentes.module.css';

const COLORES = [
  ['--carbon', '#1C1C1A', 'Carbón', 'Fondo de la app y del visualizador'],
  ['--panel', '#232321', 'Panel', 'Paneles laterales y barras'],
  ['--panel-alto', '#2E2E2B', 'Panel alto', 'Teclas oscuras, campos, filas activas'],
  ['--linea', '#3D3D39', 'Línea', 'Bordes de 1 px'],
  ['--chasis', '#E8E4DC', 'Chasis', 'Texto principal y teclas claras'],
  ['--gris-tecla', '#9A968C', 'Gris tecla', 'Borde inferior de teclas claras'],
  ['--gris-texto', '#A39F95', 'Gris texto', 'Texto secundario y etiquetas'],
  ['--ambar', '#FF9F1C', 'Ámbar', 'Acento: activo, seleccionado, pedal, LCD'],
  ['--lcd', '#2A1A04', 'LCD', 'Fondo de pantallas LCD'],
  ['--lcd-borde', '#7A4A00', 'Borde LCD', 'Borde de pantallas LCD'],
  ['--grabacion', '#B83A0B', 'Grabación', 'Detener y alertas de grabación'],
  ['--punto-rec', '#D9480F', 'Punto rec', 'Solo el punto del botón Grabar'],
  ['--tecla-oscura-borde', '#0E0E0D', 'Borde tecla oscura', 'Borde inferior de teclas oscuras'],
] as const;

const FORMATOS = [
  { value: '16:9', label: 'Horizontal 16:9' },
  { value: '9:16', label: 'Vertical 9:16' },
  { value: '1:1', label: 'Cuadrado 1:1' },
] as const;

const PESTANAS = [
  { id: 'estudio', label: 'Estudio' },
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'partitura', label: 'Partitura' },
  { id: 'en-vivo', label: 'En vivo' },
] as const;

type Formato = (typeof FORMATOS)[number]['value'];
type Pestana = (typeof PESTANAS)[number]['id'];

function Muestra({
  etiqueta,
  children,
  className,
}: {
  etiqueta: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure className={[styles.muestra, className].filter(Boolean).join(' ')}>
      <div className={styles.contenido}>{children}</div>
      <figcaption className="ui-etiqueta">{etiqueta}</figcaption>
    </figure>
  );
}

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section className={styles.seccion} aria-labelledby={id}>
      <h2 id={id} className="ui-titulo-panel">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function Componentes() {
  const [tocando, setTocando] = useState(false);
  const [formato, setFormato] = useState<Formato>('16:9');
  const [pestana, setPestana] = useState<Pestana>('estudio');
  const [dedos, setDedos] = useState(true);
  const [nombres, setNombres] = useState(false);
  const [chispas, setChispas] = useState(62);
  const [caida, setCaida] = useState(1);

  return (
    <div className={styles.pagina}>
      <header className={styles.cabecera}>
        <p className="ui-etiqueta">Impromptu · Identidad · C3 Consola ámbar</p>
        <h1 className="ui-titulo-pantalla">Componentes</h1>
        <p className="ui-secundario">
          Tokens y componentes base de docs/DESIGN.md. Toda pantalla nueva sale de aquí.
        </p>
      </header>

      <main className={styles.secciones}>
        <Seccion id="logo" titulo="Logo">
          <div className={styles.rejillaLogo}>
            <Muestra etiqueta="Logo principal · sobre carbón" className={styles.logoPrincipal}>
              <Logo size="clamp(32px, 11vw, 58px)" />
            </Muestra>
            <Muestra etiqueta="Ícono de app" className={styles.iconos}>
              <img src="/icon.svg" width={96} height={96} alt="Ícono de Impromptu" />
              <img src="/icon.svg" width={40} height={40} alt="" />
              <img src="/icon.svg" width={28} height={28} alt="" />
              <img src="/icon.svg" width={16} height={16} alt="" />
            </Muestra>
            <Muestra etiqueta="Sobre fondo claro" className={styles.fondoClaro}>
              <Logo size={32} variant="claro" />
            </Muestra>
            <Muestra etiqueta="Una tinta · sobre ámbar" className={styles.fondoAmbar}>
              <Logo size={32} variant="ambar" />
            </Muestra>
            <Muestra etiqueta="Reglas">
              <ul className={styles.reglas}>
                <li>Espacio libre alrededor: el alto de la nota de la «i».</li>
                <li>Logo con teclado desde 120 px de ancho. Debajo, solo la palabra o el ícono.</li>
                <li>En la app es texto y CSS, no imagen.</li>
              </ul>
            </Muestra>
          </div>
        </Seccion>

        <Seccion id="color" titulo="Color">
          <ul className={styles.colores}>
            {COLORES.map(([token, hex, nombre, uso]) => (
              <li key={token} className={styles.color}>
                <span className={styles.chip} style={{ background: `var(${token})` }} />
                <span className="ui-mono ui-secundario">{hex}</span>
                <strong className={styles.nombreColor}>{nombre}</strong>
                <span className="ui-secundario">{uso}</span>
                <code className={styles.token}>{token}</code>
              </li>
            ))}
          </ul>
          <p className="ui-secundario">
            Proporción en pantalla: carbón 58 %, paneles 24 %, chasis 12 %, ámbar 6 %. El ámbar
            marca lo activo y nunca rellena áreas grandes.
          </p>
        </Seccion>

        <Seccion id="tipografia" titulo="Tipografía">
          <dl className={styles.tipos}>
            <div>
              <dt className="ui-etiqueta">Martian Mono · LCD, tiempos, tempo</dt>
              <dd className={styles.tipoMono}>01:24.36 · ♩ = 72 · 4/4</dd>
            </div>
            <div>
              <dt className="ui-etiqueta">Etiqueta de sección · Martian Mono 11 / 500</dt>
              <dd className="ui-etiqueta">Fuentes y tomas</dd>
            </div>
            <div>
              <dt className="ui-etiqueta">Título de pantalla · Archivo 28 / 500</dt>
              <dd className="ui-titulo-pantalla">Nocturno en mi bemol</dd>
            </div>
            <div>
              <dt className="ui-etiqueta">Título de panel · Archivo 20 / 500</dt>
              <dd className="ui-titulo-panel">Efectos</dd>
            </div>
            <div>
              <dt className="ui-etiqueta">Texto · Archivo 15 / 400</dt>
              <dd className="ui-texto">
                Conecta tu teclado, toca y exporta un video con tus manos y tus pedales.
              </dd>
            </div>
            <div>
              <dt className="ui-etiqueta">Secundario · Archivo 13 / 400</dt>
              <dd className="ui-secundario">Toma 3 · guardada hace 2 min</dd>
            </div>
            <div>
              <dt className="ui-etiqueta">Número de dedo · Archivo 12 / 600</dt>
              <dd className={styles.dedos}>
                {[1, 2, 3, 4, 5].map((d) => (
                  <span key={d} className={styles.dedo}>
                    {d}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </Seccion>

        <Seccion id="componentes" titulo="Componentes">
          <div className={styles.rejilla}>
            <Muestra etiqueta="Botones · uno principal por vista">
              <div className={styles.fila}>
                <Button variant="primary" rec>
                  Grabar
                </Button>
                <Button icon={<Download />}>Exportar video</Button>
                <Button variant="stop" icon={<Square />}>
                  Detener
                </Button>
                <Button disabled>Calibrar teclas</Button>
              </div>
            </Muestra>

            <Muestra etiqueta="Botón de ícono">
              <div className={styles.fila}>
                <IconButton label="Ir al inicio" icon={<SkipBack />} />
                <IconButton
                  label={tocando ? 'Pausar' : 'Reproducir'}
                  icon={tocando ? <Pause /> : <Play />}
                  onClick={() => setTocando((t) => !t)}
                />
                <IconButton label="Repetir sección" icon={<Repeat />} />
                <IconButton label="Buscar" icon={<Search />} />
              </div>
            </Muestra>

            <Muestra etiqueta="Pantalla LCD">
              <div className={styles.fila}>
                <Lcd size="lg" aria-label="Tiempo">
                  01:24.36
                </Lcd>
                <Lcd aria-label="Duración">04:12.80</Lcd>
                <Lcd size="sm" aria-label="Tempo">
                  ♩ = 72
                </Lcd>
              </div>
            </Muestra>

            <Muestra etiqueta="Interruptor">
              <div className={styles.columna}>
                <Switch label="Números de dedo" checked={dedos} onChange={setDedos} />
                <Switch label="Nombres de cada nota" checked={nombres} onChange={setNombres} />
                <Switch label="Sostenuto" checked={false} onChange={() => {}} disabled />
              </div>
            </Muestra>

            <Muestra etiqueta="Selector de opciones">
              <Chips label="Formato" options={FORMATOS} value={formato} onChange={setFormato} />
            </Muestra>

            <Muestra etiqueta="Pestañas">
              <Tabs
                label="Secciones"
                idPrefix="demo"
                tabs={PESTANAS}
                value={pestana}
                onChange={setPestana}
              />
              <div
                role="tabpanel"
                id={`demo-panel-${pestana}`}
                aria-labelledby={`demo-tab-${pestana}`}
                className="ui-secundario"
              >
                Vista: {PESTANAS.find((p) => p.id === pestana)?.label}
              </div>
            </Muestra>

            <Muestra etiqueta="Deslizador">
              <div className={styles.columna}>
                <Slider
                  label="Chispas al tocar"
                  value={chispas}
                  onChange={setChispas}
                  format={(v) => `${v} %`}
                />
                <Slider
                  label="Velocidad de caída"
                  value={caida}
                  onChange={setCaida}
                  min={0.5}
                  max={2}
                  step={0.1}
                  format={(v) => `${v.toFixed(1)}×`}
                />
              </div>
            </Muestra>

            <Muestra etiqueta="Indicador de dispositivo">
              <div className={styles.fila}>
                <DeviceIndicator name="PSR-E343" connected />
                <DeviceIndicator name="Micrófono" connected={false} />
              </div>
            </Muestra>
          </div>
        </Seccion>
      </main>
    </div>
  );
}
