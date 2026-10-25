// The live site's address. Vercel fills this in at build time and switches it over by itself
// if a custom domain is added later.
export const SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "ishenaliev.vercel.app"}`;
