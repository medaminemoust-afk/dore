import { NextRequest } from "next/server";
import { searchAlbums, searchAll, searchArtists, searchSongs } from "@/lib/innertube";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const type = url.searchParams.get("type") ?? "all";
  const hl = url.searchParams.get("hl") ?? "en";
  if (!q) return jsonCached({ songs: [], artists: [], albums: [] });

  try {
    if (type === "songs") return jsonCached({ songs: await searchSongs(q, 30, hl), artists: [], albums: [] });
    if (type === "artists") return jsonCached({ songs: [], artists: await searchArtists(q, 24, hl), albums: [] });
    if (type === "albums") return jsonCached({ songs: [], artists: [], albums: await searchAlbums(q, 24, hl) });
    return jsonCached(await searchAll(q, hl));
  } catch {
    return jsonCached({ songs: [], artists: [], albums: [], error: "search_failed" });
  }
}
