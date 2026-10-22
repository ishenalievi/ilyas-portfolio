"use client";

// "Now spinning": a torn label stuck under the headshot on Home, showing what Ilyas is playing
// on Spotify right now, or the last thing played. Asks /api/now-playing after the welcome
// intro, then every 30 s while the tab is open. Shows nothing until Spotify is connected.

import Image from "next/image";
import { useEffect, useState } from "react";
import { tornClip } from "@/lib/torn";
import type { NowPlaying as Data } from "@/lib/spotify";
import { Tape } from "./collage";
import { afterReveal } from "./motion/bus";
import { TLink } from "./transitions/TLink";

const EVERY = 30_000;

function ago(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 2) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

export function NowPlaying() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let timer = 0;
    let stopped = false;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/now-playing");
        if (res.status === 503) return void (stopped = true); // not connected yet
        if (res.ok) setData(await res.json());
      } catch {}
    };
    const cancel = afterReveal(() => {
      load();
      timer = window.setInterval(() => !stopped && load(), EVERY);
    });
    const onShow = () => !document.hidden && !stopped && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      cancel();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  if (!data || data.state === "off") return null;
  const playing = data.state === "playing";

  return (
    <div className="np-wrap">
      <Tape className="np-tape" />
      <TLink href={data.url} className="np" aria-label={`${playing ? "Now playing" : "Last played"}: ${data.title} by ${data.artist}, on Spotify`}>
        <span className="np-paper" style={{ clipPath: tornClip("trbl", 4, "now-playing") }}>
          {data.art && (
            <span className="np-art">
              <Image src={data.art.url} alt="" width={data.art.w} height={data.art.h} sizes="5rem" />
            </span>
          )}
          <span className="np-text">
            <small className="np-label">
              {playing ? (
                <>
                  <span className="np-bars" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  Now spinning
                </>
              ) : (
                <>Last spun · {data.at ? ago(data.at) : "a while ago"}</>
              )}
            </small>
            <b className="np-title">{data.title}</b>
            <span className="np-artist">{data.artist}</span>
          </span>
        </span>
      </TLink>
    </div>
  );
}
