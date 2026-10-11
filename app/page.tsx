import Image from "next/image";
import { posts } from "@/content/posts";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { Lift, Tape, Torn } from "@/components/collage";
import { Clipping, HazardSlot, Ledger, Loves, SectionHead, Sheet } from "@/components/blocks";
import { ContentWall } from "@/components/ContentWall";
import { PaletteSwap } from "@/components/PaletteSwap";
import { TLink } from "@/components/transitions/TLink";

export default function Home() {
  return (
    <>
      {/* Frame 1 · Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Portfolio · Vol. 1 · 2026</p>
            <h1 className="ransom" aria-label={site.name}>
              <Torn as="span" className="r1" seed="r1" amp={6}>
                {site.firstName.toUpperCase()}
              </Torn>
              <Torn as="span" className="r2 paper-2" seed="r2" amp={5}>
                {site.lastName}
              </Torn>
            </h1>
            <p className="hero-tag">{site.tagline}</p>
            <div className="hero-actions">
              <TLink href="/work" className="btn">
                See the work
              </TLink>
              <TLink href={site.instagram.url} className="btn btn-ghost">
                {site.instagram.handle}
              </TLink>
            </div>
          </div>

          <div className="hero-board">
            <span className="gogo" aria-hidden="true">
              ゴゴゴ
            </span>
            <Lift className="hb hb-1">
              <Torn className="hb-img" seed="hb-1" amp={7}>
                <Image src="/images/posts/imprint.jpg" alt="After Hours reel cover" width={562} height={1000} loading="eager" fetchPriority="high" sizes="(max-width: 800px) 40vw, 22vw" />
              </Torn>
            </Lift>
            <Lift className="hb hb-2">
              <Torn className="hb-img" seed="hb-2" amp={7}>
                <Image src="/images/posts/kali.jpg" alt="Red Moon in Venus poster" width={801} height={1000} loading="eager" fetchPriority="high" sizes="(max-width: 800px) 36vw, 20vw" />
              </Torn>
            </Lift>
            <Lift className="hb hb-3">
              <Torn className="hb-img" seed="hb-3" amp={6}>
                <Image src="/images/btv/cocrM2CmRTM.jpg" alt="ISM Baseball Sendoff thumbnail" width={1280} height={720} sizes="(max-width: 800px) 50vw, 26vw" />
              </Torn>
            </Lift>
            <Tape className="hb-tape1" />
            <Tape className="hb-tape2" />
            <div className="hb-stamp">
              <PaletteSwap variant="stamp" />
            </div>
          </div>
        </div>
      </section>

      {/* Frame 2 · Intro */}
      <section className="intro">
        <div className="wrap intro-grid">
          <p className="intro-line">
            I edit videos, design posters, and <mark className="hl">start hobbies faster than I finish them</mark>. This site is{" "}
            <span className="circ">mostly</span> proof I finished one.
          </p>
          <span className="margin-note">← accurate, sadly</span>
        </div>
      </section>

      {/* Frame 3 · Work */}
      <section className="block">
        <div className="wrap">
          <SectionHead eyebrow="Selected work" title="Three clippings, one taped shut" />
          <div className="clips">
            {projects.map((p, i) => (
              <Clipping key={p.slug} p={p} i={i} />
            ))}
            <HazardSlot text="04 · Under construction" note="The next IMPRINT reel goes here. Allegedly soon." />
          </div>
        </div>
      </section>

      {/* Frame 4 · Content */}
      <Sheet seed="home-wall">
        <SectionHead eyebrow="Content wall" title="Reels, posters, edits">
          A selection from Instagram and YouTube. The full wall has filters.
        </SectionHead>
        <ContentWall posts={posts.slice(0, 8)} filters={false} />
        <p className="more">
          <TLink href="/content" className="btn">
            See everything →
          </TLink>
        </p>
      </Sheet>

      {/* Frame 5 · Loves */}
      <section className="block">
        <div className="wrap">
          <SectionHead eyebrow="Things I love" title="The taste wall">
            Shows, sports, books and hobbies, labelled like a museum would if it had less dignity.
          </SectionHead>
          <Loves limit={5} />
          <p className="more">
            <TLink href="/about" className="btn">
              All nine →
            </TLink>
          </p>
        </div>
      </section>

      {/* Frame 6 · Experience */}
      <Sheet seed="home-ledger">
        <SectionHead eyebrow="The record" title="Where I've been" />
        <Ledger />
      </Sheet>
    </>
  );
}
