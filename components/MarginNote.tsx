"use client";

// The margin note on Home's intro sentence. It sits just under the circled word, wherever that
// word lands at the current width, with a hand-drawn arrow curving up into the circle.
// Any arrow typed into the note itself is dropped: the drawn one does the pointing.

import { useEffect, useRef, useState } from "react";

const ARROWS = /^[\s←→↑↓↖↗↘↙⟵⟶]+|[\s←→↑↓↖↗↘↙⟵⟶]+$/g;

export function MarginNote({ text }: { text: string }) {
  const note = useRef<HTMLSpanElement>(null);
  const [path, setPath] = useState<{ d: string; head: string } | null>(null);

  useEffect(() => {
    const el = note.current;
    const grid = el?.parentElement;
    const circle = grid?.querySelector<HTMLElement>(".circ");
    if (!el || !grid || !circle) return;

    const place = () => {
      const g = grid.getBoundingClientRect();
      const c = circle.getBoundingClientRect();
      // the drawn circle reaches 0.2em below the word (see .circ::after), so the tip stops short of that
      const ring = parseFloat(getComputedStyle(circle).fontSize) * 0.2;
      const x1 = c.left - g.left + c.width * 0.5;
      const y1 = c.bottom - g.top + ring + 8;
      // the note starts a little right of the tip, kept inside the column
      const x = Math.max(0, Math.min(x1 + 30, g.width - el.offsetWidth));
      el.style.marginLeft = `${x}px`;
      // and low enough that the arrow has room to curve up
      el.style.marginTop = "";
      const room = el.getBoundingClientRect().top - (c.bottom + ring);
      if (room < 40) el.style.marginTop = `calc(0.4rem + ${Math.ceil(40 - room)}px)`;
      const n = el.getBoundingClientRect();
      // from just left of the note, level with its text, curving up to just under the circle
      const x0 = n.left - g.left - 8;
      const y0 = n.top - g.top + n.height / 2;
      const bend = Math.max(14, (y0 - y1) * 0.7);
      setPath({
        d: `M${x0} ${y0} C${x1 + (x0 - x1) * 0.25} ${y0}, ${x1} ${y1 + bend}, ${x1} ${y1}`,
        // a two-stroke arrowhead pointing up at the circle
        head: `M${x1 - 6} ${y1 + 8} L${x1} ${y1} L${x1 + 6} ${y1 + 8}`,
      });
    };

    place();
    const ro = new ResizeObserver(place);
    ro.observe(grid);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <span ref={note} className="margin-note">
        {text.replace(ARROWS, "")}
      </span>
      {path && (
        <svg className="margin-arrow" aria-hidden="true">
          <path d={path.d} />
          <path d={path.head} />
        </svg>
      )}
    </>
  );
}
