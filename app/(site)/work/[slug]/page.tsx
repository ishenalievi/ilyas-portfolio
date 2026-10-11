import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";
import { Lift, Tape, Torn, TornSheet } from "@/components/collage";
import { MiniCollage } from "@/components/blocks";
import { TLink } from "@/components/transitions/TLink";

// Every project page is built ahead of time, so a blocking load is fine.
export const instant = false;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const projects = await getProjects();
  const p = projects.find((x) => x.slug === slug);
  if (!p) notFound();
  const next = projects[(projects.indexOf(p) + 1) % projects.length];

  return (
    <article className="pp">
      <Torn sides="b" amp={14} seed={`pp-hero-${p.slug}`} className={`pp-hero halftone-${p.accent}`}>
        <div className="wrap pp-hero-inner">
          <Lift>
            <Torn className="pp-title paper" seed={`ppt-${p.slug}`} amp={5}>
              <span className="eyebrow">No. {p.no}</span>
              <h1>{p.title}</h1>
              <em>{p.subtitle}</em>
            </Torn>
          </Lift>
          {p.cover && !p.videos.length ? (
            <div className="pp-cover">
              <Tape className="poster-tape" />
              <Lift>
                <Torn className="poster-img" seed={`ppc-${p.slug}`} amp={6}>
                  <Image src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} loading="eager" fetchPriority="high" sizes="(max-width: 800px) 60vw, 24vw" />
                </Torn>
              </Lift>
            </div>
          ) : p.videos.length ? (
            <div className="pp-cover pp-cover-wide">
              <Lift>
                <Torn className="poster-img" seed={`ppc-${p.slug}`} amp={6}>
                  <Image src={p.videos[0].img.src} alt={p.videos[0].img.alt} width={p.videos[0].img.w} height={p.videos[0].img.h} loading="eager" fetchPriority="high" sizes="(max-width: 800px) 90vw, 45vw" />
                </Torn>
              </Lift>
            </div>
          ) : (
            <div className="pp-cover pp-cover-wide">
              <MiniCollage seed={`pp-${p.slug}`} />
            </div>
          )}
        </div>
      </Torn>

      <div className="wrap pp-sheet-wrap">
        <TornSheet className="pp-sheet paper" seed={`pps-${p.slug}`} amp={8}>
      <div className="pp-grid">
        <aside className="pp-meta">
          <dl>
            <div>
              <dt>Role</dt>
              <dd>{p.role}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{p.year}</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{p.platform}</dd>
            </div>
          </dl>
          {p.links.map((l) => (
            <TLink key={l.href} href={l.href} className="btn">
              {l.label} ↗
            </TLink>
          ))}
        </aside>

        <div className="pp-body">
          <p className="pp-lede">{p.summary}</p>
          {p.body.map((b) => (
            <section key={b.heading}>
              <h2>{b.heading}</h2>
              <p>{b.text}</p>
            </section>
          ))}

          {p.episodes.length > 0 && (
            <section>
              <h2>Episodes</h2>
              <div className="eps">
                {p.episodes.map((e) =>
                  e.soon ? (
                    <div key={e.n} className="ep ep-soon">
                      <div className="hazard">
                        <span>Ep. {String(e.n).padStart(2, "0")} · soon</span>
                      </div>
                    </div>
                  ) : (
                    <TLink key={e.n} href={e.href} className="ep">
                      {e.img && (
                        <Torn className="ep-img" seed={`ep-${e.n}`} amp={4}>
                          <Image src={e.img.src} alt={e.img.alt} width={e.img.w} height={e.img.h} sizes="(max-width: 700px) 45vw, 16vw" />
                        </Torn>
                      )}
                      <b>
                        Ep. {String(e.n).padStart(2, "0")} · {e.title}
                      </b>
                    </TLink>
                  ),
                )}
              </div>
            </section>
          )}

          {p.videos.length > 0 && (
            <section>
              <h2>The videos</h2>
              <div className="vids">
                {p.videos.map((v) => (
                  <TLink key={v.href} href={v.href} className="vid">
                    <Torn className="vid-thumb" seed={`v-${v.href}`} amp={4}>
                      <Image src={v.img.src} alt={v.img.alt} width={v.img.w} height={v.img.h} sizes="(max-width: 700px) 90vw, 30vw" />
                    </Torn>
                    <span>{v.title}</span>
                  </TLink>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
        </TornSheet>
      </div>

      <div className="wrap pp-next">
        <TLink href={`/work/${next.slug}`} label={next.short} className="btn btn-big">
          Next: {next.title} →
        </TLink>
        <TLink href="/work" className="back">
          ← All work
        </TLink>
      </div>
    </article>
  );
}
