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
  description: "One of the four accent colours from the brand palette",
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
const clip = () =>
  fields.file({
    label: "Looping clip (optional MP4, 5–15 seconds)",
    description: "Plays silently on repeat in place of the picture. The picture above stays as its first frame and for anyone who turns motion off.",
    directory: "public/videos",
    publicPath: "/videos/",
  });

// ---------- brand booklet helpers ----------
const hex = (label: string) =>
  fields.text({
    label,
    description: "A colour code like #9b1d30",
    validation: { pattern: { regex: /^#[0-9a-fA-F]{6}$/, message: "Use # and six letters/numbers, e.g. #9b1d30" } },
  });
const list = (label: string, item: string, description?: string) =>
  fields.array(longText(item), { label, description, itemLabel: (p) => p.value || item });
const colour = fields.object({
  name: text("Name"),
  hex: hex("Colour"),
  token: text("Code name (optional)", "The name the site's code uses, e.g. --ground. Leave empty if it has none."),
  use: longText("Where it's used"),
});

export default config({
  storage: useGithub ? { kind: "github", repo: { owner: "ishenalievi", name: "ilyas-portfolio" } } : { kind: "local" },
  ui: {
    brand: { name: "Ilyas · site editor" },
    navigation: {
      "Site & pages": ["site", "home", "workPage", "contentPage", "aboutPage"],
      "Your stuff": ["projects", "resume", "posts", "loves"],
      Extras: ["stickers"],
      Brand: ["brand"],
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
            video: clip(),
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
        photo: fields.image({ label: "Photo of you (optional)", description: "Taped up next to the greeting. Something more casual than the Home headshot works best.", directory: "public/images", publicPath: "/images/" }),
        photoAlt: text("Photo description for screen readers", "e.g. Ilyas mid-climb at the bouldering gym"),
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
            image: fields.image({
              label: "Picture on the strip (optional)",
              description: "Replaces the big word. Leave empty to keep the word.",
              directory: "public/images/loves",
              publicPath: "/images/loves/",
            }),
            imageAlt: text("Picture description", "What's in the picture, for screen readers"),
            imageFit: fields.select({
              label: "How the picture sits",
              options: [
                { label: "Fill the strip (photos, posters)", value: "cover" },
                { label: "Fit inside the strip (logos, badges)", value: "contain" },
              ],
              defaultValue: "cover",
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
            date: fields.date({ label: "Date posted", description: "The wall sorts itself by this, newest first" }),
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
        go: fields.image({
          label: "ゴ letter for the menacing ゴゴゴ (transparent PNG)",
          description: "One ゴ, drawn the way you want it. It replaces the typed letter everywhere ゴゴゴ appears, including the intro.",
          directory: "public/stickers",
          publicPath: "/stickers/",
        }),
      },
    }),

    brand: singleton({
      label: "Brand booklet",
      path: "content/settings/brand",
      format: { data: "json" },
      schema: {
        title: text("Booklet title", "Laid out at /brand, which only opens for you (signed in here with GitHub). Change anything here, then ask Claude to sync the site with the booklet."),
        edition: text("Edition", "e.g. Vol. 1 · 2026"),
        essence: longText("The brand in one line"),

        identity: fields.object(
          {
            monogram: text("Monogram", "The small logo in the nav"),
            wordmark: longText("How the name is set"),
            words: fields.array(text("Word"), { label: "Brand words", itemLabel: (p) => p.value || "Word" }),
            is: list("The site is…", "Point"),
            isNot: list("The site is never…", "Point"),
          },
          { label: "01 · Identity" },
        ),

        voice: fields.object(
          {
            summary: longText("Voice in a sentence"),
            principles: list("Principles", "Principle"),
            do: list("Do", "Do"),
            dont: list("Don't", "Don't"),
            samples: fields.array(fields.object({ line: longText("Line"), where: text("Where it appears") }), {
              label: "Sample lines",
              itemLabel: (p) => p.fields.line.value || "Line",
            }),
            sfx: longText("Sound effects"),
          },
          { label: "02 · Voice" },
        ),

        colourGroups: fields.array(
          fields.object({
            title: text("Group"),
            note: longText("About this group"),
            colours: fields.array(colour, { label: "Colours", itemLabel: (p) => `${p.fields.name.value || "Colour"} ${p.fields.hex.value}` }),
          }),
          { label: "03 · Colours", description: "Fixed colours, grouped. They stay the same in every palette.", itemLabel: (p) => p.fields.title.value || "Group" },
        ),
        palettes: fields.array(
          fields.object({
            name: text("Palette name"),
            mood: longText("Mood"),
            a1: hex("Accent 1"),
            a2: hex("Accent 2"),
            a3: hex("Accent 3"),
            a4: hex("Accent 4"),
          }),
          { label: "03 · Palettes", description: "The site uses the first one. The others are spares: move one to the top and ask Claude to sync the site with the booklet.", itemLabel: (p) => p.fields.name.value || "Palette" },
        ),
        accentRoles: list("03 · What each accent does", "Role"),

        type: fields.array(
          fields.object({
            role: text("Role", "e.g. Display"),
            font: text("Font", "A Google Fonts name, e.g. Bowlby One"),
            token: text("Code name", "e.g. --f-display"),
            use: longText("Where it's used"),
            sample: text("Sample text"),
          }),
          { label: "04 · Typography", itemLabel: (p) => `${p.fields.role.value}: ${p.fields.font.value}` },
        ),
        typeNote: longText("04 · Type notes"),

        motifs: fields.array(fields.object({ name: text("Motif"), how: longText("How it's used") }), {
          label: "05 · Motifs & textures",
          itemLabel: (p) => p.fields.name.value || "Motif",
        }),
        imagery: list("06 · Imagery & stickers", "Rule"),

        motion: fields.object(
          {
            principles: list("Principles", "Principle"),
            easing: fields.array(fields.object({ name: text("Name"), value: text("Curve"), use: text("Use for") }), {
              label: "Easing curves",
              itemLabel: (p) => p.fields.name.value || "Curve",
            }),
            transitions: fields.array(
              fields.object({
                kind: fields.select({
                  label: "Transition",
                  options: [
                    { label: "Menacing intro", value: "menace" },
                    { label: "Tusk ACT 4", value: "tusk" },
                    { label: "Sticky Fingers", value: "zipper" },
                    { label: "Heaven's Door", value: "book" },
                    { label: "The World", value: "timestop" },
                    { label: "Paper stack", value: "strips" },
                    { label: "To Be Continued", value: "tbc" },
                  ],
                  defaultValue: "strips",
                }),
                where: text("Where it plays"),
                stand: text("Name"),
                sfx: text("Sound effect"),
                feel: longText("What happens"),
              }),
              { label: "Page transitions", itemLabel: (p) => `${p.fields.where.value} → ${p.fields.stand.value}` },
            ),
            ambient: list("Everything else that moves", "Motion"),
          },
          { label: "07 · Motion" },
        ),

        layout: list("08 · Layout", "Rule"),
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
            video: clip(),
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
        gallery: fields.array(
          fields.object({
            caption: text("Caption", "What it is, e.g. Storyboard v1, the cover"),
            image: fields.image({ label: "Picture", directory: "public/images/gallery", publicPath: "/images/gallery/" }),
          }),
          { label: "Pictures from the process (optional)", description: "Taped up under the write-up.", itemLabel: (p) => p.fields.caption.value || "Picture", slugField: "caption" },
        ),
        accent,
      },
    }),
  },
});
