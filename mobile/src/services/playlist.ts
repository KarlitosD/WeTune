import { and, asc, desc, eq, gt, lt, sql } from "drizzle-orm";
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
  const last = await db
    .select({ position: playlistSongs.position })
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, playlistId))
    .orderBy(desc(playlistSongs.position))
    .limit(1);
  const nextPosition = (last[0]?.position ?? -1) + 1;
  await db.insert(playlistSongs).values([songToRow(song, playlistId, nextPosition)]);
}

// Mueve la canción al inicio sin reescribir toda la playlist: desplaza una
// sola vez las posiciones que quedan debajo de la fila existente.
export async function prependSongToPlaylist(playlistId: string, song: Song): Promise<void> {
  db.transaction((tx) => {
    const existing = tx
      .select({ position: playlistSongs.position })
      .from(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.youtubeId, song.youtubeId)))
      .all();
    const position = existing[0]?.position;

    if (position === undefined) {
      tx.update(playlistSongs)
        .set({ position: sql`${playlistSongs.position} + 1` })
        .where(eq(playlistSongs.playlistId, playlistId))
        .run();
    } else {
      tx.update(playlistSongs)
        .set({ position: sql`${playlistSongs.position} + 1` })
        .where(
          and(
            eq(playlistSongs.playlistId, playlistId),
            lt(playlistSongs.position, position),
          ),
        )
        .run();
      tx.delete(playlistSongs)
        .where(
          and(
            eq(playlistSongs.playlistId, playlistId),
            eq(playlistSongs.youtubeId, song.youtubeId),
          ),
        )
        .run();
    }

    tx.insert(playlistSongs).values([songToRow(song, playlistId, 0)]).run();
  });
}

export async function removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
  db.transaction((tx) => {
    const existing = tx
      .select({ position: playlistSongs.position })
      .from(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.youtubeId, songId)))
      .all();
    const position = existing[0]?.position;
    if (position === undefined) return;

    tx.delete(playlistSongs)
      .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.youtubeId, songId)))
      .run();
    tx.update(playlistSongs)
      .set({ position: sql`${playlistSongs.position} - 1` })
      .where(
        and(
          eq(playlistSongs.playlistId, playlistId),
          gt(playlistSongs.position, position),
        ),
      )
      .run();
  });
}

export async function findSongPosition(
  playlistId: string,
  songId: string,
): Promise<number | undefined> {
  const rows = await db
    .select({ position: playlistSongs.position })
    .from(playlistSongs)
    .where(and(eq(playlistSongs.playlistId, playlistId), eq(playlistSongs.youtubeId, songId)));
  return rows[0]?.position;
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
