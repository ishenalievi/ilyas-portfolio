// Reads everything the admin panel (Keystatic) edits, and shapes it for the pages.
// Each loader is cached: the files are read once per build, not on every visit.

import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { createReader } from "@keystatic/core/reader";
import { imageSize } from "image-size";
import keystaticConfig from "@/keystatic.config";

const reader = createReader(process.cwd(), keystaticConfig);

// Live site: content only changes with a new deploy, so cache it for good.
// On your Mac: refresh every minute or so, so edits in /keystatic show up quickly.
const life = () => (process.env.NODE_ENV === "development" ? cacheLife("minutes") : cacheLife("max"));

export type Img = { src: string; w: number; h: number; alt: string };

/** Turns a stored "/images/…" path into an image with its real width and height. */
async function img(src: string | null | undefined, alt = ""): Promise<Img | undefined> {
  if (!src) return undefined;
  try {
    const file = await readFile(path.join(process.cwd(), "public", decodeURI(src)));
    const { width, height } = imageSize(file);
    return { src, w: width ?? 1000, h: height ?? 1000, alt };
  } catch {
    return undefined;
  }
}

const must = <T,>(value: T | null, name: string): T => {
  if (value === null) throw new Error(`Missing content file: ${name}`);
  return value;
};

// ---------- site & pages ----------

export async function getSite() {
  "use cache";
  life();
  const s = must(await reader.singletons.site.read(), "site");
  // links can be left empty in the editor; pages expect text
  return { ...s, instagramUrl: s.instagramUrl ?? "", climbingUrl: s.climbingUrl ?? "", linkedinUrl: s.linkedinUrl ?? "" };
}

export async function getHome() {
  "use cache";
  life();
  const h = must(await reader.singletons.home.read(), "home");
  const clippings = (await Promise.all(h.clippings.map((c) => img(c.image, c.alt)))).filter((x): x is Img => !!x);
  return { ...h, portrait: await img(h.portrait, ""), clippings };
}

export async function getWorkPage() {
  "use cache";
  life();
  return must(await reader.singletons.workPage.read(), "work page");
}

export async function getContentPage() {
  "use cache";
  life();
  return must(await reader.singletons.contentPage.read(), "content page");
}

export async function getAboutPage() {
  "use cache";
  life();
  return must(await reader.singletons.aboutPage.read(), "about page");
}

// ---------- experience ----------

export type Role = {
  dates: string;
  role: string;
  org: string;
  place: string;
  points: string[];
  link?: { label: string; href: string };
};

export async function getResume() {
  "use cache";
  life();
  const r = must(await reader.singletons.resume.read(), "resume");
  const shape = (x: (typeof r.work)[number]): Role => ({
    dates: x.dates,
    role: x.role,
    org: x.org,
    place: x.place,
    points: x.points.filter(Boolean),
    link: x.linkHref ? { label: x.linkLabel || "See more", href: x.linkHref } : undefined,
  });
  return { work: r.work.map(shape), volunteering: r.volunteering.map(shape) };
}

// ---------- loves ----------

export type Love = {
  fig: string;
  title: string;
  line: string;
  tag: string;
  color: string;
  img?: Img;
  fit: "cover" | "contain";
  link?: { label: string; href: string };
};

const loveColour: Record<string, string> = { city: "var(--city)", navy: "var(--navy-fixed)" };

export async function getLoves(): Promise<Love[]> {
  "use cache";
  life();
  const l = must(await reader.singletons.loves.read(), "loves");
  return Promise.all(
    l.items.map(async (x) => ({
      fig: x.fig,
      title: x.title,
      line: x.line,
      tag: x.tag,
      color: loveColour[x.color] ?? `var(--${x.color})`,
      img: await img(x.image, x.imageAlt || x.title),
      fit: x.imageFit,
      link: x.linkHref ? { label: x.linkLabel || "More", href: x.linkHref } : undefined,
    })),
  );
}

// ---------- content wall ----------

export type Post = {
  title: string;
  note: string;
  href: string;
  img: string;
  w: number;
  h: number;
  platform: "ig" | "yt";
  type: "video" | "design";
  stamp: string;
};

export async function getPosts(): Promise<Post[]> {
  "use cache";
  life();
  const p = must(await reader.singletons.posts.read(), "posts");
  const out: Post[] = [];
  // newest first by date posted; posts without a date go last, in the editor's order
  const items = p.items.map((x, i) => ({ x, i })).sort((a, b) => (b.x.date ?? "").localeCompare(a.x.date ?? "") || a.i - b.i);
  for (const { x } of items) {
    const i = await img(x.image, x.title);
    if (!i) continue;
    out.push({ title: x.title, note: x.note, href: x.href ?? "", img: i.src, w: i.w, h: i.h, platform: x.platform, type: x.type, stamp: x.stamp });
  }
  return out;
}

// ---------- stickers ----------

export async function getStickers() {
  "use cache";
  life();
  const s = (await reader.singletons.stickers.read()) ?? {};
  const out: Record<string, Img | undefined> = {};
  for (const [k, v] of Object.entries(s)) out[k] = await img(v as string | null, "");
  return out;
}

// ---------- projects ----------

export type Video = { title: string; href: string; img: Img };
export type Episode = { n: number; title: string; href: string; img?: Img; soon: boolean };

export type Project = {
  slug: string;
  no: string;
  title: string;
  subtitle: string;
  short: string;
  year: string;
  role: string;
  platform: string;
  facts: string[];
  summary: string;
  body: { heading: string; text: string }[];
  cover?: Img;
  links: { label: string; href: string }[];
  episodes: Episode[];
  videos: Video[];
  accent: "a1" | "a2" | "a3" | "a4";
};

export async function getProjects(): Promise<Project[]> {
  "use cache";
  life();
  const all = await reader.collections.projects.all();
  const projects = await Promise.all(
    all.map(async ({ slug, entry: e }) => {
      const videos: Video[] = [];
      for (const v of e.videos) {
        const i = await img(v.image, `Thumbnail for ${v.title}`);
        if (i) videos.push({ title: v.title, href: v.href ?? "", img: i });
      }
      const episodes: Episode[] = await Promise.all(
        e.episodes.map(async (ep, n) => ({
          n: n + 1,
          title: ep.title,
          href: ep.href ?? "",
          img: await img(ep.image, `${ep.title} cover`),
          soon: !ep.href,
        })),
      );
      return {
        slug,
        no: e.no,
        title: e.title,
        subtitle: e.subtitle,
        short: e.short || e.title.toUpperCase(),
        year: e.year,
        role: e.role,
        platform: e.platform,
        facts: e.facts.filter(Boolean),
        summary: e.summary,
        body: e.body.map((b) => ({ heading: b.heading, text: b.text })),
        cover: await img(e.cover, e.coverAlt),
        links: e.links.filter((l) => l.href).map((l) => ({ label: l.label, href: l.href ?? "" })),
        episodes,
        videos,
        accent: e.accent,
      } satisfies Project;
    }),
  );
  return projects.sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }));
}

export async function getProject(slug: string) {
  return (await getProjects()).find((p) => p.slug === slug);
}
