"use client";

// Everything on the page that moves, apart from the page transitions:
// smooth scrolling (Lenis), the hero entrance, word-by-word headings,
// the highlighter and circle drawing themselves on, and paper pasting in on scroll.
//
// Rules (see .agents/skills/build-awwwards-quality-sites):
// - transitions come first: nothing here starts until the overlay is gone,
//   and Lenis pauses while a transition is on screen;
// - only opacity and CSS variables (fed into `translate` / `scale`) are animated,
//   so CSS hover transforms and rotations are never touched;
// - with reduced motion none of this runs and the page is simply there;
// - without JavaScript the page is complete, because nothing is hidden in CSS.

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { afterReveal, isCovering, watchCovering } from "./bus";

// the site's easing curves, the same ones the transitions use
const curves = () => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  return {
    out: CustomEase.create("site-out", "M0,0 C0.23,1 0.32,1 1,1"),
    pop: CustomEase.create("site-pop", "M0,0 C0.3,1.6 0.5,1 1,1"),
  };
};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// things that paste themselves in as they scroll into view
const PASTE = [".sh .eyebrow", ".sh > p", ".clip", ".post", ".love", ".ledger-rows > li", ".proj", ".vid", ".ep", ".gallery-item", ".more"].join(",");

// A torn sheet draws its shadow as a separate layer beside the paper (TornSheet), so paste the
// wrapper: otherwise the black shadow shows on its own until the paper arrives.
const sheetOf = (el: HTMLElement) => (el.parentElement?.classList.contains("tsheet") ? el.parentElement : el);

export function Motion() {
  const pathname = usePathname();

  // Smooth scrolling, once for the whole visit.
  useEffect(() => {
    if (reduced()) return;
    curves();
    const lenis = new Lenis({ autoRaf: false, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // hold the page still while a transition covers it, then re-measure
    const sync = (covering: boolean) => {
      if (covering) return lenis.stop();
      lenis.start();
      lenis.resize();
      ScrollTrigger.refresh();
    };
    sync(isCovering());
    const unwatch = watchCovering(sync);

    // late fonts and images change the page height
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      unwatch();
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // The motion for each page, set up again after every page change.
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main || reduced()) return;
    const { out, pop } = curves();
    const undo: (() => void)[] = [];
    // drive translate/scale from CSS variables, so CSS keeps its own transforms
    const usesVars = (els: Element[], props: ("translate" | "scale")[]) => {
      els.forEach((el) => {
        const s = (el as HTMLElement).style;
        if (props.includes("translate")) s.translate = "var(--mx, 0px) var(--my, 0px)";
        if (props.includes("scale")) s.scale = "var(--ms, 1)";
      });
      undo.push(() =>
        els.forEach((el) => {
          const s = (el as HTMLElement).style;
          s.translate = "";
          s.scale = "";
        }),
      );
    };
    // Next keeps the previous page mounted but hidden (display: none), so only touch what's shown
    const $ = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, main).filter((el) => el.checkVisibility?.() ?? true);
    const findHero = () => $(".hero")[0];

    const ctx = gsap.context(() => {
      // --- hero: hide the pieces now, while the transition still covers the page
      const hero = findHero();
      const name = $(".hero .ransom > span");
      const heroLines = $(".hero-tag, .hero-actions");
      const clippings = $(".hero-board .hb");
      const tapes = $(".hero-board .tape");
      const portrait = $(".hb-portrait");
      const extras = $(".hero-board .gogo");
      if (hero) {
        usesVars(name, ["scale"]);
        usesVars([...heroLines, ...clippings, ...portrait], ["translate"]);
        usesVars(extras, ["scale"]);
        // the name only gets a stamp (scale), so it is readable from the first frame
        gsap.set(name, { "--ms": 1.18 });
        gsap.set(heroLines, { opacity: 0, "--my": "1rem" });
        gsap.set(clippings, { opacity: 0, "--my": "-3rem" });
        gsap.set(portrait, { opacity: 0, "--my": "2.5rem" });
        gsap.set([...tapes, ...extras], { opacity: 0 });
        gsap.set(extras, { "--ms": 0.6 });
      }

      // --- headings split into words (see SplitWords)
      const words = $("[data-split]").map((h) => ({ h, w: gsap.utils.toArray<HTMLElement>(".w > span", h) }));
      words.forEach(({ w }) => gsap.set(w, { "--wy": "120%" }));

      // --- highlighter and circle (frame 2 of the storyboard)
      const marks = $(".hl");
      const circles = $(".circ");
      gsap.set(marks, { "--hl": "0%" });
      gsap.set(circles, { "--circ": 0 });

      // --- paper that pastes in on scroll (nothing inside the hero)
      const paste = $(PASTE).filter((el) => !el.closest(".hero")).map(sheetOf);
      usesVars(paste, ["translate"]);
      gsap.set(paste, { opacity: 0, "--my": "1.75rem" });
    }, main);

    // --- play it all once the transition has finished
    const cancel = afterReveal(() => {
      ctx.add(() => {
        const hero = findHero();
        if (hero) {
          const tl = gsap.timeline({ defaults: { ease: out } });
          tl.to($(".hero .ransom > span"), { "--ms": 1, duration: 0.5, ease: pop, stagger: 0.1 })
            .to($(".hero-tag, .hero-actions"), { opacity: 1, "--my": "0rem", duration: 0.6, stagger: 0.08 }, 0.15)
            .to($(".hero-board .hb"), { opacity: 1, "--my": "0rem", duration: 0.7, stagger: 0.09 }, 0.05)
            .to($(".hb-portrait"), { opacity: 1, "--my": "0rem", duration: 0.8 }, 0.3)
            .to($(".hero-board .tape"), { opacity: 1, duration: 0.25, stagger: 0.08 }, 0.55)
            .to($(".hero-board .gogo"), { opacity: 1, "--ms": 1, duration: 0.45, ease: pop, stagger: 0.1 }, 0.7);
          undo.push(parallax(hero));
        }

        $("[data-split]").forEach((h) => {
          gsap.to(gsap.utils.toArray<HTMLElement>(".w > span", h), {
            "--wy": "0%",
            duration: 0.8,
            ease: out,
            stagger: 0.045,
            scrollTrigger: { trigger: h, start: "top 88%", once: true },
          });
        });

        $(".hl").forEach((m) => {
          gsap.to(m, { "--hl": "100%", duration: 0.7, ease: out, delay: 0.2, scrollTrigger: { trigger: m, start: "top 85%", once: true } });
        });
        $(".circ").forEach((c) => {
          gsap.to(c, { "--circ": 1, duration: 0.8, ease: out, delay: 0.55, scrollTrigger: { trigger: c, start: "top 85%", once: true } });
        });

        const paste = $(PASTE).filter((el) => !el.closest(".hero")).map(sheetOf);
        ScrollTrigger.batch(paste, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, "--my": "0rem", duration: 0.7, ease: out, stagger: 0.07, overwrite: true }),
        });
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancel();
      ctx.revert();
      undo.forEach((f) => f());
    };
  }, [pathname]);

  return null;
}

/** Storyboard frame 1: the hero board's layers drift slightly with the cursor.
    Mouse only; it settles back on leave, blur or when the tab is hidden. */
function parallax(hero: HTMLElement) {
  const board = hero.querySelector<HTMLElement>(".hero-board");
  if (!board || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
  gsap.set(board, { "--px": 0, "--py": 0 });
  const qx = gsap.quickTo(board, "--px", { duration: 0.9, ease: "power3" });
  const qy = gsap.quickTo(board, "--py", { duration: 0.9, ease: "power3" });
  const clamp = gsap.utils.clamp(-1, 1);
  let frame = 0;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const r = board.getBoundingClientRect();
      qx(clamp((e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      qy(clamp((e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    });
  };
  const settle = () => {
    qx(0);
    qy(0);
  };
  const onVis = () => document.hidden && settle();
  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", settle);
  window.addEventListener("blur", settle);
  document.addEventListener("visibilitychange", onVis);
  return () => {
    cancelAnimationFrame(frame);
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", settle);
    window.removeEventListener("blur", settle);
    document.removeEventListener("visibilitychange", onVis);
    gsap.set(board, { clearProps: "--px,--py" });
  };
}
