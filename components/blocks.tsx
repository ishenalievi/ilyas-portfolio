// Shared page sections.

import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import type { Love, Project, Role } from "@/lib/content";
import { Lift, Tape, Torn, TornSheet } from "./collage";
import { Menacing } from "./Menacing";
import { TLink } from "./transitions/TLink";
import { fitCols } from "@/lib/grid";

/** Heading text cut into words, so it can come in word by word (components/motion).
    Screen readers get the whole sentence once; the cut-up words are hidden from them. */
export function SplitWords({ text }: { text: string }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="w">
              <span>{w}</span>
            </span>
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </span>
    </>
  );
}

/** A section heading (level 1 when it is the page's title). Empty text from the admin panel is simply left out. */
export function SectionHead({ eyebrow, title, children, level = 2 }: { eyebrow: string; title: ReactNode; children?: ReactNode; level?: 1 | 2 }) {
  const split = typeof title === "string";
  const H = level === 1 ? "h1" : "h2";
  return (
    <div className="sh">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <H data-split={split || undefined}>{split ? <SplitWords text={title} /> : title}</H>
      {children && <p>{children}</p>}
    </div>
  );
}

/** A full-width sheet of paper with torn top and bottom edges. */
export function Sheet({ seed, children, className = "" }: { seed: string; children: ReactNode; className?: string }) {
  return (
    <section className={`sheet-sec ${className}`}>
      <TornSheet sides="tb" amp={12} seed={seed} className="sheet paper">
        <div className="wrap">{children}</div>
      </TornSheet>
    </section>
  );
}

/** The making-of has no cover photo yet, so it gets a small paper collage. */
export function MiniCollage({ seed }: { seed: string }) {
  return (
    <div className="mini-collage" aria-hidden="true">
      <Torn className="mc1" seed={`${seed}-1`} />
      <Lift className="mc2">
        <Torn className="mc2-paper paper-2" seed={`${seed}-2`}>
          <b>v1 → v2 → v3</b>
          <i>still arguing with myself</i>
        </Torn>
      </Lift>
      <Torn className="mc3" seed={`${seed}-3`} amp={5} />
    </div>
  );
}

export function Clipping({ p, i }: { p: Project; i: number }) {
  // no cover of its own? borrow the first video or episode image
  const cover = p.cover ?? p.videos[0]?.img ?? p.episodes.find((e) => e.img)?.img;
  return (
    <TLink href={`/work/${p.slug}`} label={p.short} className={`clip clip-${i}`}>
      <Tape className="clip-tape" />
      <Lift>
        <Torn className="clip-paper paper-2" seed={`clip-${p.slug}`} amp={5}>
          <div className="clip-img" style={{ background: `var(--${p.accent})` }}>
            {cover ? (
              <Image src={cover.src} alt={cover.alt} width={cover.w} height={cover.h} sizes="(max-width: 700px) 90vw, 30vw" />
            ) : (
              <MiniCollage seed={`clip-mc-${p.slug}`} />
            )}
          </div>
          <span className="clip-no">No. {p.no}</span>
          <b className="clip-title">{p.title}</b>
          <span className="clip-sub">{p.subtitle}</span>
        </Torn>
      </Lift>
    </TLink>
  );
}

export function HazardSlot({ text, note }: { text: string; note: string }) {
  return (
    <div className="clip clip-soon">
      <Torn className="soon-paper" seed={`soon-${text}`} amp={5}>
        <div className="hazard">
          <span>{text}</span>
        </div>
        <p>{note}</p>
      </Torn>
    </div>
  );
}

function LoveCard({ l, i }: { l: Love; i: number }) {
  return (
    <Lift className="love">
      <Torn className="love-card paper" seed={`love-${i}`} amp={5}>
        <Torn className="love-ph" sides="b" amp={6} seed={`love-ph-${i}`} style={{ background: l.color }}>
          {l.img ? (
            <Image className={`love-img fit-${l.fit}`} src={l.img.src} alt={l.img.alt} width={l.img.w} height={l.img.h} sizes="(max-width: 700px) 90vw, 22vw" />
          ) : l.tag === "ゴゴゴ" ? (
            <Menacing count={3} className="love-menace" />
          ) : (
            <span>{l.tag}</span>
          )}
        </Torn>
        <div className="love-body">
          <span className="fig">
            Fig. {i + 1} · {l.fig}
          </span>
          <h3>{l.title}</h3>
          <p>{l.line}</p>
          {l.link && (
            <TLink href={l.link.href} className="pts-link">
              {l.link.label} ↗
            </TLink>
          )}
        </div>
      </Torn>
    </Lift>
  );
}

export function Loves({ items, limit }: { items: Love[]; limit?: number }) {
  const list = limit ? items.slice(0, limit) : items;
  return (
    <div className="loves" style={{ "--cols": fitCols(list.length) } as React.CSSProperties}>
      {list.map((l, i) => (
        <LoveCard key={l.title} l={l} i={i} />
      ))}
    </div>
  );
}

/** Back-to-back roles at the same place become one entry, newest role first, like a promotion on LinkedIn. */
function groupByOrg(rows: Role[]) {
  const groups: Role[][] = [];
  for (const r of rows) {
    const last = groups.at(-1);
    if (last && last[0].org === r.org) last.push(r);
    else groups.push([r]);
  }
  return groups;
}

/** "Feb – Apr 2025" + "Apr 2026 – now" → "Feb 2025 – now": the start of the oldest role to the end of the newest. */
function span(newest: string, oldest: string) {
  const [from, to = ""] = oldest.split(" – ");
  const start = /\d/.test(from) ? from : `${from} ${to.match(/\d{4}/)?.[0] ?? ""}`.trim();
  return `${start} – ${newest.split(" – ")[1] ?? newest}`;
}

function Points({ e }: { e: Role }) {
  if (!e.points.length && !e.link) return null;
  return (
    <div className="pts">
      {e.points.length > 0 && (
        <ul>
          {e.points.map((pt) => (
            <li key={pt}>{pt}</li>
          ))}
        </ul>
      )}
      {e.link && (
        <TLink href={e.link.href} className="pts-link">
          {e.link.label} →
        </TLink>
      )}
    </div>
  );
}

export function Ledger({ rows, detailed = false, linkedinUrl, limit }: { rows: Role[]; detailed?: boolean; linkedinUrl?: string; limit?: number }) {
  const groups = groupByOrg(rows).slice(0, limit);
  return (
    <div className="ledger">
      <div className="crest" aria-hidden="true">
        II
      </div>
      <ol className={`ledger-rows ${detailed ? "detailed" : ""}`}>
        {groups.map((g) => {
          const e = g[0];
          if (g.length === 1)
            return (
              <li key={e.org + e.role}>
                <span className="yr">{e.dates}</span>
                <span className="org">
                  {e.org}
                  <small>{e.place}</small>
                </span>
                <span className="role">{e.role}</span>
                {detailed && <Points e={e} />}
              </li>
            );
          return (
            <li key={e.org + e.role}>
              <span className="yr">{span(e.dates, g[g.length - 1].dates)}</span>
              <span className="org">
                {e.org}
                <small>{e.place}</small>
              </span>
              <ol className="steps">
                {g.map((s) => (
                  <li key={s.role}>
                    <span className="step-yr">{s.dates}</span>
                    <span className="role">{s.role}</span>
                    {detailed && <Points e={s} />}
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ol>
      {linkedinUrl && (
        <TLink href={linkedinUrl} className="btn">
          Full record on LinkedIn ↗
        </TLink>
      )}
    </div>
  );
}
