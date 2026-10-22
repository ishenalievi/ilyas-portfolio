import { connection } from "next/server";
import { getNowPlaying, spotifyReady } from "@/lib/spotify";

// The "now spinning" label on Home asks here every half minute.
// Shared caches keep each answer ~20 s, so Spotify is asked a few times a minute at most.
export async function GET() {
  await connection(); // always at request time, never prerendered at build
  const noStore = { "Cache-Control": "no-store" };
  if (!spotifyReady()) return Response.json({ state: "off" }, { status: 503, headers: noStore });
  try {
    return Response.json(await getNowPlaying(), {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=20, stale-while-revalidate=40" },
    });
  } catch {
    return Response.json({ state: "off" }, { status: 502, headers: noStore });
  }
}
