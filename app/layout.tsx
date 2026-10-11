import type { Metadata, Viewport } from "next";
import { Bowlby_One, DM_Serif_Display, Instrument_Sans, Space_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { site } from "@/content/site";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { paletteScript } from "@/components/PaletteSwap";
import { TransitionProvider } from "@/components/transitions/TransitionProvider";

const display = Bowlby_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const serif = DM_Serif_Display({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="palette" strategy="beforeInteractive">
          {paletteScript}
        </Script>
        <TransitionProvider>
          <a href="#main" className="skip">
            Skip to content
          </a>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </TransitionProvider>
      </body>
    </html>
  );
}
