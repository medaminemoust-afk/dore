"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";
import { Icon, Thumb, TrackMenu, formatTime } from "@/components/ui";

type LyricLine = { time: number; text: string };

function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split("\n")) {
    const matches = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    const text = raw.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, "").trim();
    for (const m of matches) {
      lines.push({ time: Number(m[1]) * 60 + Number(m[2]), text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

export function PlayerBar() {
  const { t, isLiked, toggleLike, isDownloaded, download, downloading } = useApp();
  const player = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const current = player.current;

  if (!current) return null;
  const liked = isLiked(current.videoId);
  const progress = player.duration ? (player.position / player.duration) * 100 : 0;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0a15]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div
          className="h-1 w-full cursor-pointer bg-white/10"
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            player.seek(ratio * player.duration);
          }}
        >
          <div className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" style={{ width: `${progress}%` }} />
        </div>

        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 sm:px-5">
          <button onClick={() => setExpanded(true)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
            <Thumb src={current.thumbnail} alt={current.title} className="h-12 w-12" rounded="rounded-lg" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-white">{current.title}</span>
              <span className="block truncate text-xs text-white/50">
                {current.artist}
                {player.offlineSource && <span className="ms-2 text-emerald-400">● offline</span>}
              </span>
            </span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => toggleLike(current)}
              className={`hidden rounded-full p-2 sm:block ${liked ? "text-fuchsia-400" : "text-white/60"} hover:bg-white/10`}
            >
              {Icon.heart("h-5 w-5", liked)}
            </button>
            <button
              onClick={player.toggleShuffle}
              className={`hidden rounded-full p-2 sm:block ${player.shuffle ? "text-fuchsia-400" : "text-white/60"} hover:bg-white/10`}
              title={t("shuffle")}
            >
              {Icon.shuffle("h-4 w-4")}
            </button>
            <button onClick={player.previous} className="rounded-full p-2 text-white/80 hover:bg-white/10">
              {Icon.prev("h-5 w-5")}
            </button>
            <button
              onClick={player.toggle}
              className="grid h-11 w-11 place-items-center rounded-full bg-white text-black transition hover:scale-105"
            >
              {player.loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              ) : player.playing ? (
                Icon.pause("h-5 w-5")
              ) : (
                Icon.play("h-5 w-5")
              )}
            </button>
            <button onClick={player.next} className="rounded-full p-2 text-white/80 hover:bg-white/10">
              {Icon.next("h-5 w-5")}
            </button>
            <button
              onClick={player.cycleRepeat}
              className={`hidden rounded-full p-2 sm:block ${player.repeat !== "off" ? "text-fuchsia-400" : "text-white/60"} hover:bg-white/10`}
              title={t("repeat")}
            >
              {Icon.repeat("h-4 w-4")}
              {player.repeat === "one" && <span className="absolute -mt-2 text-[9px]">1</span>}
            </button>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="w-24 text-end text-xs tabular-nums text-white/40">
              {formatTime(player.position)} / {formatTime(player.duration)}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={player.volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              className="h-1 w-24 accent-fuchsia-500"
            />
            <button
              onClick={() => (isDownloaded(current.videoId) ? undefined : download(current))}
              className={`rounded-full p-2 ${isDownloaded(current.videoId) ? "text-emerald-400" : "text-white/60"} hover:bg-white/10`}
              title={t("download")}
            >
              {downloading.includes(current.videoId) ? (
                <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : isDownloaded(current.videoId) ? (
                Icon.check("h-4 w-4")
              ) : (
                Icon.download("h-4 w-4")
              )}
            </button>
            <TrackMenu track={current} />
          </div>
        </div>
      </div>

      {expanded && <NowPlaying onClose={() => setExpanded(false)} />}
    </>
  );
}

function NowPlaying({ onClose }: { onClose: () => void }) {
  const { t, isLiked, toggleLike, isDownloaded, download } = useApp();
  const player = usePlayer();
  const current = player.current!;
  const [tab, setTab] = useState<"lyrics" | "queue">("lyrics");
  const [lyrics, setLyrics] = useState<{ synced: LyricLine[]; plain: string | null; loading: boolean }>({
    synced: [],
    plain: null,
    loading: true,
  });
  const activeRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLyrics({ synced: [], plain: null, loading: true });
    fetch(`/api/lyrics?title=${encodeURIComponent(current.title)}&artist=${encodeURIComponent(current.artist)}`)
      .then((r) => r.json())
      .then((data: { synced?: string | null; plain?: string | null }) => {
        if (cancelled) return;
        setLyrics({
          synced: data.synced ? parseLrc(data.synced) : [],
          plain: data.plain ?? null,
          loading: false,
        });
      })
      .catch(() => !cancelled && setLyrics({ synced: [], plain: null, loading: false }));
    return () => {
      cancelled = true;
    };
  }, [current.videoId, current.title, current.artist]);

  const activeIndex = useMemo(() => {
    if (!lyrics.synced.length) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.synced.length; i++) {
      if (lyrics.synced[i].time <= player.position + 0.25) idx = i;
      else break;
    }
    return idx;
  }, [lyrics.synced, player.position]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex]);

  const liked = isLiked(current.videoId);

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-gradient-to-b from-[#1a1026] via-[#0d0a15] to-black">
      <div className="mx-auto max-w-6xl px-5 py-5">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={onClose} className="rounded-full p-2 text-white/70 hover:bg-white/10">
            {Icon.close("h-5 w-5")}
          </button>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">{t("nowPlaying")}</p>
          <TrackMenu track={current} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center">
            <Thumb
              src={current.thumbnail}
              alt={current.title}
              className="aspect-square w-full max-w-sm shadow-2xl"
              rounded="rounded-3xl"
            />
            <h2 className="mt-5 line-clamp-2 text-center text-xl font-bold text-white">{current.title}</h2>
            {current.artistId ? (
              <Link
                href={`/artist/${current.artistId}?name=${encodeURIComponent(current.artist)}`}
                onClick={onClose}
                className="mt-1 text-sm text-fuchsia-300 hover:underline"
              >
                {current.artist}
              </Link>
            ) : (
              <p className="mt-1 text-sm text-white/55">{current.artist}</p>
            )}

            <div className="mt-5 w-full max-w-sm">
              <input
                type="range"
                min={0}
                max={Math.max(1, player.duration)}
                value={player.position}
                onChange={(e) => player.seek(Number(e.target.value))}
                className="w-full accent-fuchsia-500"
              />
              <div className="flex justify-between text-xs tabular-nums text-white/40">
                <span>{formatTime(player.position)}</span>
                <span>{formatTime(player.duration)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => toggleLike(current)}
                className={`rounded-full p-3 ${liked ? "text-fuchsia-400" : "text-white/60"} hover:bg-white/10`}
              >
                {Icon.heart("h-5 w-5", liked)}
              </button>
              <button onClick={player.previous} className="rounded-full p-3 text-white hover:bg-white/10">
                {Icon.prev("h-6 w-6")}
              </button>
              <button
                onClick={player.toggle}
                className="grid h-16 w-16 place-items-center rounded-full bg-white text-black hover:scale-105"
              >
                {player.playing ? Icon.pause("h-7 w-7") : Icon.play("h-7 w-7")}
              </button>
              <button onClick={player.next} className="rounded-full p-3 text-white hover:bg-white/10">
                {Icon.next("h-6 w-6")}
              </button>
              <button
                onClick={() => (isDownloaded(current.videoId) ? undefined : download(current))}
                className={`rounded-full p-3 ${isDownloaded(current.videoId) ? "text-emerald-400" : "text-white/60"} hover:bg-white/10`}
              >
                {isDownloaded(current.videoId) ? Icon.check("h-5 w-5") : Icon.download("h-5 w-5")}
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs">
              <button
                onClick={player.toggleShuffle}
                className={`rounded-full border px-3 py-1.5 ${player.shuffle ? "border-fuchsia-500 text-fuchsia-300" : "border-white/15 text-white/60"}`}
              >
                {t("shuffle")}
              </button>
              <button
                onClick={player.cycleRepeat}
                className={`rounded-full border px-3 py-1.5 ${player.repeat !== "off" ? "border-fuchsia-500 text-fuchsia-300" : "border-white/15 text-white/60"}`}
              >
                {t("repeat")}: {player.repeat}
              </button>
              <button
                onClick={() => player.setAutoRadio(!player.autoRadio)}
                className={`rounded-full border px-3 py-1.5 ${player.autoRadio ? "border-cyan-400 text-cyan-300" : "border-white/15 text-white/60"}`}
              >
                {t("autoplayRadio")}
              </button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex gap-2">
              {(["lyrics", "queue"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    tab === key ? "bg-white text-black" : "bg-white/10 text-white/70"
                  }`}
                >
                  {t(key)}
                </button>
              ))}
            </div>

            {tab === "lyrics" ? (
              <div className="max-h-[55vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                {lyrics.loading ? (
                  <p className="text-white/40">{t("loading")}</p>
                ) : lyrics.synced.length ? (
                  lyrics.synced.map((line, i) => (
                    <p
                      key={`${line.time}-${i}`}
                      ref={i === activeIndex ? activeRef : null}
                      onClick={() => player.seek(line.time)}
                      className={`cursor-pointer py-1.5 text-lg transition ${
                        i === activeIndex ? "font-bold text-white" : "text-white/35 hover:text-white/60"
                      }`}
                    >
                      {line.text || "♪"}
                    </p>
                  ))
                ) : lyrics.plain ? (
                  <p className="whitespace-pre-wrap text-white/70">{lyrics.plain}</p>
                ) : (
                  <p className="text-white/40">{t("noLyrics")}</p>
                )}
              </div>
            ) : (
              <div className="max-h-[55vh] overflow-y-auto rounded-3xl border border-white/10 bg-white/[0.03] p-2">
                {player.queue.map((track, i) => (
                  <button
                    key={`${track.videoId}-${i}`}
                    onClick={() => player.jumpTo(i)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2 text-start transition hover:bg-white/10 ${
                      i === player.index ? "bg-white/10" : ""
                    }`}
                  >
                    <Thumb src={track.thumbnail} alt={track.title} className="h-10 w-10" rounded="rounded-lg" />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${i === player.index ? "text-fuchsia-300" : "text-white"}`}>
                        {track.title}
                      </span>
                      <span className="block truncate text-xs text-white/45">{track.artist}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
