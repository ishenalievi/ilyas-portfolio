// Your projects. To add one, copy a block, change the words and images,
// and put the images in /public/images. The site builds the page for you.
// Body text is placeholder copy: rewrite it in your own voice.

export type Img = { src: string; w: number; h: number; alt: string };

export type Video = { title: string; href: string; img: Img };

export type Episode =
  | { n: number; title: string; href: string; img: Img }
  | { n: number; soon: true };

export type Project = {
  slug: string;
  no: string;
  title: string;
  subtitle: string;
  short: string; // label used by the rip transition
  year: string;
  role: string;
  platform: string;
  facts: string[];
  summary: string;
  body: { heading: string; text: string }[];
  cover?: Img;
  links: { label: string; href: string }[];
  episodes?: Episode[];
  videos?: Video[];
  accent: "a1" | "a2" | "a3" | "a4";
};

const btv = (id: string, title: string): Video => ({
  title,
  href: `https://www.youtube.com/watch?v=${id}`,
  img: { src: `/images/btv/${id}.jpg`, w: 1280, h: 720, alt: `Thumbnail for ${title}` },
});

export const projects: Project[] = [
  {
    slug: "imprint-reels",
    no: "01",
    title: "IMPRINT Reels",
    subtitle: "for UBC IMPRINT",
    short: "IMPRINT",
    year: "2026",
    role: "Film + edit",
    platform: "Instagram",
    facts: ["Instagram reel", "@ubcimprint", "Oct 2026", "Film + edit"],
    summary:
      "A run of reels for UBC IMPRINT. The first one teases After Hours on 20 October 2026. More land over the next few weeks.",
    body: [
      {
        heading: "The brief",
        text: "Make people want to show up to After Hours without telling them much about it. The first rule of After Hours, as the caption says, you already know.",
      },
      {
        heading: "The reel",
        text: "Shot and cut as a short film teaser, opening on a title card that reads “a film by Ilyas Ishenaliev”. Red type, dark rooms, two people who clearly know something you don't.",
      },
      {
        heading: "What's next",
        text: "New episodes are on the way. They get added here as they're posted.",
      },
    ],
    cover: { src: "/images/posts/imprint.jpg", w: 562, h: 1000, alt: "After Hours reel cover: two figures in a dark room under red title type" },
    links: [{ label: "Watch episode 1", href: "https://www.instagram.com/p/DeK9--tBvPo/" }],
    episodes: [
      {
        n: 1,
        title: "After Hours",
        href: "https://www.instagram.com/p/DeK9--tBvPo/",
        img: { src: "/images/posts/imprint.jpg", w: 562, h: 1000, alt: "After Hours reel cover" },
      },
      { n: 2, soon: true },
      { n: 3, soon: true },
    ],
    accent: "a1",
  },
  {
    slug: "btv",
    no: "02",
    title: "BTV",
    subtitle: "Bamboo Telegraph Video, ISM",
    short: "BTV",
    year: "2023–24",
    role: "Edit + produce",
    platform: "YouTube",
    facts: ["YouTube", "@BambooTelegraphVideoISM", "2023–24", "Edit + produce"],
    summary:
      "Videos edited or produced for the school's student channel: two IASAS sendoff hype videos and the first two episodes of BTV IASAS Hot Ones.",
    body: [
      {
        heading: "The sendoffs",
        text: "Hype videos for the teams heading to IASAS. The job: make athletes look intimidating in under three minutes.",
      },
      {
        heading: "Hot Ones",
        text: "A school-sized version of the interview show where the questions get harder as the sauce gets hotter. The job: make hot sauce look worse.",
      },
    ],
    cover: btv("cocrM2CmRTM", "ISM Baseball Sendoff, IASAS 2024").img,
    links: [{ label: "See the channel", href: "https://www.youtube.com/@BambooTelegraphVideoISM" }],
    videos: [
      btv("cocrM2CmRTM", "ISM Baseball Sendoff, IASAS 2024"),
      btv("rQMtM5s5GJc", "ISM Volleyball Sendoff 2023"),
      btv("3TAkjXcQMv0", "BTV IASAS Hot Ones, Ep. 1"),
      btv("nBnC-iMoNgE", "BTV IASAS Hot Ones, Ep. 2"),
    ],
    accent: "a2",
  },
  {
    slug: "making-this-site",
    no: "03",
    title: "This website",
    subtitle: "the making-of",
    short: "MAKING OF",
    year: "2026",
    role: "Design + direction",
    platform: "Web",
    facts: ["Web", "Next.js", "Oct 2026 →", "Design + direction"],
    summary:
      "How this site went from an empty folder to live: the references, the storyboards, the palettes and the build.",
    body: [
      {
        heading: "The brief",
        text: "Show the work, grow the audience a little, and don't look like every other portfolio. Not taking clients, so no hire-me buttons.",
      },
      {
        heading: "The references",
        text: "Ralph Lauren for structure (navy, crests, stripes). Vox for the voice (cut-outs, highlighter, arrows). JoJo's Bizarre Adventure for the energy (colour that changes, poses, ゴゴゴ, To Be Continued).",
      },
      {
        heading: "The storyboards",
        text: "Three rounds. Version one was too clean. Version two added torn paper and full-screen transitions. Version three added real work, a moving background and a rip that tears in two stages.",
      },
      {
        heading: "The palette",
        text: "Navy and oxford blue stay fixed. Four accent colours rotate, the way Araki recolours a character between panels. Hit the stamp in the menu to swap them.",
      },
      {
        heading: "The build",
        text: "Next.js, hosted free on Vercel. Every tear on this page is generated from a seed, so it looks hand-made but stays the same every visit.",
      },
    ],
    links: [],
    accent: "a4",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
