import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Tells search engines what to skip. Not a lock: anything private has to be protected or removed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/keystatic", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
