// Everything around each page of the site: stickers, transitions, menu, footer, floor.
// The admin panel (/keystatic) doesn't use this, so it stays plain.

import type { ReactNode } from "react";
import { getSite, getStickers } from "@/lib/content";
import { Footer } from "./Footer";
import { Motion } from "./motion/Motion";
import { Nav } from "./Nav";
import { Stickers } from "./Stickers";
import { TransitionProvider } from "./transitions/TransitionProvider";

export async function SiteChrome({ children }: { children: ReactNode }) {
  const [site, stickers] = await Promise.all([getSite(), getStickers()]);
  return (
    <>
      {/* your drawn ゴ (Keystatic → Background stickers) replaces the typed letter in every ゴゴゴ */}
      {stickers.go && <style>{goGlyph(stickers.go.src)}</style>}
      <Stickers />
      <TransitionProvider introLabel={site.introLabel}>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Motion />
        <div className="floor" aria-hidden="true" />
      </TransitionProvider>
    </>
  );
}

/** The typed ゴ stays in place for screen size and screen readers; the picture is drawn over it. */
const goGlyph = (src: string) =>
  `.menacing > span{background:url("${encodeURI(src)}") center / contain no-repeat;-webkit-background-clip:border-box;background-clip:border-box;color:transparent;width:1em;height:1em;filter:none}`;
