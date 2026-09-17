import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

// DDL explícito en vez de drizzle-kit/migrations: una sola DB local,
// sin sync con servidor. Si el schema cambia, subir DB_VERSION y migrar aquí.
const DB_VERSION = 1;

const sqlite = openDatabaseSync("wetune.db");

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id TEXT NOT NULL,
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_id TEXT NOT NULL,
    album_name TEXT,
    album_id TEXT,
    thumbnail_url TEXT NOT NULL,
    type TEXT NOT NULL,
    duration REAL NOT NULL,
    position INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_songs_playlist ON playlist_songs(playlist_id, position);
  CREATE INDEX IF NOT EXISTS idx_songs_youtube ON playlist_songs(youtube_id);
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);

const row = sqlite.getFirstSync<{ value: string }>("SELECT value FROM meta WHERE key = 'version'");
if (!row) {
  sqlite.runSync("INSERT INTO meta (key, value) VALUES ('version', ?)", [String(DB_VERSION)]);
}

export const db = drizzle(sqlite);
export type AppDb = typeof db;
