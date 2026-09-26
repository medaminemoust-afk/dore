import { NextRequest } from "next/server";
import { db } from "@/db";
import { playlistItems, playlists } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

async function owns(userId: string, id: string) {
  const rows = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, id), eq(playlists.userId, userId)))
    .limit(1);
  return rows.length > 0;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await requireUser();
  if (!(await owns(user.id, id))) return Response.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as {
    songs?: {
      videoId: string;
      title: string;
      artist?: string;
      thumbnail?: string;
      duration?: number;
    }[];
  };
  const songs = body.songs ?? [];
  const existing = await db.select().from(playlistItems).where(eq(playlistItems.playlistId, id));
  const have = new Set(existing.map((e) => e.videoId));
  let pos = existing.length;
  const toInsert = songs
    .filter((s) => s.videoId && !have.has(s.videoId))
    .map((s) => ({
      playlistId: id,
      videoId: s.videoId,
      title: s.title ?? "",
      artist: s.artist ?? "",
      thumbnail: s.thumbnail ?? null,
      duration: s.duration ?? 0,
      position: pos++,
    }));
  if (toInsert.length) await db.insert(playlistItems).values(toInsert);

  const items = await db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.playlistId, id))
    .orderBy(asc(playlistItems.position), asc(playlistItems.id));
  return Response.json({ items });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await requireUser();
  if (!(await owns(user.id, id))) return Response.json({ error: "not found" }, { status: 404 });
  const videoId = new URL(req.url).searchParams.get("videoId") ?? "";
  await db
    .delete(playlistItems)
    .where(and(eq(playlistItems.playlistId, id), eq(playlistItems.videoId, videoId)));
  const items = await db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.playlistId, id))
    .orderBy(asc(playlistItems.position), asc(playlistItems.id));
  return Response.json({ items });
}
