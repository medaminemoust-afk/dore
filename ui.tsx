"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useApp, type Track } from "@/components/AppProvider";
import { usePlayer } from "@/components/PlayerProvider";

export function formatTime(seconds: number) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor(seconds / 60) % 60;
  const h = Math.floor(seconds / 3600);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export const Icon = {
  play: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
  ),
  pause: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
  ),
  next: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M6 5l9 7-9 7zM17 5h2v14h-2z" /></svg>
  ),
  prev: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor"><path d="M18 5l-9 7 9 7zM5 5h2v14H5z" /></svg>
  ),
  heart: (c = "", filled = false) => (
    <svg className={c} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7.5-4.6-9.5-9A5.3 5.3 0 0 1 12 6.5 5.3 5.3 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9z" />
    </svg>
  ),
  download: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
    </svg>
  ),
  check: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 12l5 5L20 6" /></svg>
  ),
  more: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
  ),
  shuffle: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  ),
  repeat: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  radio: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="2.5" /><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 16.5a6.4 6.4 0 0 0 0-9M4.5 4.5a10.5 10.5 0 0 0 0 15M19.5 19.5a10.5 10.5 0 0 0 0-15" />
    </svg>
  ),
  search: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
  ),
  home: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M3 10.5L12 3l9 7.5V21H3z" /></svg>
  ),
  library: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4v16M9 4v16M14 5l5 15" /></svg>
  ),
  settings: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3.2" /><path d="M4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4" /></svg>
  ),
  queue: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h11M4 12h11M4 18h7M17 10v9M17 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM19 10l3-1" /></svg>
  ),
  close: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
  ),
  plus: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
  ),
  chevron: (c = "") => (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6" /></svg>
  ),
};

export function Thumb({
  src,
  alt,
  className = "",
  rounded = "rounded-xl",
}: {
  src?: string | null;
  alt: string;
  className?: string;
  rounded?: string;
}) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-fuchsia-600/40 via-violet-600/30 to-cyan-500/30 text-white/70 ${rounded} ${className}`}
      >
        <span className="text-lg font-bold">{alt.slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={`object-cover ${rounded} ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */

export function TrackMenu({ track, onRemove }: { track: Track; onRemove?: () => void }) {
  const { t, playlists, createPlaylist, addToPlaylist, download, isDownloaded, downloading, deleteDownload, toast } =
    useApp();
  const player = usePlayer();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const downloaded = isDownloaded(track.videoId);
  const busy = downloading.includes(track.videoId);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        {Icon.more("h-4 w-4")}
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-1 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#15121f]/95 p-1.5 text-sm shadow-2xl backdrop-blur">
          <MenuItem onClick={() => { player.addNext(track); setOpen(false); toast(t("queue")); }}>
            {Icon.queue("h-4 w-4")} Play next
          </MenuItem>
          <MenuItem onClick={() => { player.addToQueue(track); setOpen(false); toast(t("queue")); }}>
            {Icon.plus("h-4 w-4")} Add to queue
          </MenuItem>
          <MenuItem onClick={() => { player.startRadio(track); setOpen(false); }}>
            {Icon.radio("h-4 w-4")} {t("radio")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (downloaded) void deleteDownload(track.videoId);
              else void download(track);
              setOpen(false);
            }}
          >
            {downloaded ? Icon.check("h-4 w-4") : Icon.download("h-4 w-4")}
            {busy ? t("savingOffline") : downloaded ? t("removeDownload") : t("download")}
          </MenuItem>
          {onRemove && (
            <MenuItem onClick={() => { onRemove(); setOpen(false); }}>
              {Icon.close("h-4 w-4")} {t("delete")}
            </MenuItem>
          )}
          <div className="my-1 h-px bg-white/10" />
          <p className="px-3 py-1 text-[11px] uppercase tracking-wide text-white/40">{t("addToPlaylist")}</p>
          <div className="max-h-40 overflow-y-auto">
            {playlists.map((p) => (
              <MenuItem
                key={p.id}
                onClick={async () => {
                  await addToPlaylist(p.id, [track]);
                  setOpen(false);
                  toast(`${t("addedTo")} ${p.name}`);
                }}
              >
                🎵 {p.name}
              </MenuItem>
            ))}
          </div>
          {creating ? (
            <form
              className="flex gap-1 p-1.5"
              onSubmit={async (e) => {
                e.preventDefault();
                const pl = await createPlaylist(name || "New playlist");
                if (pl) {
                  await addToPlaylist(pl.id, [track]);
                  toast(`${t("addedTo")} ${pl.name}`);
                }
                setName("");
                setCreating(false);
                setOpen(false);
              }}
            >
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("playlistName")}
                className="min-w-0 flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs outline-none"
              />
              <button className="rounded-lg bg-fuchsia-500 px-2 py-1.5 text-xs font-semibold">
                {t("create")}
              </button>
            </form>
          ) : (
            <MenuItem onClick={() => setCreating(true)}>
              {Icon.plus("h-4 w-4")} {t("newPlaylist")}
            </MenuItem>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-white/85 transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

export function SongRow({
  song,
  index,
  queue,
  onRemove,
}: {
  song: Track;
  index?: number;
  queue?: Track[];
  onRemove?: () => void;
}) {
  const { isLiked, toggleLike, isDownloaded } = useApp();
  const player = usePlayer();
  const active = player.current?.videoId === song.videoId;
  const liked = isLiked(song.videoId);

  return (
    <div
      onDoubleClick={() => player.playTracks(queue ?? [song], queue ? queue.indexOf(song) : 0, { radio: !queue })}
      className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/[0.06] ${
        active ? "bg-white/[0.08]" : ""
      }`}
    >
      <button
        onClick={() =>
          active
            ? player.toggle()
            : player.playTracks(queue ?? [song], queue ? Math.max(0, queue.indexOf(song)) : 0, { radio: !queue })
        }
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
      >
        <Thumb src={song.thumbnail} alt={song.title} className="h-12 w-12" rounded="rounded-lg" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
          {active && player.playing ? Icon.pause("h-5 w-5 text-white") : Icon.play("h-5 w-5 text-white")}
        </span>
        {active && player.playing && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="flex h-4 items-end gap-[2px]">
              <i className="w-[3px] animate-[eq_0.9s_ease-in-out_infinite] bg-fuchsia-400" style={{ height: "40%" }} />
              <i className="w-[3px] animate-[eq_0.7s_ease-in-out_infinite] bg-fuchsia-400" style={{ height: "90%" }} />
              <i className="w-[3px] animate-[eq_1.1s_ease-in-out_infinite] bg-fuchsia-400" style={{ height: "60%" }} />
            </span>
          </span>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${active ? "text-fuchsia-300" : "text-white"}`}>
          {typeof index === "number" && <span className="me-2 text-white/30">{index + 1}</span>}
          {song.title}
        </p>
        <p className="truncate text-xs text-white/50">
          {song.artist}
          {isDownloaded(song.videoId) && <span className="ms-2 text-emerald-400">● offline</span>}
        </p>
      </div>

      <span className="hidden w-12 text-end text-xs text-white/40 sm:block">
        {formatTime(song.duration ?? 0)}
      </span>
      <button
        onClick={() => toggleLike(song)}
        aria-label="like"
        className={`rounded-full p-2 transition hover:bg-white/10 ${liked ? "text-fuchsia-400" : "text-white/50"}`}
      >
        {Icon.heart("h-4 w-4", liked)}
      </button>
      <TrackMenu track={song} onRemove={onRemove} />
    </div>
  );
}

export function SongCard({ song, queue }: { song: Track; queue?: Track[] }) {
  const player = usePlayer();
  const active = player.current?.videoId === song.videoId;
  return (
    <div className="group w-40 shrink-0 sm:w-44">
      <button
        onClick={() =>
          player.playTracks(queue ?? [song], queue ? Math.max(0, queue.indexOf(song)) : 0, { radio: !queue })
        }
        className="relative block w-full overflow-hidden rounded-2xl"
      >
        <Thumb src={song.thumbnail} alt={song.title} className="aspect-square w-full" rounded="rounded-2xl" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-fuchsia-500 text-white shadow-lg">
            {active && player.playing ? Icon.pause("h-5 w-5") : Icon.play("h-5 w-5")}
          </span>
        </span>
      </button>
      <p className={`mt-2 truncate text-sm font-medium ${active ? "text-fuchsia-300" : "text-white"}`}>
        {song.title}
      </p>
      <p className="truncate text-xs text-white/50">{song.artist}</p>
    </div>
  );
}

export function ArtistTile({
  artist,
}: {
  artist: { artistId: string; name: string; thumbnail?: string | null; subtitle?: string };
}) {
  return (
    <Link href={`/artist/${artist.artistId}?name=${encodeURIComponent(artist.name)}`} className="group w-32 shrink-0 text-center sm:w-36">
      <Thumb
        src={artist.thumbnail}
        alt={artist.name}
        className="aspect-square w-full transition group-hover:scale-[1.03]"
        rounded="rounded-full"
      />
      <p className="mt-2 truncate text-sm font-medium text-white">{artist.name}</p>
      {artist.subtitle && <p className="truncate text-xs text-white/45">{artist.subtitle}</p>}
    </Link>
  );
}

export function Shelf({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-end justify-between gap-3 px-1">
        <div>
          <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
          {subtitle && <p className="text-xs text-white/45">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">{children}</div>
    </section>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-white/50">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia-400" />
      {label}
    </div>
  );
}
