import { Value } from "@sinclair/typebox/value";
import { getApiUrl } from "~/config";
import { playlistSchema, songSchema, type Playlist, type Song } from "~/db/schema";

// Reutiliza el backend Nitro tal cual (no se migra).
// Las respuestas se validan con TypeBox: el backend puede devolver objetos
// parciales (p. ej. /api/song para algunos IDs) y no queremos que eso llegue
// a SQLite como un NOT NULL constraint.

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;

  constructor(message: string, options: { status?: number; code?: string } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
  }
}

const FRIENDLY: Record<string, string> = {
  song_unavailable: "This song isn't available from YouTube right now.",
  invalid_song: "This song isn't available from YouTube right now.",
  playlist_unavailable: "This playlist isn't available right now.",
  invalid_playlist: "This playlist isn't available right now.",
};

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function httpError(response: Response, fallback: string) {
  const body = await readJson(response);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const code = typeof record?.error === "string" ? record.error : undefined;
  const raw = [record?.error, record?.statusMessage, record?.message].find(
    (value) => typeof value === "string",
  ) as string | undefined;
  const message = (code && FRIENDLY[code]) || (raw && FRIENDLY[raw]) || raw || fallback;
  return new ApiError(message, { status: response.status, code });
}

function parseSong(value: unknown): Song | null {
  return Value.Check(songSchema, value) ? (value as Song) : null;
}

// GET /api/search?query= -> { songs, videos }
export async function searchSongs(query: string): Promise<{ songs: Song[]; videos: Song[] }> {
  if (!query) return { songs: [], videos: [] };
  const res = await fetch(getApiUrl(`search?query=${encodeURIComponent(query)}`));
  if (!res.ok) throw new ApiError(`Search failed: ${res.status}`, { status: res.status });
  const result = (await readJson(res)) as { songs?: unknown; videos?: unknown } | null;
  const songs = Array.isArray(result?.songs)
    ? result.songs.map(parseSong).filter((song): song is Song => song !== null)
    : [];
  const videos = Array.isArray(result?.videos)
    ? result.videos.map(parseSong).filter((song): song is Song => song !== null)
    : [];
  return { songs, videos };
}

// GET /api/playlist?list= -> Playlist
export async function getPlaylist(listId: string): Promise<Playlist> {
  const res = await fetch(getApiUrl(`playlist?list=${encodeURIComponent(listId)}`));
  if (!res.ok) throw await httpError(res, "Playlist not found");
  const payload = await readJson(res);
  if (Value.Check(playlistSchema, payload)) return payload as Playlist;

  // Tolerante: conserva la playlist y descarta solo las canciones inválidas.
  const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  if (typeof record?.id !== "string" || typeof record.title !== "string" || !Array.isArray(record.songs)) {
    throw new ApiError(FRIENDLY.invalid_playlist, { status: 422, code: "invalid_playlist" });
  }
  const songs = record.songs
    .map(parseSong)
    .filter((song): song is Song => song !== null);
  return { id: record.id, title: record.title, songs };
}

// GET /api/song?songId= -> Song
export async function getSong(songId: string): Promise<Song> {
  const res = await fetch(getApiUrl(`song?songId=${encodeURIComponent(songId)}`));
  if (!res.ok) throw await httpError(res, "Song not found");
  const song = parseSong(await readJson(res));
  if (!song) {
    throw new ApiError(FRIENDLY.invalid_song, { status: 422, code: "invalid_song" });
  }
  return song;
}
