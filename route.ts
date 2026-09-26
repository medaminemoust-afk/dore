import { NextRequest } from "next/server";
import { getRadio, searchSongs } from "@/lib/innertube";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await ctx.params;
  const url = new URL(req.url);
  const hl = url.searchParams.get("hl") ?? "en";
  const seed = url.searchParams.get("seed") ?? "";
  try {
    let songs = await getRadio(videoId, hl);
    if (!songs.length && seed) songs = await searchSongs(seed + " mix", 25, hl);
    return jsonCached({ songs });
  } catch {
    try {
      const songs = seed ? await searchSongs(seed + " mix", 25, hl) : [];
      return jsonCached({ songs });
    } catch {
      return jsonCached({ songs: [] });
    }
  }
}
