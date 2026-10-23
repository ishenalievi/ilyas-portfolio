import { getSite } from "@/lib/content";
import { Torn } from "./collage";
import { TLink } from "./transitions/TLink";

export async function Footer() {
  const site = await getSite();
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="tbc-arrow" aria-hidden="true">
          TO BE CONTINUED
        </div>
        <p className="foot-sign">— {site.firstName}</p>
        <div className="foot-links">
          <Torn as={TLink} href={site.instagramUrl} seed="foot-ig" amp={3} className="foot-link">
            Instagram {site.instagramHandle}
          </Torn>
          <Torn as={TLink} href={site.climbingUrl} seed="foot-cl" amp={3} className="foot-link">
            Climbing {site.climbingHandle}
          </Torn>
          <Torn as={TLink} href={site.linkedinUrl} seed="foot-li" amp={3} className="foot-link">
            LinkedIn
          </Torn>
          <Torn as={TLink} href="/work/making-this-site" seed="foot-mo" amp={3} className="foot-link">
            How this site was made
          </Torn>
        </div>
        <p className="foot-small">
          © {site.year} {site.name}. {site.footerNote}
        </p>
        {site.disclaimer && <p className="foot-disclaimer">{site.disclaimer}</p>}
      </div>
    </footer>
  );
}
