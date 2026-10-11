// The admin panel (/keystatic). Everything editable on the site is described here.
// Content lives in /content as JSON files; images live in /public.
//
// Storage: on your Mac (npm run dev) edits save straight to the files.
// On the live site, edits are saved to GitHub through your account and go live
// after Vercel rebuilds (about a minute).

import { collection, config, fields, singleton } from "@keystatic/core";

const useGithub = process.env.NODE_ENV !== "development" || process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

const text = (label: string, description?: string) => fields.text({ label, description });
const longText = (label: string, description?: string) => fields.text({ label, description, multiline: true });
const link = (label: string) => fields.url({ label });
const heading = (label: string) =>
  fields.object(
    {
      eyebrow: text("Small label above"),
      title: text("Heading"),
      sub: longText("Line under the heading (optional)"),
    },
    { label },
  );

const accent = fields.select({
  label: "Accent colour",
  description: "Follows the palette swap",
  options: [
    { label: "Accent 1", value: "a1" },
    { label: "Accent 2", value: "a2" },
    { label: "Accent 3", value: "a3" },
    { label: "Accent 4", value: "a4" },
  ],
  defaultValue: "a1",
});

const role = fields.object({
  dates: text("Dates", "e.g. Apr 2026 – now"),
  role: text("Role"),
  org: text("Organisation"),
  place: text("Place"),
  points: fields.array(longText("Highlight"), { label: "Highlights", itemLabel: (p) => p.value || "Highlight" }),
  linkLabel: text("Link text (optional)", "e.g. See IMPRINT Reels"),
  linkHref: text("Link (optional)", "e.g. /work/imprint-reels or a full https:// address"),
});

const sticker = (label: string) => fields.image({ label, directory: "public/stickers", publicPath: "/stickers/" });

export default config({
  storage: useGithub ? { kind: "github", repo: { owner: "ishenalievi", name: "ilyas-portfolio" } } : { kind: "local" },
  ui: {
    brand: { name: "Ilyas · site editor" },
    navigation: {
      "Site & pages": ["site", "home", "workPage", "contentPage", "aboutPage"],
      "Your stuff": ["projects", "resume", "posts", "loves"],
      Extras: ["stickers"],
    },
  },

  singletons: {
    site: singleton({
      label: "Site details & links",
      path: "content/settings/site",
      format: { data: "json" },
      schema: {
        name: text("Full name"),
        firstName: text("First name"),
        lastName: text("Last name"),
        tagline: text("Tagline", "The black strip under your name on Home"),
        description: longText("Search-engine description"),
        year: text("Year in the footer"),
        introLabel: text("Intro card text", "Shown under ゴゴゴ when the site loads, after “Welcome to”"),
        footerNote: text("Footer small print"),
        instagramHandle: text("Instagram handle"),
        instagramUrl: link("Instagram link"),
        climbingHandle: text("Climbing Instagram handle"),
        climbingUrl: link("Climbing Instagram link"),
        linkedinUrl: link("LinkedIn link"),
      },
    }),

    home: singleton({
      label: "Home page",
      path: "content/settings/home",
      format: { data: "json" },
      schema: {
        heroEyebrow: text("Small label above your name"),
        primaryButton: text("Main button text"),
        portrait: fields.image({ label: "Headshot (cut-out PNG works best)", directory: "public/images", publicPath: "/images/" }),
        clippings: fields.array(
          fields.object({
            title: text("Name (for your reference)"),
            image: fields.image({ label: "Image", directory: "public/images/hero", publicPath: "/images/hero/" }),
            alt: text("Description for screen readers"),
          }),
          { label: "Hero clippings (first three are used)", itemLabel: (p) => p.fields.title.value || "Clipping", slugField: "title" },
        ),
        intro: fields.object(
          {
            before: text("Start of the sentence"),
            highlight: text("Highlighted part"),
            middle: text("Middle"),
            circled: text("Circled word"),
            after: text("End of the sentence"),
            note: text("Margin note"),
          },
          { label: "Intro sentence" },
        ),
        work: heading("Work section"),
        soonTitle: text("Taped-shut slot label"),
        soonNote: text("Taped-shut slot note"),
        wall: heading("Content wall section"),
        wallButton: text("Content wall button"),
        loves: heading("Loves section"),
        lovesCount: fields.integer({ label: "How many loves to show on Home", defaultValue: 5 }),
        lovesButton: text("Loves button"),
        record: heading("Experience section"),
        recordCount: fields.integer({ label: "How many roles to show on Home", defaultValue: 4 }),
        recordButton: text("Experience button"),
      },
    }),

    workPage: singleton({
      label: "Work page",
      path: "content/settings/work-page",
      format: { data: "json" },
      schema: {
        header: heading("Header"),
        soonTitle: text("Taped-shut slot label"),
        soonNote: text("Taped-shut slot note"),
      },
    }),

    contentPage: singleton({
      label: "Content page",
      path: "content/settings/content-page",
      format: { data: "json" },
      schema: {
        header: heading("Header"),
      },
    }),

    aboutPage: singleton({
      label: "About page",
      path: "content/settings/about-page",
      format: { data: "json" },
      schema: {
        eyebrow: text("Small label above the greeting"),
        greeting: text("Greeting before your first name", "e.g. Hi, I'm"),
        bio: fields.array(longText("Paragraph"), { label: "Bio paragraphs", itemLabel: (p) => (p.value || "Paragraph").slice(0, 60) }),
        loves: heading("Loves section"),
        record: heading("Experience section"),
        volunteeringTitle: text("Volunteering heading"),
        school: text("School"),
        studyDetail: text("What you study"),
        studyDates: text("Graduation"),
        tools: fields.array(text("Tool"), { label: "Tools", itemLabel: (p) => p.value || "Tool" }),
        languages: fields.array(text("Language"), { label: "Languages", itemLabel: (p) => p.value || "Language" }),
      },
    }),

    resume: singleton({
      label: "Experience & volunteering",
      path: "content/settings/resume",
      format: { data: "json" },
      schema: {
        work: fields.array(role, {
          label: "Work experience (top = newest)",
          itemLabel: (p) => `${p.fields.role.value || "Role"} · ${p.fields.org.value || "Organisation"}`,
        }),
        volunteering: fields.array(role, {
          label: "Volunteering",
          itemLabel: (p) => `${p.fields.role.value || "Role"} · ${p.fields.org.value || "Organisation"}`,
        }),
      },
    }),

    loves: singleton({
      label: "Things I love",
      path: "content/settings/loves",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            title: text("Name"),
            fig: text("Gallery label", "e.g. Manga, 1987–"),
            line: longText("Your line about it"),
            tag: text("Big word on the colour strip", "Type ゴゴゴ to get the JoJo lettering"),
            color: fields.select({
              label: "Strip colour",
              options: [
                { label: "Accent 1", value: "a1" },
                { label: "Accent 2", value: "a2" },
                { label: "Accent 3", value: "a3" },
                { label: "Accent 4", value: "a4" },
                { label: "Man City blue", value: "city" },
                { label: "Navy", value: "navy" },
              ],
              defaultValue: "a1",
            }),
            linkLabel: text("Link text (optional)"),
            linkHref: text("Link (optional)"),
          }),
          { label: "Loves", itemLabel: (p) => p.fields.title.value || "Love" },
        ),
      },
    }),

    posts: singleton({
      label: "Content wall posts",
      path: "content/settings/posts",
      format: { data: "json" },
      schema: {
        items: fields.array(
          fields.object({
            title: text("Title"),
            note: text("Small caption"),
            href: link("Link to the post"),
            image: fields.image({ label: "Thumbnail", directory: "public/images/posts", publicPath: "/images/posts/", validation: { isRequired: true } }),
            platform: fields.select({
              label: "Platform",
              options: [
                { label: "Instagram", value: "ig" },
                { label: "YouTube", value: "yt" },
              ],
              defaultValue: "ig",
            }),
            type: fields.select({
              label: "Type",
              options: [
                { label: "Video", value: "video" },
                { label: "Design", value: "design" },
              ],
              defaultValue: "video",
            }),
            stamp: text("Stamp text", "e.g. IG reel, YouTube"),
          }),
          { label: "Posts (top = first on the wall)", itemLabel: (p) => p.fields.title.value || "Post", slugField: "title" },
        ),
      },
    }),

    stickers: singleton({
      label: "Background stickers",
      path: "content/settings/stickers",
      format: { data: "json" },
      schema: {
        bear: sticker("Bear (leave empty for the drawn one)"),
        cheese: sticker("Cheese"),
        rocket: sticker("Rocket"),
        crest: sticker("Crest"),
        tea: sticker("Tea"),
        sheep: sticker("Sheep"),
        patch: sticker("Patch"),
        toast: sticker("Toast"),
      },
    }),
  },

  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*",
      format: { data: "json" },
      columns: ["no", "title"],
      schema: {
        title: fields.slug({ name: { label: "Title" }, slug: { label: "Web address", description: "Used in /work/…" } }),
        no: text("Number", "e.g. 01 (also sets the order)"),
        subtitle: text("Subtitle"),
        short: text("Short label for the page-turn transition"),
        year: text("Year"),
        role: text("Your role"),
        platform: text("Platform"),
        facts: fields.array(text("Fact"), { label: "Fact chips", itemLabel: (p) => p.value || "Fact" }),
        summary: longText("Summary"),
        body: fields.array(fields.object({ heading: text("Heading"), text: longText("Text") }), {
          label: "Sections",
          itemLabel: (p) => p.fields.heading.value || "Section",
        }),
        cover: fields.image({ label: "Cover image (leave empty for the paper collage)", directory: "public/images/projects", publicPath: "/images/projects/" }),
        coverAlt: text("Cover description"),
        links: fields.array(fields.object({ label: text("Button text"), href: link("Link") }), {
          label: "Buttons",
          itemLabel: (p) => p.fields.label.value || "Button",
        }),
        episodes: fields.array(
          fields.object({
            title: text("Episode title"),
            href: link("Link (leave empty for a taped-shut ‘soon’ slot)"),
            image: fields.image({ label: "Cover", directory: "public/images/projects", publicPath: "/images/projects/" }),
          }),
          { label: "Episodes (optional)", itemLabel: (p) => p.fields.title.value || "Episode", slugField: "title" },
        ),
        videos: fields.array(
          fields.object({
            title: text("Video title"),
            href: link("Link"),
            image: fields.image({ label: "Thumbnail", directory: "public/images/projects", publicPath: "/images/projects/" }),
          }),
          { label: "Videos (optional)", itemLabel: (p) => p.fields.title.value || "Video", slugField: "title" },
        ),
        accent,
      },
    }),
  },
});
