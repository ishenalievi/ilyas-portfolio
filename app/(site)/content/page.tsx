import type { Metadata } from "next";
import { getContentPage, getPosts, getSite } from "@/lib/content";
import { SectionHead } from "@/components/blocks";
import { ContentWall } from "@/components/ContentWall";
import { TLink } from "@/components/transitions/TLink";

export const metadata: Metadata = { title: "Content" };

export default async function ContentPage() {
  const [page, posts, site] = await Promise.all([getContentPage(), getPosts(), getSite()]);
  return (
    <section className="block page-top">
      <div className="wrap">
        <SectionHead eyebrow={page.header.eyebrow} title={page.header.title}>
          {page.header.sub}
        </SectionHead>
        <ContentWall posts={posts} />
        <p className="more">
          <TLink href={site.instagramUrl} className="btn">
            Follow {site.instagramHandle} ↗
          </TLink>
        </p>
      </div>
    </section>
  );
}
