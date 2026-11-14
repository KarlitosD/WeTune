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
    await repo.addPlaylist(playlist);
    set({ playlists: await repo.findAll() });
  },

  removePlaylist: async (playlistId) => {
    if (playlistId === PLAYLISTS.HISTORY) return;
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (playlist) {
      for (const song of playlist.songs) {
        await get().removeSong(song, playlistId);
      }
    }
    await repo.removePlaylist(playlistId);
    if (get().actualPlaylistId === playlistId) {
      get().setActualPlaylist(PLAYLISTS.HISTORY);
    }
    set({ playlists: await repo.findAll() });
  },

  toggleFavorite: async (playlistId) => {
    const playlist = get().playlists.find((p) => p.id === playlistId);
    if (!playlist) return;
    await repo.setFavorite(playlistId, !playlist.favorite);
    set({ playlists: await repo.findAll() });
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
    set({ playlists: await repo.findAll() });
  },

  playSong: async (song, playlistId = PLAYLISTS.HISTORY) => {
    await get().addSong(song, PLAYLISTS.HISTORY);
    const history = (await repo.findPlaylistById(PLAYLISTS.HISTORY))?.songs ?? [];
    const deduped = history.filter((s) => s.youtubeId !== song.youtubeId);
    await repo.setSongsInPlaylist(PLAYLISTS.HISTORY, [song, ...deduped]);

    get().setActualPlaylist(playlistId);
    const playlist = await repo.findPlaylistById(playlistId);
    const index = playlist?.songs.findIndex((s) => s.youtubeId === song.youtubeId) ?? -1;
    if (index !== -1) get().setSelectedIndex(index);
    await repo.touchPlaylist(playlistId);
    set({ playlists: await repo.findAll() });
  },

  removeSong: async (song, playlistId) => {
    await repo.removeSongFromPlaylist(playlistId, song.youtubeId);
    const stillUsed = await repo.findPlaylistIdsBySongId(song.youtubeId);
    if (stillUsed.length === 0) await removeAudioFromCache(song.youtubeId);
    set({ playlists: await repo.findAll() });
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
