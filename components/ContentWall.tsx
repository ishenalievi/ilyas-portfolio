"use client";

import Image from "next/image";
import { useState } from "react";
import type { Post } from "@/content/posts";
import { tornClip } from "@/lib/torn";
import { TLink } from "./transitions/TLink";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "video", label: "Video" },
  { id: "design", label: "Design" },
  { id: "ig", label: "Instagram" },
  { id: "yt", label: "YouTube" },
] as const;

type F = (typeof FILTERS)[number]["id"];

export function ContentWall({ posts, filters = true }: { posts: Post[]; filters?: boolean }) {
  const [f, setF] = useState<F>("all");
  const shown = posts.filter((p) => f === "all" || p.type === f || p.platform === f);

  return (
    <div>
      {filters && (
        <div className="wall-bar" role="group" aria-label="Filter posts">
          {FILTERS.map((x) => (
            <button key={x.id} type="button" aria-pressed={f === x.id} onClick={() => setF(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      )}
      <div className="wall">
        {shown.map((p) => (
          <TLink key={p.href} href={p.href} className="post">
            <div className="pic" style={{ clipPath: tornClip("trbl", 4, p.href) }}>
              <Image src={p.img} alt={p.title} width={p.w} height={p.h} sizes="(max-width: 600px) 50vw, (max-width: 1200px) 25vw, 18vw" />
            </div>
            <span className={`post-stamp ${p.platform}`}>{p.stamp}</span>
            <b>{p.title}</b>
            <small>{p.note}</small>
          </TLink>
        ))}
      </div>
    </div>
  );
}
