import { db } from "@/db";
import { mediaCache } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Minimal YouTube Music (InnerTube) client.
 * Same data source InnerTune uses: the public YouTube Music API.
 * No audio is hosted by this app - playback happens through the official
 * YouTube player, exactly like InnerTune streams from YouTube.
 */

const INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const BASE = "https://music.youtube.com/youtubei/v1";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type Song = {
  videoId: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  thumbnail: string;
  duration: number;
  type: "song";
};

export type ArtistCard = {
  artistId: string;
  name: string;
  thumbnail: string;
  subtitle?: string;
  type: "artist";
};

export type AlbumCard = {
  albumId: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  type: "album";
};

export const SEARCH_FILTERS = {
  songs: "EgWKAQIIAWoKEAoQCRADEAQQBQ%3D%3D",
  videos: "EgWKAQIQAWoKEAoQCRADEAQQBQ%3D%3D",
  artists: "EgWKAQIgAWoKEAoQCRADEAQQBQ%3D%3D",
  albums: "EgWKAQIYAWoKEAoQCRADEAQQBQ%3D%3D",
  playlists: "EgWKAQIoAWoKEAoQCRADEAQQBQ%3D%3D",
} as const;

type Json = Record<string, unknown>;

const memory = new Map<string, { at: number; value: unknown }>();
/** Keep hot results in memory for 3 days so the feed stays fast. */
const MEM_TTL = 1000 * 60 * 60 * 24 * 3;
/** Persist search / artist / radio payloads in Postgres for 3 days. */
const DB_TTL_MS = 1000 * 60 * 60 * 24 * 3;

export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < Math.min(ttlMs, MEM_TTL)) return hit.value as T;

  try {
    const rows = await db.select().from(mediaCache).where(eq(mediaCache.key, key)).limit(1);
    const row = rows[0];
    if (row && Date.now() - new Date(row.updatedAt).getTime() < ttlMs) {
      memory.set(key, { at: Date.now(), value: row.payload });
      return row.payload as T;
    }
  } catch {
    /* cache table may not exist yet */
  }

  const value = await loader();
  memory.set(key, { at: Date.now(), value });
  try {
    await db
      .insert(mediaCache)
      .values({ key, payload: value as never })
      .onConflictDoUpdate({
        target: mediaCache.key,
        set: { payload: value as never, updatedAt: sql`now()` },
      });
  } catch {
    /* ignore */
  }
  return value;
}

async function innertube(action: string, body: Json, hl = "en", gl = "US"): Promise<Json> {
  const payload = {
    context: {
      client: {
        clientName: "WEB_REMIX",
        clientVersion: "1.20240403.01.00",
        hl,
        gl,
      },
      user: { lockedSafetyMode: false },
    },
    ...body,
  };

  const res = await fetch(`${BASE}/${action}?key=${INNERTUBE_KEY}&prettyPrint=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": UA,
      Origin: "https://music.youtube.com",
      Referer: "https://music.youtube.com/",
      "X-Goog-Visitor-Id": "CgtHUE5NNVBBTzZOWSjTnbmiBg%3D%3D",
    },
    body: JSON.stringify(payload),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signal: AbortSignal.timeout(15000) as any,
  });
  if (!res.ok) throw new Error(`innertube ${action} failed: ${res.status}`);
  return (await res.json()) as Json;
}

/* ---------------- generic tree helpers ---------------- */

function findAll(node: unknown, key: string, out: Json[] = []): Json[] {
  if (Array.isArray(node)) {
    for (const item of node) findAll(item, key, out);
  } else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Json)) {
      if (k === key && v && typeof v === "object") out.push(v as Json);
      findAll(v, key, out);
    }
  }
  return out;
}

function firstValue(node: unknown, key: string): unknown {
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = firstValue(item, key);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node as Json)) {
      if (k === key) return v;
      const found = firstValue(v, key);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function bestThumb(node: unknown): string {
  const thumbs = firstValue(node, "thumbnails") as { url: string; width?: number }[] | undefined;
  if (!thumbs || !thumbs.length) return "";
  const sorted = [...thumbs].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const url = sorted[sorted.length - 1].url;
  return url.replace(/=w\d+-h\d+/, "=w544-h544");
}

function runsText(node: unknown): string {
  const runs = (node as Json | undefined)?.runs as { text: string }[] | undefined;
  if (runs) return runs.map((r) => r.text).join("");
  const simple = (node as Json | undefined)?.simpleText;
  return typeof simple === "string" ? simple : "";
}

function parseDuration(text: string): number {
  const m = text.match(/(\d+):(\d{2})(?::(\d{2}))?/);
  if (!m) return 0;
  if (m[3]) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  return Number(m[1]) * 60 + Number(m[2]);
}

function flexRuns(item: Json, col: number): { text: string; browseId?: string }[] {
  const cols = (item.flexColumns as Json[] | undefined) ?? [];
  const c = cols[col]?.musicResponsiveListItemFlexColumnRenderer as Json | undefined;
  const runs = ((c?.text as Json | undefined)?.runs as Json[] | undefined) ?? [];
  return runs.map((r) => ({
    text: String(r.text ?? ""),
    browseId: (firstValue(r.navigationEndpoint, "browseId") as string | undefined) ?? undefined,
  }));
}

function listItemToSong(item: Json): Song | null {
  const videoId =
    ((item.playlistItemData as Json | undefined)?.videoId as string | undefined) ??
    (firstValue(item, "videoId") as string | undefined);
  if (!videoId) return null;
  const title = flexRuns(item, 0)
    .map((r) => r.text)
    .join("");
  if (!title) return null;

  const sub = flexRuns(item, 1);
  const subText = sub.map((r) => r.text).join("");
  const artistRun = sub.find((r) => r.browseId?.startsWith("UC")) ?? sub[0];
  const durationText = [...sub].reverse().find((r) => /\d+:\d{2}/.test(r.text))?.text ?? "";

  return {
    videoId,
    title,
    artist: artistRun?.text?.replace(/^[•\s]+/, "") || subText.split("•")[0]?.trim() || "",
    artistId: artistRun?.browseId,
    thumbnail: bestThumb(item),
    duration: parseDuration(durationText),
    type: "song",
  };
}

export function parseSongs(data: unknown, limit = 30): Song[] {
  const items = [
    ...findAll(data, "musicResponsiveListItemRenderer"),
    ...findAll(data, "playlistPanelVideoRenderer").map((p) => ({
      ...p,
      flexColumns: [
        { musicResponsiveListItemFlexColumnRenderer: { text: p.title } },
        { musicResponsiveListItemFlexColumnRenderer: { text: p.longBylineText } },
      ],
      playlistItemData: { videoId: p.videoId },
    })),
  ];
  const songs: Song[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const song = listItemToSong(item as Json);
    if (!song || seen.has(song.videoId)) continue;
    if (!song.duration) {
      const t = runsText((item as Json).lengthText);
      song.duration = parseDuration(t);
    }
    seen.add(song.videoId);
    songs.push(song);
    if (songs.length >= limit) break;
  }
  return songs;
}

export function parseArtists(data: unknown, limit = 20): ArtistCard[] {
  const out: ArtistCard[] = [];
  const seen = new Set<string>();
  const push = (artistId?: string, name?: string, thumbnail?: string, subtitle?: string) => {
    if (!artistId || !artistId.startsWith("UC") || !name || seen.has(artistId)) return;
    seen.add(artistId);
    out.push({ artistId, name, thumbnail: thumbnail ?? "", subtitle, type: "artist" });
  };

  for (const item of findAll(data, "musicResponsiveListItemRenderer")) {
    const browseId = firstValue(item.navigationEndpoint, "browseId") as string | undefined;
    const name = flexRuns(item, 0)
      .map((r) => r.text)
      .join("");
    push(browseId, name, bestThumb(item), flexRuns(item, 1).map((r) => r.text).join(""));
    if (out.length >= limit) return out;
  }
  for (const item of findAll(data, "musicTwoRowItemRenderer")) {
    const browseId = firstValue(item.navigationEndpoint, "browseId") as string | undefined;
    push(browseId, runsText(item.title), bestThumb(item), runsText(item.subtitle));
    if (out.length >= limit) return out;
  }
  return out;
}

export function parseAlbums(data: unknown, limit = 20): AlbumCard[] {
  const out: AlbumCard[] = [];
  const seen = new Set<string>();
  for (const item of findAll(data, "musicTwoRowItemRenderer")) {
    const browseId = firstValue(item.navigationEndpoint, "browseId") as string | undefined;
    if (!browseId || !browseId.startsWith("MPRE") || seen.has(browseId)) continue;
    seen.add(browseId);
    out.push({
      albumId: browseId,
      title: runsText(item.title),
      subtitle: runsText(item.subtitle),
      thumbnail: bestThumb(item),
      type: "album",
    });
    if (out.length >= limit) break;
  }
  return out;
}

/* ---------------- public API ---------------- */

export async function searchSongs(query: string, limit = 25, hl = "en"): Promise<Song[]> {
  return cached(`songs:${hl}:${query}:${limit}`, DB_TTL_MS, async () => {
    const data = await innertube("search", { query, params: SEARCH_FILTERS.songs }, hl);
    let songs = parseSongs(data, limit);
    if (!songs.length) {
      const alt = await innertube("search", { query }, hl);
      songs = parseSongs(alt, limit);
    }
    return songs;
  });
}

export async function searchArtists(query: string, limit = 12, hl = "en"): Promise<ArtistCard[]> {
  return cached(`artists:${hl}:${query}:${limit}`, DB_TTL_MS * 7, async () => {
    const data = await innertube("search", { query, params: SEARCH_FILTERS.artists }, hl);
    return parseArtists(data, limit);
  });
}

export async function searchAlbums(query: string, limit = 12, hl = "en"): Promise<AlbumCard[]> {
  return cached(`albums:${hl}:${query}:${limit}`, DB_TTL_MS, async () => {
    const data = await innertube("search", { query, params: SEARCH_FILTERS.albums }, hl);
    return parseAlbums(data, limit);
  });
}

export async function searchAll(query: string, hl = "en") {
  const [songs, artists, albums] = await Promise.all([
    searchSongs(query, 20, hl).catch(() => []),
    searchArtists(query, 10, hl).catch(() => []),
    searchAlbums(query, 10, hl).catch(() => []),
  ]);
  return { songs, artists, albums };
}

export async function getArtist(browseId: string, hl = "en") {
  return cached(`artist:${hl}:${browseId}`, DB_TTL_MS, async () => {
    const data = await innertube("browse", { browseId }, hl);
    const header =
      (findAll(data, "musicImmersiveHeaderRenderer")[0] as Json | undefined) ??
      (findAll(data, "musicVisualHeaderRenderer")[0] as Json | undefined) ??
      (findAll(data, "musicHeaderRenderer")[0] as Json | undefined);

    const name = header ? runsText(header.title) : "";
    const description = header ? runsText(header.description) : "";
    const thumbnail = header ? bestThumb(header) : "";
    const songs = parseSongs(data, 20);
    const albums = parseAlbums(data, 16);
    const related = parseArtists(data, 12).filter((a) => a.artistId !== browseId);

    return { artistId: browseId, name, description, thumbnail, songs, albums, related };
  });
}

export async function getAlbum(browseId: string, hl = "en") {
  return cached(`album:${hl}:${browseId}`, DB_TTL_MS, async () => {
    const data = await innertube("browse", { browseId }, hl);
    const header =
      (findAll(data, "musicDetailHeaderRenderer")[0] as Json | undefined) ??
      (findAll(data, "musicResponsiveHeaderRenderer")[0] as Json | undefined);
    return {
      albumId: browseId,
      title: header ? runsText(header.title) : "",
      subtitle: header ? runsText(header.subtitle) : "",
      thumbnail: header ? bestThumb(header) : "",
      songs: parseSongs(data, 60),
    };
  });
}

/** Radio / autoplay queue for a track - powers "next random song". */
export async function getRadio(videoId: string, hl = "en"): Promise<Song[]> {
  return cached(`radio:${hl}:${videoId}`, DB_TTL_MS, async () => {
    const data = await innertube(
      "next",
      { videoId, playlistId: `RDAMVM${videoId}`, isAudioOnly: true, params: "wAEB" },
      hl,
    );
    const songs = parseSongs(data, 40).filter((s) => s.videoId !== videoId);
    return songs;
  });
}

export async function getPlaylist(playlistId: string, hl = "en") {
  const browseId = playlistId.startsWith("VL") ? playlistId : `VL${playlistId}`;
  return cached(`ytplaylist:${hl}:${browseId}`, DB_TTL_MS, async () => {
    const data = await innertube("browse", { browseId }, hl);
    return parseSongs(data, 100);
  });
}

export async function getSuggestions(query: string, hl = "en"): Promise<string[]> {
  if (!query.trim()) return [];
  const data = await innertube("music/get_search_suggestions", { input: query }, hl);
  const items = findAll(data, "searchSuggestionRenderer");
  return items
    .map((i) => runsText(i.suggestion))
    .filter(Boolean)
    .slice(0, 8);
}
