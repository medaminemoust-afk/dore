import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const preferences = pgTable("preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  language: text("language").default("en").notNull(),
  region: text("region").default("GLOBAL").notNull(),
  country: text("country").default("US").notNull(),
  genres: jsonb("genres").$type<string[]>().default([]).notNull(),
  onboarded: boolean("onboarded").default(false).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const favoriteArtists = pgTable(
  "favorite_artists",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    artistId: text("artist_id").notNull(),
    name: text("name").notNull(),
    thumbnail: text("thumbnail"),
    region: text("region"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("fav_artist_unique").on(t.userId, t.artistId)],
);

export const likedSongs = pgTable(
  "liked_songs",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: text("video_id").notNull(),
    title: text("title").notNull(),
    artist: text("artist").default("").notNull(),
    artistId: text("artist_id"),
    thumbnail: text("thumbnail"),
    duration: integer("duration").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("liked_song_unique").on(t.userId, t.videoId)],
);

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  cover: text("cover"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const playlistItems = pgTable(
  "playlist_items",
  {
    id: serial("id").primaryKey(),
    playlistId: uuid("playlist_id")
      .references(() => playlists.id, { onDelete: "cascade" })
      .notNull(),
    videoId: text("video_id").notNull(),
    title: text("title").notNull(),
    artist: text("artist").default("").notNull(),
    thumbnail: text("thumbnail"),
    duration: integer("duration").default(0).notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("playlist_items_playlist_idx").on(t.playlistId)],
);

export const history = pgTable(
  "history",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    videoId: text("video_id").notNull(),
    title: text("title").notNull(),
    artist: text("artist").default("").notNull(),
    thumbnail: text("thumbnail"),
    duration: integer("duration").default(0).notNull(),
    playedAt: timestamp("played_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("history_user_idx").on(t.userId, t.playedAt)],
);

export const mediaCache = pgTable("media_cache", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
