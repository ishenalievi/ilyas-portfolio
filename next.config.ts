import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Keystatic's GitHub setup runs at 127.0.0.1 on your Mac; allow it in development only.
  allowedDevOrigins: ["127.0.0.1"],
  partialPrefetching: true,
  // album covers for the "now spinning" label on Home
  images: { remotePatterns: [{ protocol: "https", hostname: "i.scdn.co" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
