/** Public catalog responses stay fresh for 3 full days. */
export const THREE_DAYS = 60 * 60 * 24 * 3;

export function longCacheHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set(
    "Cache-Control",
    `public, max-age=${THREE_DAYS}, s-maxage=${THREE_DAYS}, stale-while-revalidate=${THREE_DAYS}`,
  );
  return headers;
}

export function jsonCached(data: unknown, status = 200) {
  return Response.json(data, { status, headers: longCacheHeaders() });
}
