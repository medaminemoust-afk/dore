"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { ArtistTile, Icon, SongRow, Spinner, Thumb } from "@/components/ui";

type ArtistData = {
  artistId: string;
  name: string;
  description: string;
  thumbnail: string;
  songs: Track[];
  albums: { albumId: string; title: string; subtitle: string; thumbnail?: string }[];
  related: { artistId: string; name: string; thumbnail?: string }[];
};

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const name = search.get("name") ?? "";
  const { t, prefs, isFavorite, toggleFavorite } = useApp();
  const player = usePlayer();
  const [data, setData] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/artist/${id}?hl=${prefs.language}&name=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id, name, prefs.language]);

  if (loading) return <Spinner label={t("loading")} />;
  if (!data) return <p className="py-16 text-center text-white/40">{t("noResults")}</p>;

  const fav = isFavorite(data.artistId);

  return (
    <div>
      <section className="mb-7 flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-end">
        <Thumb src={data.thumbnail} alt={data.name} className="h-40 w-40" rounded="rounded-full" />
        <div className="flex-1 text-center sm:text-start">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">{t("artists")}</p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">{data.name}</h1>
          {data.description && (
            <p className="mt-2 line-clamp-3 max-w-2xl text-sm text-white/50">{data.description}</p>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              disabled={!data.songs.length}
              onClick={() => player.playTracks(data.songs, 0, { radio: true })}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
            >
              {Icon.play("h-4 w-4")} {t("play")}
            </button>
            <button
              disabled={!data.songs.length}
              onClick={() => player.startRadio(data.songs[0])}
              className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              {Icon.radio("h-4 w-4")} {t("radio")}
            </button>
            <button
              onClick={() =>
                toggleFavorite({ artistId: data.artistId, name: data.name, thumbnail: data.thumbnail })
              }
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold ${
                fav ? "border-fuchsia-500 bg-fuchsia-500/20 text-white" : "border-white/20"
              }`}
            >
              {Icon.heart("h-4 w-4", fav)} {fav ? t("unfollowArtist") : t("followArtist")}
            </button>
          </div>
        </div>
      </section>

      {data.songs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold">{t("topSongs")}</h2>
          <div className="space-y-0.5">
            {data.songs.map((s, i) => (
              <SongRow key={s.videoId} song={s} index={i} queue={data.songs} />
            ))}
          </div>
        </section>
      )}

      {data.albums.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold">{t("discography")}</h2>
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

      {data.related.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold">{t("relatedArtists")}</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.related.map((a) => (
              <ArtistTile key={a.artistId} artist={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
