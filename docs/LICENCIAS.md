# LICENCIAS — qué se puede usar

Regla: **nada entra al proyecto sin estar en esta tabla.** "[VERIFICAR]" significa que hay que confirmar en el repositorio oficial antes de instalar y actualizar esta fila.

## Licencia del proyecto
Pendiente (P1). Provisional: **GPL-3.0**. Mientras no se decida, no copies código de otros proyectos (aunque sean GPL); usa solo dependencias de la tabla.

## Librerías
| Componente | Uso | Licencia | Obligaciones / notas |
|---|---|---|---|
| React 19.3, Vite 8.3 | App | MIT (verificado en npm, 2026-11-16) | Aviso de copyright |
| Zustand | Estado de la app | MIT (verificado 5.1, aún sin instalar) | Aviso de copyright |
| `react-router` 8.5 | Rutas (`/componentes`, luego `/en-vivo`) | MIT (verificado) | Aviso de copyright |
| `vite-plugin-pwa` 2.0 (+ Workbox) | Versión web instalable y sin conexión | MIT (verificado) | Aviso de copyright |
| `@vitejs/plugin-react` 6.3 | Build | MIT (verificado) | Solo desarrollo |
| `@fontsource/martian-mono`, `@fontsource/archivo` 5.3 | Fuentes empaquetadas | OFL-1.1 (verificado) | Ver fila de tipografías |
| Turborepo 2.11 | Monorepo | MIT (verificado) | Solo desarrollo |
| TypeScript 6.0 | Lenguaje | Apache-2.0 (verificado) | Solo desarrollo. typescript-eslint aún no soporta TS 7 |
| ESLint 10, `typescript-eslint` 8, `eslint-plugin-react-hooks` 7, `globals` | Lint | MIT (verificado) | Solo desarrollo |
| Prettier 3.10 | Formato | MIT (verificado) | Solo desarrollo |
| PixiJS | Visualizador | MIT [VERIFICAR] | |
| Tone.js | Audio | MIT [VERIFICAR] | |
| `@tonejs/piano` | Piano incluido con pedal | MIT | Usa muestras de Salamander (ver abajo) |
| `midi-file` 1.2 | Leer y escribir .mid (en uso desde la fase 1) | MIT (verificado) | Aviso de copyright. Se eligió en lugar de `@tonejs/midi` para controlar velocity 0 y notas sin cerrar |
| `@tonejs/midi` | Leer y escribir .mid | MIT (verificado 2.0.28) | No se usa: ver la fila de `midi-file` |
| Mediabunny | Escribir MP4 con WebCodecs | MPL-2.0 | Si modificas sus archivos, publica esos cambios bajo MPL. No quitar cabeceras de licencia |
| OpenSheetMusicDisplay | Mostrar partitura | BSD-3-Clause | Aviso de copyright |
| Verovio (alternativa) | Grabado de partitura | LGPL-3.0 | Dar crédito; cambios a Verovio deben publicarse |
| alphaTab | Tablaturas (fase 9) | MPL-2.0 | Igual que Mediabunny |
| onnxruntime-web | Ejecutar modelos ONNX | MIT [VERIFICAR] | |
| TensorFlow.js | Basic Pitch | Apache-2.0 [VERIFICAR] | |
| Dexie (IndexedDB) | Almacenamiento | [VERIFICAR] | |
| Tauri 2 | Escritorio | MIT o Apache-2.0 [VERIFICAR] | |
| `tauri-plugin-midi` | MIDI en escritorio | MIT | |
| Lucide (`lucide-react` 1.73) | Íconos | ISC (verificado) | Aviso de copyright |
| Vitest 5.1, Playwright 1.65 | Pruebas | MIT, Apache-2.0 (verificado) | Solo desarrollo |

## Modelos de IA
| Modelo | Uso | Licencia | Decisión |
|---|---|---|---|
| Basic Pitch (Spotify) | Audio→notas general | Apache-2.0 | Sí, núcleo |
| High-resolution Piano Transcription (ByteDance) | Piano con pedal | Apache-2.0 | Sí, núcleo (convertir a ONNX) |
| beat_this (CPJKU) | Tempo y pulsos (fase 6) | MIT | Sí, evaluar |
| MuScriptor (Kyutai × Mirelo) | Multi-instrumento | Código MIT, **pesos CC BY-NC 4.0** | **No en el núcleo** (ADR-007) |
| MT3 / YourMT3 | Multi-instrumento | [VERIFICAR] | Evaluar en fase 9 |

## Algoritmos y datos
| Recurso | Uso | Licencia | Notas |
|---|---|---|---|
| PianoPlayer (marcomusy) | Algoritmo de digitación (puerto a TS) | MIT | Conservar el aviso de copyright en el archivo portado |
| Salamander Grand Piano (Alexander Holm) | Sonido de piano | Publicado como CC-BY 3.0; según la página del autor, de dominio público desde 2022 | Dar crédito igualmente en "Acerca de" |
| Martian Mono, Archivo | Tipografías | SIL OFL 1.1 | Incluir el archivo OFL con las fuentes. Hoy se empaquetan vía `@fontsource` (que trae el OFL en `node_modules`); falta mostrar el texto OFL en "Acerca de" |

## Proyectos que NO se copian
| Proyecto | Licencia | Por qué |
|---|---|---|
| Neothesia | GPL-3.0 | Inspiración sí, código no (hasta decidir P1) |
| Pianorium | GPL-3.0 | Ídem |
| SeeMusic, Synthesia, Embers, Piano VFX | Propietarios | Ni código, ni assets, ni nombres de sus temas |

## Créditos visibles en la app
Pantalla "Acerca de" con: Salamander Grand Piano, Basic Pitch, ByteDance Piano Transcription, OSMD, Mediabunny, PianoPlayer, fuentes y demás dependencias con aviso obligatorio.
