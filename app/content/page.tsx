import type { Metadata } from "next";
import { posts } from "@/content/posts";
import { site } from "@/content/site";
import { SectionHead } from "@/components/blocks";
import { ContentWall } from "@/components/ContentWall";
import { TLink } from "@/components/transitions/TLink";

export const metadata: Metadata = { title: "Content" };

export default function ContentPage() {
  return (
    <section className="block page-top">
      <div className="wrap">
        <SectionHead eyebrow="Content" title="The wall of everything">
          Reels, posters and edits from Instagram and YouTube. New ones weekly, allegedly.
        </SectionHead>
        <ContentWall posts={posts} />
        <p className="more">
          <TLink href={site.instagram.url} className="btn">
            Follow {site.instagram.handle} ↗
          </TLink>
        </p>
      </div>
    </section>
  );
}
