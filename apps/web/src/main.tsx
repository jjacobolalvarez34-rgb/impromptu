import '@impromptu/ui/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Estudio } from './pages/Estudio';
import { EnVivo } from './pages/EnVivo';
import { Componentes } from './pages/Componentes';
import { Intro } from './pages/Intro';

const root = document.getElementById('root');
if (!root) throw new Error('Falta el elemento #root en index.html');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Estudio />} />
        <Route path="/en-vivo" element={<EnVivo />} />
        <Route path="/componentes" element={<Componentes />} />
        <Route path="/intro" element={<Intro />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
