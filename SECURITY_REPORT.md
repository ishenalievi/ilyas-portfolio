# Security report (pre-launch pass)

Date: 24 Oct 2026. Branch: `main` at `a3f15d3`, plus the uncommitted Tailwind-removal and image work that was in the folder at the time.
Live site: https://ishenaliev.vercel.app

**Bottom line:** no P0 problems. No secrets in the code, in git history or in the build. No personal data in photos or videos. Nothing renders untrusted HTML. Fixes made: security headers, a link-safety guard, robots/sitemap, an error page and one dev-only dependency update. What's left is account settings only the owner can change, plus a few things the owner has to confirm.

Status key: ✅ Pass · 🔧 Fixed · ⚠️ Needs owner · N/A

---

## 1. Scope (Section 0)

| Question | Answer |
|---|---|
| Framework | Next.js **16.4.2**, App Router, React 19.3, TypeScript, `cacheComponents` (Partial Prerendering) |
| Rendering | Mostly prerendered. Server parts: `proxy.ts` (guards `/brand`), `/api/now-playing` (Spotify), `/api/keystatic/*` (editor back end), `/api/spotify/connect` + `/callback` (setup pages that only work with `npm run dev`; the live site answers 404) |
| Forms | No visitor forms. The only forms are the dev-only Spotify setup page and the Keystatic editor (owner only) |
| Auth / logins | Keystatic editor at `/keystatic` signs in with GitHub. `/brand` is owner-only: `proxy.ts` asks GitHub who the signed-in user is, and anyone else gets the 404 page |
| Data storage | No database. Content is JSON in the repo; the live editor commits it to GitHub |
| Cookies / storage | `sessionStorage` key for found stickers. Cookies: Keystatic's GitHub sign-in cookies (editor only), `brand-renewing` (HttpOnly, 20 s), `spotify-state` (dev only) |
| File uploads | No visitor uploads. Editor image uploads become GitHub commits (owner only) |
| Third parties | None on visitor pages. Fonts are bundled at build by `next/font`. Spotify covers are fetched on the server and served from `/_next/image`. Only the editor talks to `api.github.com`, `avatars.githubusercontent.com` and Google Fonts (its Inter font). Instagram/YouTube/LinkedIn/Spotify are plain links, not embeds |
| Env vars | Server-only: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`. Public by design: `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` (the GitHub app's name), `NEXT_PUBLIC_KEYSTATIC_STORAGE` (dev switch). Vercel-provided: `VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL`. `.env.local` holds a Vercel CLI `VERCEL_OIDC_TOKEN` (git-ignored, not used by code) |
| Repo visibility | **Public** (github.com/ishenalievi/ilyas-portfolio) |

**N/A sections:** 4 (contact form) completely; most of 14 (no database, no visitor uploads, no webhooks).

---

## 2. Summary

| Section | ✅ | 🔧 | ⚠️ | N/A |
|---|---|---|---|---|
| 1 Secrets in code | 6 | 2 | 0 | 0 |
| 2 Git history | 2 | 0 | 1 | 1 |
| 3 XSS / unsafe rendering | 4 | 2 | 0 | 0 |
| 4 Contact form | 0 | 0 | 0 | 9 |
| 5 Security headers | 1 | 6 | 2 | 0 |
| 6 HTTPS / mixed content | 2 | 0 | 0 | 1 |
| 7 Third-party scripts | 3 | 0 | 0 | 4 |
| 8 Personal data in assets | 5 | 1 | 2 | 0 |
| 9 Build output / debug | 5 | 0 | 0 | 0 |
| 10 Browser storage | 3 | 0 | 0 | 0 |
| 11 Dependencies | 4 | 1 | 1 | 0 |
| 12 Error pages | 2 | 1 | 0 | 0 |
| 13 Vercel / accounts | 0 | 0 | 8 | 0 |
| 14 Back-end items | 5 | 0 | 0 | 3 |

---

## 3. Findings

No P0 findings. Commits: see the last section.

### P0 checks (all passed)

- **Secrets in code (S1):** Searched every tracked file for key patterns (`sk_`, `AKIA`, `AIza`, `ghp_`/`github_pat_`, `xox`, `SG.`, `re_`, `Bearer`, JWTs, `-----BEGIN`, `api_key=` style assignments). Also checked each real value in `.env`/`.env.local` against tracked files: **0 hits**. The 32-character hex strings in `skills-lock.json` are content hashes (`computedHash`), not keys. ✅
- **Server-only secrets (S1):** Spotify keys are read only in `lib/spotify.ts`, which imports `server-only`. Keystatic keys are read only in the API route. No `NEXT_PUBLIC_` variable holds a secret. ✅
- **Build output (S1/S15):** Searched `.next/static` and `.next/server` after the final build for every `.env` value and the key patterns: **0 hits**. ✅
- **Git history (S2):** `gitleaks`/`trufflehog` aren't installed, so I used the manual fallback: grepped the full `git log -p --all` for the patterns above and for every real `.env` value. **0 hits.** No `.env*` file was ever committed. ✅
- **XSS (S3):** No `dangerouslySetInnerHTML`, `eval`, `new Function`, `document.write` or string timers. The two `innerHTML` uses (`components/sticker-moves.ts:282`, `components/transitions/engine.ts:420`) insert fixed SVG drawings written in the same file. There are no Markdown or rich-text fields: all editor text renders as plain React text. The only URL-parameter reads are in the dev-only Spotify callback, which escapes them. ✅
- **Photo metadata (S8):** Checked all 63 images in `public/` (ImageMagick): **no GPS, no camera make/model/serial, no author or location fields.** 22 JPGs carry an Instagram download tag (`photoshop:Instructions="FBMD…"`), which is harmless. ✅
- **Video metadata (S8):** All 3 MP4s (ffprobe) carry only encoder tags (`Lavf63.1.102`). ✅
- **Email / phone (S8):** Neither appears anywhere in the site code or content. The only addresses in the repo are fake ones in a design-skill test file (`.agents/skills/design-taste-frontend/evals/evals.json`). ✅

### P1

| # | Where | What was wrong | Change |
|---|---|---|---|
| 1 | `next.config.ts` | No security headers apart from Vercel's HSTS | 🔧 Added `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` and `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()` on every response. (I used `browsing-topics`, not the checklist's `interest-cohort`: that one is retired, and Chrome logs a console error for it, which Lighthouse flags) |
| 2 | `next.config.ts` | No Content-Security-Policy | 🔧 Added as **Report-Only**. Origins allowed: self, plus GitHub API/avatars and Google Fonts for the editor, plus `vercel.live` on preview builds only (the comment toolbar). Scripts need `'unsafe-inline'`: a nonce policy would make every page render on each visit and turn off Partial Prerendering (Next docs: *CSP guide → Static vs Dynamic Rendering*). `upgrade-insecure-requests` is added automatically once the policy is enforced (browsers ignore it in Report-Only and warn about it) |
| 3 | `next.config.ts` | `X-Powered-By: Next.js` header | 🔧 `poweredByHeader: false` |
| 4 | `next.config.ts` | — | ✅ HSTS: Vercel already sends `max-age=63072000; includeSubDomains; preload` on the live site, so I didn't add a second one |
| 5 | `components/transitions/TLink.tsx` | Link addresses from the editor and from Spotify's API were used without checking their scheme | 🔧 `safeHref` lets through only `http(s)://`, `/path` and `#` links; anything else becomes `#`. A `javascript:` or `data:` link can't run, even if one gets typed into the editor or an outside API sends one. No current link changes |
| 6 | `package-lock.json` | `npm audit`: 1 high, `zod <4.6.6` (GHSA-mrhx-c7xc-m3w5, memory exhaustion) | 🔧 `npm audit fix` → zod 4.6.7. **Dev-only:** it comes in through `eslint-config-next` → `eslint-plugin-react-hooks`, and nothing visitors load includes it. Now 0 vulnerabilities |
| 7 | Next.js version | — | ✅ 16.4.2 is newer than every fixed version in the Next.js advisories (including the Oct 2026 critical image-optimizer RCE and `use cache` RCE, both fixed in 16.4.1). 16.4.3 is out; it's a bug-fix backport with no security fixes, so upgrading is optional |
| 8 | Source maps | — | ✅ `productionBrowserSourceMaps` unset; 0 `.map` files in `.next/static` |
| 9 | Console / debug leftovers | — | ✅ No `console.*` or `debugger` in `app/`, `components/`, `lib/` |
| 10 | Mixed content | — | ✅ The only `http://` URLs are `127.0.0.1` addresses in the dev-only Spotify setup |
| 11 | Third-party | — | ✅ No external scripts, iframes, analytics or widgets. Fonts are self-hosted through `next/font/google` |
| 12 | External links | — | ✅ No `target="_blank"` anywhere: external links open in the same tab after the To Be Continued transition, so tab-nabbing can't happen. `rel="noopener"` is already set |
| 13 | Back end | — | ✅ No CORS headers set (same-origin only). `/api/now-playing` is read-only and cached at Vercel's edge for 20 s and in memory for 15 s, so floods don't reach Spotify. Its errors return only `{state:"off"}`. `/brand` is checked on the server against GitHub, not just hidden in the UI. Editor writes are authorized by GitHub itself (they need write access to the repo) |

### P2

| # | Where | Change |
|---|---|---|
| 14 | `.gitignore`, `.env.example` | 🔧 `.env*` blocked an example file. Added `!.env.example` and a `.env.example` listing the key names only (no values) |
| 15 | `app/robots.ts`, `app/sitemap.ts`, `lib/site-url.ts` | 🔧 Neither existed (live site returns 404 for both). robots skips `/keystatic` and `/api/`. Sitemap lists Home, Work, Content, About and each project. `/brand` is left out of both, so neither points anyone to it. The address comes from `VERCEL_PROJECT_PRODUCTION_URL`, so a custom domain later is picked up automatically |
| 16 | `app/(site)/error.tsx` | 🔧 No custom error page. Added one in the 404's style (ゴゴゴ, "Try again", "Back home"). It shows no error details. **Copy is placeholder.** Next's built-in fallback already hid stack traces, so this is for looks |
| 17 | `sticker-moves.ts:282`, `engine.ts:420` | 🔧 Comment on each `innerHTML` line saying it's a fixed drawing |
| 18 | Browser storage | ✅ `sessionStorage` (found stickers) is wrapped in try/catch. `brand-renewing` cookie: HttpOnly, SameSite=Lax, Secure in production. Keystatic's own GitHub sign-in cookie can be read by JavaScript because the editor calls GitHub from the browser; that's Keystatic's design, and nothing on the site injects scripts |
| 19 | 404 page | ✅ Custom, on-brand |

---

## 4. ⚠️ Owner to-do list

Account settings first. Do these yourself in the browser; I didn't touch any account.

1. **Two-factor sign-in on every account.** GitHub: Settings → Password and authentication → Enable two-factor. Vercel: Account Settings → Authentication → Two-Factor. Your Google account (the email behind both): myaccount.google.com → Security → 2-Step Verification. Use an authenticator app or passkey, not SMS, if offered.
2. **GitHub Dependabot.** Repo → Settings → Advanced Security (or "Code security") → turn on **Dependabot alerts** and **Dependabot security updates**. Also turn on **Secret scanning / Push protection** while there (free on public repos): it blocks a push that contains a key.
3. **Vercel preview protection.** Vercel → project `ishenaliev` → Settings → Deployment Protection → **Vercel Authentication: Standard Protection** (protects preview URLs, keeps the live site public). Free on Hobby.
4. **Vercel env vars.** Settings → Environment Variables. Check each Keystatic/Spotify key is set for **Production** only (not Preview/Development) and marked **Sensitive**. To mark an existing one, you may need to delete and re-add it with the toggle on (paste the value from `.env` on the Mac).
5. **Git fork protection.** Settings → Git → make sure "Git Fork Protection" is on. It's on by default, and it matters here because the repo is public.
6. **Old projects.** Vercel dashboard: delete any old or test projects and unused integrations.
7. **Firewall.** Settings → Firewall: the default DDoS protection is on automatically. Optional: turn on **Bot Protection** (free). No rate-limit rule needed: there's no form, and `/api/now-playing` is cached.
8. **Turn the CSP on.** After this change is on a preview deployment: open `/keystatic` there, sign in, edit and **save** something. If it saves, change `"Content-Security-Policy-Report-Only"` to `"Content-Security-Policy"` in `next.config.ts` (one line, commented). I tested every site page with the policy enforced (zero violations), but couldn't test the signed-in editor.
9. **Score the headers.** After deploying, run https://securityheaders.com and https://developer.mozilla.org/observatory on the live URL and note the grades below.
10. **`Portfolio Storyboard.pdf` in the repo root.** It isn't served by the site (it isn't in `public/`), but the repo is public, so anyone can download it from GitHub. Its metadata only says author "Ilyas Ishenaliev", and it contains no email or phone. Decide whether a 13-page planning doc should be public. If not, delete it (it stays in git history; ask Claude about removing it from history, which rewrites history, can't be undone, and needs a force-push).
11. **Confirm nothing private is in `public/`.** Everything there can be downloaded by direct URL, linked or not. Confirm nothing is under NDA or unreleased: club/org assets (Imprint, Young Ventures, BTV), drafts.
12. **Photos of other people.** I checked metadata, not faces. Look through `public/images/posts/`, `projects/` and `hero/` and confirm anyone identifiable is fine being on the site.
13. **Keystatic in GitHub.** Since the editor's GitHub app can write to the repo: GitHub → Settings → Applications → check the Keystatic app is installed **only** on `ilyas-portfolio`.

---

## 5. Scores

| Check | Before (live, 24 Oct) | After |
|---|---|---|
| Response headers | Only `strict-transport-security` + `server: Vercel` | nosniff, frame DENY, referrer, permissions, CSP (Report-Only), no `X-Powered-By` (checked on a local production build) |
| securityheaders.com | not run (needs the live URL); with only HSTS it's normally **D** | run after deploy (to-do #9). Expect A once the CSP is enforced; while it's Report-Only, the CSP may count as missing |
| Mozilla Observatory | not run | after deploy |
| Lighthouse | not run in this pass | after deploy, to compare with the image-optimization pass |
| Console on every page (headless Chrome, production build, CSP enforced) | — | 0 CSP violations, 0 mixed-content warnings |

Non-security console notes from that run (existing code, not changed here): `GSAP target not found` on most pages, and three "preloaded but not used" image warnings on `/work/imprint-reels`. Lighthouse Best Practices may count the GSAP one.

---

## 6. Deferred

- **Enforcing the CSP**: waits for the signed-in editor test (to-do #8).
- **Nonce-based CSP** (no `'unsafe-inline'` scripts): skipped on purpose. It turns off prerendering for every page (slower, costs more), and there's no user input or third-party script on the site for it to protect against.
- **Stripping the Instagram `FBMD` tags** from 22 JPGs: harmless, so it can wait for the next image re-export.
- **`gitleaks` scan**: the manual history grep found nothing. Installing `gitleaks` (`brew install gitleaks`) and running `gitleaks detect` would be a second opinion.
- **Next 16.4.3**: bug fixes only; upgrade whenever.
- **Contact-form checks (Section 4)**: N/A now. Redo them if a form is ever added (the brief says no).

## Commits

- `af3446d`: the performance pass this checklist ran after (Tailwind removal, media compression). It also carries the `npm audit fix` (zod) because it shares `package-lock.json`.
- The commit that adds this report: everything else above (headers, CSP, link guard, `.env.example`, robots/sitemap, error page, `innerHTML` notes, booklet line for the error page).
