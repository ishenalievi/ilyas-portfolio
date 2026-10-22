// Step 1 of the one-time Spotify setup: paste the app's keys, then approve on Spotify.
// Only exists with `npm run dev`; the live site answers "not found".

import { callbackUrl, hostOf, localOnly, page, readEnv, saveEnv } from "@/lib/spotify-setup";

const SCOPES = "user-read-currently-playing user-read-recently-played";
const notFound = () => new Response("Not found", { status: 404 });

export async function GET(req: Request) {
  if (!localOnly()) return notFound();
  // Spotify's rules: local sign-in must use 127.0.0.1, not localhost
  const host = hostOf(req);
  if (host.startsWith("localhost")) return Response.redirect(`http://${host.replace("localhost", "127.0.0.1")}/api/spotify/connect`, 307);

  const env = await readEnv();
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    return page(
      "Connect Spotify",
      `<h1>Connect Spotify · step 1 of 2</h1>
<ol><li>Open <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener">developer.spotify.com/dashboard</a> and click <b>Create app</b>.</li>
<li>Name: <code>ishenaliev site</code>. Description: anything. Redirect URI: <code>${callbackUrl(req)}</code> (click Add). Tick <b>Web API</b>, accept the terms, Save.</li>
<li>Open the app's <b>Settings</b>, copy the <b>Client ID</b> and click <b>View client secret</b>, then paste both below.</li></ol>
<form method="post"><label for="id">Client ID</label><input id="id" name="id" autocomplete="off" required pattern="[0-9a-fA-F]{32}">
<label for="secret">Client secret</label><input id="secret" name="secret" type="password" autocomplete="off" required pattern="[0-9a-fA-F]{32}">
<button>Save and continue to Spotify</button></form>
<p><small>Saved only in the <code>.env</code> file on this computer, which never goes to GitHub.</small></p>`,
    );
  }

  const state = crypto.randomUUID();
  const auth = new URL("https://accounts.spotify.com/authorize");
  auth.search = new URLSearchParams({
    response_type: "code",
    client_id: env.SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: callbackUrl(req),
    state,
  }).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: auth.toString(),
      "Set-Cookie": `spotify-state=${state}; Path=/api/spotify; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  });
}

export async function POST(req: Request) {
  if (!localOnly()) return notFound();
  const form = await req.formData();
  const id = String(form.get("id") ?? "").trim();
  const secret = String(form.get("secret") ?? "").trim();
  if (!/^[0-9a-f]{32}$/i.test(id) || !/^[0-9a-f]{32}$/i.test(secret)) {
    return page("Connect Spotify", `<h1>That doesn't look right</h1><p>Both are 32 letters and numbers. <a href="">Try again</a>.</p>`, 400);
  }
  await saveEnv({ SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret });
  return Response.redirect(`http://${hostOf(req)}/api/spotify/connect`, 303);
}
