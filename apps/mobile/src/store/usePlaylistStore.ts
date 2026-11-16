import { create } from "zustand";
import { PLAYLISTS } from "~/consts";
import type { Playlist, Song } from "~/db/schema";
import * as repo from "~/services/playlist";
import { removeAudioFromCache } from "~/services/offline-cache";
import { mmkv } from "./storage";

// Estado de playlists con Zustand. SQLite es la fuente de verdad;
// actualPlaylistId y selectedIndex persisten en MMKV.

const K_ACTUAL = "actualPlaylistId";
const K_INDEX = "selectedIndex";

// Evita doble seed de HISTORY si hydrate() corre en paralelo
// (layout + headless service al arrancar).
let hydratePromise: Promise<void> | null = null;

type PlaylistStore = {
  playlists: Playlist[];
  actualPlaylistId: string;
  selectedIndex: number;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  addPlaylist: (playlist: Playlist) => Promise<void>;
  removePlaylist: (playlistId: string) => Promise<void>;
  toggleFavorite: (playlistId: string) => Promise<void>;
  setActualPlaylist: (playlistId: string) => void;
  setSelectedIndex: (index: number) => void;
  setRandom: () => void;
  addSong: (song: Song, playlistId: string) => Promise<void>;
  removeSong: (song: Song, playlistId: string) => Promise<void>;
  playSong: (song: Song, playlistId?: string) => Promise<void>;

  actualPlaylist: () => Playlist | undefined;
  selectedSong: () => Song | undefined;
  nextSong: () => Song | undefined;
  hasNext: () => boolean;
  hasPrevious: () => boolean;
};

export const usePlaylistStore = create<PlaylistStore>()((set, get) => ({
  playlists: [],
  actualPlaylistId: mmkv.getString(K_ACTUAL) ?? PLAYLISTS.HISTORY,
  selectedIndex: mmkv.getNumber(K_INDEX) ?? 0,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return Promise.resolve();
    hydratePromise ??= (async () => {
      let playlists = await repo.findAll();
      if (playlists.length === 0) {
        await repo.addPlaylist({ id: PLAYLISTS.HISTORY, title: "Recents", songs: [] });
        playlists = await repo.findAll();
      }
      const actualExists = playlists.some((p) => p.id === get().actualPlaylistId);
      set({
        playlists,
        hydrated: true,
        actualPlaylistId: actualExists ? get().actualPlaylistId : PLAYLISTS.HISTORY,
      });
    })().finally(() => {
      hydratePromise = null;
    });
    return hydratePromise;
  },

  addPlaylist: async (playlist) => {
    const previous = get().playlists.find((p) => p.id === playlist.id);
    await repo.addPlaylist(playlist);

    const nextPlaylist = {
      ...playlist,
      favorite: playlist.favorite ?? previous?.favorite ?? false,
      lastPlayedAt: playlist.lastPlayedAt ?? previous?.lastPlayedAt ?? 0,
    };
    set({
      playlists: previous
        ? get().playlists.map((p) => (p.id === playlist.id ? nextPlaylist : p))
        : [...get().playlists, nextPlaylist],
    });

    if (!previous) return;

    // Reimportar pudo quitar canciones: se libera su audio solo si ninguna
    // otra playlist lo sigue usando.
    const nextSongIds = new Set(playlist.songs.map((song) => song.youtubeId));
    for (const song of previous.songs) {
      if (nextSongIds.has(song.youtubeId)) continue;
      const stillUsed = await repo.findPlaylistIdsBySongId(song.youtubeId);
      if (stillUsed.length === 0) await removeAudioFromCache(song.youtubeId);
    }
  },

  removePlaylist: async (playlistId) => {
    if (playlistId === PLAYLISTS.HISTORY) return;
    const playlist = get().playlists.find((p) => p.id === playlistId);
    const songs = playlist?.songs ?? [];

    // Una sola operación borra playlist + canciones; después se libera el
    // audio solo si ninguna otra playlist lo sigue usando.
    await repo.removePlaylist(playlistId);
    for (const song of songs) {
      const stillUsed = await repo.findPlaylistIdsBySongId(song.youtubeId);
      if (stillUsed.length === 0) await removeAudioFromCache(song.youtubeId);
    }

    if (get().actualPlaylistId === playlistId) {
      get().setActualPlaylist(PLAYLISTS.HISTORY);
    }
    set({ playlists: get().playlists.filter((p) => p.id !== playlistId) });
  },

  toggleFavorite: async (playlistId) => {
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    const favorite = !playlist.favorite;
    await repo.setFavorite(playlistId, favorite);
    set({
      playlists: get().playlists.map((p) =>
        p.id === playlistId ? { ...p, favorite } : p,
      ),
    });
  },

  setActualPlaylist: (playlistId) => {
    mmkv.set(K_ACTUAL, playlistId);
    set({ actualPlaylistId: playlistId });
  },

  setSelectedIndex: (index) => {
    mmkv.set(K_INDEX, index);
    set({ selectedIndex: index });
  },

  setRandom: () => {
    const songs = get().actualPlaylist()?.songs ?? [];
    if (songs.length === 0) return;
    let next: number;
    do {
      next = Math.trunc(songs.length * Math.random());
    } while (songs.length > 1 && next === get().selectedIndex);
    get().setSelectedIndex(next);
  },

  addSong: async (song, playlistId) => {
    if (!playlistId || !song) throw new Error("PlaylistId and song are required");
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (playlist?.songs.some((s) => s.youtubeId === song.youtubeId)) return;
    await repo.addSongToPlaylist(playlistId, song);
    set({
      playlists: get().playlists.map((p) =>
        p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p,
      ),
    });
  },

  playSong: async (song, playlistId = PLAYLISTS.HISTORY) => {
    await get().addSong(song, PLAYLISTS.HISTORY);
    const history = get().playlists.find((p) => p.id === PLAYLISTS.HISTORY)?.songs ?? [];
    const deduped = history.filter((s) => s.youtubeId !== song.youtubeId);
    await repo.prependSongToPlaylist(PLAYLISTS.HISTORY, song);

    const playedAt = Date.now();
    get().setActualPlaylist(playlistId);
    const index = await repo.findSongPosition(playlistId, song.youtubeId);
    if (index !== undefined) get().setSelectedIndex(index);
    await repo.touchPlaylist(playlistId, playedAt);

    // Se actualiza solo lo que cambió: historial y lastPlayedAt. Las demás
    // playlists conservan su referencia, así las filas memoiceadas no
    // se re-renderizan.
    set({
      playlists: get().playlists.map((p) => {
        const isHistory = p.id === PLAYLISTS.HISTORY;
        const isPlayed = p.id === playlistId;
        if (!isHistory && !isPlayed) return p;
        return {
          ...p,
          ...(isHistory ? { songs: [song, ...deduped] } : {}),
          ...(isPlayed ? { lastPlayedAt: playedAt } : {}),
        };
      }),
    });
  },

  removeSong: async (song, playlistId) => {
    await repo.removeSongFromPlaylist(playlistId, song.youtubeId);
    const stillUsed = await repo.findPlaylistIdsBySongId(song.youtubeId);
    if (stillUsed.length === 0) await removeAudioFromCache(song.youtubeId);
    set({
      playlists: get().playlists.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter((s) => s.youtubeId !== song.youtubeId) }
          : p,
      ),
    });
  },

  actualPlaylist: () => get().playlists.find((p) => p.id === get().actualPlaylistId),

  // El índice persistido puede quedar fuera de rango al borrar canciones;
  // se clamp-ea aquí para no dejar la UI sin canción aunque haya.
  selectedSong: () => {
    const songs = get().actualPlaylist()?.songs ?? [];
    if (songs.length === 0) return undefined;
    return songs[Math.min(Math.max(get().selectedIndex, 0), songs.length - 1)];
  },

  nextSong: () => {
    const songs = get().actualPlaylist()?.songs ?? [];
    const i = Math.min(Math.max(get().selectedIndex, 0), Math.max(songs.length - 1, 0));
    return get().hasNext() ? songs[i + 1] : undefined;
  },

  hasNext: () => {
    const songs = get().actualPlaylist()?.songs ?? [];
    const i = Math.min(Math.max(get().selectedIndex, 0), Math.max(songs.length - 1, 0));
    return Boolean(songs[i + 1]);
  },

  hasPrevious: () => {
    const songs = get().actualPlaylist()?.songs ?? [];
    const i = Math.min(Math.max(get().selectedIndex, 0), Math.max(songs.length - 1, 0));
    return Boolean(songs[i - 1]);
  },
}));
