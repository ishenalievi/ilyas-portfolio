"use client";

import Image from "next/image";
import { useState } from "react";
import type { Post } from "@/lib/content";
import { tornClip } from "@/lib/torn";
import { TLink } from "./transitions/TLink";
import { fitCols } from "@/lib/grid";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "design", label: "Design" },
  { id: "ig", label: "Instagram" },
  { id: "yt", label: "YouTube" },
  { id: "li", label: "LinkedIn" },
] as const;

type F = (typeof FILTERS)[number]["id"];

const SIZES = "(max-width: 600px) 50vw, (max-width: 1200px) 25vw, 18vw";

/** eager: how many posts sit in the first screen, so their pictures load straight away. */
export function ContentWall({ posts, filters = true, eager = 0 }: { posts: Post[]; filters?: boolean; eager?: number }) {
  const [f, setF] = useState<F>("all");
  const shown = posts.filter((p) => f === "all" || p.type === f || p.platform === f);

  return (
    <div>
      {filters && (
        <div className="wall-bar" role="group" aria-label="Filter posts">
          {FILTERS.map((x) => (
            <button key={x.id} type="button" aria-pressed={f === x.id} onClick={() => setF(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <div className="wall" style={filters ? undefined : ({ "--cols": fitCols(shown.length) } as React.CSSProperties)}>
        {shown.map((p, i) => (p.slides.length > 1 ? <SlidePost key={p.href || p.title} p={p} eager={i < eager} /> : <LinkPost key={p.href || p.title} p={p} eager={i < eager} />))}
      </div>
    </div>
  );
}

function LinkPost({ p, eager }: { p: Post; eager: boolean }) {
  return (
    <TLink href={p.href} className="post">
      <div className="pic" style={{ clipPath: tornClip("trbl", 4, p.href) }}>
        <Image src={p.img} alt={p.title} width={p.w} height={p.h} sizes={SIZES} loading={eager ? "eager" : undefined} />
      </div>
      <span className={`post-stamp ${p.platform}`}>{p.stamp}</span>
      <b>{p.title}</b>
      <small>{p.note}</small>
    </TLink>
  );
}

/** A post with several pieces: arrows under the picture flip through them (buttons can't sit inside a link, so only the title links out). */
function SlidePost({ p, eager }: { p: Post; eager: boolean }) {
  const [at, setAt] = useState(0);
  const n = p.slides.length;
  const go = (d: number) => setAt((at + d + n) % n);

  return (
    <div className="post">
      <div className="pic slides" style={{ clipPath: tornClip("trbl", 4, p.href || p.title) }}>
        {p.slides.map((s, i) => (
          <Image key={s.src} src={s.src} alt={`${p.title}, ${i + 1} of ${n}`} width={s.w} height={s.h} sizes={SIZES} loading={eager && i === 0 ? "eager" : undefined} className={i === at ? "on" : undefined} aria-hidden={i !== at} />
        ))}
      </div>
      <div className="slide-nav" role="group" aria-label={`${p.title} pictures`}>
        <button type="button" aria-label="Previous picture" onClick={() => go(-1)}>
          ←
        </button>
        <span aria-live="polite">
          {at + 1} / {n}
        </span>
        <button type="button" aria-label="Next picture" onClick={() => go(1)}>
          →
        </button>
      </div>
      <span className={`post-stamp ${p.platform}`}>{p.stamp}</span>
      <b>{p.href ? <TLink href={p.href}>{p.title}</TLink> : p.title}</b>
      <small>{p.note}</small>
    </div>
  );
}
