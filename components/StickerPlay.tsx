"use client";

// Makes the background stickers pressable (the tricks themselves are in sticker-moves.ts).
// Stickers sit behind the page, so presses never reach them directly: the whole document
// listens, and a press counts when nothing solid (paper, a picture, a link) lies over the
// sticker at that spot. Press every sticker on screen and the hidden reward shows up.

import { useEffect, useRef, useState } from "react";
import { Torn } from "./collage";
import { isCovering } from "./motion/bus";
import { MOVES } from "./sticker-moves";

const SOLID = "a, button, input, select, textarea, label, summary, img, video, svg, canvas, iframe, [role], [tabindex]";
const FOUND = "stickers-found";

/** The sticker under the pointer, if nothing solid covers it there. */
function stickerAt(x: number, y: number) {
  const stickers = [...document.querySelectorAll<HTMLElement>(".sticker[data-play]")];
  if (!stickers.some((s) => { const r = s.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; })) return null;
  for (const el of document.elementsFromPoint(x, y)) {
    const hit = stickers.find((s) => s.contains(el));
    if (hit) return hit;
    if (el.matches(SOLID)) return null;
    const s = getComputedStyle(el);
    if (s.backgroundImage !== "none" || !["transparent", "rgba(0, 0, 0, 0)"].includes(s.backgroundColor)) return null;
  }
  return null;
}

const load = (): string[] => {
  try { return JSON.parse(sessionStorage.getItem(FOUND) ?? "[]"); } catch { return []; }
};
const save = (ids: Set<string>) => {
  try { sessionStorage.setItem(FOUND, JSON.stringify([...ids])); } catch {}
};

export function StickerPlay() {
  const layer = useRef<HTMLDivElement>(null);
  const [reward, setReward] = useState(false);

  useEffect(() => {
    const busy = new Set<string>();
    const found = new Set(load());
    const still = matchMedia("(prefers-reduced-motion: reduce)");

    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || isCovering() || !layer.current) return;
      const sticker = stickerAt(e.clientX, e.clientY);
      const id = sticker?.dataset.play;
      const play = sticker?.querySelector<HTMLElement>(".play");
      if (!sticker || !id || !play || !MOVES[id] || busy.has(id)) return;
      busy.add(id);
      MOVES[id]({ sticker, play, layer: layer.current, still: still.matches }).finally(() => busy.delete(id));
      found.add(id);
      save(found);
      const onScreen = [...document.querySelectorAll<HTMLElement>(".sticker[data-play]")].filter((s) => s.checkVisibility());
      if (onScreen.every((s) => found.has(s.dataset.play ?? ""))) {
        found.clear();
        save(found);
        setTimeout(() => setReward(true), 700); // let the last trick land first
      }
    };

    // mouse only: over a sticker it lifts a little and the cursor turns to a hand
    let frame = 0;
    let near: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const now = isCovering() ? null : stickerAt(e.clientX, e.clientY);
        if (now === near) return;
        near?.classList.remove("is-near");
        now?.classList.add("is-near");
        near = now;
        document.body.style.cursor = now ? "pointer" : "";
      });
    };

    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div className="play-layer" ref={layer}>
      {reward && <Reward onClose={() => setReward(false)} />}
    </div>
  );
}

/** The hidden reward: a torn card admits it. Any press, Esc or a few seconds closes it. */
function Reward({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let closing = false;
    const close = () => {
      if (closing || !el) return;
      closing = true;
      el.animate([{ opacity: 1 }, { opacity: 0, transform: still ? "none" : "translateY(1.5rem) rotate(2deg)" }], { duration: 260, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "forwards" }).finished.then(onClose, onClose);
    };
    if (el && !still) {
      el.animate([{ opacity: 0, transform: "translateY(2rem) rotate(-6deg)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
    } else el?.animate([{ opacity: 0 }, { opacity: 1 }], 300);
    const t = setTimeout(close, 7000);
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    // the press that finished the set is already over, so this only hears the next one
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", key);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  return (
    <div className="reward" ref={ref} role="status">
      <div className="lift">
        <Torn seed="reward" className="paper reward-card">
          <p className="reward-big">You found them all.</p>
          <p className="reward-small">You must love me… or my portfolio.</p>
        </Torn>
      </div>
    </div>
  );
}
