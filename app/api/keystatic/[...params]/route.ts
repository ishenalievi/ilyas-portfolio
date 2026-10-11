import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "@/keystatic.config";

// Keystatic refuses to start in production without its GitHub keys, which would
// break every deploy until the one-time GitHub setup is done. Until the keys are
// added in Vercel, the editor's back end just says it isn't set up yet.
const keysReady = Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID && process.env.KEYSTATIC_GITHUB_CLIENT_SECRET && process.env.KEYSTATIC_SECRET);
const enabled = config.storage.kind === "local" || keysReady || process.env.NODE_ENV !== "production";

const handlers = enabled ? makeRouteHandler({ config }) : null;

const notReady = () =>
  Response.json(
    { error: "The site editor isn't connected to GitHub yet. Add the Keystatic keys in Vercel, then redeploy." },
    { status: 503 },
  );

export function GET(request: Request) {
  return handlers ? handlers.GET(request) : notReady();
}

export function POST(request: Request) {
  return handlers ? handlers.POST(request) : notReady();
}
