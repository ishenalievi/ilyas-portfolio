import Image from "next/image";
import { getHome, getLoves, getPosts, getProjects, getResume, getSite } from "@/lib/content";
import { Lift, Tape, Torn } from "@/components/collage";
import { Clipping, HazardSlot, Ledger, Loves, SectionHead, Sheet } from "@/components/blocks";
import { ContentWall } from "@/components/ContentWall";
import { Menacing } from "@/components/Menacing";
import { PaletteSwap } from "@/components/PaletteSwap";
import { TLink } from "@/components/transitions/TLink";
import { LoopVideo } from "@/components/LoopVideo";
import { NowPlaying } from "@/components/NowPlaying";

// a space between sentence parts, unless the next part starts with punctuation
const glue = (next: string) => (/^[.,!?;:)]/.test(next) ? "" : " ");

export default async function Home() {
  const [site, home, projects, posts, loves, resume] = await Promise.all([getSite(), getHome(), getProjects(), getPosts(), getLoves(), getResume()]);
  const { intro } = home;

  return (
    <>
      {/* Frame 1 · Hero */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            {home.heroEyebrow && <p className="eyebrow">{home.heroEyebrow}</p>}
            <h1 className="ransom" aria-label={site.name}>
              <Torn as="span" className="r1" seed="r1" amp={6}>
                {site.firstName.toUpperCase()}
              </Torn>
              <Torn as="span" className="r2 paper-2" seed="r2" amp={5}>
                {site.lastName}
              </Torn>
            </h1>
            {site.tagline && <p className="hero-tag">{site.tagline}</p>}
            <div className="hero-actions">
              <TLink href="/work" className="btn">
                {home.primaryButton || "See the work"}
              </TLink>
              <TLink href={site.instagramUrl} className="btn btn-ghost">
                {site.instagramHandle}
              </TLink>
            </div>
          </div>

          <div className="hero-board">
            <Menacing className="gogo" />
            {home.clippings.slice(0, 3).map((c, i) => (
              <div key={c.src} className={`hb hb-${i + 1}`}>
                <Lift>
                  <Torn className="hb-img" seed={`hb-${i + 1}`} amp={i === 2 ? 6 : 7}>
                    {c.video ? <LoopVideo src={c.video} poster={c} /> : <Image src={c.src} alt={c.alt} width={c.w} height={c.h} loading={i < 2 ? "eager" : undefined} fetchPriority={i < 2 ? "high" : undefined} sizes="(max-width: 800px) 45vw, 24vw" />}
                  </Torn>
                </Lift>
                {/* the tape rides on its clipping, so it drifts and drops in with it */}
                {i < 2 && <Tape className={`hb-tape${i + 1}`} />}
              </div>
            ))}
            {/* the headshot, cut out like a sticker, in front of the clippings */}
            {home.portrait && (
              <div className="hb-portrait">
                <Image src={home.portrait.src} alt={site.name} width={home.portrait.w} height={home.portrait.h} loading="eager" fetchPriority="high" sizes="(max-width: 800px) 70vw, 36vw" />
              </div>
            )}
            {/* what's playing on Spotify, stuck under the headshot (shows once Spotify is connected) */}
            <NowPlaying />
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
            {intro.before}
            {intro.highlight && (
              <>
                {glue(intro.highlight)}
                <mark className="hl">{intro.highlight}</mark>
              </>
            )}
            {intro.middle && glue(intro.middle) + intro.middle}
            {intro.circled && (
              <>
                {glue(intro.circled)}
                <span className="circ">{intro.circled}</span>
              </>
            )}
            {intro.after && glue(intro.after) + intro.after}
          </p>
          {intro.note && <span className="margin-note">{intro.note}</span>}
        </div>
      </section>

      {/* Frame 3 · Work */}
      <section className="block">
        <div className="wrap">
          <SectionHead eyebrow={home.work.eyebrow} title={home.work.title}>
            {home.work.sub}
          </SectionHead>
          <div className="clips">
            {projects.map((p, i) => (
              <Clipping key={p.slug} p={p} i={i} />
            ))}
            {home.soonTitle && <HazardSlot text={home.soonTitle} note={home.soonNote} />}
          </div>
        </div>
      </section>

      {/* Frame 4 · Content */}
      <Sheet seed="home-wall">
        <SectionHead eyebrow={home.wall.eyebrow} title={home.wall.title}>
          {home.wall.sub}
        </SectionHead>
        <ContentWall posts={posts.slice(0, 8)} filters={false} />
        <p className="more">
          <TLink href="/content" className="btn">
            {home.wallButton || "See everything →"}
          </TLink>
        </p>
      </Sheet>

      {/* Frame 5 · Loves */}
      <section className="block">
        <div className="wrap">
          <SectionHead eyebrow={home.loves.eyebrow} title={home.loves.title}>
            {home.loves.sub}
          </SectionHead>
          <Loves items={loves} limit={home.lovesCount ?? 5} />
          <p className="more">
            <TLink href="/about" className="btn">
              {home.lovesButton || "All of them →"}
            </TLink>
          </p>
        </div>
      </section>

      {/* Frame 6 · Experience */}
      <Sheet seed="home-ledger">
        <SectionHead eyebrow={home.record.eyebrow} title={home.record.title}>
          {home.record.sub}
        </SectionHead>
        <Ledger rows={resume.work.slice(0, home.recordCount ?? 4)} linkedinUrl={site.linkedinUrl} />
        <p className="more">
          <TLink href="/about" className="btn btn-ghost">
            {home.recordButton || "The full record →"}
          </TLink>
        </p>
      </Sheet>
    </>
  );
}
