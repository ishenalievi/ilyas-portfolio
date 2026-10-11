// The four full-screen transitions, written as plain DOM animations.
// Each one is split into a "cover" half (hides the old page) and a
// "reveal" half (shows the new one), so the route can change in between.

import { rng, tornClip } from "@/lib/torn";

export type Kind = "strips" | "rip" | "menace" | "tbc" | "fade";

export type Run = {
  cover: () => Promise<void>;
  reveal: () => Promise<void>;
};

const EASE = "cubic-bezier(.7,0,.25,1)";

export function createRun(ov: HTMLElement, kind: Kind, text: string, skipped: () => boolean): Run {
  const el = (cls: string, parent: HTMLElement = ov, html?: string) => {
    const d = document.createElement("div");
    d.className = cls;
    if (html !== undefined) d.textContent = html;
    parent.appendChild(d);
    return d;
  };
  const fin = (a: Animation) => (skipped() ? Promise.resolve() : a.finished.then(() => undefined, () => undefined));
  const all = (list: Animation[]) => Promise.all(list.map(fin)).then(() => undefined);
  const wait = (ms: number) =>
    new Promise<void>((res) => {
      const t0 = performance.now();
      const tick = () => (skipped() || performance.now() - t0 >= ms ? res() : setTimeout(tick, 30));
      tick();
    });

  if (kind === "strips") {
    const cols = ["var(--a1)", "var(--a3)", "var(--a2)", "var(--paper)", "var(--a4)", "var(--navy-fixed)"];
    const strips = cols.map((c, i) => {
      const d = el("ov-strip");
      d.style.top = `${(i * 100) / 6 - 2}%`;
      d.style.height = `${100 / 6 + 4}%`;
      d.style.backgroundColor = c;
      d.style.clipPath = tornClip("trbl", 16, i + 7);
      d.style.transform = "translateX(-110%)";
      return d;
    });
    const lab = el("ov-label", ov, text);
    lab.style.clipPath = tornClip("trbl", 6, 99);
    return {
      cover: async () => {
        await all(strips.map((d, i) => d.animate([{ transform: "translateX(-110%) rotate(-2deg)" }, { transform: "translateX(0) rotate(0)" }], { duration: 620, delay: i * 70, easing: EASE, fill: "forwards" })));
        await fin(lab.animate([{ opacity: 0, transform: "translate(-50%,-50%) scale(.6) rotate(-12deg)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-4deg)" }], { duration: 320, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "forwards" }));
        await wait(350);
      },
      reveal: async () => {
        await wait(150);
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: "forwards" });
        await all(strips.map((d, i) => d.animate([{ transform: "translateX(0)" }, { transform: "translateX(110%) rotate(2deg)" }], { duration: 620, delay: i * 70, easing: EASE, fill: "forwards" })));
      },
    };
  }

  if (kind === "rip") {
    const r = rng(42);
    const seam: [number, number][] = [];
    for (let y = 0; y < 100; y += 1.5 + r() * 2.5) seam.push([50 + (r() - 0.5) * 6 + (y - 50) * 0.06, y]);
    seam.push([53, 100]);
    const poly = (side: "L" | "R", off: number, jit: number, rr: () => number) => {
      const pts = seam.map(([x, y]) => `${(x + off + (rr() - 0.5) * jit).toFixed(2)}% ${y.toFixed(2)}%`).join(",");
      return side === "L" ? `polygon(0 0,${pts},0 100%)` : `polygon(100% 0,${pts},100% 100%)`;
    };
    const faceRng = rng(7);
    const half = (side: "L" | "R") => {
      const h = el("ov-half");
      const fib = el("fib", h);
      const face = el("face", h);
      el("big", face, text);
      el("small", face, "tear here");
      fib.style.clipPath = poly(side, side === "L" ? 0.8 : -0.8, 1.2, rng(side === "L" ? 5 : 9));
      fib.style.opacity = "0";
      face.style.clipPath = poly(side, 0, 0, faceRng);
      h.style.transform = "translateY(-105%)";
      return { h, fib };
    };
    const L = half("L");
    const R = half("R");
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "ov-seam");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    const d = seam.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
    const line = (color: string, w: number) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("vector-effect", "non-scaling-stroke");
      p.setAttribute("pathLength", "1");
      p.setAttribute("stroke-dasharray", "1");
      p.setAttribute("stroke-dashoffset", "1");
      p.style.stroke = color;
      p.style.strokeWidth = String(w);
      svg.appendChild(p);
      return p;
    };
    const l1 = line("var(--fiber)", 9);
    const l2 = line("var(--navy-fixed)", 2.5);
    svg.style.opacity = "0";
    ov.appendChild(svg);
    const sfx = el("ov-sfx", ov, "ビリッ!");
    return {
      cover: async () => {
        await all([L.h, R.h].map((h) => h.animate([{ transform: "translateY(-105%)" }, { transform: "translateY(0)" }], { duration: 750, easing: EASE, fill: "forwards" })));
        await wait(250);
      },
      reveal: async () => {
        svg.style.opacity = "1";
        await all([l1, l2].map((p) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 550, easing: "cubic-bezier(.5,0,.8,.6)", fill: "forwards" })));
        svg.style.opacity = "0";
        L.fib.style.opacity = "1";
        R.fib.style.opacity = "1";
        // stage 1: the left side is ripped away
        L.h.style.transformOrigin = "0% 0%";
        sfx.animate([{ opacity: 0, transform: "scale(.3) rotate(-20deg)" }, { opacity: 1, transform: "scale(1.2) rotate(-8deg)", offset: 0.35 }, { opacity: 1, transform: "scale(1) rotate(-10deg)", offset: 0.7 }, { opacity: 0, transform: "scale(1) rotate(-10deg)" }], { duration: 900, easing: "ease-out", fill: "forwards" });
        await fin(L.h.animate([{ transform: "none" }, { transform: "translate(-1.5%, .5%) rotate(-3deg)", offset: 0.22 }, { transform: "translate(-25vw, 115vh) rotate(-32deg)" }], { duration: 900, easing: "cubic-bezier(.5,0,.65,1)", fill: "forwards" }));
        await wait(200);
        // stage 2: the other side is dragged off-screen
        await fin(R.h.animate([{ transform: "none" }, { transform: "translateX(-2%) rotate(-.6deg)", offset: 0.2 }, { transform: "translateX(112vw) rotate(7deg)" }], { duration: 750, easing: "cubic-bezier(.6,0,.3,1)", fill: "forwards" }));
      },
    };
  }

  if (kind === "menace") {
    const bg = el("ov-menace");
    bg.style.clipPath = "circle(0% at 85% 15%)";
    const g = el("ov-gogo", bg);
    const chars = [0, 1, 2].map(() => {
      const b = document.createElement("b");
      b.textContent = "ゴ";
      b.style.opacity = "0";
      g.appendChild(b);
      return b;
    });
    el("ov-mlabel", bg, text);
    return {
      cover: async () => {
        await fin(bg.animate([{ clipPath: "circle(0% at 85% 15%)" }, { clipPath: "circle(150% at 85% 15%)" }], { duration: 650, easing: EASE, fill: "forwards" }));
        await all(chars.map((b, i) => b.animate([{ transform: "scale(0) rotate(-30deg)", opacity: 0 }, { transform: "scale(1.3) rotate(8deg)", opacity: 1, offset: 0.6 }, { transform: "scale(1) rotate(0)", opacity: 1 }], { duration: 400, delay: i * 150, easing: "ease-out", fill: "both" })));
        await wait(600);
      },
      reveal: async () => {
        await fin(bg.animate([{ clipPath: "circle(150% at 15% 85%)" }, { clipPath: "circle(0% at 15% 85%)" }], { duration: 600, easing: EASE, fill: "forwards" }));
      },
    };
  }

  if (kind === "tbc") {
    const f = el("ov-sepia");
    const a = el("ov-tbc", ov, "TO BE CONTINUED");
    const nt = el("ov-tbcnote", ov, text);
    a.style.transform = "translateX(-130%)";
    return {
      cover: async () => {
        f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" });
        await fin(a.animate([{ transform: "translateX(-130%)" }, { transform: "translateX(0)" }], { duration: 600, delay: 200, easing: "cubic-bezier(.2,.9,.3,1)", fill: "forwards" }));
        nt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards" });
        await wait(1100);
      },
      reveal: async () => {
        await all([f, a, nt].map((x) => x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })));
      },
    };
  }

  // fade: used when the visitor's device asks for reduced motion
  const d = el("ov-fade", ov, text);
  d.style.opacity = "0";
  return {
    cover: async () => {
      await fin(d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, fill: "forwards" }));
      await wait(250);
    },
    reveal: async () => {
      await fin(d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }));
    },
  };
}
