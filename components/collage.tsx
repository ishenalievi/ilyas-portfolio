// The collage kit: torn paper, tape and margin notes.

import type { CSSProperties, ElementType, ReactNode } from "react";
import { tornClip } from "@/lib/torn";

type TornProps = {
  as?: ElementType;
  sides?: string;
  amp?: number;
  seed: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

/** A piece of paper with ripped edges. The seed keeps each tear unique but stable. */
export function Torn({ as: Tag = "div", sides = "trbl", amp = 6, seed, className, style, children, ...rest }: TornProps) {
  return (
    <Tag className={className} style={{ ...style, clipPath: tornClip(sides, amp, seed) }} {...rest}>
      {children}
    </Tag>
  );
}

export function Tape({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`tape ${className}`} style={style} aria-hidden="true" />;
}

/** Wraps torn paper so it casts a hard shadow in the shape of the tear. */
export function Lift({ children, className = "", accent = false }: { children: ReactNode; className?: string; accent?: boolean }) {
  return <div className={`${accent ? "lift-a" : "lift"} ${className}`}>{children}</div>;
}

/** Like <Lift><Torn/></Lift>, but draws the shadow as its own layer so very
    tall sheets never get cut off (browsers give up on filters over big areas). */
export function TornSheet({ as: Tag = "div", sides = "trbl", amp = 8, seed, className, style, children, ...rest }: TornProps) {
  const clip = tornClip(sides, amp, seed);
  return (
    <div className="tsheet">
      <div className="tsheet-shadow" style={{ clipPath: clip }} aria-hidden="true" />
      <Tag className={className} style={{ ...style, clipPath: clip, position: "relative" }} {...rest}>
        {children}
      </Tag>
    </div>
  );
}
