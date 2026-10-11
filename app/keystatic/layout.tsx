import type { Metadata } from "next";

// The admin panel: kept out of search results.
export const metadata: Metadata = { title: "Site editor", robots: { index: false, follow: false } };

export default function KeystaticLayout({ children }: { children: React.ReactNode }) {
  return children;
}
