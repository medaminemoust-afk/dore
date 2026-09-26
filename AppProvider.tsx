"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LANGUAGES, translate, type LanguageId } from "@/lib/i18n";
import type { RegionId } from "@/lib/regions";
import { listDownloads, removeDownload, saveDownload, type OfflineSong } from "@/lib/offline";

export type Track = {
  videoId: string;
  title: string;
  artist: string;
  artistId?: string | null;
  thumbnail?: string | null;
  duration?: number;
};

export type FavoriteArtist = {
  artistId: string;
  name: string;
  thumbnail?: string | null;
  region?: string | null;
};

export type PlaylistSummary = {
  id: string;
  name: string;
  description?: string;
  cover?: string | null;
  count?: number;
};

type Prefs = {
  language: LanguageId;
  region: RegionId;
  country: string;
  genres: string[];
  onboarded: boolean;
};

type AppState = {
  ready: boolean;
  prefs: Prefs;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
  updatePrefs: (patch: Partial<Prefs>) => Promise<void>;
  likes: Track[];
  isLiked: (videoId: string) => boolean;
  toggleLike: (track: Track) => Promise<void>;
  favorites: FavoriteArtist[];
  isFavorite: (artistId: string) => boolean;
  toggleFavorite: (artist: FavoriteArtist) => Promise<void>;
  playlists: PlaylistSummary[];
  refreshPlaylists: () => Promise<void>;
  createPlaylist: (name: string) => Promise<PlaylistSummary | null>;
  addToPlaylist: (playlistId: string, songs: Track[]) => Promise<void>;
  removeFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  downloads: OfflineSong[];
  isDownloaded: (videoId: string) => boolean;
  downloading: string[];
  download: (track: Track) => Promise<void>;
  deleteDownload: (videoId: string) => Promise<void>;
  toast: (message: string) => void;
  toasts: { id: number; message: string }[];
  online: boolean;
};

const AppContext = createContext<AppState | null>(null);

const DEFAULT_PREFS: Prefs = {
  language: "en",
  region: "GLOBAL",
  country: "US",
  genres: [],
  onboarded: false,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [likes, setLikes] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistSummary[]>([]);
  const [downloads, setDownloads] = useState<OfflineSong[]>([]);
  const [downloading, setDownloading] = useState<string[]>([]);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const [online, setOnline] = useState(true);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (cancelled) return;
        setPrefs({
          language: (data.prefs?.language ?? "en") as LanguageId,
          region: (data.prefs?.region ?? "GLOBAL") as RegionId,
          country: data.prefs?.country ?? "US",
          genres: data.prefs?.genres ?? [],
          onboarded: Boolean(data.prefs?.onboarded),
        });
        setLikes(data.likes ?? []);
        setFavorites(data.favorites ?? []);
      } catch {
        /* offline: keep defaults */
      } finally {
        if (!cancelled) setReady(true);
      }
      try {
        const res = await fetch("/api/playlists");
        const data = await res.json();
        if (!cancelled) setPlaylists(data.playlists ?? []);
      } catch {
        /* ignore */
      }
      const local = await listDownloads();
      if (!cancelled) setDownloads(local);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const dir = useMemo<"ltr" | "rtl">(
    () => (LANGUAGES.find((l) => l.id === prefs.language)?.dir === "rtl" ? "rtl" : "ltr"),
    [prefs.language],
  );

  useEffect(() => {
    document.documentElement.lang = prefs.language;
    document.documentElement.dir = dir;
  }, [prefs.language, dir]);

  const t = useCallback((key: string) => translate(prefs.language, key), [prefs.language]);

  const updatePrefs = useCallback(async (patch: Partial<Prefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
    try {
      await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch {
      /* ignore */
    }
  }, []);

  const isLiked = useCallback((videoId: string) => likes.some((l) => l.videoId === videoId), [likes]);

  const toggleLike = useCallback(
    async (track: Track) => {
      const liked = likes.some((l) => l.videoId === track.videoId);
      setLikes((prev) =>
        liked ? prev.filter((l) => l.videoId !== track.videoId) : [{ ...track }, ...prev],
      );
      try {
        const res = liked
          ? await fetch(`/api/likes?videoId=${encodeURIComponent(track.videoId)}`, { method: "DELETE" })
          : await fetch("/api/likes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(track),
            });
        const data = await res.json();
        if (data.likes) setLikes(data.likes);
      } catch {
        /* keep optimistic value */
      }
    },
    [likes],
  );

  const isFavorite = useCallback(
    (artistId: string) => favorites.some((f) => f.artistId === artistId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (artist: FavoriteArtist) => {
      const fav = favorites.some((f) => f.artistId === artist.artistId);
      setFavorites((prev) =>
        fav ? prev.filter((f) => f.artistId !== artist.artistId) : [...prev, artist],
      );
      try {
        const res = fav
          ? await fetch(`/api/favorites?artistId=${encodeURIComponent(artist.artistId)}`, {
              method: "DELETE",
            })
          : await fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(artist),
            });
        const data = await res.json();
        if (data.favorites) setFavorites(data.favorites);
      } catch {
        /* ignore */
      }
    },
    [favorites],
  );

  const refreshPlaylists = useCallback(async () => {
    try {
      const res = await fetch("/api/playlists");
      const data = await res.json();
      setPlaylists(data.playlists ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  const createPlaylist = useCallback(
    async (name: string) => {
      try {
        const res = await fetch("/api/playlists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        await refreshPlaylists();
        return data.playlist as PlaylistSummary;
      } catch {
        return null;
      }
    },
    [refreshPlaylists],
  );

  const addToPlaylist = useCallback(
    async (playlistId: string, songs: Track[]) => {
      try {
        await fetch(`/api/playlists/${playlistId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ songs }),
        });
        await refreshPlaylists();
      } catch {
        /* ignore */
      }
    },
    [refreshPlaylists],
  );

  const removeFromPlaylist = useCallback(
    async (playlistId: string, videoId: string) => {
      try {
        await fetch(`/api/playlists/${playlistId}/items?videoId=${encodeURIComponent(videoId)}`, {
          method: "DELETE",
        });
        await refreshPlaylists();
      } catch {
        /* ignore */
      }
    },
    [refreshPlaylists],
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      try {
        await fetch(`/api/playlists/${playlistId}`, { method: "DELETE" });
        await refreshPlaylists();
      } catch {
        /* ignore */
      }
    },
    [refreshPlaylists],
  );

  const isDownloaded = useCallback(
    (videoId: string) => downloads.some((d) => d.videoId === videoId),
    [downloads],
  );

  const download = useCallback(
    async (track: Track) => {
      setDownloading((prev) => [...prev, track.videoId]);
      try {
        const result = await saveDownload({
          videoId: track.videoId,
          title: track.title,
          artist: track.artist,
          thumbnail: track.thumbnail ?? "",
          duration: track.duration ?? 0,
        });
        setDownloads(await listDownloads());
        toast(
          result.hasAudio
            ? `${track.title} — ${translate(prefs.language, "downloaded")}`
            : `${track.title} — saved to your offline library (audio needs connection)`,
        );
      } catch {
        toast("Download failed");
      } finally {
        setDownloading((prev) => prev.filter((id) => id !== track.videoId));
      }
    },
    [prefs.language, toast],
  );

  const deleteDownload = useCallback(
    async (videoId: string) => {
      await removeDownload(videoId);
      setDownloads(await listDownloads());
    },
    [],
  );

  const value: AppState = {
    ready,
    prefs,
    t,
    dir,
    updatePrefs,
    likes,
    isLiked,
    toggleLike,
    favorites,
    isFavorite,
    toggleFavorite,
    playlists,
    refreshPlaylists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    downloads,
    isDownloaded,
    downloading,
    download,
    deleteDownload,
    toast,
    toasts,
    online,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
