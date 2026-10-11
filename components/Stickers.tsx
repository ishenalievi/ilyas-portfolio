// Die-cut stickers stuck on the background, behind the paper.
// The drawn ones are originals: nods to Ralph Lauren and Wallace & Gromit,
// not their actual characters or logos.
//
// TO USE YOUR OWN PNG: put it in /public/stickers/ named after the sticker
// it replaces, e.g. public/stickers/bear.png. Names you can use:
//   bear, cheese, rocket, crest, tea, sheep, patch, toast
// A transparent background looks best: the white die-cut edge follows its shape.

import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import type { ReactNode } from "react";

const INK = "#14213d";
const RED = "#a3122a";
const CREAM = "#f1ecdf";

function Bear() {
  // a preppy teddy in a rugby sweater and bow tie
  return (
    <svg viewBox="0 0 100 124">
      <circle cx="30" cy="22" r="10" fill="#7a4a22" />
      <circle cx="70" cy="22" r="10" fill="#7a4a22" />
      <circle cx="30" cy="22" r="4.5" fill="#c68e5a" />
      <circle cx="70" cy="22" r="4.5" fill="#c68e5a" />
      <ellipse cx="22" cy="80" rx="9" ry="16" fill={INK} transform="rotate(18 22 80)" />
      <ellipse cx="78" cy="80" rx="9" ry="16" fill={INK} transform="rotate(-18 78 80)" />
      <circle cx="17" cy="94" r="7" fill="#a8713d" />
      <circle cx="83" cy="94" r="7" fill="#a8713d" />
      <ellipse cx="38" cy="112" rx="11" ry="8" fill="#a8713d" />
      <ellipse cx="62" cy="112" rx="11" ry="8" fill="#a8713d" />
      <rect x="24" y="58" width="52" height="50" rx="16" fill={INK} />
      <rect x="24" y="74" width="52" height="7" fill={RED} />
      <rect x="24" y="85" width="52" height="3" fill={CREAM} />
      <rect x="40" y="58" width="20" height="9" rx="2" fill={CREAM} />
      <circle cx="50" cy="38" r="23" fill="#a8713d" />
      <ellipse cx="50" cy="47" rx="11" ry="8" fill="#e2c29a" />
      <ellipse cx="50" cy="43" rx="4.5" ry="3.2" fill="#2a1a10" />
      <path d="M50 46 v4 M46 51 q4 3 8 0" stroke="#2a1a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="41" cy="33" r="2.6" fill="#2a1a10" />
      <circle cx="59" cy="33" r="2.6" fill="#2a1a10" />
      <path d="M50 62 L40 56 L40 68 Z M50 62 L60 56 L60 68 Z" fill={RED} />
      <circle cx="50" cy="62" r="2.6" fill={RED} />
    </svg>
  );
}

function Cheese() {
  return (
    <svg viewBox="0 0 120 92">
      <path d="M8 70 L112 70 L112 42 L30 26 Z" fill="#f2c14e" />
      <path d="M30 26 L112 42 L112 30 Z" fill="#f8d878" />
      <path d="M8 70 L30 26 L30 30 L12 70 Z" fill="#e0a93a" />
      <circle cx="44" cy="52" r="6" fill="#d9a033" />
      <circle cx="72" cy="58" r="4" fill="#d9a033" />
      <circle cx="92" cy="50" r="7" fill="#d9a033" />
      <circle cx="60" cy="44" r="3" fill="#d9a033" />
      <text x="60" y="88" textAnchor="middle" fontSize="15" fill={INK} style={{ fontFamily: "var(--f-display)" }}>
        MORE CHEESE?
      </text>
    </svg>
  );
}

function Rocket() {
  return (
    <svg viewBox="0 0 80 120">
      <path d="M40 4 C60 22 62 60 56 86 L24 86 C18 60 20 22 40 4 Z" fill="#d7263d" />
      <path d="M24 66 L8 92 L26 86 Z M56 66 L72 92 L54 86 Z" fill="#a3122a" />
      <circle cx="40" cy="44" r="10" fill={CREAM} stroke={INK} strokeWidth="4" />
      <path d="M28 86 L52 86 L46 98 L34 98 Z" fill="#6b7280" />
      <path d="M33 98 Q40 122 47 98 Z" fill="#f2b705" />
      <path d="M37 98 Q40 112 43 98 Z" fill="#ff7a1a" />
    </svg>
  );
}

function Tea() {
  return (
    <svg viewBox="0 0 110 90">
      <path d="M38 20 q-6 -8 0 -16 M52 20 q-6 -8 0 -16" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="78" rx="44" ry="9" fill={CREAM} stroke={INK} strokeWidth="3" />
      <path d="M18 28 L82 28 L76 66 Q50 80 24 66 Z" fill="#ffffff" stroke={INK} strokeWidth="3" />
      <path d="M82 36 q20 2 12 18 q-6 8 -16 6" stroke={INK} strokeWidth="5" fill="none" />
      <rect x="20" y="38" width="60" height="7" fill={RED} />
      <rect x="21" y="48" width="58" height="3" fill={INK} />
    </svg>
  );
}

function Sheep() {
  return (
    <svg viewBox="0 0 110 90">
      <rect x="30" y="62" width="7" height="20" rx="3" fill="#2a2a2a" />
      <rect x="66" y="62" width="7" height="20" rx="3" fill="#2a2a2a" />
      <g fill="#ffffff" stroke="#c9d1de" strokeWidth="2">
        <circle cx="34" cy="44" r="16" />
        <circle cx="54" cy="36" r="18" />
        <circle cx="74" cy="44" r="16" />
        <circle cx="44" cy="58" r="14" />
        <circle cx="66" cy="58" r="14" />
      </g>
      <ellipse cx="90" cy="46" rx="12" ry="15" fill="#2a2a2a" />
      <circle cx="94" cy="42" r="3" fill="#ffffff" />
      <circle cx="95" cy="42" r="1.5" fill="#2a2a2a" />
    </svg>
  );
}

function Crest() {
  return (
    <svg viewBox="0 0 90 104">
      <path d="M8 8 L82 8 L82 50 Q82 84 45 98 Q8 84 8 50 Z" fill={INK} />
      <path d="M14 14 L76 14 L76 50 Q76 78 45 91 Q14 78 14 50 Z" fill="none" stroke="#d4ae3a" strokeWidth="2.5" />
      <text x="45" y="62" textAnchor="middle" fontSize="34" fill="#d4ae3a" style={{ fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
        II
      </text>
    </svg>
  );
}

function Patch() {
  // a rugby-stripe patch
  return (
    <svg viewBox="0 0 120 70">
      <rect x="4" y="4" width="112" height="62" rx="10" fill={INK} />
      <rect x="4" y="22" width="112" height="10" fill={RED} />
      <rect x="4" y="36" width="112" height="10" fill="#1f4d3a" />
      <rect x="4" y="4" width="112" height="62" rx="10" fill="none" stroke={CREAM} strokeWidth="3" strokeDasharray="5 4" />
      <text x="60" y="62" textAnchor="middle" fontSize="11" fill={CREAM} style={{ fontFamily: "var(--f-mono)", fontWeight: 700, letterSpacing: "1.5px" }}>
        EST. 2026
      </text>
    </svg>
  );
}

function Toast() {
  return (
    <svg viewBox="0 0 90 90">
      <path d="M12 34 Q8 8 45 8 Q82 8 78 34 L74 84 L16 84 Z" fill="#d8a25e" />
      <path d="M20 36 Q18 18 45 18 Q72 18 70 36 L67 76 L23 76 Z" fill="#f6e2b8" />
      <path d="M26 40 Q45 30 64 42 Q60 58 46 54 Q30 60 26 40 Z" fill="#c2185b" />
    </svg>
  );
}

const STICKERS: { id: string; node: ReactNode; cls: string }[] = [
  { id: "bear", node: <Bear />, cls: "st-1" },
  { id: "cheese", node: <Cheese />, cls: "st-2" },
  { id: "rocket", node: <Rocket />, cls: "st-3" },
  { id: "crest", node: <Crest />, cls: "st-4" },
  { id: "tea", node: <Tea />, cls: "st-5" },
  { id: "sheep", node: <Sheep />, cls: "st-6" },
  { id: "patch", node: <Patch />, cls: "st-7" },
  { id: "toast", node: <Toast />, cls: "st-8" },
];

/** If public/stickers/<id>.png exists, return its path and pixel size. */
function customSticker(id: string) {
  const file = path.join(process.cwd(), "public", "stickers", `${id}.png`);
  try {
    const head = fs.readFileSync(file).subarray(0, 24);
    // PNG files store width and height at bytes 16-23
    return { src: `/stickers/${id}.png`, w: head.readUInt32BE(16), h: head.readUInt32BE(20) };
  } catch {
    return null;
  }
}

export async function Stickers() {
  "use cache"; // the folder is checked once per build, not on every visit
  return (
    <div className="stickers" aria-hidden="true">
      {STICKERS.map((s) => {
        const own = customSticker(s.id);
        return (
          <div key={s.id} className={`sticker ${s.cls}`}>
            {own ? <Image src={own.src} alt="" width={own.w} height={own.h} sizes="10rem" /> : s.node}
          </div>
        );
      })}
    </div>
  );
}
