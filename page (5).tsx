"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { ArtistTile, Icon, SongRow, Thumb } from "@/components/ui";

export default function LibraryPage() {
  const { t, likes, playlists, favorites, createPlaylist, deletePlaylist, downloads } = useApp();
  const player = usePlayer();
  const [tab, setTab] = useState<"playlists" | "liked" | "artists" | "history">("playlists");
  const [history, setHistory] = useState<Track[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "playlists", label: t("playlists") },
    { id: "liked", label: t("liked") },
    { id: "artists", label: t("favouriteArtists") },
    { id: "history", label: t("history") },
  ] as const;

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">{t("library")}</h1>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${
              tab === tabItem.id ? "bg-white text-black" : "bg-white/10 text-white/70"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === "playlists" && (
        <div>
          <div className="mb-4">
            {creating ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await createPlaylist(name || t("newPlaylist"));
                  setName("");
                  setCreating(false);
                }}
                className="flex gap-2"
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("playlistName")}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none"
                />
                <button className="rounded-xl bg-fuchsia-500 px-4 py-2.5 text-sm font-semibold">{t("create")}</button>
                <button type="button" onClick={() => setCreating(false)} className="rounded-xl border border-white/10 px-4 text-sm">
                  {t("cancel")}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-white/70 hover:border-fuchsia-400"
              >
                {Icon.plus("h-4 w-4")} {t("createPlaylist")}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {playlists.map((p) => (
              <div key={p.id} className="group">
                <Link href={`/playlist/${p.id}`}>
                  <Thumb src={p.cover} alt={p.name} className="aspect-square w-full" rounded="rounded-2xl" />
                  <p className="mt-2 truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-white/45">
                    {p.count ?? 0} {t("tracks")}
                  </p>
                </Link>
                <button
                  onClick={() => deletePlaylist(p.id)}
                  className="mt-1 text-xs text-white/30 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                >
                  {t("delete")}
                </button>
              </div>
            ))}
          </div>
          {!playlists.length && <p className="py-10 text-center text-white/35">{t("emptyLibrary")}</p>}
        </div>
      )}

      {tab === "liked" && (
        <div>
          {likes.length > 0 && (
            <button
              onClick={() => player.playTracks(likes, 0)}
              className="mb-3 flex items-center gap-2 rounded-full bg-fuchsia-500 px-5 py-2.5 text-sm font-semibold"
            >
              {Icon.play("h-4 w-4")} {t("playAll")} ({likes.length})
            </button>
          )}
          <div className="space-y-0.5">
            {likes.map((s, i) => (
              <SongRow key={s.videoId} song={s} index={i} queue={likes} />
            ))}
          </div>
          {!likes.length && <p className="py-10 text-center text-white/35">{t("emptyLibrary")}</p>}
        </div>
      )}

      {tab === "artists" && (
        <div className="flex flex-wrap gap-4">
          {favorites.map((f) => (
            <ArtistTile
              key={f.artistId}
              artist={{ artistId: f.artistId, name: f.name, thumbnail: f.thumbnail ?? undefined }}
            />
          ))}
          {!favorites.length && <p className="py-10 text-center text-white/35">{t("emptyLibrary")}</p>}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-0.5">
          {history.map((s, i) => (
            <SongRow key={`${s.videoId}-${i}`} song={s} index={i} queue={history} />
          ))}
          {!history.length && <p className="py-10 text-center text-white/35">{t("emptyLibrary")}</p>}
        </div>
      )}

      {downloads.length > 0 && (
        <p className="mt-8 text-xs text-white/35">
          {downloads.length} {t("downloads")} · <Link href="/downloads" className="text-fuchsia-300">{t("seeAll")}</Link>
        </p>
      )}
    </div>
  );
}
