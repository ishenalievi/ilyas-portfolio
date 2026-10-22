// Step 2 of the one-time Spotify setup: Spotify sends you back here after you approve,
// and the long-lived key (refresh token) is saved to .env. Only exists with `npm run dev`.

import { callbackUrl, localOnly, page, readEnv, saveEnv } from "@/lib/spotify-setup";

export async function GET(req: Request) {
  if (!localOnly()) return new Response("Not found", { status: 404 });
  const url = new URL(req.url);
  const cookie = req.headers.get("cookie") ?? "";
  const expected = cookie.match(/(?:^|;\s*)spotify-state=([^;]+)/)?.[1];
  const retry = `<p><a href="/api/spotify/connect">Start again</a></p>`;

  if (url.searchParams.get("error")) return page("Spotify", `<h1>Spotify said no</h1><p>${(url.searchParams.get("error") ?? "").replace(/[<>&"]/g, "")}</p>${retry}`, 400);
  if (!expected || expected !== url.searchParams.get("state")) return page("Spotify", `<h1>That link expired</h1>${retry}`, 400);

  const env = await readEnv();
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code") ?? "", redirect_uri: callbackUrl(req) }),
    cache: "no-store",
  });
  if (!res.ok) return page("Spotify", `<h1>Spotify didn't accept the keys (${res.status})</h1><p>Check the Client ID, secret and Redirect URI in your Spotify app.</p>${retry}`, 400);

  const j: { refresh_token?: string } = await res.json();
  if (!j.refresh_token) return page("Spotify", `<h1>No key came back</h1>${retry}`, 400);
  await saveEnv({ SPOTIFY_REFRESH_TOKEN: j.refresh_token });

  return page(
    "Spotify connected",
    `<h1>Spotify connected ✓</h1><p>Your site can now see what you're playing. Go back to Claude and say <b>“Spotify connected”</b> so the keys get added to the live site.</p>
<p><a href="/">See it on Home</a></p>`,
  );
}
