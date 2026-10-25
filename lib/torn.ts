// Generates ragged "torn paper" clip-paths.
// The same seed always gives the same tear, so the server and the browser
// draw identical edges and every reload looks the same.

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: string | number) {
  let s = typeof seed === "number" ? seed : hash(seed);
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** sides: any of "t", "r", "b", "l". amp: depth of the tear in px. */
export function tornClip(sides: string, amp: number, seed: string | number): string {
  const r = rng(seed);
  const step = () => 1.5 + r() * 3;
  const p: string[] = [];
  // a straight side needs only its first point; the random steps still run, so every tear stays the same
  const side = (s: string, n: number, at: (v: number, d: string) => string) => {
    const torn = sides.includes(s);
    for (let i = 0, v = n ? 100 : 0; n ? v > 0 : v < 100; v += (n ? -1 : 1) * step(), i++) {
      const d = torn ? `${(r() * amp).toFixed(1)}px` : "0px";
      if (torn || i === 0) p.push(at(v, d));
    }
  };
  side("t", 0, (x, d) => `${x.toFixed(2)}% ${d}`);
  side("r", 0, (y, d) => `calc(100% - ${d}) ${y.toFixed(2)}%`);
  side("b", 1, (x, d) => `${x.toFixed(2)}% calc(100% - ${d})`);
  side("l", 1, (y, d) => `${d} ${y.toFixed(2)}%`);
  return `polygon(${p.join(",")})`;
}
