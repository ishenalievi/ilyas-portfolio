// Die-cut stickers stuck on the background, behind the paper. Every slot holds one of the
// owner's pictures (admin panel /keystatic → Background stickers), and each one does its own
// trick when pressed (StickerPlay.tsx, sticker-moves.ts).
//
// The extras drawn here (the chalk hand, George's top scoop and drip, the guitar strings) are
// lined up with today's pictures. Upload a different picture to one of those slots and its
// trick stops lining up: tell Claude, and it will re-measure.

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { getStickers } from "@/lib/content";

type Pic = { src: string; w: number; h: number };

const SLOTS = [
  { id: "bear", play: "ball", cls: "st-1" },
  { id: "cheese", play: "hold", cls: "st-2" },
  { id: "rocket", play: "george", cls: "st-3" },
  { id: "crest", play: "jersey", cls: "st-4" },
  { id: "tea", play: "camera", cls: "st-5" },
  { id: "sheep", play: "gromit", cls: "st-6" },
  { id: "plant", play: "plant", cls: "st-7" },
  { id: "toast", play: "guitar", cls: "st-8" },
];

/** Width factor that gives an uploaded picture about the area of a square sticker, within limits. */
const fit = (w: number, h: number) => Math.min(1.15, Math.max(0.75, Math.sqrt(w / h))).toFixed(3);

const img = (p: Pic, className?: string, style?: CSSProperties) => (
  <Image className={className} style={style} src={p.src} alt="" width={p.w} height={p.h} sizes="(max-width: 800px) 4rem, 8vw" fetchPriority="low" />
);

// George's top scoop, measured on the 880 × 1414 picture: the round top, then back along the
// wavy edge of the scoop under it. As % of the picture, for clip-path.
const SCOOP = [
  ...Array.from({ length: 19 }, (_, i) => {
    const t = ((-28 + (i * 236) / 18) * Math.PI) / 180;
    return [606 + 91 * Math.cos(t), 135 - 92 * Math.sin(t)];
  }),
  [517, 180], [547, 177], [577, 183], [600, 170], [620, 175], [640, 174], [660, 177], [680, 177], [697, 182],
]
  .map(([x, y]) => `${((x / 880) * 100).toFixed(2)}% ${((y / 1414) * 100).toFixed(2)}%`)
  .join(", ");

function George({ p }: { p: Pic }) {
  return (
    <>
      {img(p, "george-base", { clipPath: `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${SCOOP}, ${SCOOP.split(", ")[0]}, 0 0)` })}
      {/* bare sticker backing, showing where the scoop was */}
      <span className="george-gap" style={{ clipPath: `polygon(${SCOOP})` }} />
      {img(p, "george-scoop", { clipPath: `polygon(${SCOOP})` })}
      {/* what the scoop leaves behind: a melted puddle running down the next one */}
      <svg className="george-drip" viewBox="0 0 880 1414" preserveAspectRatio="none">
        <g fill="#fbf0a2" stroke="#3b2a14" strokeWidth="5" strokeLinejoin="round">
          <path className="drop" d="M534 190 C532 210 533 226 539 238 C545 248 553 240 551 224 C549 210 550 198 552 192 Z" />
          <path className="drop" d="M594 192 C592 216 594 244 601 262 C607 274 617 264 614 244 C611 224 612 204 614 194 Z" />
          <path className="drop" d="M656 190 C654 204 656 216 661 224 C667 232 674 224 672 212 C670 202 671 194 672 190 Z" />
          <path d="M512 186 C520 164 548 160 566 168 C584 158 610 156 628 166 C648 158 676 160 700 184 C690 196 672 190 660 192 C640 200 620 190 600 196 C580 204 560 192 540 196 C526 200 516 196 512 186 Z" />
        </g>
      </svg>
    </>
  );
}

function Chalk() {
  // a chalky hand print: a palm and five fingers, roughed up and speckled by the filter
  return (
    <svg className="hold-chalk" viewBox="0 0 100 100">
      <defs>
        <filter id="chalky" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" result="rough" />
          <feColorMatrix in="noise" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 5 -1.6" result="speck" />
          <feComposite in="rough" in2="speck" operator="in" />
        </filter>
      </defs>
      <g fill="#fbfaf5" filter="url(#chalky)" transform="rotate(-14 50 55)">
        <ellipse cx="50" cy="66" rx="20" ry="18" />
        <rect x="31" y="24" width="9" height="34" rx="4.5" transform="rotate(-10 35 41)" />
        <rect x="42" y="16" width="9" height="38" rx="4.5" />
        <rect x="53" y="19" width="9" height="36" rx="4.5" transform="rotate(7 57 37)" />
        <rect x="63" y="31" width="8" height="28" rx="4" transform="rotate(16 67 45)" />
        <rect x="19" y="54" width="9" height="26" rx="4.5" transform="rotate(-52 23 67)" />
      </g>
    </svg>
  );
}

// Guitar strings, measured on the 621 × 1406 picture: x at the nut (y 250) and at the saddle (y 1074).
const STRINGS = [
  [282, 273], [292, 287], [302, 302], [311, 316], [321, 330], [331, 344],
];

function Strings() {
  return (
    <svg className="guitar-strings" viewBox="0 0 621 1406">
      {STRINGS.map(([nut, saddle]) => {
        const x = (nut + saddle) / 2;
        return (
          // each string in its own little viewport, so it can bow either way around x
          <svg key={x} x={x} y="0" overflow="visible">
            <path d={`M${nut - x} 250 Q${(nut + saddle) / 2 - x + 110} 662 ${saddle - x} 1074`} />
          </svg>
        );
      })}
    </svg>
  );
}

function Body({ play, pic, jaw }: { play: string; pic: Pic; jaw?: Pic }): ReactNode {
  if (play === "george") return <George p={pic} />;
  if (play === "hold") return <>{img(pic)}<Chalk /></>;
  if (play === "guitar") return <>{img(pic)}<Strings /></>;
  if (play === "plant") return <>{img(pic)}{jaw && img(jaw, "plant-jaw")}</>;
  return img(pic);
}

export async function Stickers() {
  const own = await getStickers();
  return (
    <div className="stickers" aria-hidden="true">
      {SLOTS.map((s) => {
        const pic = own[s.id];
        if (!pic) return null;
        return (
          <div key={s.id} className={`sticker ${s.cls}`} data-play={s.play} style={{ "--fit": fit(pic.w, pic.h) } as CSSProperties}>
            <div className="play">
              <Body play={s.play} pic={pic} jaw={s.play === "plant" ? own.plantJaw : undefined} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
