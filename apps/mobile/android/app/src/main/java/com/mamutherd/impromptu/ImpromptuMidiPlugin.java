package com.mamutherd.impromptu;

import android.content.Context;
import android.content.pm.PackageManager;
import android.media.midi.MidiDevice;
import android.media.midi.MidiDeviceInfo;
import android.media.midi.MidiManager;
import android.media.midi.MidiOutputPort;
import android.media.midi.MidiReceiver;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;

/**
 * Puente MIDI para la app de prueba (ADR-018): la vista web de Android no trae Web MIDI, así
 * que este plugin lista los teclados conectados por USB (cable OTG), abre el elegido y pasa cada
 * mensaje a la página, donde un relleno de navigator.requestMIDIAccess lo entrega a la app.
 */
@CapacitorPlugin(name = "ImpromptuMidi")
public class ImpromptuMidiPlugin extends Plugin {
    private MidiManager manager;
    private MidiDevice openDevice;
    private MidiOutputPort openPort;
    private final Handler main = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        if (!getContext().getPackageManager().hasSystemFeature(PackageManager.FEATURE_MIDI)) return;
        manager = (MidiManager) getContext().getSystemService(Context.MIDI_SERVICE);
        if (manager == null) return;
        manager.registerDeviceCallback(new MidiManager.DeviceCallback() {
            @Override
            public void onDeviceAdded(MidiDeviceInfo info) {
                notifyListeners("devices", devicesObject());
            }

            @Override
            public void onDeviceRemoved(MidiDeviceInfo info) {
                notifyListeners("devices", devicesObject());
            }
        }, main);
    }

    /** Teclados con al menos una salida MIDI (lo que el teclado envía al celular). */
    private JSObject devicesObject() {
        JSArray list = new JSArray();
        if (manager != null) {
            for (MidiDeviceInfo info : manager.getDevices()) {
                if (info.getOutputPortCount() == 0) continue;
                Bundle p = info.getProperties();
                JSObject d = new JSObject();
                d.put("id", String.valueOf(info.getId()));
                String name = p.getString(MidiDeviceInfo.PROPERTY_PRODUCT);
                if (name == null) name = p.getString(MidiDeviceInfo.PROPERTY_NAME);
                d.put("name", name != null ? name : "Teclado MIDI");
                String maker = p.getString(MidiDeviceInfo.PROPERTY_MANUFACTURER);
                d.put("manufacturer", maker != null ? maker : "");
                list.put(d);
            }
        }
        JSObject out = new JSObject();
        out.put("available", manager != null);
        out.put("devices", list);
        return out;
    }

    @PluginMethod
    public void devices(PluginCall call) {
        call.resolve(devicesObject());
    }

    @PluginMethod
    public void open(PluginCall call) {
        String id = call.getString("id");
        if (manager == null || id == null) {
            call.reject("Este celular no tiene MIDI");
            return;
        }
        MidiDeviceInfo target = null;
        for (MidiDeviceInfo info : manager.getDevices()) {
            if (String.valueOf(info.getId()).equals(id)) target = info;
        }
        if (target == null) {
            call.reject("No encontramos ese teclado");
            return;
        }
        closeCurrent();
        final String deviceId = id;
        manager.openDevice(target, device -> {
            if (device == null) {
                call.reject("No se pudo abrir el teclado");
                return;
            }
            openDevice = device;
            openPort = device.openOutputPort(0);
            if (openPort == null) {
                call.reject("El teclado no tiene salida MIDI");
                return;
            }
            openPort.connect(new MidiReceiver() {
                @Override
                public void onSend(byte[] msg, int offset, int count, long timestamp) {
                    JSArray bytes = new JSArray();
                    for (int i = 0; i < count; i++) bytes.put(msg[offset + i] & 0xFF);
                    JSObject event = new JSObject();
                    event.put("id", deviceId);
                    event.put("data", bytes);
                    notifyListeners("message", event);
                }
            });
            call.resolve();
        }, main);
    }

    @PluginMethod
    public void close(PluginCall call) {
        closeCurrent();
        call.resolve();
    }

    private void closeCurrent() {
        try {
            if (openPort != null) openPort.close();
            if (openDevice != null) openDevice.close();
        } catch (IOException ignored) {
            // Ya estaba cerrado.
        }
        openPort = null;
        openDevice = null;
    }
}
