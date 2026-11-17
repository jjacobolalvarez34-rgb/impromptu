# DESIGN — Identidad de Impromptu

Identidad aprobada por Jacobo: **C3 · Consola ámbar**. Inspiración: hardware de estudio, la pantalla LCD naranja del Yamaha PSR-E343 y botones físicos que se hunden. La identidad completa (logo, color, tipografía, componentes y reglas) también está dibujada en el lienzo de diseño de Jacobo, en la página "Identidad".

## 1. Logo
- **Palabra:** `impromptu` en minúsculas, Martian Mono, espaciado −2 px a 58 px (ajusta proporcional).
- **El punto de la "i"** es una nota cayendo: barra vertical ámbar `#FF9F1C`, ancho 0,13 em, alto 0,36 em, centrada sobre el palo de la "i" sin punto (`ı`), separada del palo.
- **Teclado:** debajo de la palabra, una línea ámbar de 2 px y 10 teclas blancas en línea fina; la primera tecla (bajo la "i") está encendida en ámbar.
- **Ícono de app:** cuadrado carbón con radio de 22 %, tres notas ámbar cayendo (la tercera al 50 % de opacidad) sobre un mini teclado de 6 teclas con la primera encendida. Archivo base: `assets/brand/icon.svg`.
- **Versiones:** principal sobre carbón; sobre fondo claro (palabra carbón, teclas blancas con borde gris); una tinta sobre ámbar (solo palabra, carbón).
- **Espacio libre:** el alto de la nota de la "i" alrededor del logo.
- **Mínimos:** logo con teclado desde 120 px de ancho; debajo, solo la palabra o el ícono.
- **En la app,** el logo es un componente (`<Logo size />`) hecho con texto y CSS, no una imagen, para que sea nítido a cualquier tamaño.

## 2. Color (tokens)
```css
:root {
  --carbon:      #1C1C1A;  /* fondo de app y visualizador */
  --panel:       #232321;  /* paneles y barras */
  --panel-alto:  #2E2E2B;  /* teclas oscuras, campos, filas activas */
  --linea:       #3D3D39;  /* bordes 1 px */
  --chasis:      #E8E4DC;  /* texto principal y teclas claras */
  --gris-tecla:  #9A968C;  /* borde inferior de teclas claras */
  --gris-texto:  #A39F95;  /* texto secundario */
  --ambar:       #FF9F1C;  /* acento: activo, seleccionado, pedal, LCD */
  --lcd:         #2A1A04;  /* fondo de pantallas LCD */
  --lcd-borde:   #7A4A00;
  --grabacion:   #B83A0B;  /* detener y alertas de grabación (texto blanco) */
  --punto-rec:   #D9480F;  /* solo el punto del botón Grabar */
  --tecla-oscura-borde: #0E0E0D;
}
```
- **Proporción en pantalla:** carbón 58 %, paneles 24 %, chasis 12 %, ámbar 6 %.
- **El ámbar marca lo activo:** selección, pestaña actual, pedal pisado, pantallas LCD, interruptores encendidos. Nunca rellena paneles ni fondos grandes.
- **Contraste:** todo texto pasa AA (4,5:1). `--grabacion` lleva texto blanco; `--ambar` lleva texto carbón.
- **Tema por defecto del visualizador ("Ámbar"):** mano derecha `--ambar`, mano izquierda `--chasis`, pedal `--ambar`, fondo `#111110`, teclas blancas `--chasis`, negras `--carbon`. Otros temas iniciales: "Sala" (dorado y rojo fieltro sobre ébano), "Medianoche" (azul claro y marfil) y "Tinta" (claro, para tutoriales).

## 3. Tipografía
| Uso | Fuente | Tamaño / peso |
|---|---|---|
| Logo, LCD, tiempos, tempo, compás | Martian Mono | según contexto, 400–500 |
| Etiquetas de sección | Martian Mono | 11 px, 500, mayúsculas, espaciado 1,5 px |
| Títulos de pantalla | Archivo | 28 / 500 |
| Títulos de panel | Archivo | 20 / 500 |
| Texto | Archivo | 15 / 400, interlineado 1,55 |
| Secundario | Archivo | 13 / 400, `--gris-texto` |
| Números de dedo sobre notas | Archivo | 10–12 / 600 |

Ambas fuentes son de Google Fonts con licencia OFL. Empaquétalas con la app (sin depender de internet).

## 4. Componentes
- **Botón principal (tecla clara):** fondo `--chasis`, texto `--carbon`, radio 4 px, borde inferior 3 px `--gris-tecla`. Al presionar: borde inferior 1 px y baja 2 px. **Un solo botón principal por vista.** El de Grabar lleva un punto `--punto-rec`.
- **Botón secundario (tecla oscura):** fondo `--panel-alto`, texto `--chasis`, borde inferior 3 px `--tecla-oscura-borde`.
- **Botón de ícono:** 40×40 (44×44 en celular), mismo estilo de tecla oscura.
- **Pantalla LCD:** fondo `--lcd`, borde 1 px `--lcd-borde`, texto `--ambar` en Martian Mono, radio 3 px. Para tiempo, tempo y compás.
- **Interruptor:** **cuadrado**, no redondo (40×22, radio 4 px, perilla 16×16 radio 2 px). Encendido: pista ámbar y perilla carbón.
- **Selector de opciones (chips):** seleccionado con fondo ámbar y texto carbón; no seleccionado con borde `--linea` y texto `--gris-texto`.
- **Pestañas:** texto `--gris-texto`; la activa en `--chasis` con subrayado ámbar de 2 px.
- **Indicador de dispositivo:** borde `--linea`, punto ámbar si está conectado y gris si no.
- **Deslizadores:** pista `--linea`, recorrido y perilla ámbar.
- **Foco con teclado:** contorno ámbar de 2 px con 2 px de separación, en todo elemento interactivo.
- **Íconos:** Lucide, trazo de 1,5 px, 16–20 px (22 en la barra del celular).
- **Espaciado:** múltiplos de 4. Radio general 4 px. Bordes 1 px.

## 5. Pantallas de referencia
- **Escritorio (Estudio):**
  - Barra superior: logo, toma, pestañas Estudio, Tutorial, Partitura y En vivo, más Exportar y Grabar.
  - Panel izquierdo: fuentes y tomas.
  - Centro: formatos, plantillas y visualizador.
  - Panel derecho: tema, notas, efectos, pedales y cámara.
  - Abajo: transporte con LCD y la línea de tiempo con carriles de mano derecha, mano izquierda, pedal y video.
- **App de PC (elegida por Jacobo, 2026-11-17: "Estudio directo"):** la misma pantalla del Estudio con todas sus funciones, más un menú Archivo (Nuevo, Abrir MIDI o audio, Abrir reciente, Guardar MIDI, Exportar video, Exportar partitura, Abrir carpeta de proyectos, con atajos) y una bienvenida al abrir (Grabar, Abrir MIDI, De MP3 a MIDI y lo abierto hace poco).
- **Celular (elegida por Jacobo, 2026-11-17: "Piezas primero", reemplaza la versión anterior de P16):**
  - Inicio en vertical: botón grande Grabar, Abrir MIDI, De MP3 a MIDI y tus piezas en cuadrícula.
  - Al abrir una pieza o grabar, la pantalla gira a **horizontal**: el piano y la partitura nunca van en vertical. Arriba, volver, título, modos Ver, Partitura, Practicar y Grabar, y Exportar; abajo, el transporte.
- **Las dos apps** abren con la animación del logo (una vez por sesión).
- Prototipo navegable: lienzo "Impromptu: apps de PC y celular" (https://claude.ai/code/artifact/dc619236-86c2-4e3c-863a-29c55fbfa2ec).

## 6. Reglas para que no parezca hecho con IA
**Sí:**
- Carbón y paneles en dos tonos.
- Ámbar solo para lo activo.
- Botones como teclas físicas.
- Números y etiquetas en mono.
- Íconos de línea.
- Brillo y chispas solo dentro del visualizador.

**No:**
- Degradados, vidrio esmerilado ni desenfoques decorativos.
- Neón o brillos en botones y paneles.
- Ámbar rellenando áreas grandes.
- Inter, Roboto o pesos 700.
- Emojis, íconos rellenos o de chispitas.
- Sombras difusas de tarjeta flotante.
- Bordes de color solo a la izquierda de una tarjeta.
- Textos de relleno tipo "lorem ipsum" o "¡Desbloquea tu potencial!".

## 7. Voz de la interfaz
- Español claro, tú, frases cortas, verbos al inicio: "Grabar", "Exportar video", "Calibrar teclas".
- Sin "por favor", sin "exitosamente" y sin signos de exclamación en mensajes del sistema.
- Errores: qué pasó y qué hacer. Ejemplo: "No encontramos tu teclado. Revisa el cable USB y vuelve a intentar."
