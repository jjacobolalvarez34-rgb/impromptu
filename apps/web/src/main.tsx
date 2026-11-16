import '@impromptu/ui/styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Inicio } from './pages/Inicio';
import { Componentes } from './pages/Componentes';

const root = document.getElementById('root');
if (!root) throw new Error('Falta el elemento #root en index.html');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/componentes" element={<Componentes />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
