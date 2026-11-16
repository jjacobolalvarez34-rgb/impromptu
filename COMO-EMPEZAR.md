# Cómo empezar (para Jacobo)

## 1. Crear el repositorio
1. En GitHub crea un repositorio nuevo llamado `impromptu` (vacío, sin README).
2. Descomprime este kit en una carpeta `impromptu` y ábrela en VS Code.
3. En la terminal:
   ```bash
   git init
   git add .
   git commit -m "Kit inicial de Impromptu"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/impromptu.git
   git push -u origin main
   ```

## 2. Instalar las herramientas (una vez)
- **Graphify** (en la terminal; necesita Python 3.10+):
  ```bash
  uv tool install graphifyy        # o: pipx install graphifyy
  graphify install --project
  graphify hook install
  ```
- **Plugins de diseño** (dentro de Claude Code, uno por uno):
  ```
  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
  /plugin install ui-ux-pro-max@ui-ux-pro-max-skill
  /plugin marketplace add https://github.com/NutshellEngineering/apple-design-skill
  /plugin install apple-design-skill@apple-design-skill-marketplace
  ```
- **Node.js 20+ y pnpm** (`npm i -g pnpm`).

## 3. Arrancar la fase 0
1. Abre Claude Code en la carpeta, con el modelo más capaz y en modo plan (Shift+Tab).
2. Escribe `/inicio-sesion`.
3. Cuando te muestre el plan, pega el prompt de **Fase 0** de `docs/ROADMAP.md`.
4. Revisa el plan y apruébalo.

## 4. Lo que puedes ir haciendo tú (sin código)
Mira `docs/PENDIENTES.md`. Lo más valioso:
- **P4: grabar 5 piezas** en tu PSR-E343 con MIDI, WAV y video desde arriba. Son las pruebas reales del proyecto.
- **P1: decidir la licencia.** La recomendación es GPL-3.0.
- **P2 y P3:** usuario de GitHub, dominio y revisión de la marca.

## 5. Después de cada fase
- Prueba con tu teclado lo que diga la fase en `ROADMAP.md`.
- Dile a Claude Code qué funcionó y qué no, para que lo anote en la BITÁCORA.
