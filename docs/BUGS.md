# BUGS — trampas conocidas y registro

## Trampas conocidas (léelas antes de tocar estas áreas)

| # | Área | Trampa | Cómo evitarla |
|---|---|---|---|
| B-001 | MIDI | Muchos teclados mandan *note on* con velocity 0 en lugar de *note off* | Tratar `0x9n` con velocity 0 como note off |
| B-002 | MIDI | Notas abiertas al parar de grabar o al desconectar el teclado | Cerrarlas con el tiempo de parada |
| B-003 | MIDI | Los teclados Yamaha y otros envían *active sensing* (0xFE) constantemente | Filtrar 0xFE, 0xF8 (clock) y demás mensajes de sistema |
| B-004 | MIDI | El pedal no siempre es 0/127: algunos mandan valores intermedios (medio pedal) | Guardar el valor completo; "pisado" si ≥ 64 para lógica binaria |
| B-005 | MIDI | Pedal FC4/FC5 con polaridad invertida según el teclado | Opción "invertir pedal" en ajustes del dispositivo |
| B-006 | MIDI | Web MIDI pide permiso y no existe en Safari | Detectar `navigator.requestMIDIAccess` y mostrar un aviso con alternativa |
| B-007 | MIDI | Usar la hora de llegada al handler en vez de `event.timeStamp` | Siempre `MIDIMessageEvent.timeStamp` |
| B-008 | Audio | `AudioContext` empieza suspendido hasta un gesto del usuario | Reanudar en el primer clic o tecla |
| B-009 | Audio | Doble sonido: el teclado suena por sus parlantes y la app también | Interruptor "sonido de la app" visible al conectar |
| B-010 | Video | Deriva de sincronía en videos largos de celular (fps variable) | Usar los timestamps de cada cuadro, no asumir fps fijo |
| B-011 | Exportar | Códec H.264 o AAC no disponible en algún navegador | `VideoEncoder.isConfigSupported` antes de empezar; ofrecer WebM |
| B-012 | Exportar | Partículas distintas en cada exportación | RNG con semilla por nota |
| B-013 | Render | Crear un objeto por nota en cada cuadro (basura y tirones) | Pool de sprites y geometría instanciada |
| B-014 | Teclado | Calcular posiciones de teclas negras como si fueran equidistantes | Usar posición por clase de nota (ver `render/keyboard`) |
| B-015 | Rango | MIDI de 88 teclas en teclado de 61 | Modo automático de rango y aviso de notas fuera de rango |
| B-016 | PWA | Caché vieja tras actualizar | Aviso "Hay una versión nueva. Recargar" |
| B-017 | Celular | La pantalla se apaga durante la grabación | Wake Lock API mientras se graba |

## Registro de bugs
```
### BUG-XXX · título
- Dónde:
- Cómo reproducir:
- Esperado / obtenido:
- Causa:
- Arreglo y prueba que lo cubre:
```
