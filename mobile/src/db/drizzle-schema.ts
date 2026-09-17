import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Espejo relacional de ~/db/schema (TypeBox). Las canciones viven anidadas
// en la web (SignalDB); aquí van en tabla propia ordenada por `position`
// para poder hacer findPlaylistBySongId sin $elemMatch.
export const playlists = sqliteTable("playlists", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
});

export const playlistSongs = sqliteTable("playlist_songs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playlistId: text("playlist_id").notNull(),
  youtubeId: text("youtube_id").notNull(),
  title: text("title").notNull(),
  authorName: text("author_name").notNull(),
  authorId: text("author_id").notNull(),
  albumName: text("album_name"),
  albumId: text("album_id"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  type: text("type").notNull(),
  duration: real("duration").notNull(),
  position: integer("position").notNull(),
});
