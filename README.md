# impromptu

**Videos de piano con notas cayendo. Gratis, de código abierto y en tu equipo.**

Conecta tu teclado, toca y exporta un video con tus manos, tus pedales y efectos de luz. Sin suscripciones y sin que tu música salga de tu computador.

## Qué puedes hacer hoy

- **Tocar en vivo** con tu teclado MIDI por USB: cada nota sale de la tecla con brillo y chispas. Sustain, sostenuto y una corda, con medio pedal.
- **Abrir un MIDI** (por ejemplo, de Cakewalk o de cualquier DAW) y verlo caer con su sonido de piano de cola, con pedal.
- **Sincronizar tu audio**: abre el MP3 o WAV de la misma pieza y se alinea solo con el MIDI.
- **Tus manos en el video**: graba la cámara mientras tocas o importa un video, calibra las teclas y las notas caen sobre tu teclado real.
- **Plantillas**: solo visualizador, cámara en recuadro, cámara arriba o fondo (video, desenfoque o color).
- **Tu estilo**: temas, colores por mano, notas brillantes, haces de luz, chispas, líneas de compás y velocidad de caída.
- **Exportar MP4** cuadro por cuadro, sin saltos: horizontal, vertical o cuadrado; 1080p o 4K; 30 o 60 fps.
- **Modo en vivo para OBS** (`/en-vivo`), con fondo verde o transparente.
- **Grabar tomas**, que quedan guardadas en tu equipo con su video.

## Cómo empezar

1. Abre la app en **Chrome o Edge** (en Safari no hay MIDI).
2. Conecta tu teclado por USB y aprieta **Conectar teclado**, o abre un archivo `.mid`.
3. Toca, o dale **Reproducir**.
4. Ajusta el tema y los efectos en el panel de la derecha.
5. Aprieta **Exportar video**.

La primera vez se descarga el piano incluido (unos 30 MB). Después funciona sin internet.

## Lo que viene

Números de dedo y separación de manos, partitura (MusicXML y PDF), audio o micrófono a notas con IA en tu equipo, modo práctica, app de escritorio y de Android, guitarra y batería. Ver [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Apoyar el proyecto

Impromptu es y será gratis. Si te sirve, puedes apoyarlo por GitHub Sponsors (en preparación) o dejar una estrella en el repositorio.

## Para desarrolladores

Requisitos: Node 22+ y pnpm.

```bash
pnpm install
pnpm dev          # la app en http://localhost:5173
pnpm test         # pruebas (Vitest)
pnpm e2e          # pruebas de punta a punta (Playwright)
pnpm lint && pnpm typecheck
```

Monorepo con pnpm + Turborepo: `apps/web` (Vite + React + PWA) y `packages/*` (core, midi, render, audio, export, media, ui). Antes de contribuir, lee [`CLAUDE.md`](CLAUDE.md), [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) y [`docs/DESIGN.md`](docs/DESIGN.md).

## Créditos

Piano: Salamander Grand Piano (Alexander Holm). Lista completa de licencias en [`docs/LICENCIAS.md`](docs/LICENCIAS.md). Licencia del proyecto: por decidir (provisional GPL-3.0).

---

Un producto de **Mamut Herd**. Contacto: mamutherdoficial@gmail.com

© 2026 Mamut Herd
