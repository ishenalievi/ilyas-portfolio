// One-time Spotify setup, on your own computer only (`npm run dev`).
// Saves the keys into the git-ignored .env file, so they never pass through chat or GitHub.

import "server-only";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ENV = path.join(process.cwd(), ".env");

export const localOnly = () => process.env.NODE_ENV === "development";

export async function readEnv(): Promise<Record<string, string>> {
  const text = await readFile(ENV, "utf8").catch(() => "");
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

/** Sets keys in .env (replacing old values, keeping everything else) and in this running server. */
export async function saveEnv(values: Record<string, string>) {
  let text = await readFile(ENV, "utf8").catch(() => "");
  for (const [k, v] of Object.entries(values)) {
    const line = `${k}=${v}`;
    const re = new RegExp(`^\\s*${k}\\s*=.*$`, "m");
    text = re.test(text) ? text.replace(re, line) : `${text.replace(/\n?$/, "\n")}${line}\n`;
    process.env[k] = v;
  }
  await writeFile(ENV, text, { mode: 0o600 });
}

/** The address the browser actually used (Next reports "localhost" in req.url either way).
    Spotify only accepts 127.0.0.1, not "localhost", for local sign-in. */
export const hostOf = (req: Request) => req.headers.get("host") ?? new URL(req.url).host;
export const callbackUrl = (req: Request) => `http://${hostOf(req)}/api/spotify/callback`;

export const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${title}</title>
<style>body{font:17px/1.55 system-ui,sans-serif;max-width:38rem;margin:3rem auto;padding:0 1rem;color:#14213d;background:#f1ecdf}h1{font-size:1.6rem}
label{display:block;margin:1rem 0 .3rem;font-weight:600}input{width:100%;font:inherit;padding:.6rem;border:2px solid #14213d;background:#fff;box-sizing:border-box}
button{margin-top:1.4rem;font:700 .9rem system-ui;letter-spacing:.05em;text-transform:uppercase;padding:.8rem 1.1rem;background:#14213d;color:#f3ead7;border:0;box-shadow:.25rem .25rem 0 #9b1d30;cursor:pointer}
code{background:#fff;padding:.1rem .3rem}ol li{margin:.4rem 0}</style>${body}`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
