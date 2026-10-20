"use client";

// The brand booklet's "Play" buttons: run a page transition without leaving the page.

import type { Kind } from "./transitions/engine";
import { usePlay } from "./transitions/TransitionProvider";

export function PlayButton({ kind, label, name }: { kind: Kind; label: string; name: string }) {
  const play = usePlay();
  return (
    <button type="button" className="bb-play" onClick={() => play(kind, label)} aria-label={`Play ${name}`}>
      ▶ Play
    </button>
  );
}
