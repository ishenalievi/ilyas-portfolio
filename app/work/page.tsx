import type { Metadata } from "next";
import Image from "next/image";
import { projects } from "@/content/projects";
import { Lift, Tape, Torn, TornSheet } from "@/components/collage";
import { HazardSlot, MiniCollage, SectionHead } from "@/components/blocks";
import { TLink } from "@/components/transitions/TLink";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <section className="block page-top">
      <div className="wrap">
        <SectionHead eyebrow="Work" title="Things I made, in order of how proud I am">
          Three so far. More get taped up as they&apos;re finished.
        </SectionHead>
        <div className="projects">
          {projects.map((p) => (
            <TornSheet key={p.slug} className="proj paper" seed={`proj-${p.slug}`} amp={8}>
                <div className="proj-text">
                  <span className="eyebrow">
                    No. {p.no} · {p.role}
                  </span>
                  <h3>
                    {p.title} <em>{p.subtitle}</em>
                  </h3>
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
                  {p.videos ? (
                    <div className="vid-grid">
                      {p.videos.map((v) => (
                        <Torn key={v.href} className="vid-thumb" seed={`wv-${v.href}`} amp={4}>
                          <Image src={v.img.src} alt={v.img.alt} width={v.img.w} height={v.img.h} sizes="(max-width: 800px) 45vw, 22vw" />
                        </Torn>
                      ))}
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
          <HazardSlot text="No. 04 · Under construction" note="Something is being made. Probably another reel." />
        </div>
      </div>
    </section>
  );
}
