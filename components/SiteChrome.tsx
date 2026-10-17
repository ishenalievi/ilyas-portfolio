// Everything around each page of the site: stickers, transitions, menu, footer, floor.
// The admin panel (/keystatic) doesn't use this, so it stays plain.

import type { ReactNode } from "react";
import { getSite } from "@/lib/content";
import { Footer } from "./Footer";
import { Motion } from "./motion/Motion";
import { Nav } from "./Nav";
import { Stickers } from "./Stickers";
import { TransitionProvider } from "./transitions/TransitionProvider";

export async function SiteChrome({ children }: { children: ReactNode }) {
  const site = await getSite();
  return (
    <>
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
