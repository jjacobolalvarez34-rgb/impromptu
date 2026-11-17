import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

/**
 * Selector de color que no traba la pantalla: el selector nativo dispara decenas de
 * cambios por segundo al arrastrar; aquí se muestran al instante pero se aplican al
 * estudio como mucho una vez por cuadro.
 */
export function ColorField({ label, value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const pending = useRef<string | null>(null);
  const frame = useRef(0);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  // Si el color cambia desde fuera (por ejemplo, al elegir otro tema), se adopta.
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setLocal(value);
  }
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <label>
      <input
        type="color"
        value={local}
        onChange={(e) => {
          const hex = e.target.value.toUpperCase();
          setLocal(hex);
          pending.current = hex;
          if (frame.current) return;
          frame.current = requestAnimationFrame(() => {
            frame.current = 0;
            if (pending.current) onChangeRef.current(pending.current);
          });
        }}
      />
      {label}
    </label>
  );
}
