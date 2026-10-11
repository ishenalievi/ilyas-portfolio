// The four full-screen transitions, written as plain DOM animations.
// Each one is split into a "cover" half (hides the old page) and a
// "reveal" half (shows the new one), so the route can change in between.

import { rng, tornClip } from "@/lib/torn";

export type Kind = "strips" | "zipper" | "book" | "timestop" | "menace" | "tbc" | "fade";

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

  if (kind === "zipper") {
    // Sticky Fingers: two panels zip shut down the middle, then unzip to reveal the page.
    const steps = [0, 0.25, 0.5, 0.75, 1];
    const shape = (side: "L" | "R", t: number) => {
      // t = how far the zip has closed (0 open V, 1 fully shut)
      const y = (t * 100).toFixed(1);
      const w = (50 * (1 - t)).toFixed(1);
      return side === "L"
        ? `polygon(0% 0%, 50% 0%, 50% ${y}%, ${(50 - +w).toFixed(1)}% 100%, 0% 100%)`
        : `polygon(100% 0%, 50% 0%, 50% ${y}%, ${(50 + +w).toFixed(1)}% 100%, 100% 100%)`;
    };
    const panel = (side: "L" | "R") => {
      const p = el(`zp-panel zp-${side}`);
      p.style.clipPath = shape(side, 0);
      p.style.transform = `translateX(${side === "L" ? -105 : 105}%)`;
      return p;
    };
    const L = panel("L");
    const R = panel("R");
    const teeth = el("zp-teeth");
    teeth.style.height = "0%";
    const pull = el("zp-pull");
    pull.style.top = "0%";
    pull.style.opacity = "0";
    const sfx = el("zp-sfx", ov, "ジィーッ!");
    const lab = el("zp-label", ov, text);
    lab.style.clipPath = tornClip("trbl", 6, 51);
    const zip = (from: number, to: number, ms: number) => {
      const ts = steps.map((s) => from + (to - from) * s);
      const opts: KeyframeAnimationOptions = { duration: ms, easing: "cubic-bezier(.45,0,.55,1)", fill: "forwards" };
      return [
        L.animate(ts.map((t) => ({ clipPath: shape("L", t) })), opts),
        R.animate(ts.map((t) => ({ clipPath: shape("R", t) })), opts),
        teeth.animate([{ height: `${from * 100}%` }, { height: `${to * 100}%` }], opts),
        pull.animate([{ top: `${from * 100}%` }, { top: `${to * 100}%` }], opts),
      ];
    };
    return {
      cover: async () => {
        await all([L, R].map((p, i) => p.animate([{ transform: `translateX(${i ? 105 : -105}%)` }, { transform: "translateX(0)" }], { duration: 500, easing: EASE, fill: "forwards" })));
        pull.style.opacity = "1";
        sfx.animate([{ opacity: 0, transform: "scale(.4) rotate(-15deg)" }, { opacity: 1, transform: "scale(1.15) rotate(-6deg)", offset: 0.3 }, { opacity: 1, transform: "scale(1) rotate(-8deg)", offset: 0.8 }, { opacity: 0, transform: "scale(1) rotate(-8deg)" }], { duration: 900, fill: "forwards" });
        await all(zip(0, 1, 850));
        await fin(lab.animate([{ opacity: 0, transform: "translate(-50%,-50%) scale(.6) rotate(-10deg)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-4deg)" }], { duration: 320, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "forwards" }));
        await wait(350);
      },
      reveal: async () => {
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
        await wait(120);
        await all(zip(1, 0, 800));
        pull.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" });
        await all([L, R].map((p, i) => p.animate([{ transform: "translateX(0)" }, { transform: `translateX(${i ? 105 : -105}%)` }], { duration: 480, easing: EASE, fill: "forwards" })));
      },
    };
  }

  if (kind === "book") {
    // Heaven's Door: the screen turns into a book. Pages swing in, then flip away one by one.
    const wrap = el("bk-wrap");
    const pages = [0, 1, 2].map((i) => {
      const pg = el("bk-page", wrap);
      const r = rng(300 + i);
      const lines = el("bk-lines", pg);
      for (let n = 0; n < 16; n++) {
        const ln = document.createElement("i");
        ln.style.width = `${45 + r() * 50}%`;
        ln.style.transform = `rotate(${(r() - 0.5) * 1.2}deg)`;
        lines.appendChild(ln);
      }
      el("bk-num", pg, String(100 + i * 2 + Math.floor(r() * 40)));
      if (i === 2) {
        el("bk-title", pg, text);
        el("bk-note", pg, "← it's all written down");
      }
      el("bk-shade", pg);
      pg.style.transform = "rotateY(100deg)";
      return pg;
    });
    const sfx = el("bk-sfx", ov, "ペラッ");
    return {
      cover: async () => {
        await all(pages.map((pg, i) => pg.animate([{ transform: "rotateY(100deg)" }, { transform: "rotateY(0deg)" }], { duration: 650, delay: i * 130, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" })));
        await wait(450);
      },
      reveal: async () => {
        sfx.animate([{ opacity: 0, transform: "scale(.5) rotate(10deg)" }, { opacity: 1, transform: "scale(1.1) rotate(4deg)", offset: 0.3 }, { opacity: 0, transform: "scale(1) rotate(6deg)" }], { duration: 1000, fill: "forwards" });
        const order = [...pages].reverse();
        await all(
          order.flatMap((pg, i) => {
            const shade = pg.querySelector(".bk-shade") as HTMLElement;
            const o: KeyframeAnimationOptions = { duration: 750, delay: i * 200, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" };
            return [pg.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }], o), shade.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.5 }, { opacity: 0 }], o)];
          }),
        );
      },
    };
  }

  if (kind === "timestop") {
    // The World: an inverted sphere freezes the page, then a gold sphere covers it
    // with a stopped clock. Time resumes on the new page.
    const inv = el("tw-inv");
    const gray = el("tw-gray");
    const wall = el("tw-wall");
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "tw-clock");
    const make = (tag: string, attrs: Record<string, string | number>) => {
      const n = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
      svg.appendChild(n);
      return n as SVGElement;
    };
    make("circle", { cx: 50, cy: 50, r: 45, class: "tw-face" });
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      const r1 = i % 3 === 0 ? 33 : 37;
      make("line", { x1: 50 + Math.sin(a) * r1, y1: 50 - Math.cos(a) * r1, x2: 50 + Math.sin(a) * 41, y2: 50 - Math.cos(a) * 41, class: "tw-tick" });
    }
    const hand = (len: number, cls: string, deg: number) => {
      const h = make("line", { x1: 50, y1: 54, x2: 50, y2: 50 - len, class: cls });
      h.style.transformOrigin = "50px 50px";
      h.style.transform = `rotate(${deg}deg)`;
      return h;
    };
    const hour = hand(20, "tw-hour", 300);
    const minute = hand(31, "tw-min", 54);
    const second = hand(36, "tw-sec", 0);
    make("circle", { cx: 50, cy: 50, r: 3, class: "tw-pin" });
    wall.appendChild(svg);
    const lab = el("tw-label", wall, text);
    lab.style.clipPath = tornClip("trbl", 6, 77);
    el("tw-stamp", wall, "Time: stopped");
    const sfx = el("tw-sfx", ov, "ザ・ワールド!");

    const C = (r: number, at = "50% 50%") => `circle(${r}% at ${at})`;
    return {
      cover: async () => {
        // 1. the inverted sphere bursts out from the middle of the page
        await fin(inv.animate([{ clipPath: C(0) }, { clipPath: C(78) }], { duration: 560, easing: "cubic-bezier(.2,.8,.3,1)", fill: "forwards" }));
        // 2. it collapses, leaving the world frozen and grey
        gray.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, fill: "forwards" });
        sfx.animate([{ opacity: 0, transform: "translateX(-50%) scale(1.8) rotate(-6deg)" }, { opacity: 1, transform: "translateX(-50%) scale(1) rotate(-4deg)", offset: 0.4 }, { opacity: 1, transform: "translateX(-50%) scale(1.04) rotate(-4deg)" }], { duration: 700, easing: "ease-out", fill: "forwards" });
        await fin(inv.animate([{ clipPath: C(78) }, { clipPath: C(0) }], { duration: 480, easing: "cubic-bezier(.6,0,.8,.4)", fill: "forwards" }));
        await wait(220);
        // 3. the gold sphere covers everything; the clock ticks, then stops
        second.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(18deg)" }], { duration: 1500, easing: "steps(3, start)", fill: "forwards" });
        await fin(wall.animate([{ clipPath: C(0) }, { clipPath: C(150) }], { duration: 560, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" }));
        await fin(lab.animate([{ opacity: 0, transform: "scale(.6) rotate(-10deg)" }, { opacity: 1, transform: "scale(1) rotate(-4deg)" }], { duration: 300, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "forwards" }));
        await wait(450);
      },
      reveal: async () => {
        // time resumes: the hands spin, the sphere shrinks away, colour comes back
        sfx.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
        hour.animate([{ transform: "rotate(300deg)" }, { transform: "rotate(660deg)" }], { duration: 600, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" });
        await fin(minute.animate([{ transform: "rotate(54deg)" }, { transform: "rotate(1134deg)" }], { duration: 600, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" }));
        await fin(wall.animate([{ clipPath: C(150) }, { clipPath: C(0) }], { duration: 560, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" }));
        await fin(gray.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease-out", fill: "forwards" }));
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
