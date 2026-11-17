# PENDIENTES — decisiones e insumos de Jacobo

Claude Code: si algo de esta lista bloquea tu tarea, usa el valor provisional, marca el código con `// PROVISIONAL(Pn)` y sigue. Jacobo: cuando decidas, cambia el estado y anota la fecha.

| # | Pendiente | Provisional | Estado |
|---|---|---|---|
| P1 | **Licencia del proyecto.** Opciones: GPL-3.0 (las copias deben seguir abiertas), MPL-2.0 (punto medio) o MIT (permisiva). Recomendación: **GPL-3.0**, que protege que nadie lo cierre y lo venda. Como dueño del código, igual puedes tener un plan pago tuyo. | GPL-3.0 | Abierto |
| P2 | Nombre en GitHub (usuario u organización) y dominio (revisar disponibilidad de impromptu.app, .studio, .music) | `impromptu` | Abierto |
| P3 | Revisión de marca "Impromptu" en Colombia (SIC) antes de lanzar la v0.1 | — | Abierto |
| P4 | **Fixtures reales:** grabar 5 piezas en el PSR-E343 con MIDI + WAV + video desde arriba (lenta, rápida, mucho pedal, acordes, mano cruzada) y subirlas a `fixtures/` | MIDIs sintéticos | Abierto |
| P5 | Modelo de celular Android para probar (y si tienes cable OTG) | — | Abierto |
| P6 | Soporte para la cámara desde arriba (trípode o brazo) | — | Abierto |
| P7 | Activar GitHub Sponsors (necesita cuenta bancaria en Colombia y datos tributarios) | — | Abierto |
| P8 | Idioma de la interfaz: solo español al inicio, o español e inglés desde la v0.1 | Español con textos preparados para traducir | Abierto |
| P9 | ¿Telemetría opcional y anónima para saber qué se usa? | No | Abierto |
| P10 | Temas extra del visualizador que quieras para la v0.1 (nombres y colores) | Ámbar, Sala, Medianoche, Tinta | Abierto |
| P11 | ¿Se publican en el repo (público) las grabaciones de `fixtures/jacobo/`? Hoy hay 4 piezas copiadas de `C:\Cakewalk Projects` (Consuelo, Nostalgia, Sorry I filed you, I'm still learning to be better), en MIDI y MP3 | Fuera de git (`.gitignore`); las pruebas de CI usan MIDIs sintéticos | Abierto |
| P12 | **Celular como app instalable, no web, y sin conexión en todo lo posible** | Resuelto en ADR-008: misma interfaz empaquetada como APK (Tauri 2 móvil o Capacitor, se elige en la fase 8) | Decidido 2026-11-16 |
| P13 | Yamaha: Jacobo tiene el controlador USB-MIDI de Yamaha en Descargas. Ver en la fase 2 si Windows reconoce el PSR-E343 sin él | Probar primero sin el controlador | Abierto |
| P14 | Logo y video de marca (pedirlo cuando se quiera, no antes): (1) la nota ámbar de la "i" parece tocar el palo; DESIGN §1 pide que vaya separada. Se corrige en `Logo.module.css` y en la constante `WORD_NOTE` de `LogoIntro.tsx` a la vez. (2) Otros formatos del MP4: `pnpm intro:mp4 1080 1920` (vertical) y `pnpm intro:mp4 1080 1080` (cuadrado) | Tal como está | En espera de Jacobo |
