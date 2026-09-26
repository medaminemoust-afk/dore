"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { ArtistTile, Icon, SongRow, Spinner, Thumb } from "@/components/ui";
import Link from "next/link";
import { GENRES } from "@/lib/regions";

type ArtistItem = { artistId: string; name: string; thumbnail?: string; subtitle?: string };
type AlbumItem = { albumId: string; title: string; subtitle: string; thumbnail?: string };

function SearchInner() {
  const { t, prefs } = useApp();
  const player = usePlayer();
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [tab, setTab] = useState<"all" | "songs" | "artists" | "albums">("all");
  const [data, setData] = useState<{ songs: Track[]; artists: ArtistItem[]; albums: AlbumItem[] }>({
    songs: [],
    artists: [],
    albums: [],
  });
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q);

  const run = useCallback(
    async (query: string, type: string) => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&type=${type}&hl=${prefs.language}`,
        );
        const json = await res.json();
        setData({ songs: json.songs ?? [], artists: json.artists ?? [], albums: json.albums ?? [] });
      } catch {
        setData({ songs: [], artists: [], albums: [] });
      } finally {
        setLoading(false);
      }
    },
    [prefs.language],
  );

  useEffect(() => {
    setInput(q);
    if (q) void run(q, tab);
  }, [q, tab, run]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(input)}`);
        }}
        className="mb-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
      >
        {Icon.search("h-5 w-5 text-white/40")}
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent text-base outline-none placeholder:text-white/30"
        />
      </form>

      {!q && (
        <div>
          <p className="mb-3 text-sm text-white/50">{t("yourGenres")}</p>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <Link
                key={g.id}
                href={`/search?q=${encodeURIComponent(g.query)}`}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:border-fuchsia-400/60"
              >
                {g.emoji} {g.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {q && (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {(["all", "songs", "artists", "albums"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm capitalize ${
                  tab === key ? "bg-white text-black" : "bg-white/10 text-white/70"
                }`}
              >
                {key === "all" ? "All" : t(key)}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner label={t("loading")} />
          ) : (
            <div className="space-y-8">
              {data.artists.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold">{t("artists")}</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {data.artists.map((a) => (
                      <ArtistTile key={a.artistId} artist={a} />
                    ))}
                  </div>
                </section>
              )}

              {data.songs.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-bold">{t("songs")}</h2>
                    <button
                      onClick={() => player.playTracks(data.songs, 0, { radio: true })}
                      className="flex items-center gap-2 rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-semibold"
                    >
                      {Icon.play("h-3.5 w-3.5")} {t("playAll")}
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {data.songs.map((s, i) => (
                      <SongRow key={s.videoId} song={s} index={i} queue={data.songs} />
                    ))}
                  </div>
                </section>
              )}

              {data.albums.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold">{t("albums")}</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {data.albums.map((al) => (
                      <Link key={al.albumId} href={`/album/${al.albumId}`} className="w-40 shrink-0">
                        <Thumb src={al.thumbnail} alt={al.title} className="aspect-square w-full" rounded="rounded-2xl" />
                        <p className="mt-2 truncate text-sm">{al.title}</p>
                        <p className="truncate text-xs text-white/45">{al.subtitle}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {!data.songs.length && !data.artists.length && !data.albums.length && (
                <p className="py-16 text-center text-white/40">{t("noResults")}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <SearchInner />
    </Suspense>
  );
}
