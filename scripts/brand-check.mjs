// Compares the brand booklet (content/settings/brand.json, edited in /keystatic → Brand booklet)
// with the site's code and lists everything that no longer matches.
// Run: npm run brand:check
//
// It checks the parts that live in code: colours, palettes, fonts, easing curves,
// transition sound effects and the monogram. Voice, motifs and the other written
// rules are guidance for whoever edits the site; they can't be checked automatically.

import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const brand = JSON.parse(read("content/settings/brand.json"));
const css = read("app/globals.css");
const engine = read("components/transitions/engine.ts");
const layout = read("app/layout.tsx");
const nav = read("components/Nav.tsx");
const swap = read("components/PaletteSwap.tsx");

const problems = [];
let checked = 0;
const check = (ok, message) => {
  checked++;
  if (!ok) problems.push(message);
};

/** The variables set inside one CSS rule, e.g. block(":root") or block(":root.pal-2"). */
function block(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = css.match(new RegExp(`^${escaped}\\s*\\{([\\s\\S]*?)\\}`, "m"));
  const vars = {};
  if (m) for (const [, name, value] of m[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[name] = value.trim().toLowerCase();
  return vars;
}
const root = block(":root");
const flat = (s) => s.toLowerCase().replace(/\s+/g, "");

// ---------- colours ----------
for (const group of brand.colourGroups) {
  for (const c of group.colours) {
    const hex = c.hex.toLowerCase();
    if (c.token) {
      const actual = root[c.token];
      check(actual !== undefined, `Colour “${c.name}”: the site has no ${c.token} in app/globals.css (:root).`);
      if (actual !== undefined) check(actual === hex, `Colour “${c.name}” (${c.token}): booklet ${hex}, site ${actual}.`);
    } else {
      check((css + engine).toLowerCase().includes(hex), `Colour “${c.name}” ${hex} isn't used anywhere in the site's styles.`);
    }
  }
}

// ---------- palettes ----------
const count = Number(swap.match(/const COUNT = (\d+)/)?.[1]);
check(count === brand.palettes.length, `Palettes: booklet has ${brand.palettes.length}, the palette swap cycles ${count} (components/PaletteSwap.tsx).`);
brand.palettes.forEach((p, i) => {
  const vars = i === 0 ? root : block(`:root.pal-${i + 1}`);
  for (const a of ["a1", "a2", "a3", "a4"]) {
    const actual = vars[`--${a}`];
    check(actual === p[a].toLowerCase(), `Palette ${i + 1} “${p.name}” accent ${a.slice(1)}: booklet ${p[a].toLowerCase()}, site ${actual ?? "missing"}.`);
  }
});

// ---------- fonts ----------
for (const t of brand.type) {
  const importName = t.font.trim().replace(/\s+/g, "_");
  check(new RegExp(`\\b${importName}\\b`).test(layout), `Font “${t.font}” (${t.role}) isn't loaded in app/layout.tsx.`);
  const suffix = t.token.replace(/^--f-/, "");
  const declared = layout.match(new RegExp(`(\\w+)\\(\\{[^)]*variable:\\s*"--font-${suffix}"`));
  check(declared?.[1] === importName, `Font role ${t.token}: booklet says ${t.font}, site uses ${declared?.[1]?.replace(/_/g, " ") ?? "nothing"}.`);
}

// ---------- motion ----------
for (const e of brand.motion.easing) {
  check(flat(engine).includes(flat(e.value)), `Easing “${e.name}” ${e.value} isn't used in components/transitions/engine.ts.`);
}
for (const t of brand.motion.transitions) {
  check(new RegExp(`"${t.kind}"`).test(engine), `Transition “${t.stand}” (${t.kind}) doesn't exist in the engine.`);
  if (t.sfx && t.sfx !== "ゴゴゴ") check(engine.includes(`"${t.sfx}"`), `Transition “${t.stand}”: sound effect “${t.sfx}” isn't in the engine.`);
}

// ---------- identity ----------
check(nav.includes(brand.identity.monogram), `Monogram “${brand.identity.monogram}” isn't the nav logo (components/Nav.tsx).`);

if (problems.length) {
  console.log(`Brand booklet vs site: ${problems.length} of ${checked} checks differ.\n`);
  for (const p of problems) console.log(`  ✗ ${p}`);
  process.exit(1);
}
console.log(`Brand booklet vs site: all ${checked} checks match.`);
