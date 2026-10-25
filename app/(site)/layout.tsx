import "../globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SiteChrome } from "@/components/SiteChrome";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteChrome>{children}</SiteChrome>
      {/* Vercel visitor counts: no cookies, served from this site's own address */}
      <Analytics />
    </>
  );
}
