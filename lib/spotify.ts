// What Ilyas is listening to, from Spotify's Web API (needs Spotify Premium on the app owner's account).
// Keys: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN, in .env on your Mac and in Vercel.
// Get them once with `npm run dev`, then open http://127.0.0.1:3000/api/spotify/connect.

import "server-only";

export type NowPlaying =
  | {
      state: "playing" | "recent";
      title: string;
      artist: string;
      url: string;
      art?: { url: string; w: number; h: number };
      /** when it was last played (recent only), ISO time */
      at?: string;
    }
  | { state: "off" };

type SpotifyImage = { url: string; width: number | null; height: number | null };
type Item = {
  type: "track" | "episode";
  name: string;
  external_urls: { spotify: string };
  artists?: { name: string }[];
  album?: { images: SpotifyImage[] };
  show?: { name: string; images: SpotifyImage[] };
  images?: SpotifyImage[];
};

const keys = () => ({
  id: process.env.SPOTIFY_CLIENT_ID ?? "",
  secret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
  refresh: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
});

export const spotifyReady = () => {
  const k = keys();
  return Boolean(k.id && k.secret && k.refresh);
};

let token: { value: string; until: number } | null = null;

async function accessToken() {
  if (token && token.until > Date.now() + 15_000) return token.value;
  const { id, secret, refresh } = keys();
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify sign-in failed (${res.status})`);
  const j: { access_token: string; expires_in: number } = await res.json();
  token = { value: j.access_token, until: Date.now() + j.expires_in * 1000 };
  return token.value;
}

const api = async (path: string) =>
  fetch(`https://api.spotify.com/v1${path}`, { headers: { Authorization: `Bearer ${await accessToken()}` }, cache: "no-store" });

/** The ~300px cover, so the card stays light. Spotify lists the largest first. */
function cover(images: SpotifyImage[] = []) {
  const pick = images.find((i) => (i.width ?? 0) <= 320) ?? images[images.length - 1];
  return pick ? { url: pick.url, w: pick.width ?? 300, h: pick.height ?? 300 } : undefined;
}

function shape(item: Item, state: "playing" | "recent", at?: string): NowPlaying {
  const episode = item.type === "episode";
  return {
    state,
    title: item.name,
    artist: episode ? (item.show?.name ?? "") : (item.artists ?? []).map((a) => a.name).join(", "),
    url: item.external_urls.spotify,
    art: cover(episode ? (item.images ?? item.show?.images) : item.album?.images),
    at,
  };
}

// one answer shared for a few seconds, so a busy page doesn't ask Spotify for every visitor
let memo: { value: NowPlaying; until: number } | null = null;

export async function getNowPlaying(): Promise<NowPlaying> {
  if (memo && memo.until > Date.now()) return memo.value;
  let value: NowPlaying = { state: "off" };

  const now = await api("/me/player/currently-playing?additional_types=track,episode");
  if (now.status === 200) {
    const j: { is_playing: boolean; item: Item | null } = await now.json();
    if (j.item && j.is_playing) value = shape(j.item, "playing");
  } else if (now.status !== 204) {
    throw new Error(`Spotify now playing failed (${now.status})`);
  }

  if (value.state === "off") {
    const recent = await api("/me/player/recently-played?limit=1");
    if (recent.ok) {
      const j: { items: { track: Item; played_at: string }[] } = await recent.json();
      if (j.items[0]) value = shape(j.items[0].track, "recent", j.items[0].played_at);
    }
  }

  memo = { value, until: Date.now() + 15_000 };
  return value;
}
