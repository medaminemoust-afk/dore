import { NextRequest } from "next/server";
import { db } from "@/db";
import { playlistItems, playlists } from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const lists = await db
    .select()
    .from(playlists)
    .where(eq(playlists.userId, user.id))
    .orderBy(desc(playlists.createdAt));
  const ids = lists.map((l) => l.id);
  const items = ids.length
    ? await db.select().from(playlistItems).where(inArray(playlistItems.playlistId, ids))
    : [];
  return Response.json({
    playlists: lists.map((l) => ({
      ...l,
      count: items.filter((i) => i.playlistId === l.id).length,
      cover: l.cover ?? items.find((i) => i.playlistId === l.id)?.thumbnail ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = (await req.json()) as { name?: string; description?: string };
  const name = (body.name ?? "").trim() || "New playlist";
  const [created] = await db
    .insert(playlists)
    .values({ userId: user.id, name, description: body.description ?? "" })
    .returning();
  return Response.json({ playlist: { ...created, count: 0 } });
}
