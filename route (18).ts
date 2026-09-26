import { NextRequest } from "next/server";
import { db } from "@/db";
import { playlistItems, playlists } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await requireUser();
  const rows = await db
    .select()
    .from(playlists)
    .where(and(eq(playlists.id, id), eq(playlists.userId, user.id)))
    .limit(1);
  if (!rows.length) return Response.json({ error: "not found" }, { status: 404 });
  const items = await db
    .select()
    .from(playlistItems)
    .where(eq(playlistItems.playlistId, id))
    .orderBy(asc(playlistItems.position), asc(playlistItems.id));
  return Response.json({ playlist: rows[0], items });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await requireUser();
  const body = (await req.json()) as { name?: string; description?: string };
  const [updated] = await db
    .update(playlists)
    .set({
      ...(body.name ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    })
    .where(and(eq(playlists.id, id), eq(playlists.userId, user.id)))
    .returning();
  return Response.json({ playlist: updated ?? null });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const user = await requireUser();
  await db.delete(playlists).where(and(eq(playlists.id, id), eq(playlists.userId, user.id)));
  return Response.json({ ok: true });
}
