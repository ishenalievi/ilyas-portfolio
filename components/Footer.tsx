import { site } from "@/content/site";
import { Torn } from "./collage";
import { TLink } from "./transitions/TLink";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-grid">
        <div className="tbc-arrow" aria-hidden="true">
          TO BE CONTINUED
        </div>
        <p className="foot-sign">— {site.firstName}</p>
        <div className="foot-links">
          <Torn as={TLink} href={site.instagram.url} seed="foot-ig" amp={3} className="foot-link">
            Instagram {site.instagram.handle}
          </Torn>
          <Torn as={TLink} href={site.linkedin.url} seed="foot-li" amp={3} className="foot-link">
            LinkedIn
          </Torn>
          <Torn as={TLink} href="/work/making-this-site" seed="foot-mo" amp={3} className="foot-link">
            How this site was made
          </Torn>
        </div>
        <p className="foot-small">
          © {site.year} {site.name}. Torn by hand, more or less.
        </p>
      </div>
    </footer>
  );
}
