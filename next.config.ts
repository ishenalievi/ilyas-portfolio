import type { NextConfig } from "next";

// Which outside addresses a page may load things from. Everything the site shows comes from
// itself (fonts are bundled, Spotify covers go through /_next/image); only the editor at
// /keystatic talks to GitHub and loads its font from Google. Preview builds also get Vercel's
// comment toolbar.
// Scripts need 'unsafe-inline' because the pages are prerendered (cacheComponents), and a
// stricter nonce policy would make every page render fresh on each visit.
const preview = process.env.VERCEL_ENV === "preview";
const toolbar = (...extra: string[]) => (preview ? ["https://vercel.live", ...extra] : []);
const csp = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", ...toolbar()],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", ...toolbar()],
  "img-src": ["'self'", "data:", "blob:", "https://avatars.githubusercontent.com", ...toolbar("https://vercel.com")],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com", ...toolbar("https://assets.vercel.com")],
  "media-src": ["'self'"],
  "connect-src": ["'self'", "https://api.github.com", ...toolbar("wss://ws-us3.pusher.com")],
  "frame-src": preview ? ["https://vercel.live"] : ["'none'"],
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "object-src": ["'none'"],
};

// Report-Only: nothing gets blocked yet. The site's pages were tested with it switched on (Oct 2026);
// the signed-in editor wasn't. Once saving in /keystatic works on a preview deployment with it
// switched on, change this to "Content-Security-Policy".
const CSP_HEADER: string = "Content-Security-Policy-Report-Only";
const enforced = CSP_HEADER === "Content-Security-Policy";

const cspValue = Object.entries(csp)
  .map(([k, v]) => [k, ...v].join(" "))
  // browsers ignore (and warn about) this one in a Report-Only policy
  .concat(enforced ? ["upgrade-insecure-requests"] : [])
  .join("; ");

// HTTPS-only (Strict-Transport-Security) is left out: Vercel already sends it on every response.
const security = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: CSP_HEADER, value: cspValue },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The pages read their text from content/ and measure pictures in public/ on the server.
  // Vercel only ships files the build can see being used, and it can't see these, so without
  // this any fresh server render (search engines, Lighthouse, link previews) fails with a 500.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./public/images/**/*", "./public/stickers/**/*"],
  },
  // Keystatic's GitHub setup runs at 127.0.0.1 on your Mac; allow it in development only.
  allowedDevOrigins: ["127.0.0.1"],
  partialPrefetching: true,
  // album covers for the "now spinning" label on Home
  images: { remotePatterns: [{ protocol: "https", hostname: "i.scdn.co" }] },
  // don't announce "Next.js" in every response
  poweredByHeader: false,
  // Security headers on every response. Skipped with `npm run dev`, which runs on plain http.
  async headers() {
    if (process.env.NODE_ENV === "development") return [];
    return [{ source: "/:path*", headers: security }];
  },
};

export default nextConfig;
