import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

// DDL explícito en vez de drizzle-kit/migrations: una sola DB local,
// sin sync con servidor.
// Al cambiar el schema: subir DB_VERSION y añadir el ALTER correspondiente
// en migrateIfNeeded() (las columnas deben seguir espejando drizzle-schema.ts).
export const DB_VERSION = 2;

const sqlite = openDatabaseSync("wetune.db");

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    favorite INTEGER NOT NULL DEFAULT 0,
    last_played_at INTEGER NOT NULL DEFAULT 0
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

migrateIfNeeded(sqlite);

export const db = drizzle(sqlite);
export type AppDb = typeof db;

type Database = ReturnType<typeof openDatabaseSync>;

// v1 -> v2: favorite + last_played_at. En una DB nueva las columnas ya
// existen por el CREATE TABLE; el PRAGMA evita un ALTER duplicado.
function migrateIfNeeded(database: Database) {
  const row = database.getFirstSync<{ value: string }>(
    "SELECT value FROM meta WHERE key = 'version'",
  );
  const currentVersion = row ? Number(row.value) : 0;

  if (currentVersion > DB_VERSION) {
    throw new Error(`[db] Unsupported version ${row?.value}, expected ${DB_VERSION}.`);
  }
  if (currentVersion === DB_VERSION) return;

  const columns = new Set(
    database
      .getAllSync<{ name: string }>("PRAGMA table_info(playlists)")
      .map((column) => column.name),
  );

  database.withTransactionSync(() => {
    if (!columns.has("favorite")) {
      database.execSync(
        "ALTER TABLE playlists ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0",
      );
    }
    if (!columns.has("last_played_at")) {
      database.execSync(
        "ALTER TABLE playlists ADD COLUMN last_played_at INTEGER NOT NULL DEFAULT 0",
      );
    }
    database.runSync(
      "INSERT INTO meta (key, value) VALUES ('version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      [String(DB_VERSION)],
    );
  });
}
