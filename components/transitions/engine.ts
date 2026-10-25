// The full-screen transitions, written as plain DOM animations (Web Animations API).
// Each one is split into a "cover" half (hides the old page) and a
// "reveal" half (shows the new one), so the route can change in between.

import { rng, tornClip } from "@/lib/torn";

export type Kind = "strips" | "zipper" | "book" | "timestop" | "tusk" | "emerald" | "menace" | "tbc" | "fade";

export type Run = {
  cover: () => Promise<void>;
  reveal: () => Promise<void>;
};

// Curves from the animation standards: things entering or leaving start fast,
// things moving across the screen ease in and out.
const OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
const POP = "cubic-bezier(.3,1.6,.5,1)"; // small overshoot for stamped labels

/** origin: where the visitor clicked, so some transitions can burst out from that spot. */
export function createRun(ov: HTMLElement, kind: Kind, text: string, skipped: () => boolean, origin?: { x: number; y: number }): Run {
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
        await all(strips.map((d, i) => d.animate([{ transform: "translateX(-110%) rotate(-2deg)" }, { transform: "translateX(0) rotate(0)" }], { duration: 520, delay: i * 50, easing: OUT, fill: "forwards" })));
        await fin(lab.animate([{ opacity: 0, transform: "translate(-50%,-50%) scale(.6) rotate(-12deg)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-4deg)" }], { duration: 280, easing: POP, fill: "forwards" }));
        await wait(120);
      },
      reveal: async () => {
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: OUT, fill: "forwards" });
        await all(strips.map((d, i) => d.animate([{ transform: "translateX(0)" }, { transform: "translateX(110%) rotate(2deg)" }], { duration: 380, delay: i * 40, easing: OUT, fill: "forwards" })));
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
    teeth.style.clipPath = "inset(0 0 100% 0)";
    const pull = el("zp-pull");
    const pullAt = (t: number) => `translate(-50%, -30%) translateY(${(t * 100).toFixed(1)}vh)`;
    pull.style.transform = pullAt(0);
    pull.style.opacity = "0";
    const sfx = el("zp-sfx", ov, "ZZZIP!");
    const lab = el("zp-label", ov, text);
    lab.style.clipPath = tornClip("trbl", 6, 51);
    // gentle in-out for the zip itself (a strong curve stalls, then rushes the middle)
    const ZIP_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
    const DRAWER = "cubic-bezier(0.32, 0.72, 0, 1)";
    const zip = (from: number, to: number, ms: number, easing: string, delay = 0) => {
      const ts = steps.map((s) => from + (to - from) * s);
      const opts: KeyframeAnimationOptions = { duration: ms, delay, easing, fill: "both" };
      return [
        L.animate(ts.map((t) => ({ clipPath: shape("L", t) })), opts),
        R.animate(ts.map((t) => ({ clipPath: shape("R", t) })), opts),
        teeth.animate([{ clipPath: `inset(0 0 ${(100 - from * 100).toFixed(1)}% 0)` }, { clipPath: `inset(0 0 ${(100 - to * 100).toFixed(1)}% 0)` }], opts),
        pull.animate([{ transform: pullAt(from) }, { transform: pullAt(to) }], opts),
      ];
    };
    return {
      // One continuous move: the zip starts while the panels are still landing, the
      // label lands as the zip finishes, and on the way out the panels start leaving
      // while it is still unzipping. No stops between phases.
      cover: async () => {
        const ZIP_AT = 200;
        const ZIP_MS = 620;
        const slide = [L, R].map((p, i) => p.animate([{ transform: `translateX(${i ? 105 : -105}%)` }, { transform: "translateX(0)" }], { duration: 380, easing: OUT, fill: "forwards" }));
        pull.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, delay: ZIP_AT, easing: OUT, fill: "both" });
        sfx.animate([{ opacity: 0, transform: "scale(.6) rotate(-15deg)" }, { opacity: 1, transform: "scale(1.15) rotate(-6deg)", offset: 0.3 }, { opacity: 1, transform: "scale(1) rotate(-8deg)", offset: 0.8 }, { opacity: 0, transform: "scale(1) rotate(-8deg)" }], { duration: 760, delay: ZIP_AT, easing: OUT, fill: "both" });
        const closing = zip(0, 1, ZIP_MS, ZIP_EASE, ZIP_AT);
        const label = lab.animate([{ opacity: 0, transform: "translate(-50%,-50%) scale(.6) rotate(-10deg)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-4deg)" }], { duration: 260, delay: ZIP_AT + ZIP_MS * 0.8, easing: POP, fill: "both" });
        await all([...slide, ...closing, label]);
        await wait(100);
      },
      reveal: async () => {
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: OUT, fill: "forwards" });
        const opening = zip(1, 0, 420, DRAWER);
        pull.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, delay: 260, easing: OUT, fill: "forwards" });
        const leave = [L, R].map((p, i) => p.animate([{ transform: "translateX(0)" }, { transform: `translateX(${i ? 105 : -105}%)` }], { duration: 360, delay: 230, easing: OUT, fill: "both" }));
        await all([...opening, ...leave]);
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
      // starts folded toward the viewer (its back faces us, so it is hidden)
      pg.style.transform = "rotateY(-100deg)";
      return pg;
    });
    const sfx = el("bk-sfx", ov, "FLIP!");
    return {
      cover: async () => {
        // each page comes down onto the stack from the viewer's side, so a page that
        // is in front is always drawn in front and nothing cuts through the pile
        await all(pages.map((pg, i) => pg.animate([{ transform: "rotateY(-100deg)" }, { transform: "rotateY(0deg)" }], { duration: 560, delay: i * 70, easing: OUT, fill: "forwards" })));
        await wait(120);
      },
      reveal: async () => {
        sfx.animate([{ opacity: 0, transform: "scale(.6) rotate(10deg)" }, { opacity: 1, transform: "scale(1.1) rotate(4deg)", offset: 0.3 }, { opacity: 0, transform: "scale(1) rotate(6deg)" }], { duration: 700, easing: OUT, fill: "forwards" });
        const order = [...pages].reverse();
        await all(
          order.flatMap((pg, i) => {
            const shade = pg.querySelector(".bk-shade") as HTMLElement;
            const o: KeyframeAnimationOptions = { duration: 480, delay: i * 80, easing: OUT, fill: "forwards" };
            return [pg.animate([{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }], o), shade.animate([{ opacity: 0 }, { opacity: 0.55, offset: 0.5 }, { opacity: 0 }], o)];
          }),
        );
      },
    };
  }

  if (kind === "timestop") {
    // The World: an inverted sphere freezes the page grey, the clock appears and ticks once,
    // and the frozen world goes still. Then time rewinds: the hands spin backwards and the
    // stillness is swept away anticlockwise from twelve, like a hand winding back, onto the new page.
    const inv = el("tw-inv");
    const gray = el("tw-gray");
    const still = el("tw-still");
    const dial = el("tw-dial");
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
    dial.appendChild(svg);
    const lab = el("tw-label", dial, text);
    lab.style.clipPath = tornClip("trbl", 6, 77);

    const from = origin ? `${Math.round(origin.x)}px ${Math.round(origin.y)}px` : "50% 50%";
    const C = (r: number, at = from) => `circle(${r}% at ${at})`;
    // what is still frozen while time rewinds: a sector from twelve o'clock, clockwise, that
    // shrinks anticlockwise as p goes 0 → 1 (p = how far time has rewound)
    const vw = innerWidth;
    const vh = innerHeight;
    const R = Math.hypot(vw, vh);
    const sector = (p: number) => {
      const sweep = (1 - p) * 2 * Math.PI;
      const arc = Array.from({ length: 40 }, (_, k) => {
        const t = (sweep * k) / 39;
        return `${(vw / 2 + R * Math.sin(t)).toFixed(1)}px ${(vh / 2 - R * Math.cos(t)).toFixed(1)}px`;
      });
      return `polygon(${vw / 2}px ${vh / 2}px, ${arc.join(", ")})`;
    };
    const rewind = Array.from({ length: 17 }, (_, i) => ({ clipPath: sector(i / 16) }));
    return {
      cover: async () => {
        // 1. the inverted sphere bursts out from the click
        await fin(inv.animate([{ clipPath: C(0) }, { clipPath: C(150) }], { duration: 420, easing: OUT, fill: "forwards" }));
        // 2. it collapses, leaving the world frozen and grey, and the clock appears and ticks once
        gray.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: OUT, fill: "forwards" });
        await fin(inv.animate([{ clipPath: C(150) }, { clipPath: C(0) }], { duration: 340, easing: IN_OUT, fill: "forwards" }));
        svg.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1)" }], { duration: 300, easing: POP, fill: "both" });
        second.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(6deg)" }], { duration: 300, delay: 260, easing: "steps(1, start)", fill: "both" });
        const label = lab.animate([{ opacity: 0, transform: "scale(.6) rotate(-10deg)" }, { opacity: 1, transform: "scale(1) rotate(-4deg)" }], { duration: 280, delay: 120, easing: POP, fill: "both" });
        // 3. the frozen world goes still behind the clock
        await all([label, still.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 300, easing: OUT, fill: "both" })]);
        await wait(140);
      },
      reveal: async () => {
        // time rewinds: the hands spin backwards while the stillness is swept away anticlockwise
        const MS = 700;
        const o: KeyframeAnimationOptions = { duration: MS, easing: IN_OUT, fill: "forwards" };
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: OUT, fill: "forwards" });
        hour.animate([{ transform: "rotate(300deg)" }, { transform: "rotate(-60deg)" }], o);
        minute.animate([{ transform: "rotate(54deg)" }, { transform: "rotate(-1026deg)" }], o);
        second.animate([{ transform: "rotate(6deg)" }, { transform: "rotate(-2154deg)" }], o);
        await all([
          still.animate(rewind, o),
          gray.animate(rewind, o),
          svg.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 1, transform: "scale(1)", offset: 0.75 }, { opacity: 0, transform: "scale(.8)" }], o),
        ]);
      },
    };
  }

  if (kind === "tusk") {
    // Tusk ACT 4: a golden spiral draws itself through its golden rectangles,
    // spinning nails fly in, then everything spins down into the spiral's eye.
    const bg = el("tk-bg");
    const from = origin ? `${Math.round(origin.x)}px ${Math.round(origin.y)}px` : "50% 50%";
    bg.style.clipPath = `circle(0% at ${from})`;
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 1618 1000");
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("class", "tk-svg");
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "tk-g");
    svg.appendChild(g);
    const add = (tag: string, attrs: Record<string, string | number>) => {
      const n = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
      g.appendChild(n);
      return n as SVGElement;
    };
    // the golden rectangles (each square is the next Fibonacci step)
    const squares = [
      [0, 0, 1000], [1000, 0, 618], [1236, 618, 382], [1000, 764, 236],
      [1000, 618, 146], [1146, 618, 90], [1180, 708, 56], [1146, 730, 34],
    ];
    const rects = squares.map(([x, y, w]) => add("rect", { x, y, width: w, height: w, class: "tk-rect" }));
    const spiral = add("path", {
      d: "M0 1000 A1000 1000 0 0 1 1000 0 A618 618 0 0 1 1618 618 A382 382 0 0 1 1236 1000 A236 236 0 0 1 1000 764 A146 146 0 0 1 1146 618 A90 90 0 0 1 1236 708 A56 56 0 0 1 1180 764 A34 34 0 0 1 1146 730",
      class: "tk-spiral",
    });
    const EYE = [1168, 744];
    bg.appendChild(svg);
    // Draw the spiral with its real measured length (not a normalised one), so every
    // browser shows exactly one dash the length of the spiral followed by a long gap.
    const len = (spiral as SVGPathElement).getTotalLength?.() || 4025;
    const hidden = `${(len * 1.03).toFixed(1)}px`;
    spiral.style.strokeDasharray = `${len.toFixed(1)}px ${(len * 3).toFixed(1)}px`;
    spiral.style.strokeDashoffset = hidden;

    const stars = [[14, 18], [82, 70], [70, 14]].map(([x, y]) => {
      const st = el("tk-star", bg);
      st.style.left = `${x}%`;
      st.style.top = `${y}%`;
      return st;
    });
    const r = rng(1890);
    const nails = Array.from({ length: 5 }, (_, i) => {
      const n = el("tk-nail", bg);
      const ang = (i / 5) * Math.PI * 2 + r();
      return { n, fx: Math.cos(ang) * 70, fy: Math.sin(ang) * 60, tx: Math.cos(ang) * (16 + r() * 14), ty: Math.sin(ang) * (14 + r() * 12), rot: Math.round((ang * 180) / Math.PI) };
    });
    const center = el("tk-center", bg);
    const lab = el("tk-label", center, text);
    lab.style.clipPath = tornClip("trbl", 6, 61);
    const sfx = el("tk-sfx", ov, "ACT 4!");

    return {
      cover: async () => {
        // bursts out from the click straight away; the spiral starts drawing at the same time
        bg.animate([{ clipPath: `circle(0% at ${from})` }, { clipPath: `circle(150% at ${from})` }], { duration: 420, easing: "cubic-bezier(.1,.9,.2,1)", fill: "forwards" });
        rects.forEach((rc, i) => rc.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 60 + i * 50, easing: OUT, fill: "both" }));
        stars.forEach((st, i) => st.animate([{ opacity: 0, transform: "scale(0.5) rotate(-90deg)" }, { opacity: 1, transform: "scale(1) rotate(0deg)" }], { duration: 320, delay: 160 + i * 70, easing: POP, fill: "both" }));
        nails.forEach(({ n, fx, fy, tx, ty, rot }, i) =>
          n.animate([{ opacity: 0, transform: `translate(-50%,-50%) translate(${fx}vw, ${fy}vh) rotate(${rot}deg)` }, { opacity: 1, transform: `translate(-50%,-50%) translate(${tx}vw, ${ty}vh) rotate(${rot + 1080}deg)` }], { duration: 560, delay: 100 + i * 60, easing: OUT, fill: "both" }),
        );
        await fin(spiral.animate([{ strokeDashoffset: hidden }, { strokeDashoffset: "0px" }], { duration: 640, delay: 60, easing: OUT, fill: "forwards" }));
        sfx.animate([{ opacity: 0, transform: "scale(1.7) rotate(-8deg)" }, { opacity: 1, transform: "scale(1) rotate(-6deg)" }], { duration: 260, easing: OUT, fill: "forwards" });
        await fin(lab.animate([{ opacity: 0, transform: "scale(.6) rotate(-10deg)" }, { opacity: 1, transform: "scale(1) rotate(-3deg)" }], { duration: 280, easing: POP, fill: "forwards" }));
        await wait(120);
      },
      reveal: async () => {
        // find where the spiral's eye actually sits on screen, and spin everything into it
        let eye = "50% 50%";
        const ctm = (svg as SVGSVGElement).getScreenCTM();
        if (ctm) {
          const pt = new DOMPoint(EYE[0], EYE[1]).matrixTransform(ctm);
          eye = `${Math.round(pt.x)}px ${Math.round(pt.y)}px`;
        }
        // the drawing fills the screen, so its on-screen eye is also its spin point
        svg.style.transformOrigin = eye;
        const o: KeyframeAnimationOptions = { duration: 480, easing: OUT, fill: "forwards" };
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: OUT, fill: "forwards" });
        sfx.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: OUT, fill: "forwards" });
        [...nails.map((x) => x.n), ...stars].forEach((d) => d.animate([{ opacity: 1 }, { opacity: 0, scale: "0.5" }], { duration: 240, easing: OUT, fill: "forwards" }));
        svg.animate([{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(540deg) scale(0.02)" }], o);
        await fin(bg.animate([{ clipPath: `circle(150% at ${eye})` }, { clipPath: `circle(0% at ${eye})` }], o));
      },
    };
  }

  if (kind === "emerald") {
    // Hierophant Green's Emerald Splash: a barrage of emeralds shoots out of the click and an
    // emerald flood spreads behind them. Some gems stick in the screen. Then the flood shatters
    // into facets that burst away from the click, onto the new page.
    const vw = innerWidth;
    const vh = innerHeight;
    const ox = origin?.x ?? vw / 2;
    const oy = origin?.y ?? vh / 2;
    ov.style.setProperty("--ox", `${Math.round(ox)}px`);
    ov.style.setProperty("--oy", `${Math.round(oy)}px`);
    const r = rng(1987);
    const reach = Math.hypot(Math.max(ox, vw - ox), Math.max(oy, vh - oy)); // the click to the farthest corner

    const flood = el("eg-bg");
    flood.style.clipPath = `circle(0px at ${ox}px ${oy}px)`;

    // the flood again, cut into gem-like facets for the shatter: a jittered grid, each cell split
    // into two triangles, each triangle grown 1.5px so no seams show while they still fit together
    const COLS = vw < 700 ? 4 : 6;
    const ROWS = 4;
    const grid = Array.from({ length: ROWS + 1 }, (_, j) =>
      Array.from({ length: COLS + 1 }, (_, i) => {
        const edgeX = i === 0 || i === COLS;
        const edgeY = j === 0 || j === ROWS;
        return [((i + (edgeX ? 0 : (r() - 0.5) * 0.6)) / COLS) * (vw + 8) - 4, ((j + (edgeY ? 0 : (r() - 0.5) * 0.6)) / ROWS) * (vh + 8) - 4];
      }),
    );
    const shards: { d: HTMLElement; cx: number; cy: number }[] = [];
    // built when the reveal starts: dozens of hidden pieces slow down the first frame of the cover
    const cutFacets = () => {
      for (let j = 0; j < ROWS; j++)
        for (let i = 0; i < COLS; i++) {
          const [A, B, C, D] = [grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]];
          for (const tri of (i + j) % 2 ? [[A, B, C], [A, C, D]] : [[A, B, D], [B, C, D]]) {
            const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
            const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
            const pts = tri.map(([x, y]) => {
              const l = Math.hypot(x - cx, y - cy) || 1;
              return [x + ((x - cx) / l) * 1.5, y + ((y - cy) / l) * 1.5];
            });
            const x0 = Math.min(...pts.map((p) => p[0]));
            const y0 = Math.min(...pts.map((p) => p[1]));
            const d = el("eg-bg eg-shard");
            Object.assign(d.style, {
              left: `${x0}px`,
              top: `${y0}px`,
              width: `${Math.max(...pts.map((p) => p[0])) - x0}px`,
              height: `${Math.max(...pts.map((p) => p[1])) - y0}px`,
              // the same flood, lined up with the screen
              backgroundPosition: `${-x0}px ${-y0}px`,
              clipPath: `polygon(${pts.map(([x, y]) => `${(x - x0).toFixed(1)}px ${(y - y0).toFixed(1)}px`).join(", ")})`,
              transformOrigin: `${cx - x0}px ${cy - y0}px`,
            });
            shards.push({ d, cx, cy });
          }
        }
    };

    const glow = el("eg-glow");
    // the emeralds: each one points the way it flies, with a streak of light behind it
    const GEM = `<svg viewBox="0 0 100 40" aria-hidden="true"><polygon points="0,20 22,2 78,2 100,20 78,38 22,38" fill="#0f7a4a"/><polygon points="0,20 22,2 78,2 100,20" fill="#3fe08f"/><polygon points="22,20 34,10 66,10 78,20 66,30 34,30" fill="#1fae66"/><line x1="34" y1="10" x2="66" y2="10" stroke="#d6ffe8" stroke-width="3"/><polygon points="0,20 22,2 78,2 100,20 78,38 22,38" fill="none" stroke="#062a1c" stroke-width="4" stroke-linejoin="round"/></svg>`;
    // a click near the middle sprays all round; a click near an edge sprays into the screen
    const toMiddle = Math.atan2(vh / 2 - oy, vw / 2 - ox);
    const spread = Math.hypot(vw / 2 - ox, vh / 2 - oy) < Math.min(vw, vh) * 0.2 ? Math.PI : Math.PI * 0.42;
    const gems = Array.from({ length: 30 }, (_, i) => {
      const stick = i % 5 < 2; // 12 of them stay stuck in the screen
      const ang = toMiddle + ((i / 29) * 2 - 1) * spread + (r() - 0.5) * 0.12;
      const outer = el("eg-gem-at");
      Object.assign(outer.style, { left: `${ox}px`, top: `${oy}px`, transform: `rotate(${ang}rad)` });
      const gem = el("eg-gem", outer);
      gem.innerHTML = GEM; // fixed drawing written above, no outside text
      gem.style.scale = String(0.7 + r() * 0.6);
      return { gem, stick, d: stick ? reach * (0.25 + r() * 0.45) : reach * 1.25 };
    });
    const lab = el("ov-label", ov, text);
    lab.style.clipPath = tornClip("trbl", 6, 88);
    const fly = (d: number) => `translate(-50%, -50%) translateX(${Math.round(d)}px)`;

    return {
      cover: async () => {
        glow.animate([{ opacity: 0, transform: "translate(-50%, -50%) scale(0.6)" }, { opacity: 1, transform: "translate(-50%, -50%) scale(1)", offset: 0.3 }, { opacity: 0, transform: "translate(-50%, -50%) scale(1.3)" }], { duration: 520, easing: OUT, fill: "both" });
        const shots = gems.map(({ gem, stick, d }, i) =>
          gem.animate([{ opacity: 0, transform: fly(0) }, { opacity: 1, transform: fly(d * 0.08), offset: 0.05 }, { opacity: stick ? 1 : 0.9, transform: fly(d) }], { duration: stick ? 560 : 480, delay: 40 + i * 12, easing: OUT, fill: "both" }),
        );
        const splash = flood.animate([{ clipPath: `circle(0px at ${ox}px ${oy}px)` }, { clipPath: `circle(${Math.ceil(reach) + 20}px at ${ox}px ${oy}px)` }], { duration: 520, delay: 120, easing: OUT, fill: "both" });
        const label = lab.animate([{ opacity: 0, transform: "translate(-50%,-50%) scale(.6) rotate(-12deg)" }, { opacity: 1, transform: "translate(-50%,-50%) scale(1) rotate(-4deg)" }], { duration: 280, delay: 560, easing: POP, fill: "both" });
        await all([...shots, splash, label]);
        await wait(140);
      },
      reveal: async () => {
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: OUT, fill: "forwards" });
        // the stuck gems carry on out of the screen
        gems.forEach(({ gem, stick, d }) => stick && gem.animate([{ transform: fly(d) }, { transform: fly(d + reach) }], { duration: 300, easing: OUT, fill: "forwards" }));
        // swap the flood for its facets (they look the same), then burst them away from the click
        cutFacets();
        shards.forEach(({ d }) => (d.style.visibility = "visible"));
        flood.style.visibility = "hidden";
        const far = Math.max(...shards.map(({ cx, cy }) => Math.hypot(cx - ox, cy - oy)));
        await all(
          shards.map(({ d, cx, cy }) => {
            const dist = Math.hypot(cx - ox, cy - oy) || 1;
            const push = 140 + r() * 220;
            const [dx, dy] = [((cx - ox) / dist) * push, ((cy - oy) / dist) * push + 60];
            const spin = (r() - 0.5) * 90;
            return d.animate(
              [{ opacity: 1, transform: "none" }, { opacity: 1, transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) rotate(${spin * 0.5}deg)`, offset: 0.5 }, { opacity: 0, transform: `translate(${dx}px, ${dy}px) rotate(${spin}deg)` }],
              { duration: 520, delay: (dist / far) * 180, easing: OUT, fill: "both" },
            );
          }),
        );
      },
    };
  }

  if (kind === "menace") {
    const bg = el("ov-menace");
    bg.style.clipPath = "circle(0% at 85% 15%)";
    // same markup as the <Menacing> component (empty letters; CSS draws the ゴ), so it gets the real ゴゴゴ look
    const g = el("ov-gogo menacing", bg);
    const chars = [0, 1, 2, 3].map((i) => {
      const b = document.createElement("span");
      b.style.setProperty("--i", String(i));
      b.style.opacity = "0";
      g.appendChild(b);
      return b;
    });
    // the welcome card: same torn-paper label as the other transitions, with a small kicker
    const lab = el("ov-mlabel-wrap", bg); // carries the shadow, which the torn edge would clip off
    const card = el("ov-mlabel", lab);
    el("kicker", card, "Welcome to");
    el("big", card, text);
    card.style.clipPath = tornClip("trbl", 6, 23);
    return {
      cover: async () => {
        await fin(bg.animate([{ clipPath: "circle(0% at 85% 15%)" }, { clipPath: "circle(150% at 85% 15%)" }], { duration: 450, easing: OUT, fill: "forwards" }));
        const pops = chars.map((b, i) => b.animate([{ scale: "0.5", opacity: 0 }, { scale: "1.35", opacity: 1, offset: 0.6 }, { scale: "1", opacity: 1 }], { duration: 340, delay: i * 60, easing: OUT, fill: "both" }));
        // the label lands as the last ゴ settles, like the labels in the other transitions
        const label = lab.animate([{ opacity: 0, transform: "scale(.6) rotate(-10deg)" }, { opacity: 1, transform: "scale(1) rotate(-3deg)" }], { duration: 280, delay: 3 * 60 + 200, easing: POP, fill: "both" });
        await all([...pops, label]);
        await wait(300);
      },
      reveal: async () => {
        lab.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: OUT, fill: "forwards" });
        await fin(bg.animate([{ clipPath: "circle(150% at 15% 85%)" }, { clipPath: "circle(0% at 15% 85%)" }], { duration: 450, easing: OUT, fill: "forwards" }));
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
        f.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: OUT, fill: "forwards" });
        await fin(a.animate([{ transform: "translateX(-130%)" }, { transform: "translateX(0)" }], { duration: 480, delay: 120, easing: OUT, fill: "forwards" }));
        nt.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: OUT, fill: "forwards" });
        await wait(450);
      },
      reveal: async () => {
        await all([f, a, nt].map((x) => x.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })));
      },
    };
  }

  // fade: used for reduced motion, and for keyboard navigation (no recent click or tap)
  const d = el("ov-fade", ov, text);
  d.style.opacity = "0";
  return {
    cover: async () => {
      await fin(d.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: OUT, fill: "forwards" }));
      await wait(80);
    },
    reveal: async () => {
      await fin(d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: OUT, fill: "forwards" }));
    },
  };
}
