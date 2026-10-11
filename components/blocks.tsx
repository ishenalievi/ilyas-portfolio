// Shared page sections.

import Image from "next/image";
import type { ReactNode } from "react";
import { experience, loves, type Love, type Role } from "@/content/about";
import type { Project } from "@/content/projects";
import { site } from "@/content/site";
import { Lift, Tape, Torn, TornSheet } from "./collage";
import { Menacing } from "./Menacing";
import { TLink } from "./transitions/TLink";

export function SectionHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="sh">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
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
  return (
    <TLink href={`/work/${p.slug}`} label={p.short} className={`clip clip-${i}`}>
      <Tape className="clip-tape" />
      <Lift>
        <Torn className="clip-paper paper-2" seed={`clip-${p.slug}`} amp={5}>
          <div className="clip-img" style={{ background: `var(--${p.accent})` }}>
            {p.cover ? (
              <Image src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} sizes="(max-width: 700px) 90vw, 30vw" />
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

export function LoveCard({ l, i }: { l: Love; i: number }) {
  return (
    <Lift className="love">
      <Torn className="love-card paper" seed={`love-${i}`} amp={5}>
        <Torn className="love-ph" sides="b" amp={6} seed={`love-ph-${i}`} style={{ background: l.color }}>
          {l.tag === "ゴゴゴ" ? <Menacing count={3} className="love-menace" /> : <span>{l.tag}</span>}
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

export function Loves({ limit }: { limit?: number }) {
  const list = limit ? loves.slice(0, limit) : loves;
  return (
    <div className="loves">
      {list.map((l, i) => (
        <LoveCard key={l.title} l={l} i={i} />
      ))}
    </div>
  );
}

export function Ledger({ rows = experience, detailed = false, linkedin = true }: { rows?: Role[]; detailed?: boolean; linkedin?: boolean }) {
  return (
    <div className="ledger">
      <div className="crest" aria-hidden="true">
        II
      </div>
      <ol className={`ledger-rows ${detailed ? "detailed" : ""}`}>
        {rows.map((e) => (
          <li key={e.org + e.role}>
            <span className="yr">{e.dates}</span>
            <span className="org">
              {e.org}
              <small>{e.place}</small>
            </span>
            <span className="role">{e.role}</span>
            {detailed && (
              <div className="pts">
                <ul>
                  {e.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                {e.link && (
                  <TLink href={e.link.href} className="pts-link">
                    {e.link.label} →
                  </TLink>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
      {linkedin && (
        <TLink href={site.linkedin.url} className="btn">
          Full record on LinkedIn ↗
        </TLink>
      )}
    </div>
  );
}
