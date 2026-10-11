import type { Metadata } from "next";
import { site } from "@/content/site";
import { education, languages, tools, volunteering } from "@/content/about";
import { Ledger, Loves, SectionHead, Sheet } from "@/components/blocks";
import { Lift, Torn } from "@/components/collage";
import { TLink } from "@/components/transitions/TLink";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="block page-top">
        <div className="wrap about-grid">
          <div>
            <span className="eyebrow">About</span>
            <h1 className="about-title">
              Hi, I&apos;m <span className="hl">{site.firstName}</span>.
            </h1>
          </div>
          <Lift>
            <Torn className="about-card paper" seed="about-card" amp={6}>
              {/* Placeholder bio: rewrite in your own words. */}
              <p>
                19, creative, having fun, which is what my Instagram bio says and it&apos;s still accurate. I study marketing at UBC Sauder and
                spend the rest of my time editing videos, designing things and picking up hobbies at an alarming rate.
              </p>
              <p>
                Right now that means running content for UBC IMPRINT, UBC Kababayan and Young Ventures, a guitar I&apos;m still negotiating
                with, and walls I mostly fall off.
              </p>
              <div className="about-links">
                <TLink href={site.instagram.url} className="btn">
                  {site.instagram.handle} ↗
                </TLink>
                <TLink href={site.linkedin.url} className="btn btn-ghost">
                  LinkedIn ↗
                </TLink>
              </div>
            </Torn>
          </Lift>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <SectionHead eyebrow="Things I love" title="The taste wall, all nine" />
          <Loves />
        </div>
      </section>

      <Sheet seed="about-ledger">
        <SectionHead eyebrow="The record" title="Where I've been">
          The short version of the resume. The long version lives on LinkedIn.
        </SectionHead>
        <Ledger detailed linkedin={false} />

        <h3 className="sub-head">Volunteering</h3>
        <Ledger rows={volunteering} detailed linkedin={false} />

        <div className="cv-extra">
          <div className="cv-box">
            <h3>Studying</h3>
            <p className="big">{education.school}</p>
            <p>{education.detail}</p>
            <p>{education.dates}</p>
          </div>
          <div className="cv-box">
            <h3>Tools</h3>
            <div className="chips">
              {tools.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
          <div className="cv-box">
            <h3>Languages</h3>
            {languages.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </div>

        <p className="more">
          <TLink href={site.linkedin.url} className="btn">
            Full record on LinkedIn ↗
          </TLink>
        </p>
      </Sheet>
    </>
  );
}
