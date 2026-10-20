// Keeps /brand (the brand booklet) private: only the site's owner, signed in to the
// editor (/keystatic) with GitHub, can open it. Everyone else gets "page not found".
//
// On your own computer with `npm run dev` the editor has no sign-in, so the page just opens.

import { NextResponse, type NextRequest } from "next/server";

const OWNER = "ishenalievi"; // the GitHub account that owns the repo
const ACCESS = "keystatic-gh-access-token"; // set by Keystatic when you sign in, lasts about 8 hours
const REFRESH = "keystatic-gh-refresh-token"; // lets Keystatic renew the sign-in without asking again
const RENEWING = "brand-renewing"; // stops a renew → come back → renew loop if cookies are blocked

const localEditor = process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE !== "github";

/** Shows the normal 404 page, as if /brand didn't exist. */
const notFound = (req: NextRequest) => NextResponse.rewrite(new URL("/_brand-private", req.url));

async function isOwner(token: string) {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "ishenaliev-site" },
    });
    if (!res.ok) return false;
    const user: { login?: unknown } = await res.json();
    return typeof user.login === "string" && user.login.toLowerCase() === OWNER;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  if (localEditor) return NextResponse.next();

  const token = req.cookies.get(ACCESS)?.value;
  if (token) {
    if (!(await isOwner(token))) return notFound(req);
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "private, no-store");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  // Signed in before, but the 8-hour sign-in ran out: renew it the same way the editor does, then come back.
  if (req.cookies.has(REFRESH) && !req.cookies.has(RENEWING)) {
    const renewed = await fetch(new URL("/api/keystatic/github/refresh-token", req.url), {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    }).catch(() => null);
    if (renewed?.ok) {
      const back = NextResponse.redirect(req.nextUrl);
      back.cookies.set(RENEWING, "1", { maxAge: 20, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/brand" });
      // after cookies.set, which rewrites the Set-Cookie headers it knows about
      for (const c of renewed.headers.getSetCookie()) back.headers.append("Set-Cookie", c);
      return back;
    }
  }

  return notFound(req);
}

export const config = {
  matcher: ["/brand", "/brand/:path*"],
};
