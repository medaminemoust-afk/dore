import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Best-effort audio resolver used by the offline downloader.
 * It asks public Piped / Invidious mirrors for a direct audio stream and
 * proxies the bytes so the browser can store them in IndexedDB.
 * If no mirror can serve the track, the client falls back to the
 * YouTube player (online) and keeps the metadata cached offline.
 */
const PIPED = [
  "https://api.piped.private.coffee",
  "https://pipedapi.ducks.party",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.drgns.space",
  "https://pipedapi.leptons.xyz",
  "https://pipedapi.kavin.rocks",
];

const INVIDIOUS = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://yewtu.be",
  "https://invidious.f5.si",
];

type AudioStream = { url: string; bitrate?: number; mimeType?: string; contentLength?: number };

async function resolve(videoId: string): Promise<AudioStream | null> {
  for (const host of PIPED) {
    try {
      const res = await fetch(`${host}/streams/${videoId}`, {
        signal: AbortSignal.timeout(9000),
        headers: { "User-Agent": "InnerSound/1.0" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { audioStreams?: AudioStream[] };
      const best = (data.audioStreams ?? [])
        .filter((s) => s.url)
        .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
      if (best) return best;
    } catch {
      /* next mirror */
    }
  }

  for (const host of INVIDIOUS) {
    try {
      const res = await fetch(`${host}/api/v1/videos/${videoId}?fields=adaptiveFormats`, {
        signal: AbortSignal.timeout(9000),
        headers: { "User-Agent": "InnerSound/1.0" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        adaptiveFormats?: { url: string; type?: string; bitrate?: string }[];
      };
      const audio = (data.adaptiveFormats ?? [])
        .filter((f) => (f.type ?? "").startsWith("audio") && f.url)
        .sort((a, b) => Number(b.bitrate ?? 0) - Number(a.bitrate ?? 0))[0];
      if (audio) return { url: audio.url, mimeType: audio.type };
    } catch {
      /* next mirror */
    }
  }
  return null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await ctx.params;
  if (!/^[\w-]{6,20}$/.test(videoId)) {
    return Response.json({ error: "bad_id" }, { status: 400 });
  }

  const stream = await resolve(videoId);
  if (!stream) {
    return Response.json(
      { error: "audio_unavailable", hint: "playback_via_youtube_player" },
      { status: 503 },
    );
  }

  const range = req.headers.get("range");
  try {
    const upstream = await fetch(stream.url, {
      headers: {
        ...(range ? { Range: range } : {}),
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      signal: AbortSignal.timeout(45000),
    });
    if (!upstream.ok && upstream.status !== 206) {
      return Response.json({ error: "upstream_failed" }, { status: 503 });
    }
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("content-type") ?? stream.mimeType ?? "audio/webm");
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    const cr = upstream.headers.get("content-range");
    if (cr) headers.set("Content-Range", cr);
    headers.set("Accept-Ranges", "bytes");
    // Cache resolved audio bytes for 3 days on the client / CDN edge.
    headers.set("Cache-Control", "public, max-age=259200, s-maxage=259200, stale-while-revalidate=86400");
    return new Response(upstream.body, { status: upstream.status, headers });
  } catch {
    return Response.json({ error: "proxy_failed" }, { status: 503 });
  }
}
