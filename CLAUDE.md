@AGENTS.md

# Ilyas Ishenaliev — portfolio site

Personal-brand portfolio. Live at https://ishenaliev.vercel.app (Vercel Hobby, free). Repo: github.com/ishenalievi/ilyas-portfolio, branch `main`. Every push to `main` deploys live in ~1 min.

## Working with the owner

- Owner new to code and hosting. Explain each step plainly. Do account actions (logins, GitHub/Vercel settings) together, never on their behalf.
- Two computers (Mac + Windows PC). Start each session with `git pull`; finish with commit + `git push` when asked. Unfinished work moving between computers goes on separate branch so it doesn't go live.
- Live editor at `/keystatic` also commits straight to GitHub: always pull before editing content files.
- Owner uses VS Code + Claude Code extension on both machines. `.vscode/tasks.json` pulls on folder open and has "Start the site" (`npm install` then `npm run dev`); keep README's VS Code steps in sync with it.

## Brief

- Showcase projects, experience, content; grow audience a little. NOT open to collabs or client work: no hire-me, services or pricing sections.
- Copy tone sarcastic/cynical. Owner writes final words; drafted copy is placeholder.
- Look: playful torn-paper collage (Vox explainer collage, Ralph Lauren Home old-money dark walnut, JoJo/Araki colour). Dark cinematic palettes, no pastels. Thick vertical stripes panning horizontally; RL navy, red, green always present, two stripes follow palette swap.
- Sound effects in English; only menacing ゴゴゴ stays Japanese (purple style).
- Layout fully fluid, phone to ultra-wide.
- No phone number or email on public site. Drawn stickers are originals; Claude never draws real copyrighted characters or logos. Owner may upload own PNGs (sheep slot is a Gromit image).

## Brand booklet

- Source of truth for branding: `content/settings/brand.json` (Keystatic → Brand → Brand booklet). Covers identity, voice, colours, palettes, type, motifs, imagery, motion, layout. Website never reads or shows it; keep it that way (no `/brand` page).
- Owner says "sync the site with the booklet" → read it, change code to match, run `npm run brand:check` until clean, then review written rules (voice, motifs, imagery) by hand.
- Any branding change made in code goes into the booklet in the same change. Run `npm run brand:check` before finishing.

## How it's built

- Next.js 16 App Router with `cacheComponents`, React 19, TypeScript, mostly plain CSS in `app/globals.css`.
- All text + images edited in Keystatic (`keystatic.config.ts`). Content in `content/settings/*.json` and `content/projects/*.json`, read via cached loaders in `lib/content.ts`. `npm run dev` uses local storage; production uses GitHub storage.
- `app/(site)` holds site chrome; root layout bare so `/keystatic` stays plain.
- Page transitions: `components/transitions/` (Web Animations API, cover/reveal split). Home = Tusk ACT 4, Work = Sticky Fingers zipper, project pages = Heaven's Door book, About = The World, external links = To Be Continued, first load = menacing "Welcome to Ilyas' portfolio" card. Keyboard navigation + reduced motion get fade.
- Easing: OUT `cubic-bezier(0.23, 1, 0.32, 1)`, IN_OUT `cubic-bezier(0.77, 0, 0.175, 1)`, POP `cubic-bezier(.3,1.6,.5,1)`; transform/opacity only, no `scale(0)`.

## Secrets

- Keystatic GitHub keys live in Vercel production env vars and git-ignored `.env` on Mac. Never print or commit them. `npm run dev` doesn't need them.

## Gotchas

- Safari: don't combine SVG `pathLength` with `vector-effect: non-scaling-stroke` for dash animations; measure with `getTotalLength()`.
- Mac folder sits in iCloud-synced Documents → can create `"* 2"` duplicate files in `.next` and stale CSS. Fix: delete them, `rm -rf .next/dev`, restart dev server.
- Preview tests: dispatch `pointerdown` before click, else click counts as keyboard navigation and gets fade.
