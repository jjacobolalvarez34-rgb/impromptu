package com.mamutherd.impromptu;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Puente MIDI propio (teclado por cable OTG): se registra antes de crear la vista web.
        registerPlugin(ImpromptuMidiPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
