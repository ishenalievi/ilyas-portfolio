import type { NextConfig } from "next";

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
};

export default nextConfig;
