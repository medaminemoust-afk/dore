import { NextRequest } from "next/server";
import { getAlbum } from "@/lib/innertube";
import { jsonCached } from "@/lib/cache-headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const hl = new URL(req.url).searchParams.get("hl") ?? "en";
  try {
    return jsonCached(await getAlbum(id, hl));
  } catch {
    return Response.json({ error: "album_failed" }, { status: 502 });
  }
}
