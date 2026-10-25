"use client";

// Use this instead of <a> or <Link> everywhere. It picks the right transition:
// Heaven's Door for project pages, Sticky Fingers for Work, The World for About, Tusk for Home,
// Hierophant Green for Content, To Be Continued for other websites,
// and the paper stack for everything else.

import Link from "next/link";
import type { ComponentProps } from "react";
import { useGo } from "./TransitionProvider";
import type { Kind } from "./engine";

type Props = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  kind?: Kind;
  label?: string;
};

// Big labels shown on the paper-stack, zipper and other transitions.
const pageLabels: Record<string, string> = { "/": "HOME", "/work": "WORK", "/content": "CONTENT", "/about": "ABOUT" };

const isExternal = (href: string) => /^https?:\/\//.test(href);

// Links come from the editor and from Spotify. Only web addresses, pages on this site and
// "#" jumps get through, so a "javascript:" or "data:" link can never run anything.
const safeHref = (href: string) => (/^(?:https?:\/\/|\/(?!\/)|#)/i.test(href.trim()) ? href.trim() : "#");

function autoKind(href: string): Kind {
  if (isExternal(href)) return "tbc";
  if (/^\/work\/[^/]+/.test(href)) return "book"; // Heaven's Door for projects
  if (/^\/work\/?(?:[?#]|$)/.test(href)) return "zipper"; // Sticky Fingers for Work
  if (/^\/about\/?(?:[?#]|$)/.test(href)) return "timestop"; // The World for About
  if (/^\/content\/?(?:[?#]|$)/.test(href)) return "emerald"; // Hierophant Green for Content
  if (/^\/(?:[?#]|$)/.test(href)) return "tusk"; // Tusk ACT 4 for Home
  return "strips";
}

function autoLabel(href: string): string {
  if (isExternal(href)) {
    if (href.includes("instagram.com")) return "Off to Instagram";
    if (href.includes("linkedin.com")) return "Off to LinkedIn";
    if (href.includes("youtube.com")) return "Off to YouTube";
    if (href.includes("spotify.com")) return "Off to Spotify";
    return "Leaving the site";
  }
  return pageLabels[href.split(/[?#]/)[0]] ?? "ONE SEC";
}

const modified = (e: React.MouseEvent) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

export function TLink({ href: raw, kind, label, onClick, children, ...rest }: Props) {
  const href = safeHref(raw);
  const go = useGo();
  const k = kind ?? autoKind(href);
  const l = label ?? autoLabel(href);

  if (isExternal(href)) {
    return (
      <a
        href={href}
        rel="noopener"
        {...rest}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented || modified(e)) return;
          e.preventDefault();
          go(href, { kind: k, label: l });
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      {...rest}
      onClick={onClick}
      onNavigate={(e) => {
        e.preventDefault();
        go(href, { kind: k, label: l });
      }}
    >
      {children}
    </Link>
  );
}
