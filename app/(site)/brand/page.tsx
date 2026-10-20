// The brand booklet, laid out. Only the owner can open this page: proxy.ts checks the
// same GitHub sign-in as /keystatic and shows everyone else "page not found".
// Edit the words and colours in /keystatic → Brand booklet.

import type { Metadata } from "next";
import Link from "next/link";
import "./brand.css";
import { getBrand, getSite } from "@/lib/content";
import { Lift, Tape, Torn } from "@/components/collage";
import { SectionHead, Sheet } from "@/components/blocks";
import { Menacing } from "@/components/Menacing";
import { PaletteSwap } from "@/components/PaletteSwap";
import { PlayButton } from "@/components/BrandPlay";
import type { Kind } from "@/components/transitions/engine";

export const metadata: Metadata = {
  title: "Brand booklet",
  robots: { index: false, follow: false },
};

const SECTIONS = [
  ["identity", "Identity"],
  ["voice", "Voice"],
  ["colour", "Colour"],
  ["type", "Type"],
  ["motifs", "Motifs"],
  ["imagery", "Imagery"],
  ["motion", "Motion"],
  ["layout", "Layout"],
] as const;

/** cubic-bezier(a, b, c, d) drawn as a little graph: time left to right, progress bottom to top. */
function Curve({ value }: { value: string }) {
  const n = value.match(/-?\d*\.?\d+/g)?.map(Number);
  if (!n || n.length !== 4) return null;
  const [x1, y1, x2, y2] = n;
  const y = (v: number) => 100 - v * 100;
  // room for curves that overshoot (Pop), so every graph shares one scale
  const ys = [0, 100, y(y1), y(y2)];
  const top = Math.min(...ys) - 6;
  const height = Math.max(...ys) + 6 - top;
  return (
    <svg className="bb-curve" viewBox={`-6 ${top} 112 ${height}`} style={{ height: `${(height / 112) * 6}rem` }} aria-hidden="true">
      <path d="M0 100 H100 M0 0 H100" className="bb-curve-grid" />
      <path d={`M0 100 L${x1 * 100} ${y(y1)} M100 0 L${x2 * 100} ${y(y2)}`} className="bb-curve-handle" />
      <path d={`M0 100 C${x1 * 100} ${y(y1)} ${x2 * 100} ${y(y2)} 100 0`} className="bb-curve-line" />
    </svg>
  );
}

const playLabel = (kind: string, intro: string) =>
  kind === "menace" ? intro : kind === "strips" ? "BRAND" : kind === "tbc" ? "Leaving the site" : "BRAND BOOKLET";

export default async function BrandPage() {
  const [b, site] = await Promise.all([getBrand(), getSite()]);
  const [first, ...rest] = b.title.split(" ");
  const sfx = b.motion.transitions.filter((t) => t.sfx && t.sfx !== "ゴゴゴ");

  return (
    <>
      {/* cover */}
      <section className="block page-top bb-cover">
        <div className="wrap bb-cover-grid">
          <div className="bb-cover-copy">
            <p className="eyebrow">{b.edition} · For your eyes only</p>
            <h1 className="ransom" aria-label={b.title}>
              <Torn as="span" className="r1" seed="bb-r1" amp={6}>
                {first.toUpperCase()}
              </Torn>
              {rest.length > 0 && (
                <Torn as="span" className="r2 paper-2" seed="bb-r2" amp={5}>
                  {rest.join(" ")}
                </Torn>
              )}
            </h1>
            <p className="bb-essence">{b.essence}</p>
          </div>
          <div className="bb-cover-side" aria-hidden="true">
            <Menacing className="bb-gogo" />
            <span className="bb-private">Private · not on the site</span>
          </div>
        </div>
        <nav className="wrap bb-toc" aria-label="Booklet sections">
          {SECTIONS.map(([id, name], i) => (
            <a key={id} href={`#${id}`}>
              <small>{String(i + 1).padStart(2, "0")}</small> {name}
            </a>
          ))}
        </nav>
      </section>

      {/* 01 · identity */}
      <Sheet seed="bb-identity" className="bb-anchor">
        <div id="identity" className="bb-target" />
        <SectionHead eyebrow="01 · Identity" title="Who this is" />
        <div className="bb-id">
          <div className="bb-mono">
            <span>{b.identity.monogram}</span>
            <small>Monogram</small>
          </div>
          <div className="bb-wordmark">
            <h3 className="bb-h">The name</h3>
            <div className="ransom bb-mini" aria-hidden="true">
              <Torn as="span" className="r1" seed="bb-m1" amp={4}>
                {site.firstName.toUpperCase()}
              </Torn>
              <Torn as="span" className="r2 paper-2" seed="bb-m2" amp={3}>
                {site.lastName}
              </Torn>
            </div>
            <p>{b.identity.wordmark}</p>
          </div>
        </div>
        <ul className="bb-words" aria-label="Brand words">
          {b.identity.words.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <div className="bb-two">
          <div>
            <h3 className="bb-h">The site is</h3>
            <ul className="bb-list">
              {b.identity.is.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="bb-h">The site is never</h3>
            <ul className="bb-list bb-x">
              {b.identity.isNot.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>

      {/* 02 · voice */}
      <section className="block bb-anchor">
        <div id="voice" className="bb-target" />
        <div className="wrap">
          <SectionHead eyebrow="02 · Voice" title="How it talks">
            {b.voice.summary}
          </SectionHead>
          <ol className="bb-principles">
            {b.voice.principles.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <div className="bb-two bb-dodont">
            <Lift>
              <Torn className="paper bb-card" seed="bb-do">
                <h3 className="bb-h">Do</h3>
                <ul className="bb-list">
                  {b.voice.do.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Torn>
            </Lift>
            <Lift>
              <Torn className="paper-2 bb-card" seed="bb-dont">
                <h3 className="bb-h">Don&rsquo;t</h3>
                <ul className="bb-list bb-x">
                  {b.voice.dont.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </Torn>
            </Lift>
          </div>
          <div className="bb-samples">
            {b.voice.samples.map((s, i) => (
              <figure key={s.line} className="bb-sample">
                {i % 2 === 0 && <Tape className="bb-tape" />}
                <Lift>
                  <Torn className="paper bb-card" seed={`bb-s${i}`}>
                    <blockquote>{s.line}</blockquote>
                    <figcaption>{s.where}</figcaption>
                  </Torn>
                </Lift>
              </figure>
            ))}
          </div>
          <div className="bb-sfx">
            <p>{b.voice.sfx}</p>
            <div className="bb-sfx-row" aria-hidden="true">
              {sfx.map((t, i) => (
                <span key={t.sfx} style={{ "--r": `${i % 2 ? 4 : -5}deg` } as React.CSSProperties}>
                  {t.sfx}
                </span>
              ))}
              <Menacing count={3} className="bb-sfx-gogo" />
            </div>
          </div>
        </div>
      </section>

      {/* 03 · colour */}
      <Sheet seed="bb-colour" className="bb-anchor">
        <div id="colour" className="bb-target" />
        <SectionHead eyebrow="03 · Colour" title="Colours & palettes" />
        {b.colourGroups.map((g) => (
          <div key={g.title} className="bb-group">
            <h3 className="bb-h">{g.title}</h3>
            {g.note && <p className="bb-note">{g.note}</p>}
            <ul className="bb-swatches">
              {g.colours.map((c) => (
                <li key={`${c.name}${c.hex}`} className="bb-swatch">
                  <span className="bb-chip" style={{ background: c.hex }} />
                  <b>{c.name}</b>
                  <code>{c.hex}</code>
                  {c.token && <code className="bb-token">{c.token}</code>}
                  <small>{c.use}</small>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="bb-group">
          <h3 className="bb-h">Palettes</h3>
          <p className="bb-note">Each one recolours the four accents and two of the background stripes. The first is the default.</p>
          <div className="bb-palettes">
            {b.palettes.map((p, i) => (
              <div key={p.name} className="bb-pal">
                <div
                  className="bb-pal-stripes"
                  style={{
                    background: `linear-gradient(90deg, var(--rl-navy) 0 20%, ${p.a1} 20% 40%, var(--rl-red) 40% 60%, ${p.a2} 60% 80%, var(--rl-green) 80%)`,
                  }}
                  aria-hidden="true"
                />
                <div className="bb-pal-chips">
                  {(["a1", "a2", "a3", "a4"] as const).map((a) => (
                    <span key={a} style={{ background: p[a] }} title={`Accent ${a.slice(1)} ${p[a]}`} />
                  ))}
                </div>
                <b>
                  {i + 1}. {p.name}
                </b>
                <small>{p.mood}</small>
                <code>{[p.a1, p.a2, p.a3, p.a4].join(" ")}</code>
              </div>
            ))}
          </div>
          <div className="bb-try">
            <PaletteSwap variant="stamp" />
            <ul className="bb-list">
              {b.accentRoles.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>

      {/* 04 · type */}
      <section className="block bb-anchor">
        <div id="type" className="bb-target" />
        <div className="wrap">
          <SectionHead eyebrow="04 · Type" title="Four fonts, no more">
            {b.typeNote}
          </SectionHead>
          <div className="bb-type">
            {b.type.map((t, i) => (
              <Lift key={t.role}>
                <Torn className={`${i % 2 ? "paper-2" : "paper"} bb-card bb-font`} seed={`bb-t${i}`} data-token={t.token}>
                  <span className="eyebrow">{t.role}</span>
                  <p className="bb-specimen" style={{ fontFamily: `var(${t.token})` }}>
                    {t.sample}
                  </p>
                  <b>{t.font}</b>
                  <code>{t.token}</code>
                  <small>{t.use}</small>
                </Torn>
              </Lift>
            ))}
          </div>
        </div>
      </section>

      {/* 05 · motifs */}
      <Sheet seed="bb-motifs" className="bb-anchor">
        <div id="motifs" className="bb-target" />
        <SectionHead eyebrow="05 · Motifs" title="Motifs & textures" />
        <div className="bb-motifs">
          {b.motifs.map((m, i) => (
            <div key={m.name} className="bb-motif">
              {i % 3 === 0 && <Tape className="bb-tape" />}
              <Lift>
                <Torn className={`${i % 2 ? "paper" : "paper-2"} bb-card`} seed={`bb-mo${i}`}>
                  <h3 className="bb-h">{m.name}</h3>
                  <p>{m.how}</p>
                </Torn>
              </Lift>
            </div>
          ))}
        </div>
      </Sheet>

      {/* 06 · imagery */}
      <section className="block bb-anchor">
        <div id="imagery" className="bb-target" />
        <div className="wrap">
          <SectionHead eyebrow="06 · Imagery" title="Photos & stickers" />
          <ol className="bb-principles">
            {b.imagery.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* 07 · motion */}
      <Sheet seed="bb-motion" className="bb-anchor">
        <div id="motion" className="bb-target" />
        <SectionHead eyebrow="07 · Motion" title="How it moves" />
        <ul className="bb-list bb-wide">
          {b.motion.principles.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        <h3 className="bb-h bb-sub">Page transitions</h3>
        <ul className="bb-transitions">
          {b.motion.transitions.map((t) => (
            <li key={t.kind + t.where}>
              <span className="bb-where">{t.where}</span>
              <b>
                {t.stand}
                {t.sfx && <span className="bb-tsfx">{t.sfx}</span>}
              </b>
              <p>{t.feel}</p>
              <PlayButton kind={t.kind as Kind} label={playLabel(t.kind, site.introLabel)} name={t.stand} />
            </li>
          ))}
        </ul>

        <h3 className="bb-h bb-sub">Easing</h3>
        <div className="bb-easing">
          {b.motion.easing.map((e) => (
            <div key={e.name} className="bb-ease">
              <Curve value={e.value} />
              <b>{e.name}</b>
              <code>{e.value}</code>
              <small>{e.use}</small>
            </div>
          ))}
        </div>

        <h3 className="bb-h bb-sub">Everything else that moves</h3>
        <ul className="bb-list bb-wide">
          {b.motion.ambient.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Sheet>

      {/* 08 · layout */}
      <section className="block bb-anchor">
        <div id="layout" className="bb-target" />
        <div className="wrap">
          <SectionHead eyebrow="08 · Layout" title="Space & scale" />
          <ol className="bb-principles">
            {b.layout.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
          <div className="bb-edit">
            <p>
              To change anything here, edit the booklet, then ask Claude to <em>sync the site with the booklet</em>.
            </p>
            <Link className="btn" href="/keystatic/singleton/brand" prefetch={false}>
              Edit the booklet
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
