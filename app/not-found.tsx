import "./globals.css";
import { Menacing } from "@/components/Menacing";
import { SiteChrome } from "@/components/SiteChrome";
import { TLink } from "@/components/transitions/TLink";

export default function NotFound() {
  return (
    <SiteChrome>
      <section className="block page-top">
        <div className="wrap nf">
          <p className="gogo-big">
            <Menacing />
          </p>
          <h1>This page doesn&apos;t exist.</h1>
          <p>Or it got torn out. Either way, nothing to see here.</p>
          <TLink href="/" className="btn">
            Back home
          </TLink>
        </div>
      </section>
    </SiteChrome>
  );
}
