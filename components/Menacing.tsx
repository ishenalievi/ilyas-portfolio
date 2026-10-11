// The JoJo "menacing" ゴゴゴ: heavy katakana with a purple gradient and dark
// outline, stepping down a diagonal and trembling. Sized by the parent's font-size.

export function Menacing({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <span className={`menacing ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties}>
          ゴ
        </span>
      ))}
    </span>
  );
}
