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
  const d = (side: string) => (sides.includes(side) ? (r() * amp).toFixed(1) : "0");
  const p: string[] = [];
  for (let x = 0; x < 100; x += step()) p.push(`${x.toFixed(2)}% ${d("t")}px`);
  for (let y = 0; y < 100; y += step()) p.push(`calc(100% - ${d("r")}px) ${y.toFixed(2)}%`);
  for (let x = 100; x > 0; x -= step()) p.push(`${x.toFixed(2)}% calc(100% - ${d("b")}px)`);
  for (let y = 100; y > 0; y -= step()) p.push(`${d("l")}px ${y.toFixed(2)}%`);
  return `polygon(${p.join(",")})`;
}
