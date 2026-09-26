"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useApp, type Track } from "@/components/AppProvider";
import { getDownload } from "@/lib/offline";

type RepeatMode = "off" | "all" | "one";

type YTPlayer = {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    options: Record<string, unknown>,
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type PlayerState = {
  current: Track | null;
  queue: Track[];
  index: number;
  playing: boolean;
  position: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  autoRadio: boolean;
  loading: boolean;
  offlineSource: boolean;
  playTracks: (tracks: Track[], startIndex?: number, options?: { radio?: boolean }) => void;
  playTrack: (track: Track, options?: { radio?: boolean }) => void;
  startRadio: (track: Track) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setAutoRadio: (v: boolean) => void;
  addNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  jumpTo: (index: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

function loadYouTubeApi(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
    };
    const timer = setInterval(() => {
      if (window.YT?.Player) {
        clearInterval(timer);
        resolve(window.YT);
      }
    }, 250);
  });
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { prefs, toast } = useApp();
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(90);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [autoRadio, setAutoRadio] = useState(true);
  const [loading, setLoading] = useState(false);
  const [offlineSource, setOfflineSource] = useState(false);

  const ytRef = useRef<YTPlayer | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modeRef = useRef<"yt" | "local" | "remote">("yt");
  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);
  const nextRef = useRef<() => void>(() => {});

  queueRef.current = queue;
  indexRef.current = index;

  const current = queue[index] ?? null;

  /* ---------- audio element for offline playback ---------- */
  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    audioRef.current = el;
    const onEnd = () => nextRef.current();
    const onTime = () => {
      if (modeRef.current === "local" || modeRef.current === "remote") {
        setPosition(el.currentTime);
        setDuration(el.duration || 0);
      }
    };
    el.addEventListener("ended", onEnd);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("timeupdate", onTime);
      el.pause();
    };
  }, []);

  /* ---------- progress polling for the YouTube player ---------- */
  useEffect(() => {
    const timer = setInterval(() => {
      const yt = ytRef.current;
      if (modeRef.current === "yt" && yt && typeof yt.getCurrentTime === "function") {
        try {
          setPosition(yt.getCurrentTime() || 0);
          setDuration(yt.getDuration() || 0);
        } catch {
          /* player not ready */
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  const ensureYt = useCallback(async (): Promise<YTPlayer> => {
    if (ytRef.current) return ytRef.current;
    const YT = await loadYouTubeApi();
    return new Promise<YTPlayer>((resolve) => {
      const player = new YT.Player("innersound-yt", {
        height: "180",
        width: "320",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            ytRef.current = player;
            player.setVolume(volume);
            resolve(player);
          },
          onStateChange: (event: { data: number }) => {
            if (modeRef.current !== "yt") return;
            if (event.data === 1) {
              setPlaying(true);
              setLoading(false);
            }
            if (event.data === 2) setPlaying(false);
            if (event.data === 3) setLoading(true);
            if (event.data === 0) nextRef.current();
          },
          onError: () => {
            if (modeRef.current === "yt") {
              setLoading(false);
              nextRef.current();
            }
          },
        },
      });
    });
  }, [volume]);

  /* warm up the YouTube player on the first user interaction */
  useEffect(() => {
    const warm = () => {
      void ensureYt().catch(() => {});
      window.removeEventListener("pointerdown", warm);
    };
    window.addEventListener("pointerdown", warm, { once: true });
    return () => window.removeEventListener("pointerdown", warm);
  }, [ensureYt]);

  const logHistory = useCallback((track: Track) => {
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: track.videoId,
        title: track.title,
        artist: track.artist,
        thumbnail: track.thumbnail ?? "",
        duration: track.duration ?? 0,
      }),
    }).catch(() => {});
  }, []);

  const load = useCallback(
    async (track: Track) => {
      setLoading(true);
      setPosition(0);
      setDuration(track.duration ?? 0);

      const offline = await getDownload(track.videoId);
      if (offline?.hasAudio && offline.blob) {
        modeRef.current = "local";
        setOfflineSource(true);
        try {
          ytRef.current?.pauseVideo();
        } catch {
          /* ignore */
        }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(offline.blob);
        objectUrlRef.current = url;
        const el = audioRef.current!;
        el.src = url;
        el.volume = volume / 100;
        await el.play().catch(() => {});
        setPlaying(true);
        setLoading(false);
      } else {
        // Prefer a real HTMLAudioElement for online playback. This allows Android/browser
        // Media Session + background playback to control the same audio element.
        // Fall back to the YouTube iframe if the server-side audio resolver is unavailable.
        modeRef.current = "remote";
        setOfflineSource(false);
        try {
          ytRef.current?.pauseVideo();
        } catch {
          /* ignore */
        }
        const el = audioRef.current!;
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
        el.pause();
        el.src = `/api/audio/${encodeURIComponent(track.videoId)}`;
        el.preload = "auto";
        el.volume = volume / 100;
        try {
          await el.play();
          setPlaying(true);
          setLoading(false);
        } catch {
          // Some hosts/mirrors may not expose a playable stream. Keep the old YouTube fallback.
          modeRef.current = "yt";
          try {
            const player = await ensureYt();
            player.loadVideoById(track.videoId);
            player.setVolume(volume);
            player.playVideo();
            setPlaying(true);
          } catch {
            setPlaying(false);
          }
          setLoading(false);
        }
      }

      logHistory(track);

      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: "InnerSound",
          artwork: track.thumbnail
            ? [{ src: track.thumbnail, sizes: "512x512", type: "image/jpeg" }]
            : [],
        });
        navigator.mediaSession.playbackState = "playing";
      }
    },
    [ensureYt, logHistory, volume],
  );

  const playTracks = useCallback(
    (tracks: Track[], startIndex = 0, options?: { radio?: boolean }) => {
      const clean = tracks.filter((t) => t.videoId);
      if (!clean.length) return;
      setQueue(clean);
      setIndex(startIndex);
      void load(clean[startIndex]);

      if (options?.radio) {
        const seed = clean[startIndex];
        fetch(`/api/radio/${seed.videoId}?hl=${prefs.language}&seed=${encodeURIComponent(seed.artist)}`)
          .then((r) => r.json())
          .then((data: { songs?: Track[] }) => {
            const extra = (data.songs ?? []).filter(
              (s) => !clean.some((c) => c.videoId === s.videoId),
            );
            if (extra.length) setQueue((prev) => [...prev, ...extra]);
          })
          .catch(() => {});
      }
    },
    [load, prefs.language],
  );

  const playTrack = useCallback(
    (track: Track, options?: { radio?: boolean }) => playTracks([track], 0, options),
    [playTracks],
  );

  const startRadio = useCallback(
    (track: Track) => {
      playTracks([track], 0, { radio: true });
      toast("📻 " + track.artist);
    },
    [playTracks, toast],
  );

  const extendWithRadio = useCallback(
    async (seed: Track) => {
      try {
        const res = await fetch(
          `/api/radio/${seed.videoId}?hl=${prefs.language}&seed=${encodeURIComponent(seed.artist)}`,
        );
        const data = (await res.json()) as { songs?: Track[] };
        const extra = (data.songs ?? []).filter(
          (s) => !queueRef.current.some((c) => c.videoId === s.videoId),
        );
        if (extra.length) {
          setQueue((prev) => [...prev, ...extra]);
          return extra[0];
        }
      } catch {
        /* ignore */
      }
      return null;
    },
    [prefs.language],
  );

  const next = useCallback(() => {
    const q = queueRef.current;
    const i = indexRef.current;
    if (!q.length) return;

    if (repeat === "one") {
      void load(q[i]);
      return;
    }

    if (shuffle && q.length > 1) {
      let r = i;
      while (r === i) r = Math.floor(Math.random() * q.length);
      setIndex(r);
      void load(q[r]);
      return;
    }

    if (i + 1 < q.length) {
      setIndex(i + 1);
      void load(q[i + 1]);
      return;
    }

    if (repeat === "all") {
      setIndex(0);
      void load(q[0]);
      return;
    }

    if (autoRadio) {
      void (async () => {
        const track = await extendWithRadio(q[i]);
        if (track) {
          setIndex(i + 1);
          void load(track);
        } else {
          setPlaying(false);
        }
      })();
      return;
    }
    setPlaying(false);
  }, [autoRadio, extendWithRadio, load, repeat, shuffle]);

  nextRef.current = next;

  const previous = useCallback(() => {
    const q = queueRef.current;
    const i = indexRef.current;
    if (position > 5) {
      if ((modeRef.current === "local" || modeRef.current === "remote") && audioRef.current) audioRef.current.currentTime = 0;
      else ytRef.current?.seekTo(0, true);
      return;
    }
    if (i > 0) {
      setIndex(i - 1);
      void load(q[i - 1]);
    }
  }, [load, position]);

  const toggle = useCallback(() => {
    if (!current) return;
    if (modeRef.current === "local" || modeRef.current === "remote") {
      const el = audioRef.current!;
      if (el.paused) {
        void el.play();
        setPlaying(true);
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
      } else {
        el.pause();
        setPlaying(false);
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
      }
      return;
    }
    const yt = ytRef.current;
    if (!yt) {
      void load(current);
      return;
    }
    if (playing) {
      yt.pauseVideo();
      setPlaying(false);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
    } else {
      yt.playVideo();
      setPlaying(true);
      if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
    }
  }, [current, load, playing]);

  const seek = useCallback((seconds: number) => {
    if ((modeRef.current === "local" || modeRef.current === "remote") && audioRef.current) {
      audioRef.current.currentTime = seconds;
    } else {
      ytRef.current?.seekTo(seconds, true);
    }
    setPosition(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
    ytRef.current?.setVolume(v);
  }, []);

  const jumpTo = useCallback(
    (i: number) => {
      const q = queueRef.current;
      if (!q[i]) return;
      setIndex(i);
      void load(q[i]);
    },
    [load],
  );

  const addNext = useCallback((track: Track) => {
    setQueue((prev) => {
      const copy = prev.filter((t) => t.videoId !== track.videoId);
      copy.splice(indexRef.current + 1, 0, track);
      return copy;
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => (prev.some((t) => t.videoId === track.videoId) ? prev : [...prev, track]));
  }, []);

  const removeFromQueue = useCallback((i: number) => {
    setQueue((prev) => prev.filter((_, idx) => idx !== i));
    if (i < indexRef.current) setIndex((prev) => Math.max(0, prev - 1));
  }, []);

  /* ---------- media session controls ---------- */
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => toggle());
    navigator.mediaSession.setActionHandler("pause", () => toggle());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
    try {
      navigator.mediaSession.setActionHandler("seekbackward", () => seek(Math.max(0, position - 10)));
      navigator.mediaSession.setActionHandler("seekforward", () => seek(Math.min(duration, position + 10)));
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (typeof details.seekTime === "number") seek(details.seekTime);
      });
    } catch {
      /* older browsers */
    }
  
  }, [duration, next, position, previous, seek, toggle]);

  const value = useMemo<PlayerState>(
    () => ({
      current,
      queue,
      index,
      playing,
      position,
      duration,
      volume,
      shuffle,
      repeat,
      autoRadio,
      loading,
      offlineSource,
      playTracks,
      playTrack,
      startRadio,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleShuffle: () => setShuffle((s) => !s),
      cycleRepeat: () =>
        setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
      setAutoRadio,
      addNext,
      addToQueue,
      removeFromQueue,
      jumpTo,
    }),
    [
      addNext,
      addToQueue,
      autoRadio,
      current,
      duration,
      index,
      jumpTo,
      loading,
      next,
      offlineSource,
      playTrack,
      playTracks,
      playing,
      position,
      previous,
      queue,
      removeFromQueue,
      repeat,
      seek,
      setVolume,
      shuffle,
      startRadio,
      toggle,
      volume,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed -left-[9999px] top-0 h-[180px] w-[320px] opacity-0">
        <div id="innersound-yt" />
      </div>
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
