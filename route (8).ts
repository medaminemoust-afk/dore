import { NextRequest } from "next/server";
import { REGIONS, otherRegions, type RegionId } from "@/lib/regions";
import { searchArtists, type ArtistCard } from "@/lib/innertube";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function cards(names: string[], hl: string, label: string): Promise<ArtistCard[]> {
  const results = await Promise.all(
    names.map(async (name) => {
      try {
        const found = await searchArtists(name, 1, hl);
        return found[0] ? ({ ...found[0], subtitle: label } as ArtistCard) : null;
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
  const url = new URL(req.url);
  const region = ((url.searchParams.get("region") as RegionId) || "GLOBAL") as RegionId;
  const hl = url.searchParams.get("hl") ?? "en";
  const info = REGIONS[region] ?? REGIONS.GLOBAL;

  const [regional, others] = await Promise.all([
    cards(info.artists, hl, `${info.emoji} ${info.label}`),
    (async () => {
      const list = otherRegions(region).flatMap((r) =>
        REGIONS[r].artists.slice(0, 3).map((name) => ({ name, label: `${REGIONS[r].emoji} ${REGIONS[r].label}` })),
      );
      const results = await Promise.all(
        list.map(async (entry) => {
          try {
            const found = await searchArtists(entry.name, 1, hl);
            return found[0] ? ({ ...found[0], subtitle: entry.label } as ArtistCard) : null;
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
    })(),
  ]);

  return jsonCached({ region, label: info.label, emoji: info.emoji, regional, others });
}
