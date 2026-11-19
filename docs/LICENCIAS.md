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
| `@tonejs/piano` | Piano incluido con pedal | MIT | No se usa (ADR-009): hay un sampler propio en `packages/audio` |
| `midi-file` 1.2 | Leer y escribir .mid (en uso desde la fase 1) | MIT (verificado) | Aviso de copyright. Se eligió en lugar de `@tonejs/midi` para controlar velocity 0 y notas sin cerrar |
| `@tonejs/midi` | Leer y escribir .mid | MIT (verificado 2.0.28) | No se usa: ver la fila de `midi-file` |
| Mediabunny 1.66 | Escribir MP4 con WebCodecs (en uso desde la fase 3) | MPL-2.0 (verificado) | Si modificas sus archivos, publica esos cambios bajo MPL. No quitar cabeceras de licencia |
| OpenSheetMusicDisplay 2.2.1 | Mostrar la partitura (fase 6) | BSD-3-Clause (verificado en npm) | Aviso de copyright; crédito en "Acerca de" |
| Verovio (alternativa) | Grabado de partitura | LGPL-3.0 | Dar crédito; cambios a Verovio deben publicarse |
| alphaTab | Tablaturas (fase 9) | MPL-2.0 | Igual que Mediabunny |
| onnxruntime-web | Ejecutar modelos ONNX | MIT [VERIFICAR] | |
| TensorFlow.js 3.21 | Ejecutar Basic Pitch | Apache-2.0 (verificado) | Aviso de licencia |
| `@spotify/basic-pitch` 1.0.1 (código y modelo) | Audio a notas (fase 5); guitarra y bajo (fase 9) | Apache-2.0 (verificado) | Aviso de licencia; crédito en "Acerca de" |
| Basic Pitch ONNX (`nmp.onnx` del paquete de pip `basic-pitch` 0.4.0) | Guitarra y bajo en la app de Android | Apache-2.0 (verificado: LICENSE del paquete, © 2022 Spotify AB) | Aviso de licencia |
| `onnxruntime-web` 1.31.1 | Correr el modelo de piano (ADR-014) | MIT (verificado) | Aviso de copyright |
| `onnxruntime-android` 1.31.1 | Transkun en la app de Android (ADR-019) | MIT | Aviso de copyright; crédito en "Acerca de" de la app |
| Jetpack Compose, AndroidX, kotlinx-coroutines | App de Android | Apache-2.0 | Aviso de licencia |
| `onnxruntime` 1.31.1 (escritorio) y `org.json` | Solo pruebas de la app de Android en la PC | MIT; dominio público | Solo desarrollo, no va en el APK |
| Trazos de íconos de Lucide (copiados a `Iconos.kt`) | Íconos de la app de Android | ISC | Aviso de copyright |
| Transkun V2 (paquete de pip `transkun` 2.0.1: código y pesos `pretrained/2.0.pt`) | Piano con pedal (ADR-015); espectro y decodificación portados a TS | MIT, © 2021 Yujia Yan (verificado: LICENSE y clasificador del paquete; los pesos vienen dentro del paquete) | Aviso de copyright; crédito en "Acerca de" |
| ADTOF (batería, Zehren et al.) | Evaluado para batería (fase 9) | CC BY-NC-SA 4.0 (no comercial) | **No se usa** |
| Omnizart (batería) | Evaluado (fase 9) | Código MIT; licencia de los pesos sin aclarar | No se usa hasta confirmar la licencia de los pesos |
| Guitar-Transcription (ErenReyhanlioglu) | Evaluado para guitarra (fase 9) | Código MIT; pesos en otro repositorio, licencia sin aclarar | No se usa; la guitarra usa Basic Pitch (Apache-2.0) |
| Batería grabada de Sonic Pi (`etc/samples/drum_*`, 17 archivos FLAC, 844 kB) | Sonido de la batería (`apps/web/public/bateria`) | **CC0 1.0** (verificado en LICENSE.md de Sonic Pi: "All the bundled samples are individually licensed under a CC0 1.0 Universal Public Domain Dedication") | Ninguna (se acredita igual en "Acerca de") |
| Sonidos de guitarra y bajo (y la batería de respaldo) | Síntesis propia (Karplus-Strong y percusión por código), solo mientras bajan los grabados | Código del proyecto (GPL-3.0) | Ninguna |
| FreePats Spanish Classical Guitar (2019-06-18) | Guitarra nylon grabada (`apps/web/public/instrumentos/nylon`), pedido 25 | **CC0 1.0** (verificado: LICENSE y README del repositorio freepats/spanish-classical-guitar) | Ninguna (se acredita en "Acerca de") |
| FreePats FSS Steel String Guitar (2020-05-21), muestras de FlameStudios | Guitarra de acero grabada (`instrumentos/acero`) | **GPL-3.0-or-later con excepción de FreePats** (verificado: gpl.txt y readme.txt del paquete). Compatible con la licencia del proyecto (GPL-3.0) | Mantener el aviso y el crédito; la excepción deja que la música hecha con estos sonidos no quede bajo la GPL |
| FreePats FSBS Electric Guitar, clean (bridge) | Guitarra eléctrica grabada (`instrumentos/electrica`) | **CC0 1.0** (verificado: LICENSE y README de freepats/electric-guitar-FSBS-clean) | Ninguna (se acredita en "Acerca de") |
| FreePats Electric Bass YR, dedos (Andrea Biasior, 2019-09-30) | Bajo grabado (`instrumentos/bajo`) | **CC0 1.0** (verificado: LICENSE y README de freepats/electric-bass-YR) | Ninguna (se acredita en "Acerca de") |
| MuldjordKit (Lars Muldjord), versión FreePats 2020-10-18 | Batería grabada de rock (`instrumentos/bateria`): 3 capas de fuerza y 2 variaciones por pieza | **CC BY 4.0** (verificado: LICENSE.txt y README del paquete) | **Dar crédito** a Lars Muldjord y FreePats ("Acerca de", hecho) e indicar que se recortó y comprimió |

Los bancos se arman con `node scripts/muestras.mjs` desde los originales descargados en `D:/.cache/muestras` (fuera de git): una nota cada 3 semitonos (el bajo, todas), recortadas con fundido y en FLAC de 16 bits. Unos 13 MB en total; cada banco se baja solo cuando se usa su instrumento.
| Modelo de piano de Kong et al. | Se evaluó y se dejó (ADR-014, ADR-015) | CC BY 4.0 | Ya no se usa |
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
| PianoPlayer (marcomusy) | Referencia de digitación | MIT | No se usa: la digitación es propia (ADR-012), con datos publicados de Parncutt et al. (1997) |
| Salamander Grand Piano (Alexander Holm) | Sonido de piano. Hoy se descarga en MP3 desde tambien.github.io/Piano (PROVISIONAL, P15) | Publicado como CC-BY 3.0; según la página del autor, de dominio público desde 2022 | Dar crédito igualmente en "Acerca de" |
| Martian Mono, Archivo | Tipografías | SIL OFL 1.1 | Incluir el archivo OFL con las fuentes. Hoy se empaquetan vía `@fontsource` (que trae el OFL en `node_modules`); falta mostrar el texto OFL en "Acerca de" |

## Proyectos que NO se copian
| Proyecto | Licencia | Por qué |
|---|---|---|
| Neothesia | GPL-3.0 | Inspiración sí, código no (hasta decidir P1) |
| Pianorium | GPL-3.0 | Ídem |
| SeeMusic, Synthesia, Embers, Piano VFX | Propietarios | Ni código, ni assets, ni nombres de sus temas |

## Créditos visibles en la app
Pantalla "Acerca de" con: Salamander Grand Piano, Basic Pitch, ByteDance Piano Transcription, OSMD, Mediabunny, PianoPlayer, fuentes y demás dependencias con aviso obligatorio.
