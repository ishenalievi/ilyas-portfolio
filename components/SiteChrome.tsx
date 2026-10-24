// Everything around each page of the site: stickers, transitions, menu, footer, floor.
// The admin panel (/keystatic) doesn't use this, so it stays plain.

import type { ReactNode } from "react";
import { getSite, getStickers } from "@/lib/content";
import { Footer } from "./Footer";
import { Motion } from "./motion/Motion";
import { Nav } from "./Nav";
import { StickerPlay } from "./StickerPlay";
import { Stickers } from "./Stickers";
import { TransitionProvider } from "./transitions/TransitionProvider";

export async function SiteChrome({ children }: { children: ReactNode }) {
  const [site, stickers] = await Promise.all([getSite(), getStickers()]);
  return (
    <>
      {/* your drawn ゴ (Keystatic → Background stickers) replaces the typed letter in every ゴゴゴ */}
      {stickers.go && <style>{goGlyph(stickers.go.src)}</style>}
      <Stickers />
      {/* pressing the stickers: their tricks, the lettering above the page, the hidden reward */}
      <StickerPlay />
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

/** Each ゴ becomes the picture alone: a 1em box with the picture as its background, and no typed letter at all. */
const goGlyph = (src: string) =>
  `.menacing > span{background:url("${encodeURI(src)}") center / contain no-repeat;-webkit-background-clip:border-box;background-clip:border-box;width:1em;height:1em;filter:none}.menacing > span::before{content:none}`;
