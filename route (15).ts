import { NextRequest } from "next/server";
import { db } from "@/db";
import { history } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const rows = await db
    .select()
    .from(history)
    .where(eq(history.userId, user.id))
    .orderBy(desc(history.playedAt))
    .limit(60);
  const seen = new Set<string>();
  const unique = rows.filter((r) => (seen.has(r.videoId) ? false : (seen.add(r.videoId), true)));
  return Response.json({ history: unique.slice(0, 30) });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const s = (await req.json()) as {
    videoId: string;
    title: string;
    artist?: string;
    thumbnail?: string;
    duration?: number;
  };
  if (!s.videoId) return Response.json({ ok: false }, { status: 400 });
  await db.insert(history).values({
    userId: user.id,
    videoId: s.videoId,
    title: s.title ?? "",
    artist: s.artist ?? "",
    thumbnail: s.thumbnail ?? null,
    duration: s.duration ?? 0,
  });
  return Response.json({ ok: true });
}
