"use client";

export type OfflineSong = {
  videoId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
  hasAudio: boolean;
  savedAt: number;
  blob?: Blob;
  artwork?: Blob;
};

const DB_NAME = "innersound";
const STORE = "downloads";
const VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "videoId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = run(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listDownloads(): Promise<OfflineSong[]> {
  try {
    const all = await tx<OfflineSong[]>("readonly", (s) => s.getAll() as IDBRequest<OfflineSong[]>);
    return all.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export async function getDownload(videoId: string): Promise<OfflineSong | undefined> {
  try {
    return await tx<OfflineSong | undefined>(
      "readonly",
      (s) => s.get(videoId) as IDBRequest<OfflineSong | undefined>,
    );
  } catch {
    return undefined;
  }
}

export async function removeDownload(videoId: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(videoId) as unknown as IDBRequest<undefined>);
  } catch {
    /* ignore */
  }
}

export type DownloadResult = { hasAudio: boolean };

export async function saveDownload(song: {
  videoId: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  duration?: number;
}): Promise<DownloadResult> {
  let blob: Blob | undefined;
  try {
    const res = await fetch(`/api/audio/${song.videoId}`);
    if (res.ok) {
      const data = await res.blob();
      if (data.size > 10_000) blob = data;
    }
  } catch {
    /* offline audio mirror unavailable */
  }

  let artwork: Blob | undefined;
  if (song.thumbnail) {
    try {
      const res = await fetch(song.thumbnail, { mode: "cors" });
      if (res.ok) artwork = await res.blob();
    } catch {
      /* ignore */
    }
  }

  const record: OfflineSong = {
    videoId: song.videoId,
    title: song.title,
    artist: song.artist ?? "",
    thumbnail: song.thumbnail ?? "",
    duration: song.duration ?? 0,
    hasAudio: Boolean(blob),
    savedAt: Date.now(),
    blob,
    artwork,
  };

  await tx("readwrite", (s) => s.put(record) as unknown as IDBRequest<IDBValidKey>);
  return { hasAudio: Boolean(blob) };
}
