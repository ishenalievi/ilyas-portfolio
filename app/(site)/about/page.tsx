import type { Metadata } from "next";
import { getAboutPage, getLoves, getResume, getSite } from "@/lib/content";
import { Ledger, Loves, SectionHead, Sheet } from "@/components/blocks";
import Image from "next/image";
import { Lift, Tape, Torn } from "@/components/collage";
import { TLink } from "@/components/transitions/TLink";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const [site, page, loves, resume] = await Promise.all([getSite(), getAboutPage(), getLoves(), getResume()]);
  return (
    <>
      <section className="block page-top">
        <div className="wrap about-grid">
          <div className="about-head">
            {page.eyebrow && <span className="eyebrow">{page.eyebrow}</span>}
            <h1 className="about-title">
              {page.greeting} <span className="hl">{site.firstName}</span>.
            </h1>
            {page.photo && (
              <div className="about-photo">
                <Tape className="poster-tape" />
                <Lift>
                  <Torn className="poster-img" seed="about-photo" amp={6}>
                    <Image src={page.photo.src} alt={page.photo.alt} width={page.photo.w} height={page.photo.h} loading="eager" sizes="(max-width: 800px) 70vw, 26vw" />
                  </Torn>
                </Lift>
              </div>
            )}
          </div>
          <Lift>
            <Torn className="about-card paper" seed="about-card" amp={6}>
              {page.bio.filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              <div className="about-links">
                <TLink href={site.instagramUrl} className="btn">
                  {site.instagramHandle} ↗
                </TLink>
                <TLink href={site.climbingUrl} className="btn btn-ghost">
                  Climbing {site.climbingHandle} ↗
                </TLink>
                <TLink href={site.linkedinUrl} className="btn btn-ghost">
                  LinkedIn ↗
                </TLink>
              </div>
            </Torn>
          </Lift>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <SectionHead eyebrow={page.loves.eyebrow} title={page.loves.title}>
            {page.loves.sub}
          </SectionHead>
          <Loves items={loves} />
        </div>
      </section>

      <Sheet seed="about-ledger">
        <SectionHead eyebrow={page.record.eyebrow} title={page.record.title}>
          {page.record.sub}
        </SectionHead>
        <Ledger rows={resume.work} detailed />

        {resume.volunteering.length > 0 && (
          <>
            <h3 className="sub-head">{page.volunteeringTitle || "Volunteering"}</h3>
            <Ledger rows={resume.volunteering} detailed />
          </>
        )}

        <div className="cv-extra">
          <div className="cv-box">
            <h3>Studying</h3>
            <p className="big">{page.school}</p>
            <p>{page.studyDetail}</p>
            <p>{page.studyDates}</p>
          </div>
          {page.tools.length > 0 && (
            <div className="cv-box">
              <h3>Tools</h3>
              <div className="chips">
                {page.tools.filter(Boolean).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {page.languages.length > 0 && (
            <div className="cv-box">
              <h3>Languages</h3>
              {page.languages.filter(Boolean).map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          )}
        </div>

        <p className="more">
          <TLink href={site.linkedinUrl} className="btn">
            Full record on LinkedIn ↗
          </TLink>
        </p>
      </Sheet>
    </>
  );
}
