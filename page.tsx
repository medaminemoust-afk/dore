"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { Icon, SongRow, Spinner, Thumb } from "@/components/ui";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, removeFromPlaylist, deletePlaylist } = useApp();
  const player = usePlayer();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<{ name: string; description: string } | null>(null);
  const [items, setItems] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/playlists/${id}`);
      const data = await res.json();
      setPlaylist(data.playlist ?? null);
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <Spinner label={t("loading")} />;
  if (!playlist) return <p className="py-16 text-center text-white/40">{t("noResults")}</p>;

  return (
    <div>
      <section className="mb-6 flex flex-col items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-end">
        <Thumb src={items[0]?.thumbnail} alt={playlist.name} className="h-40 w-40" rounded="rounded-2xl" />
        <div className="flex-1 text-center sm:text-start">
          <p className="text-xs uppercase tracking-[0.25em] text-white/40">{t("playlists")}</p>
          <h1 className="mt-1 text-3xl font-black">{playlist.name}</h1>
          <p className="mt-1 text-sm text-white/50">
            {items.length} {t("tracks")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button
              disabled={!items.length}
              onClick={() => player.playTracks(items, 0)}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-40"
            >
              {Icon.play("h-4 w-4")} {t("playAll")}
            </button>
            <button
              disabled={!items.length}
              onClick={() => player.playTracks([...items].sort(() => Math.random() - 0.5), 0)}
              className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold disabled:opacity-40"
            >
              {Icon.shuffle("h-4 w-4")} {t("shufflePlay")}
            </button>
            <button
              onClick={async () => {
                await deletePlaylist(id);
                router.push("/library");
              }}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:text-red-400"
            >
              {t("delete")}
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-0.5">
        {items.map((s, i) => (
          <SongRow
            key={s.videoId}
            song={s}
            index={i}
            queue={items}
            onRemove={async () => {
              await removeFromPlaylist(id, s.videoId);
              void load();
            }}
          />
        ))}
      </div>
      {!items.length && <p className="py-10 text-center text-white/35">{t("emptyLibrary")}</p>}
    </div>
  );
}
