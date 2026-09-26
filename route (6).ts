import { NextRequest } from "next/server";
import { db } from "@/db";
import { favoriteArtists } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const rows = await db.select().from(favoriteArtists).where(eq(favoriteArtists.userId, user.id));
  return Response.json({ favorites: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = (await req.json()) as {
    artistId: string;
    name: string;
    thumbnail?: string;
    region?: string;
  };
  if (!body.artistId || !body.name) return Response.json({ error: "invalid" }, { status: 400 });
  await db
    .insert(favoriteArtists)
    .values({
      userId: user.id,
      artistId: body.artistId,
      name: body.name,
      thumbnail: body.thumbnail ?? null,
      region: body.region ?? null,
    })
    .onConflictDoNothing();
  const rows = await db.select().from(favoriteArtists).where(eq(favoriteArtists.userId, user.id));
  return Response.json({ favorites: rows });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  const artistId = new URL(req.url).searchParams.get("artistId") ?? "";
  await db
    .delete(favoriteArtists)
    .where(and(eq(favoriteArtists.userId, user.id), eq(favoriteArtists.artistId, artistId)));
  const rows = await db.select().from(favoriteArtists).where(eq(favoriteArtists.userId, user.id));
  return Response.json({ favorites: rows });
}
