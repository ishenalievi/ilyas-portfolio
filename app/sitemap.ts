import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { SITE_URL } from "@/lib/site-url";

// The public pages, for search engines. /brand stays out on purpose.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/work", "/content", "/about"];
  const projects = (await getProjects()).map((p) => `/work/${p.slug}`);
  return [...pages, ...projects].map((path) => ({ url: `${SITE_URL}${path}` }));
}
