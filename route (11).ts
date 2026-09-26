import { NextRequest } from "next/server";
import { getArtist, searchArtists, searchSongs } from "@/lib/innertube";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const hl = new URL(req.url).searchParams.get("hl") ?? "en";
  const name = new URL(req.url).searchParams.get("name") ?? "";
  try {
    if (id.startsWith("UC")) {
      const artist = await getArtist(id, hl);
      if (artist.songs.length || artist.name) {
        const songs = [...artist.songs];
        if (songs.length < 12 && artist.name) {
          const extra = await searchSongs(`${artist.name} songs`, 20, hl).catch(() => []);
          const seen = new Set(songs.map((s) => s.videoId));
          for (const song of extra) {
            if (!seen.has(song.videoId)) {
              seen.add(song.videoId);
              songs.push(song);
            }
          }
        }
        return jsonCached({ ...artist, songs });
      }
    }
    const query = name || id;
    const [artists, songs] = await Promise.all([
      searchArtists(query, 6, hl).catch(() => []),
      searchSongs(query + " songs", 20, hl).catch(() => []),
    ]);
    const first = artists[0];
    return jsonCached({
      artistId: first?.artistId ?? id,
      name: first?.name ?? query,
      description: "",
      thumbnail: first?.thumbnail ?? songs[0]?.thumbnail ?? "",
      songs,
      albums: [],
      related: artists.slice(1),
    });
  } catch {
    return Response.json({ error: "artist_failed" }, { status: 502 });
  }
}
