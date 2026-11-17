# App de Android (para probar)

La web de Impromptu empaquetada con Capacitor (ADR-018). Es para probar en el celular: la app
definitiva será nativa. Todo queda en D: (Java 21 en `D:\tools`, SDK en `D:\Android\sdk`,
Gradle en `D:\.cache\gradle`).

- `pnpm --filter @impromptu/mobile sync`: compila la web y la pasa al proyecto de Android.
- `pnpm --filter @impromptu/mobile apk`: arma `android/app/build/outputs/apk/debug/app-debug.apk`.

El teclado MIDI por cable OTG usa un puente propio (`ImpromptuMidi`), porque la vista web de
Android no trae Web MIDI.
