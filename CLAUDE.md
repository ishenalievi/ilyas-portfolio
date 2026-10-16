@AGENTS.md

# Ilyas Ishenaliev — portfolio site

Personal-brand portfolio. Live at https://ishenaliev.vercel.app (Vercel Hobby, free). Repo: github.com/ishenalievi/ilyas-portfolio, branch `main`. Every push to `main` deploys to the live site in about a minute.

## Working with the owner

- The owner is new to code and hosting. Explain each step plainly and do account actions (logins, GitHub/Vercel settings) together, never on their behalf.
- The project is worked on from two computers (a Mac and a Windows PC). Start each session with `git pull`; finish with a commit and `git push` when asked. Unfinished work that needs to move between computers goes on a separate branch, so it doesn't go live.
- The live editor at `/keystatic` also commits straight to GitHub, so always pull before editing content files.

## Brief

- Showcase projects, experience and content; grow the audience a little. NOT open to collabs or client work: no hire-me, services or pricing sections.
- Copy tone is sarcastic/cynical. The owner writes the final words; drafted copy is a placeholder.
- Look: playful torn-paper collage (Vox explainer collage, Ralph Lauren Home old-money dark walnut, JoJo/Araki colour). Dark cinematic palettes, no pastels. Thick vertical stripes panning horizontally; RL navy, red and green always present, two stripes follow the palette swap.
- Sound effects are in English; only the menacing ゴゴゴ stays Japanese (purple style).
- Layout is fully fluid, phone to ultra-wide.
- No phone number or email on the public site. Stickers are original drawings, never real copyrighted characters or logos.

## How it's built

- Next.js 16 App Router with `cacheComponents`, React 19, TypeScript, mostly plain CSS in `app/globals.css`.
- All text and images are edited in Keystatic (`keystatic.config.ts`). Content lives in `content/settings/*.json` and `content/projects/*.json`, read through the cached loaders in `lib/content.ts`. `npm run dev` uses local storage; production uses GitHub storage.
- `app/(site)` holds the site chrome; the root layout is bare so `/keystatic` stays plain.
- Page transitions: `components/transitions/` (Web Animations API, cover/reveal split). Home = Tusk ACT 4, Work = Sticky Fingers zipper, project pages = Heaven's Door book, About = The World, external links = To Be Continued, first load = menacing "Welcome to Ilyas' portfolio" card. Keyboard navigation and reduced motion get a fade.
- Easing: OUT `cubic-bezier(0.23, 1, 0.32, 1)`, IN_OUT `cubic-bezier(0.77, 0, 0.175, 1)`, POP `cubic-bezier(.3,1.6,.5,1)`; transform/opacity only, no `scale(0)`.

## Secrets

- The Keystatic GitHub keys live in Vercel's production environment variables and in a git-ignored `.env` on the Mac. Never print or commit them. `npm run dev` doesn't need them.

## Gotchas

- Safari: don't combine SVG `pathLength` with `vector-effect: non-scaling-stroke` for dash animations; measure with `getTotalLength()`.
- On the Mac the folder sits in iCloud-synced Documents, which can create `"* 2"` duplicate files in `.next` and stale CSS. Fix: delete them and `rm -rf .next/dev`, then restart the dev server.
- Preview tests: dispatch `pointerdown` before a click, otherwise the click counts as keyboard navigation and gets the fade.
