import { Torn } from "./collage";
import { TLink } from "./transitions/TLink";

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        {/* the monogram on the off-white paper behind the hero's "Ishenaliev" */}
        <TLink href="/" className="logo" aria-label="Home">
          <Torn as="span" className="logo-paper paper-2" seed="logo" amp={3}>
            II.
          </Torn>
        </TLink>
        <nav aria-label="Main">
          <TLink href="/work">Work</TLink>
          <TLink href="/content">Content</TLink>
          <TLink href="/about">About</TLink>
        </nav>
      </div>
    </header>
  );
}
