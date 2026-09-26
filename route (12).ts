import { NextRequest } from "next/server";
import { getSuggestions } from "@/lib/innertube";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  try {
    return Response.json({ suggestions: await getSuggestions(q) });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
