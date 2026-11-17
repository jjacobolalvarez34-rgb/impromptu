import '@impromptu/ui/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { engine } from './studio/audio';
import { Celular } from './pages/Celular';
import { Inicio } from './pages/Inicio';
import { EnVivo } from './pages/EnVivo';
import { Componentes } from './pages/Componentes';
import { Intro } from './pages/Intro';

// El piano se descarga apenas se abre la app (luego queda en caché y sirve sin conexión).
void engine.preload();

const root = document.getElementById('root');
if (!root) throw new Error('Falta el elemento #root en index.html');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/celular" element={<Celular />} />
        <Route path="/en-vivo" element={<EnVivo />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/intro" element={<Intro />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
