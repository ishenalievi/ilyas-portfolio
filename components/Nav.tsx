import { TLink } from "./transitions/TLink";

export function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav-row">
        <TLink href="/" className="logo" aria-label="Home">
          II.
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
