import { NextRequest } from "next/server";
import { db } from "@/db";
import { likedSongs } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(likedSongs)
    .where(eq(likedSongs.userId, user.id))
    .orderBy(desc(likedSongs.createdAt));
  return Response.json({ likes: rows });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const s = (await req.json()) as {
    videoId: string;
    title: string;
    artist?: string;
    artistId?: string;
    thumbnail?: string;
    duration?: number;
  };
  if (!s.videoId) return Response.json({ error: "invalid" }, { status: 400 });
  await db
    .insert(likedSongs)
    .values({
      userId: user.id,
      videoId: s.videoId,
      title: s.title ?? "",
      artist: s.artist ?? "",
      artistId: s.artistId ?? null,
      thumbnail: s.thumbnail ?? null,
      duration: s.duration ?? 0,
    })
    .onConflictDoNothing();
  const rows = await db
    .select()
    .from(likedSongs)
    .where(eq(likedSongs.userId, user.id))
    .orderBy(desc(likedSongs.createdAt));
  return Response.json({ likes: rows });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  const videoId = new URL(req.url).searchParams.get("videoId") ?? "";
  await db.delete(likedSongs).where(and(eq(likedSongs.userId, user.id), eq(likedSongs.videoId, videoId)));
  const rows = await db
    .select()
    .from(likedSongs)
    .where(eq(likedSongs.userId, user.id))
    .orderBy(desc(likedSongs.createdAt));
  return Response.json({ likes: rows });
}
