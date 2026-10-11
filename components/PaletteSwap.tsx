"use client";

// Cycles the four accent palettes (navy and oxford never change).
// The choice is remembered on this device.

import { useSyncExternalStore } from "react";

const COUNT = 4;

export const paletteScript = `try{var p=+localStorage.getItem('palette');if(p>1&&p<=${COUNT})document.documentElement.classList.add('pal-'+p)}catch(e){}`;

const current = () => {
  const m = document.documentElement.className.match(/pal-(\d)/);
  return m ? +m[1] : 1;
};
const subscribe = (cb: () => void) => {
  window.addEventListener("palette", cb);
  return () => window.removeEventListener("palette", cb);
};

export function PaletteSwap({ variant = "chip" }: { variant?: "chip" | "stamp" }) {
  const n = useSyncExternalStore(subscribe, current, () => 1);

  const swap = () => {
    const next = (n % COUNT) + 1;
    const root = document.documentElement;
    for (let i = 2; i <= COUNT; i++) root.classList.remove(`pal-${i}`);
    if (next > 1) root.classList.add(`pal-${next}`);
    try {
      localStorage.setItem("palette", String(next));
    } catch {}
    window.dispatchEvent(new Event("palette"));
  };

  if (variant === "stamp") {
    return (
      <button type="button" className="stamp-btn" onClick={swap} aria-label={`Swap colour palette, now ${n} of ${COUNT}`}>
        <span>Swap</span>
        <span>colour</span>
        <small>{n}/{COUNT}</small>
      </button>
    );
  }

  return (
    <button type="button" className="swap-chip" onClick={swap} aria-label={`Swap colour palette, now ${n} of ${COUNT}`}>
      <span className="dots" aria-hidden="true">
        <i style={{ background: "var(--a1)" }} />
        <i style={{ background: "var(--a2)" }} />
        <i style={{ background: "var(--a3)" }} />
        <i style={{ background: "var(--a4)" }} />
      </span>
      <span className="swap-txt">{n}/{COUNT}</span>
    </button>
  );
}
