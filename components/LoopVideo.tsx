"use client";

// A silent clip on repeat, standing in for a still (hero clippings, episode posters).
// The still is its poster, so it looks finished before the clip loads, and it is all anyone
// with reduced motion sees. It only plays while on screen and after the page transition.

import { useEffect, useRef } from "react";
import type { Img } from "@/lib/content";
import { afterReveal } from "./motion/bus";

export function LoopVideo({ src, poster, className }: { src: string; poster: Img; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    let ready = false;
    const sync = () => (visible && ready && !document.hidden ? v.play().catch(() => {}) : v.pause());
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(v);
    const cancel = afterReveal(() => {
      ready = true;
      sync();
    });
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancel();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster.src}
      width={poster.w}
      height={poster.h}
      aria-label={poster.alt || undefined}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
    />
  );
}
