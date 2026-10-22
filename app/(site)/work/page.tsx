import type { Metadata } from "next";
import Image from "next/image";
import { getProjects, getWorkPage } from "@/lib/content";
import { Lift, Tape, Torn, TornSheet } from "@/components/collage";
import { HazardSlot, MiniCollage, SectionHead } from "@/components/blocks";
import { TLink } from "@/components/transitions/TLink";
import { LoopVideo } from "@/components/LoopVideo";

export const metadata: Metadata = { title: "Work" };

export default async function WorkPage() {
  const [page, projects] = await Promise.all([getWorkPage(), getProjects()]);
  return (
    <section className="block page-top">
      <div className="wrap">
        <SectionHead level={1} eyebrow={page.header.eyebrow} title={page.header.title}>
          {page.header.sub}
        </SectionHead>
        <div className="projects">
          {projects.map((p) => (
            <TornSheet key={p.slug} className="proj paper" seed={`proj-${p.slug}`} amp={8}>
                <div className="proj-text">
                  <span className="eyebrow">
                    No. {p.no} · {p.role}
                  </span>
                  <h3>{p.title}</h3>
                  {p.subtitle && <p className="proj-sub">{p.subtitle}</p>}
                  <p>{p.summary}</p>
                  <div className="facts">
                    {p.facts.map((f) => (
                      <span key={f}>{f}</span>
                    ))}
                  </div>
                  <TLink href={`/work/${p.slug}`} label={p.short} className="btn">
                    Open the project
                  </TLink>
                </div>
                <TLink href={`/work/${p.slug}`} label={p.short} className="proj-visual" aria-label={`Open ${p.title}`}>
                  {p.videos.length ? (
                    <div className="vid-grid">
                      {p.videos.map((v) => (
                        <Torn key={v.href} className="vid-thumb" seed={`wv-${v.href}`} amp={4}>
                          <Image src={v.img.src} alt={v.img.alt} width={v.img.w} height={v.img.h} sizes="(max-width: 800px) 45vw, 22vw" />
                        </Torn>
                      ))}
                    </div>
                  ) : p.episodes.filter((e) => e.img).length > 1 ? (
                    // a series: every episode poster that's out, side by side
                    <div className="posters">
                      {p.episodes.map(
                        (e) =>
                          e.img && (
                            <div key={e.n} className="poster">
                              <Tape className="poster-tape" />
                              <Lift>
                                <Torn className="poster-img" seed={`wp-${p.slug}-${e.n}`} amp={6}>
                                  {e.video ? <LoopVideo src={e.video} poster={e.img} /> : <Image src={e.img.src} alt={e.img.alt} width={e.img.w} height={e.img.h} sizes="(max-width: 800px) 40vw, 18vw" />}
                                </Torn>
                              </Lift>
                            </div>
                          ),
                      )}
                    </div>
                  ) : p.cover ? (
                    <div className="poster">
                      <Tape className="poster-tape" />
                      <Lift>
                        <Torn className="poster-img" seed={`wp-${p.slug}`} amp={6}>
                          <Image src={p.cover.src} alt={p.cover.alt} width={p.cover.w} height={p.cover.h} sizes="(max-width: 800px) 60vw, 22vw" />
                        </Torn>
                      </Lift>
                    </div>
                  ) : (
                    <MiniCollage seed={`work-${p.slug}`} />
                  )}
                </TLink>
            </TornSheet>
          ))}
          {page.soonTitle && <HazardSlot text={page.soonTitle} note={page.soonNote} />}
        </div>
      </div>
    </section>
  );
}
