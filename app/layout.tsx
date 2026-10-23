import type { Metadata, Viewport } from "next";
import { Bowlby_One, DM_Serif_Display, Instrument_Sans, Space_Mono } from "next/font/google";
import { getSite } from "@/lib/content";

// The bare page shell shared by the site and the admin panel.
// The site's styles and chrome live in app/(site)/layout.tsx.

const display = Bowlby_One({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const serif = DM_Serif_Display({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-serif" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-mono" });

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.name, template: `%s · ${site.name}` },
    description: site.description,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
