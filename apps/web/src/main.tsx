import '@impromptu/ui/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { connectDesktopMenu } from './desktop';
import { engine } from './studio/audio';
import { Celular } from './pages/Celular';
import { Inicio } from './pages/Inicio';
import { Landing } from './pages/Landing';
import { Portada } from './pages/Portada';
import { EnVivo } from './pages/EnVivo';
import { Componentes } from './pages/Componentes';
import { Intro } from './pages/Intro';
import { Acerca } from './pages/Acerca';

// El piano se descarga al abrir la app (luego queda en caché y sirve sin conexión), pero
// después de la intro: decodificar 150 muestras a la vez la hacía ver trabada.
// Con ?intro (app de escritorio) lo hace el Estudio al terminar la animación.
if (!new URLSearchParams(window.location.search).has('intro')) {
  window.setTimeout(() => void engine.preload(), 4000);
}

const root = document.getElementById('root');
if (!root) throw new Error('Falta el elemento #root en index.html');

connectDesktopMenu();

createRoot(root).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Portada />} />
        <Route path="/estudio" element={<Inicio />} />
        <Route path="/celular" element={<Celular />} />
        <Route path="/en-vivo" element={<EnVivo />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/acerca" element={<Acerca />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
