// The JoJo "menacing" ゴゴゴ: heavy katakana with a purple gradient and dark
// outline, stepping down a diagonal and trembling. Sized by the parent's font-size.
// The letters are empty: CSS draws each one, as the uploaded ゴ picture if there is
// one (see SiteChrome), otherwise as the typed ゴ, so the two never show at once.

export function Menacing({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <span className={`menacing ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </span>
  );
}
