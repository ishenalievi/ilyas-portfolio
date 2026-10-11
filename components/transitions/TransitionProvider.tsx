"use client";

// Plays a full-screen transition around every page change:
// cover the screen, switch the page underneath, then reveal it.

import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createRun, type Kind } from "./engine";

type Go = (href: string, opts: { kind: Kind; label: string }) => void;

const Ctx = createContext<Go>(() => {});
export const useGo = () => useContext(Ctx);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const ovRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const skip = useRef(false);
  const pending = useRef<{ path: string; resolve: () => void } | null>(null);
  // where and when the visitor last pressed, so a transition can start from that spot
  const lastPress = useRef<{ x: number; y: number; t: number } | null>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      lastPress.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    return () => window.removeEventListener("pointerdown", onDown, { capture: true });
  }, []);
  const pressOrigin = () => {
    const p = lastPress.current;
    return p && performance.now() - p.t < 1500 ? { x: p.x, y: p.y } : undefined;
  };

  // Resolve the waiting transition once the new page is on screen.
  useEffect(() => {
    if (pending.current && pending.current.path === pathname) {
      const p = pending.current;
      pending.current = null;
      setTimeout(p.resolve, 60);
    }
  }, [pathname]);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const play = useCallback(async (kind: Kind, label: string, between?: () => Promise<void>) => {
    const ov = ovRef.current;
    if (!ov || busy.current) return;
    busy.current = true;
    skip.current = false;
    ov.replaceChildren();
    ov.hidden = false;
    try {
      const run = createRun(ov, reduced() ? "fade" : kind, label, () => skip.current, pressOrigin());
      await run.cover();
      if (between) await between();
      skip.current = false;
      await run.reveal();
    } catch {
      // never leave the overlay stuck on screen
    } finally {
      ov.hidden = true;
      ov.replaceChildren();
      busy.current = false;
    }
  }, []);

  const go = useCallback<Go>(
    (href, { kind, label }) => {
      if (busy.current) return;
      const url = new URL(href, window.location.href);
      const external = url.origin !== window.location.origin;
      if (external) {
        // To Be Continued, then leave. The overlay stays up while the new site loads.
        const ov = ovRef.current;
        if (!ov) return void (window.location.href = href);
        busy.current = true;
        skip.current = false;
        ov.replaceChildren();
        ov.hidden = false;
        const run = createRun(ov, reduced() ? "fade" : kind, label, () => skip.current);
        run.cover().finally(() => {
          window.location.href = href;
        });
        return;
      }
      if (url.pathname === window.location.pathname) {
        router.push(url.pathname + url.search + url.hash);
        return;
      }
      play(kind, label, () =>
        new Promise<void>((resolve) => {
          pending.current = { path: url.pathname, resolve };
          router.push(url.pathname + url.search + url.hash);
          // fallback in case the page takes unusually long
          setTimeout(() => {
            if (pending.current?.resolve === resolve) {
              pending.current = null;
              resolve();
            }
          }, 6000);
        }),
      );
    },
    [play, router],
  );

  // Every full page load (first visit or reload): the menacing intro.
  // Moving between pages inside the site keeps this provider mounted, so it doesn't replay.
  useEffect(() => {
    play("menace", "Ilyas is approaching");
  }, [play]);

  // Coming back with the browser's back button after leaving: clear the overlay.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted && ovRef.current) {
        ovRef.current.hidden = true;
        ovRef.current.replaceChildren();
        busy.current = false;
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // Any click or key skips the current animation.
  const doSkip = () => {
    if (!busy.current || !ovRef.current) return;
    skip.current = true;
    ovRef.current.getAnimations({ subtree: true }).forEach((a) => {
      // looping effects (like the ゴゴゴ tremble) have no end to jump to
      if (a.effect?.getComputedTiming().endTime !== Infinity) a.finish();
    });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (busy.current && ["Escape", " ", "Enter"].includes(e.key)) {
        e.preventDefault();
        doSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={go}>
      {children}
      <div ref={ovRef} className="ov" hidden aria-hidden="true" onClick={doSkip} />
    </Ctx.Provider>
  );
}
