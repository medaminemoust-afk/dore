"use client";

import { use, useEffect, useState } from "react";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { Icon, SongRow, Spinner, Thumb } from "@/components/ui";

type AlbumData = { title: string; subtitle: string; thumbnail: string; songs: Track[] };

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, prefs } = useApp();
  const player = usePlayer();
  const [data, setData] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/album/${id}?hl=${prefs.language}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id, prefs.language]);

  if (loading) return <Spinner label={t("loading")} />;
  if (!data) return <p className="py-16 text-center text-white/40">{t("noResults")}</p>;

  return (
    <div>
      <section className="mb-6 flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-end">
        <Thumb src={data.thumbnail} alt={data.title} className="h-44 w-44" rounded="rounded-2xl" />
        <div className="flex-1 text-center sm:text-start">
          <h1 className="text-3xl font-black">{data.title}</h1>
          <p className="mt-1 text-sm text-white/50">{data.subtitle}</p>
          <button
            disabled={!data.songs.length}
            onClick={() => player.playTracks(data.songs, 0)}
            className="mt-4 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
          >
            {Icon.play("h-4 w-4")} {t("playAll")}
          </button>
        </div>
      </section>
      <div className="space-y-0.5">
        {data.songs.map((s, i) => (
          <SongRow key={s.videoId} song={s} index={i} queue={data.songs} />
        ))}
      </div>
    </div>
  );
}
