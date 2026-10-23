---
name: portfolio-design
description: The one design skill for this portfolio. Combines design-taste-frontend (composition, process, browser inspector), emil-design-eng (interaction and motion craft) and build-awwwards-quality-sites (quality bar, honest assets), with the brand booklet and the page transitions ranked above all three. Use for any design, layout, motion, polish, restyle or review work on this site — new sections, new pages, hover and press states, scroll motion, "make it look better", "it looks generic", or reviewing UI code.
---

# Portfolio design

Three design skills are installed here, and they overlap and disagree. This skill is the single entry
point: it decides which one wins on each topic and sends you to the right file for the detail. Read the
others only through the routes below.

## 1. Order of authority

When two sources disagree, the higher one wins. No exceptions.

1. **The owner's words** in this conversation.
2. **The brand booklet**, `content/settings/brand.json` (Keystatic → Brand → Brand booklet), and
   `CLAUDE.md`. Identity, voice, colours, palettes, type, motifs, imagery, motion, layout. Any branding
   change made in code goes into the booklet in the same change.
3. **The page transitions** in `components/transitions/` and the hand-off in `components/motion/bus.ts`.
4. **This file's project rules** (§2).
5. **emil-design-eng** for interaction and motion craft (§4).
6. **design-taste-frontend** for composition, process and checking (§5).
7. **build-awwwards-quality-sites** for the overall bar and honest assets (§6).

## 2. Project rules

- **No conversion content.** No hire-me, services, pricing, contact forms, newsletter sign-ups, CTA
  buttons, `mailto:` actions or "let's work together". No phone number or email anywhere. The only
  outward links are the owner's social profiles. Navigation buttons to other pages of the site are fine.
- **Transitions come first.** Home = Tusk ACT 4, Work = Sticky Fingers zipper, project pages = Heaven's
  Door book, About = The World, external links = To Be Continued, first load = the menacing welcome card.
  Page motion starts only after `afterReveal()` fires, never animates the same elements or properties as
  a transition, and never delays or covers one. On conflict, cut the page motion.
- **Copy is a placeholder.** Draft in the booklet's voice (sarcastic, cynical, self-aware); the owner
  writes the final words. Never invent proof: no quotes, clients, press, logos or numbers.
- **Stickers are drawn originals.** Never draw real copyrighted characters or logos. The owner may upload
  their own pictures (the interests strip, the sheep slot holding Gromit); those are theirs to choose.
- Fully fluid layout, phone to ultra-wide. Dark cinematic palettes, no pastels.

## 3. Where the skills overlap, and the verdict here

The rules that clashed with the brand or the project rules were removed from the source skills
themselves (Oct 2026): taste's bans on the brand's devices, its primary-action and `mailto:` rules, its
"deal a new direction" step and its own curves; awwwards' ban on drawn illustrations and "GSAP for
everything"; Emil's canned first reply. Taste's reference files carry a short "On this portfolio" note
instead of edits. These are local edits: after `npx skills update` or a reinstall, check the diff and
remove the clashes again. Taste's inspector still measures the removed rules in code, which is why §7
passes `--allow`.

| Topic | emil-design-eng | design-taste-frontend | build-awwwards | Verdict on this site |
| --- | --- | --- | --- | --- |
| Easing | `0.23,1,0.32,1` out, `0.77,0,0.175,1` in-out | `0.22,1,0.36,1` out, expo `0.16,1,0.3,1`, ease-in for exits | GSAP choreography | **Site tokens only:** OUT `cubic-bezier(0.23, 1, 0.32, 1)`, IN_OUT `cubic-bezier(0.77, 0, 0.175, 1)`, POP `cubic-bezier(.3,1.6,.5,1)` (same as Emil's). Taste's curves are not used. |
| Durations | UI under 300ms; press 100–160ms | reveals 600–1,000ms; openings 1,100–1,600ms | — | Controls and hovers: Emil (≤300ms). Scroll reveals and the hero entrance: taste's 600–1,000ms band. |
| Overshoot / bounce | subtle, playful only | banned on interface | — | POP is brand: stamped labels, the name. Nowhere else. |
| Should it animate? | frequency table; never on keyboard actions | at least 8 moving elements or FAIL | motion needs a narrative role | Emil's frequency test decides. Keyboard navigation gets the fade. Taste's motion count is not a goal. |
| Stagger | 30–80ms | 60–90ms, heading → text → picture | word-by-word headings | 45–90ms. Headings word by word (`SplitWords` + `[data-split]`); sections paste in via `ScrollTrigger.batch`. |
| Reduced motion | fewer and gentler, keep fades | final state immediately | bypass smooth scroll and scrubs | Final state immediately; Lenis off. The transitions' own fade stays. |
| Smooth scroll | — | in the scenes stage | exactly one engine | **Lenis**, stopped while a transition covers the page. Never add Locomotive. |
| Animated properties | transform + opacity | transform + opacity | bounded transforms | Opacity plus CSS variables fed into `translate` / `scale` (`components/motion/Motion.tsx`), so CSS rotations and hover transforms stay untouched. Never `scale(0)`. |
| Hover | gate behind `(hover: hover) and (pointer: fine)` | feedback on every control | CSS for hover/focus/tap | Emil's rule, as in `globals.css`. Press: `scale(0.97)` where the element has no other transform. |
| Art direction | — | deal a direction from the library | write a direction first | **Never deal a new direction.** The look is fixed by the booklet. Taste's `draw.mjs` only with `--keep palette,type`, and only when the owner asks for a new section layout. |
| Ornaments | — | bans eyebrows, monospace, "01", shadows, gradients, accent words, more than 2 typefaces | rejects gradient blobs, glass, bento | **The brand keeps its own devices** (§5 lists them). Taste's other bans still apply to new work: no glass, no icon-card rows, no gradient blobs, no emoji, no pill nav. |
| Primary action | — | one button on the first screen; else `mailto:` | — | No. A nudge to the Work page or a social link at most. |
| Pictures | — | at least 4 real pictures; archives with credit | licensed or generated PNG cutouts; no model-drawn illustration | The owner's own work first. Found archival pictures only with a credit and the owner's OK. Stickers: drawn originals are allowed (brand). |
| Three.js / scenes | — | scroll scenes from the library | Three.js only with purpose | None so far. Add only if the owner asks and it carries the collage idea; never as background. |
| Reviews | Before / After / Why table | 14-pass critique + score | report checklist | Emil's table for code findings, taste's critique passes for screenshots (§7). |

## 4. Interaction and motion craft (from emil-design-eng)

Follow `.claude/skills/emil-design-eng/SKILL.md` for: the animation decision framework, custom curves,
press feedback, origin-aware popovers, interruptible transitions over keyframes, `@starting-style`,
clip-path reveals, the performance rules (WAAPI, transform/opacity, CSS variables on small subtrees) and
its review checklist. For a single new animation, `animate`; for a motion audit, `improve-animations` or
`review-animations`; for naming an effect, `animation-vocabulary`. These all share Emil's rules.

Two site-specific notes: the transitions are Web Animations API code (keep them so), and page motion is
GSAP + ScrollTrigger in `components/motion/Motion.tsx`. Next keeps the previous page mounted but hidden,
so select only visible elements (`checkVisibility()`), as `Motion.tsx` does.

## 5. Composition and process (from design-taste-frontend)

Useful parts of `.agents/skills/design-taste-frontend/`, adapted:

- **Idea sentence** (its step 4) for any new section: "On this page, [something only Ilyas has]
  becomes [the collage device]." Fill the first blank from the work, the interests or the record, not
  the category.
- **Full content** (step 5): every section carries its real material; thin sections lose.
- **Build still first** (step 6): the page must look finished with motion off.
- **Laws of the craft** for type scale, spacing and frame: equal outer margins, no blank stretches,
  a heading on every section, running text in full ink at 16px+.
- **References** worth reading when the topic comes up: `references/layout.md`, `references/type.md`,
  `references/critique.md`, `references/tells.md`.

Brand devices that taste's house rules ban but this site keeps on purpose: eyebrows and monospace
labels (`.eyebrow`, gallery labels), "No. 01" numbering, hard shadows under torn paper, the moving
stripes, the highlighter, the halftone, the purple gradient ゴゴゴ, the ransom-note name in two faces,
the hard offset shadow on buttons, the italic serif accent, four typefaces (Bowlby One, DM Serif Display, Instrument Sans, Space Mono),
the aubergine and ivory paper colours, a bare name as the `h1`, no button in the first screen, and the
welcome card covering the first second.

## 6. The bar (from build-awwwards-quality-sites)

Distinct idea, memorable first screen, disciplined type and spacing, intentional crops, refined hover,
focus, active, touch and reduced-motion states, no fake proof, no continuously animated offscreen work,
and never call the result award-winning.

## 7. Checking your work

Run in this order; fix before reporting:

1. `npm run build`, `npx tsc --noEmit`, `npm run lint`.
2. `npm run brand:check` until clean.
3. With `npm run dev` running, the taste inspector with the brand's exceptions allowed:

   ```bash
   node .agents/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:3000/<page> --out .taste-skill/inspect --allow eyebrow,mono,micro-label,numbering,shadow,button-fx,gradient,gradient-text,text-shadow,palette-purple,palette-cream,font-count,mixed-font-headline,name-only-title,first-action,late-title,dashed
   ```

   Treat the remaining FAILs as real (overflow, contrast, clipped or covered text, headline lines,
   lopsided sections, blank gaps, broken images, reduced-hidden). One known exception: the large intro
   sentence on Home (`.intro-line`, storyboard frame 2) is a brand statement and trips `headline-lines`.
   `.taste-skill/` is scratch output; do not commit it.
4. Open every screenshot at 1440, 768 and 390 and critique it with taste's `references/critique.md`
   passes. Check a page change by clicking (dispatch `pointerdown` first, or you get the keyboard fade):
   the transition must finish before any page motion starts.
5. Code review findings go in Emil's single `| Before | After | Why |` table.
