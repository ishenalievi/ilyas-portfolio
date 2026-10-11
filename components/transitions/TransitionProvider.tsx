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
      const run = createRun(ov, reduced() ? "fade" : kind, label, () => skip.current);
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

  // First visit of the session: the menacing intro.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("intro-seen") === "1";
      sessionStorage.setItem("intro-seen", "1");
    } catch {}
    if (!seen) play("menace", "Ilyas is approaching");
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
    ovRef.current.getAnimations({ subtree: true }).forEach((a) => a.finish());
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
