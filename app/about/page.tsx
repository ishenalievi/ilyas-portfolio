import type { Metadata } from "next";
import { site } from "@/content/site";
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
                19, creative, having fun, which is what my Instagram bio says and it&apos;s still accurate. I edit videos, design posters and
                pick up hobbies at an alarming rate.
              </p>
              <p>
                Right now that means reels for UBC IMPRINT, a guitar I&apos;m still negotiating with, and climbing walls I mostly fall off.
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
        <SectionHead eyebrow="The record" title="Where I've been" />
        <Ledger />
      </Sheet>
    </>
  );
}
