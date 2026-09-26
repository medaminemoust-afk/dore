import { NextRequest } from "next/server";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

type LrcResult = {
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
  trackName?: string;
  artistName?: string;
};

function clean(value: string) {
  return value
    .replace(/\(.*?(official|video|audio|lyrics|remaster|clip).*?\)/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/(official|lyric[s]? video|audio|hd|4k)/gi, "")
    .trim();
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const title = clean(url.searchParams.get("title") ?? "");
  const artist = clean(url.searchParams.get("artist") ?? "");
  if (!title) return jsonCached({ synced: null, plain: null });

  const endpoints = [
    `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`,
    `https://lrclib.net/api/search?q=${encodeURIComponent(`${artist} ${title}`.trim())}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { "User-Agent": "InnerSound/1.0 (https://github.com)" },
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 60 * 60 * 24 * 3 },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as LrcResult | LrcResult[];
      const item = Array.isArray(data) ? data.find((d) => d.syncedLyrics || d.plainLyrics) : data;
      if (item && (item.syncedLyrics || item.plainLyrics)) {
        return jsonCached({
          synced: item.syncedLyrics ?? null,
          plain: item.plainLyrics ?? null,
          source: "LRCLIB",
        });
      }
    } catch {
      /* try next */
    }
  }
  return jsonCached({ synced: null, plain: null });
}
