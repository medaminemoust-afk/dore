"use client";

import { useApp } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { Icon, Thumb, formatTime } from "@/components/ui";

export default function DownloadsPage() {
  const { t, downloads, deleteDownload } = useApp();
  const player = usePlayer();

  const tracks = downloads.map((d) => ({
    videoId: d.videoId,
    title: d.title,
    artist: d.artist,
    thumbnail: d.thumbnail,
    duration: d.duration,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black">{t("downloads")}</h1>
      <p className="mb-5 text-sm text-white/45">
        {downloads.length} {t("tracks")} · {t("offlineReady")}
      </p>

      {downloads.length > 0 && (
        <button
          onClick={() => player.playTracks(tracks, 0)}
          className="mb-4 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black"
        >
          {Icon.play("h-4 w-4")} {t("playAll")}
        </button>
      )}

      <div className="space-y-1">
        {downloads.map((d, i) => (
          <div key={d.videoId} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.06]">
            <button onClick={() => player.playTracks(tracks, i)} className="shrink-0">
              <Thumb src={d.thumbnail} alt={d.title} className="h-12 w-12" rounded="rounded-lg" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.title}</p>
              <p className="truncate text-xs text-white/50">
                {d.artist}
                <span className={d.hasAudio ? "ms-2 text-emerald-400" : "ms-2 text-amber-400"}>
                  {d.hasAudio ? "● full offline audio" : "● metadata cached (audio needs network)"}
                </span>
              </p>
            </div>
            <span className="hidden text-xs text-white/35 sm:block">{formatTime(d.duration)}</span>
            <button
              onClick={() => deleteDownload(d.videoId)}
              className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-red-400"
            >
              {Icon.close("h-4 w-4")}
            </button>
          </div>
        ))}
      </div>

      {!downloads.length && <p className="py-16 text-center text-white/35">{t("emptyDownloads")}</p>}
    </div>
  );
}
