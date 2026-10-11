// Things you love, your experience and your background.
// Experience comes from your resume (Oct 2026). The love captions are
// placeholder copy written in your tone: rewrite them in your own words.

export type Love = { fig: string; title: string; line: string; tag: string; color: string; link?: { label: string; href: string } };

export const loves: Love[] = [
  { fig: "Manga, 1987–", title: "JoJo's Bizarre Adventure", line: "The reason I can no longer stand normally in photos.", tag: "ゴゴゴ", color: "var(--a4)" },
  { fig: "Football", title: "Manchester City", line: "Yes, I liked them before the trophies. No, I will not be providing evidence.", tag: "MCFC", color: "var(--city)" },
  { fig: "V4–6 · Scarpa Instinct VSR LV", title: "Bouldering", line: "I pay money to fall off walls in shoes a size too small.", tag: "V4–6", color: "var(--a2)", link: { label: "Proof: @ishenslabs", href: "https://www.instagram.com/ishenslabs" } },
  { fig: "Now reading", title: "Books", line: "Currently on The Place of the Skull by Chingiz Aitmatov. Exactly as cheerful as it sounds.", tag: "p. 1 of many", color: "var(--a3)" },
  { fig: "Premiere Pro, After Effects", title: "Video editing", line: "Four hours on a fifteen-second clip that people will watch once, at 2× speed.", tag: "00:00:15", color: "var(--a1)" },
  { fig: "Since summer 2026", title: "Guitar", line: "I know four chords. My neighbours know them too.", tag: "G · C · D", color: "var(--navy-fixed)" },
  { fig: "Claymation", title: "Wallace & Gromit", line: "Gromit is the most competent character in British film and he never says a word.", tag: "CHEESE", color: "var(--a3)" },
  { fig: "Stop-motion, 1993", title: "The Nightmare Before Christmas", line: "Settled the Halloween-or-Christmas argument by refusing to pick one.", tag: "Oct → Dec", color: "var(--a4)" },
  { fig: "Trained in acting · fave: Little Shop of Horrors", title: "Theatre & musicals", line: "My favourite musical is a feel-good story about a florist and his carnivorous plant.", tag: "ENCORE?", color: "var(--a2)" },
];

export type Role = {
  dates: string;
  role: string;
  org: string;
  place: string;
  points: string[];
  link?: { label: string; href: string };
};

export const experience: Role[] = [
  {
    dates: "Sep 2026 – now",
    role: "Head of Marketing",
    org: "Young Ventures",
    place: "San Francisco, CA",
    points: [
      "21,000 impressions across TikTok, Instagram and LinkedIn on the debut post.",
      "Cut content turnaround by 60% by rebuilding the marketing workflow from the ground up.",
    ],
  },
  {
    dates: "Apr 2026 – now",
    role: "Visual Media Director",
    org: "UBC Kababayan",
    place: "Vancouver, BC",
    points: [
      "210,000+ views and a 9% click-through rate from short-form event and hiring content.",
      "Three trend-led videos that averaged 140% more views than usual.",
    ],
  },
  {
    dates: "Apr 2026 – now",
    role: "VP Content Marketing",
    org: "UBC Imprint Conference & Competition",
    place: "Vancouver, BC",
    points: [
      "Mapped and rebuilt the content workflow for a four-person team.",
      "Runs content comms with the committee and two external partners.",
    ],
    link: { label: "See IMPRINT Reels", href: "/work/imprint-reels" },
  },
  {
    dates: "Aug 2025 – Apr 2026",
    role: "Podcast Director",
    org: "UBC Supply Chain and Operations Association",
    place: "Vancouver, BC",
    points: [
      "Produced five episodes explaining supply chain to people who had never thought about it.",
      "Wrote an internal brand booklet that cut turnaround by 20%.",
    ],
  },
  {
    dates: "2023 – 24",
    role: "Editor + producer",
    org: "Bamboo Telegraph Video, ISM",
    place: "Manila",
    points: ["IASAS sendoff videos and the first two episodes of BTV IASAS Hot Ones."],
    link: { label: "See BTV", href: "/work/btv" },
  },
];

export const volunteering: Role[] = [
  {
    dates: "May – Aug 2025",
    role: "Youth Ambassador",
    org: "The Gord Downie & Chanie Wenjack Fund",
    place: "Vancouver, BC",
    points: ["Raised $800 for reconciliation initiatives with a local event and a video presented to a community panel."],
  },
  {
    dates: "Oct 2023 – Jan 2024",
    role: "Volunteer",
    org: "Child Hope Philippines",
    place: "Manila",
    points: ["Ran four workshop modules for about 50 kids and cut the programme's recap video in Premiere Pro."],
  },
];

export const education = {
  school: "University of British Columbia, Sauder School of Business",
  detail: "Marketing, with a Concentration in Sustainability and Social Impact",
  dates: "Graduating May 2028",
};

export const tools = ["Premiere Pro", "After Effects", "Canva Pro", "Notion", "Mailchimp", "Excel", "PowerPoint", "Tableau", "Office 365"];

export const languages = ["English (native)", "Russian (intermediate)", "Spanish (intermediate)"];
