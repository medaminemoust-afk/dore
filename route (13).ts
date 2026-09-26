import { NextRequest } from "next/server";
import { db } from "@/db";
import { favoriteArtists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPreferences, requireUser } from "@/lib/session";
import { GENRES, REGIONS, otherRegions, type RegionId } from "@/lib/regions";
import { searchArtists, searchSongs, type ArtistCard, type Song } from "@/lib/innertube";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Shelf =
  | { kind: "songs"; id: string; title: string; subtitle?: string; items: Song[] }
  | { kind: "artists"; id: string; title: string; subtitle?: string; items: ArtistCard[] };

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function artistCards(names: string[], hl: string, region: RegionId): Promise<ArtistCard[]> {
  const results = await Promise.all(
    names.map(async (name) => {
      try {
        const found = await searchArtists(name, 2, hl);
        const match = found[0];
        if (!match) return null;
        return { ...match, subtitle: REGIONS[region].label } as ArtistCard;
      } catch {
        return null;
      }
    }),
  );
  const seen = new Set<string>();
  return results.filter((a): a is ArtistCard => {
    if (!a || seen.has(a.artistId)) return false;
    seen.add(a.artistId);
    return true;
  });
}

export async function GET(req: NextRequest) {
  const user = await requireUser();
  const prefs = await getPreferences(user.id);
  const url = new URL(req.url);
  const region = ((url.searchParams.get("region") as RegionId) || prefs.region || "GLOBAL") as RegionId;
  const hl = prefs.language || "en";
  const info = REGIONS[region] ?? REGIONS.GLOBAL;

  const favs = await db.select().from(favoriteArtists).where(eq(favoriteArtists.userId, user.id));
  const favNames = favs.map((f) => f.name);
  const genreIds = (prefs.genres ?? []) as string[];
  const genres = GENRES.filter((g) => genreIds.includes(g.id)).slice(0, 4);

  const shelves: Shelf[] = [];

  // 1. Quick picks: mix of the user's favourite artists (or regional stars).
  const seedNames = (favNames.length ? favNames : info.artists).slice(0, 6);
  const quickLists = await Promise.all(
    seedNames.map((n) => searchSongs(`${n} best songs`, 8, hl).catch(() => [] as Song[])),
  );
  const quick: Song[] = [];
  const seen = new Set<string>();
  for (let round = 0; round < 8; round++) {
    for (const list of quickLists) {
      const song = list[round];
      if (song && !seen.has(song.videoId)) {
        seen.add(song.videoId);
        quick.push(song);
      }
    }
  }
  if (quick.length) {
    shelves.push({
      kind: "songs",
      id: "quick",
      title: favNames.length ? "madeForYou" : "quickPicks",
      subtitle: favNames.slice(0, 3).join(" • "),
      items: shuffle(quick).slice(0, 24),
    });
  }

  // 2. Top artists in the detected region.
  const regionArtists = await artistCards(info.artists.slice(0, 10), hl, region);
  if (regionArtists.length) {
    shelves.push({
      kind: "artists",
      id: "region-artists",
      title: "topArtistsIn",
      subtitle: `${info.emoji} ${info.label}`,
      items: regionArtists,
    });
  }

  // 3. Trending in region.
  const trending = await searchSongs(info.trendingQuery, 20, hl).catch(() => [] as Song[]);
  if (trending.length) {
    shelves.push({
      kind: "songs",
      id: "trending",
      title: "trendingNow",
      subtitle: `${info.emoji} ${info.label}`,
      items: trending,
    });
  }

  // 4. Favourite artist deep dive.
  if (favNames.length) {
    const pick = favNames[Math.floor(Math.random() * favNames.length)];
    const songs = await searchSongs(`${pick} songs`, 20, hl).catch(() => [] as Song[]);
    if (songs.length) {
      shelves.push({
        kind: "songs",
        id: `fav-${pick}`,
        title: "becauseYouLike",
        subtitle: pick,
        items: songs,
      });
    }
  }

  // 5. Selected genres only (if the user chose styles, we stay in those styles).
  for (const g of genres) {
    const songs = await searchSongs(`${g.query} ${info.label}`, 18, hl).catch(() => [] as Song[]);
    if (songs.length) {
      shelves.push({
        kind: "songs",
        id: `genre-${g.id}`,
        title: "yourGenres",
        subtitle: `${g.emoji} ${g.label}`,
        items: songs,
      });
    }
  }

  // 6. Artists from other regions of the world.
  const others = otherRegions(region);
  const otherNames = others.flatMap((r) => REGIONS[r].artists.slice(0, 2));
  const otherArtists = await artistCards(otherNames.slice(0, 10), hl, "GLOBAL");
  if (otherArtists.length) {
    shelves.push({
      kind: "artists",
      id: "other-artists",
      title: "fromOtherRegions",
      subtitle: others.map((r) => REGIONS[r].emoji).join(" "),
      items: otherArtists,
    });
  }

  return jsonCached({ region, regionLabel: info.label, regionEmoji: info.emoji, shelves });
}
