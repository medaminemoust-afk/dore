import { NextRequest } from "next/server";
import { db } from "@/db";
import { favoriteArtists, likedSongs, playlists, preferences } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { detectGeo, getPreferences, requireUser } from "@/lib/session";
import { defaultLanguageForRegion } from "@/lib/regions";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  let prefs = await getPreferences(user.id);

  if (!prefs.onboarded) {
    const geo = await detectGeo();
    const language = defaultLanguageForRegion(geo.region);
    const [updated] = await db
      .update(preferences)
      .set({ region: geo.region, country: geo.country, language })
      .where(eq(preferences.userId, user.id))
      .returning();
    prefs = updated;
  }

  const [favs, likes, lists] = await Promise.all([
    db.select().from(favoriteArtists).where(eq(favoriteArtists.userId, user.id)),
    db.select().from(likedSongs).where(eq(likedSongs.userId, user.id)).orderBy(desc(likedSongs.createdAt)),
    db.select().from(playlists).where(eq(playlists.userId, user.id)).orderBy(desc(playlists.createdAt)),
  ]);

  return Response.json({ user: { id: user.id }, prefs, favorites: favs, likes, playlists: lists });
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser();
  await getPreferences(user.id);
  const body = (await req.json()) as {
    language?: string;
    region?: string;
    country?: string;
    genres?: string[];
    onboarded?: boolean;
  };
  const [updated] = await db
    .update(preferences)
    .set({
      ...(body.language ? { language: body.language } : {}),
      ...(body.region ? { region: body.region } : {}),
      ...(body.country ? { country: body.country } : {}),
      ...(body.genres ? { genres: body.genres } : {}),
      ...(body.onboarded !== undefined ? { onboarded: body.onboarded } : {}),
    })
    .where(eq(preferences.userId, user.id))
    .returning();
  return Response.json({ prefs: updated });
}
