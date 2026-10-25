"use client";

// Shown when a page breaks. Says nothing about why: the details stay in the Vercel logs.
// Copy is a placeholder, like the 404's.

import { Menacing } from "@/components/Menacing";
import { TLink } from "@/components/transitions/TLink";

export default function PageError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <section className="block page-top">
      <div className="wrap nf">
        <p className="gogo-big">
          <Menacing />
        </p>
        <h1>Something broke.</h1>
        <p>Not your fault. Probably.</p>
        <button type="button" className="btn" onClick={() => retry()}>
          Try again
        </button>
        <TLink href="/" className="btn btn-ghost">
          Back home
        </TLink>
      </div>
    </section>
  );
}
