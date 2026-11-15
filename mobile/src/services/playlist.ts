import { and, asc, eq } from "drizzle-orm";
import { db } from "~/db/client";
import { playlistSongs, playlists } from "~/db/drizzle-schema";
import type { Playlist, Song } from "~/db/schema";

// Repositorio de playlists sobre SQLite+Drizzle.

type SongRow = typeof playlistSongs.$inferSelect;
type PlaylistRow = typeof playlists.$inferSelect;

function rowToPlaylist(row: PlaylistRow, songs: Song[]): Playlist {
  return {
    id: row.id,
    title: row.title,
    favorite: row.favorite,
    lastPlayedAt: row.lastPlayedAt,
    songs,
  };
}

function rowToSong(row: SongRow): Song {
  return {
    title: row.title,
    youtubeId: row.youtubeId,
    thumbnailUrl: row.thumbnailUrl,
    type: row.type,
    duration: row.duration,
    author: { name: row.authorName, id: row.authorId },
    ...(row.albumName && row.albumId ? { album: { name: row.albumName, id: row.albumId } } : {}),
  };
}

function songToRow(song: Song, playlistId: string, position: number) {
  return {
    playlistId,
    youtubeId: song.youtubeId,
    title: song.title,
    authorName: song.author.name,
    authorId: song.author.id,
    albumName: song.album?.name ?? null,
    albumId: song.album?.id ?? null,
    thumbnailUrl: song.thumbnailUrl,
    type: song.type,
    duration: song.duration,
    position,
  };
}

export async function findAll(): Promise<Playlist[]> {
  const all = await db.select().from(playlists);
  const songRows = await db
    .select()
    .from(playlistSongs)
    .orderBy(asc(playlistSongs.playlistId), asc(playlistSongs.position));

  const songsByPlaylist = new Map<string, Song[]>();
  for (const row of songRows) {
    const song = rowToSong(row);
    const songs = songsByPlaylist.get(row.playlistId);
    if (songs) songs.push(song);
    else songsByPlaylist.set(row.playlistId, [song]);
  }

  return all.map((playlist) =>
    rowToPlaylist(playlist, songsByPlaylist.get(playlist.id) ?? []),
  );
}

export async function findSongsInPlaylist(playlistId: string): Promise<Song[]> {
  const rows = await db
    .select()
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(asc(playlistSongs.position));
  return rows.map(rowToSong);
}

export async function findPlaylistById(playlistId: string): Promise<Playlist | undefined> {
  const rows = await db.select().from(playlists).where(eq(playlists.id, playlistId));
  const p = rows[0];
  if (!p) return undefined;
  return rowToPlaylist(p, await findSongsInPlaylist(p.id));
}

export async function findPlaylistIdsBySongId(songId: string): Promise<string[]> {
  const rows = await db
    .select({ playlistId: playlistSongs.playlistId })
    .from(playlistSongs)
    .where(eq(playlistSongs.youtubeId, songId));
  return [...new Set(rows.map((r) => r.playlistId))];
}

export async function addPlaylist(playlist: Playlist): Promise<void> {
  await db.insert(playlists).values({
    id: playlist.id,
    title: playlist.title,
    favorite: playlist.favorite ?? false,
    lastPlayedAt: playlist.lastPlayedAt ?? 0,
  });
  if (playlist.songs.length > 0) {
    await db.insert(playlistSongs).values(playlist.songs.map((s, i) => songToRow(s, playlist.id, i)));
  }
}

export async function addSongToPlaylist(playlistId: string, song: Song): Promise<void> {
  const existing = await findSongsInPlaylist(playlistId);
  await db.insert(playlistSongs).values([songToRow(song, playlistId, existing.length)]);
}

export async function setSongsInPlaylist(playlistId: string, songs: Song[]): Promise<void> {
  await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, playlistId));
  if (songs.length > 0) {
    await db.insert(playlistSongs).values(songs.map((s, i) => songToRow(s, playlistId, i)));
  }
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  await db
    .delete(playlistSongs)
    .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.youtubeId, songId)));
  // Recompactar posiciones
  const remaining = await findSongsInPlaylist(playlistId);
  await setSongsInPlaylist(playlistId, remaining);
}

export async function removePlaylist(playlistId: string): Promise<void> {
  await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, playlistId));
  await db.delete(playlists).where(eq(playlists.id, playlistId));
}

export async function setFavorite(playlistId: string, favorite: boolean): Promise<void> {
  await db.update(playlists).set({ favorite }).where(eq(playlists.id, playlistId));
}

export async function touchPlaylist(playlistId: string, at = Date.now()): Promise<void> {
  await db.update(playlists).set({ lastPlayedAt: at }).where(eq(playlists.id, playlistId));
}
