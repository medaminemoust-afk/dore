"use client";

import { useCallback, useEffect, useState } from "react";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { ArtistTile, Icon, Shelf, SongCard, Spinner, Thumb } from "@/components/ui";
import { REGIONS, type RegionId } from "@/lib/regions";

type ArtistItem = { artistId: string; name: string; thumbnail?: string; subtitle?: string };

type ShelfData =
  | { kind: "songs"; id: string; title: string; subtitle?: string; items: Track[] }
  | { kind: "artists"; id: string; title: string; subtitle?: string; items: ArtistItem[] };

export default function HomePage() {
  const { t, prefs, ready, favorites, downloads } = useApp();
  const player = usePlayer();
  const [shelves, setShelves] = useState<ShelfData[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<RegionId>(prefs.region);
  const [history, setHistory] = useState<Track[]>([]);

  useEffect(() => setRegion(prefs.region), [prefs.region]);

  const loadFeed = useCallback(
    async (target: RegionId) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/home?region=${target}`);
        const data = await res.json();
        setShelves(data.shelves ?? []);
      } catch {
        setShelves([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!ready || !prefs.onboarded) return;
    void loadFeed(region);
  }, [ready, prefs.onboarded, region, loadFeed]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {});
  }, [player.current?.videoId]);

  const info = REGIONS[region] ?? REGIONS.GLOBAL;
  const allSongs = shelves.flatMap((s) => (s.kind === "songs" ? s.items : []));

  return (
    <div>
      {/* hero */}
      <section className="mb-7 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/25 via-violet-700/15 to-cyan-500/15 p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-white/50">
          {info.emoji} {info.label} · {prefs.country}
        </p>
        <h1 className="mt-2 text-2xl font-black sm:text-4xl">
          {favorites.length ? `${t("madeForYou")} 🎧` : `${t("welcome")} 🎧`}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/60">{t("connectionNote")}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            disabled={!allSongs.length}
            onClick={() => player.playTracks(allSongs, 0, { radio: true })}
            className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:scale-[1.02] disabled:opacity-40"
          >
            {Icon.play("h-4 w-4")} {t("playAll")}
          </button>
          <button
            disabled={!allSongs.length}
            onClick={() => {
              const shuffled = [...allSongs].sort(() => Math.random() - 0.5);
              player.playTracks(shuffled, 0, { radio: true });
            }}
            className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/40 disabled:opacity-40"
          >
            {Icon.shuffle("h-4 w-4")} {t("shufflePlay")}
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-2 text-[11px] uppercase tracking-wide text-white/40">{t("browseRegion")}</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(REGIONS) as RegionId[]).map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  region === r
                    ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                }`}
              >
                {REGIONS[r].emoji} {REGIONS[r].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {favorites.length > 0 && (
        <Shelf title={t("favouriteArtists")} subtitle={`${favorites.length}`}>
          {favorites.map((f) => (
            <ArtistTile
              key={f.artistId}
              artist={{ artistId: f.artistId, name: f.name, thumbnail: f.thumbnail ?? undefined }}
            />
          ))}
        </Shelf>
      )}

      {history.length > 0 && (
        <Shelf title={t("history")}>
          {history.slice(0, 15).map((song) => (
            <SongCard key={`h-${song.videoId}`} song={song} queue={history} />
          ))}
        </Shelf>
      )}

      {downloads.length > 0 && (
        <Shelf title={t("downloads")} subtitle={t("offlineReady")}>
          {downloads.slice(0, 12).map((d) => (
            <div key={`d-${d.videoId}`} className="w-40 shrink-0 sm:w-44">
              <button
                onClick={() =>
                  player.playTracks(
                    downloads.map((x) => ({
                      videoId: x.videoId,
                      title: x.title,
                      artist: x.artist,
                      thumbnail: x.thumbnail,
                      duration: x.duration,
                    })),
                    downloads.findIndex((x) => x.videoId === d.videoId),
                  )
                }
                className="block w-full"
              >
                <Thumb src={d.thumbnail} alt={d.title} className="aspect-square w-full" rounded="rounded-2xl" />
              </button>
              <p className="mt-2 truncate text-sm text-white">{d.title}</p>
              <p className="truncate text-xs text-emerald-400/80">
                {d.hasAudio ? t("offlineReady") : d.artist}
              </p>
            </div>
          ))}
        </Shelf>
      )}

      {loading && !shelves.length ? (
        <Spinner label={t("loading")} />
      ) : (
        shelves.map((shelf) => (
          <Shelf key={shelf.id} title={t(shelf.title)} subtitle={shelf.subtitle}>
            {shelf.kind === "songs"
              ? shelf.items.map((song) => (
                  <SongCard key={`${shelf.id}-${song.videoId}`} song={song} queue={shelf.items} />
                ))
              : shelf.items.map((artist) => (
                  <ArtistTile key={`${shelf.id}-${artist.artistId}`} artist={artist} />
                ))}
          </Shelf>
        ))
      )}

      {loading && shelves.length > 0 && <Spinner />}
    </div>
  );
}
