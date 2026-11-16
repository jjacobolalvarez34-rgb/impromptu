# INVESTIGACIÓN — hallazgos iniciales (noviembre de 2026)

## Competencia
| Producto | Qué hace | Por qué no basta |
|---|---|---|
| SeeMusic | Videos de piano con MIDI, cámara, efectos 4K, audio→MIDI | Lo fuerte es de pago (PRO 9,99 USD al mes o 79,99 al año) |
| Piano VFX | Visualizador gratis para videos tipo Rousseau | Solo Windows; en itch.io figura como cancelado |
| Embers | Visualizador con muchos efectos | Freemium, solo Windows |
| Neothesia | Visualizador open source (Rust, GPL-3.0) | Solo bloques cayendo; sin video ni partitura |
| MIDIVisualizer | Visualizador open source (C++, MIT) | Solo render de MIDI |
| Pianorium | Visualizador libre (GPL-3.0) | En desarrollo; solo gráficos |
| Klangio Piano2Notes | Audio→partitura | De pago; la demo convierte solo 20 s |
| Songscription | Audio→partitura y tablatura | De pago |
| Ivory | Piano audio→MIDI, MusicXML, PDF | Freemium |

**Hueco:** nadie junta visualizador bonito, pedal visible, digitación, partitura y tutoriales gratis. Rousseau y Patrik Pietschmann usan herramientas propias o cerradas.

## Referencias de estilo
- **Rousseau:** pianista con visualizador reactivo; cada nota dispara luz y chispas sobre las teclas.
- **Patrik Pietschmann:** pianista y programador alemán que combina su piano en vivo con un software propio tipo Synthesia (más de 1,8 millones de suscriptores).

## Tecnología clave
- **Web MIDI:** soportado en Chrome, Edge, Firefox y Chrome Android; requiere permiso. Safari (macOS e iOS) no lo soporta de forma nativa.
- **Basic Pitch (Spotify):** audio→MIDI ligero, con detección de pitch bend; Apache-2.0; tiene versión TypeScript que corre en el navegador.
- **High-resolution Piano Transcription (ByteDance):** transcripción de piano con pedal; superó a Onsets and Frames de Google; código y modelos publicados bajo Apache 2.0.
- **MuScriptor (julio 2026):** el mejor modelo abierto multi-instrumento (Multi F1 48,2 frente a 21,9 de YourMT3+), pero con pesos CC BY-NC 4.0 (no comercial).
- **Onsets and Frames (Magenta):** existe portado a JavaScript (Piano Scribe); referencia histórica.
- **Onsets and Velocities:** modelo de piano en tiempo real con CPU modesto; útil si se quiere transcripción en vivo del micrófono.
- **PianoPlayer:** digitación automática para MusicXML y MIDI, minimizando esfuerzo, con tamaño de mano configurable; MIT.
- **alphaTab:** partitura y tablatura (guitarra, bajo, batería); lee Guitar Pro y MusicXML y escribe Guitar Pro 7+, MIDI y audio; MPL-2.0.
- **OpenSheetMusicDisplay:** MusicXML en el navegador (BSD-3). **Verovio:** grabado de partituras (LGPL-3.0).
- **Mediabunny:** escribir MP4 y WebM con WebCodecs, en TypeScript y sin dependencias; MPL-2.0. Reemplaza a mp4-muxer, que está deprecado.
- **tauri-plugin-midi:** emula Web MIDI dentro de Tauri usando `midir`; MIT.
- **Salamander Grand Piano:** Yamaha C5 muestreado a 48 kHz y 24 bit con 16 capas de velocidad.
- **GitHub Sponsors:** disponible para mantenedores en Colombia desde 2022; sin comisión en patrocinios de cuentas personales.

## Yamaha PSR-E343 (equipo de pruebas de Jacobo)
- 61 teclas, sensibles a la fuerza (Touch Response), polifonía de 32 notas.
- Puerto USB TO HOST (va directo al computador; para iPhone necesitaba el adaptador i-UX1).
- Pedal: footswitch FC4/FC5 de encendido y apagado (no envía medio pedal).

## Fuentes
- [Neothesia (GitHub)](https://github.com/PolyMeilex/Neothesia)
- [SeeMusic en App Store](https://apps.apple.com/app/id1494198562)
- [Piano VFX en itch.io](https://piano-vfx.itch.io/piano-vfx-basic)
- [Basic Pitch TS](https://github.com/spotify/basic-pitch-ts)
- [ByteDance piano_transcription](https://github.com/bytedance/piano_transcription)
- [High-resolution Piano Transcription (artículo)](https://alphaxiv.org/abs/2010.01815)
- [MuScriptor (Hugging Face)](https://huggingface.co/MuScriptor/muscriptor-large)
- [Web MIDI en caniuse](https://caniuse.com/midi)
- [PianoPlayer (PyPI)](https://pypi.org/project/pianoplayer/)
- [alphaTab](https://alphatab.net/)
- [Mediabunny](https://github.com/Vanilagy/mediabunny)
- [tauri-plugin-midi](https://docs.rs/tauri-plugin-midi)
- [Verovio: licencia](https://book.verovio.org/introduction/licensing.html)
- [Salamander Grand Piano (sfzinstruments)](https://sfzinstruments.github.io/pianos/salamander)
- [Yamaha PSR-E343: especificaciones](https://usa.yamaha.com/products/musical_instruments/keyboards/portable_keyboards/psr-e343/specs.html)
- [GitHub Sponsors: 30 nuevas regiones](https://github.blog/news-insights/company-news/github-sponsors-available-in-30-new-regions-2/)
- [Graphify](https://github.com/Graphify-Labs/graphify)
