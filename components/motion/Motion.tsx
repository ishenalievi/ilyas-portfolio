"use client";

// Starts the page motion (scenes.ts). GSAP and Lenis are loaded on demand, after the page has
// painted, so they never hold up the first screen; the intro card covers the page meanwhile.

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes = () => import("./scenes");

/** Runs start() from the loaded module unless the effect was cleaned up first. */
function useScene(start: (m: Awaited<ReturnType<typeof scenes>>) => (() => void) | undefined, deps: unknown[]) {
  useEffect(() => {
    if (reduced()) return;
    let stop: (() => void) | undefined;
    let live = true;
    scenes().then((m) => {
      if (live) stop = start(m);
    });
    return () => {
      live = false;
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are passed through
  }, deps);
}

export function Motion() {
  const pathname = usePathname();
  useScene((m) => m.smooth(), []);
  useScene((m) => {
    const main = document.getElementById("main");
    return main ? m.page(main) : undefined;
  }, [pathname]);
  return null;
}
