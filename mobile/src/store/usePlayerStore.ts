import { create } from "zustand";
import { getDictionary } from "~/i18n";
import {
  ensurePlayer,
  getPlayerPosition,
  loadSong,
  pausePlayer,
  playPlayer,
  seekPlayerTo,
  setPlayerVolume,
} from "~/services/playback";
import { addAudioToCache } from "~/services/offline-cache";
import { usePlaylistStore } from "./usePlaylistStore";
import { toast } from "./useToastStore";
import { mmkv } from "./storage";

// Estado del player (playing/volume²/loop/shuffle/
// seek/preload/download) a Zustand + TrackPlayer. Sin elemento <audio>:
// el progreso se lee con useProgress() en la UI, aquí solo settings+acciones.

export type RepeatState = "NONE" | "ONE" | "ALL";

const K_VOLUME = "volume";
const K_LAST_VOLUME = "lastVolumeLevel";
const K_LOOP = "loop";
const K_SHUFFLE = "shuffle";

let loadedYoutubeId: string | null = null;
let playerReady = false;

type PlayerStore = {
  playing: boolean;
  volume: number;
  loop: RepeatState;
  shuffle: boolean;
  downloading: boolean;
  expanded: boolean;

  init: () => Promise<void>;
  setExpanded: (v: boolean) => void;
  playSelected: () => Promise<void>;
  ensureSelectionLoaded: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleQueueEnded: () => Promise<void>;
  handleDownload: () => Promise<void>;
};

async function loadCurrent(autoplay: boolean): Promise<boolean> {
  const song = usePlaylistStore.getState().selectedSong();
  if (!song) return false;
  await loadSong(song, autoplay);
  loadedYoutubeId = song.youtubeId;
  return true;
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  playing: false,
  volume: mmkv.getNumber(K_VOLUME) ?? 1,
  loop: (mmkv.getString(K_LOOP) as RepeatState) ?? "NONE",
  shuffle: mmkv.getBoolean(K_SHUFFLE) ?? false,
  downloading: false,
  expanded: false,

  init: async () => {
    if (playerReady) return;
    await ensurePlayer();
    await setPlayerVolume((get().volume || 1) ** 2);
    playerReady = true;
  },

  setExpanded: (v) => set({ expanded: v }),

  playSelected: async () => {
    await get().init();
    if (await loadCurrent(true)) set({ playing: true });
  },

  // Primera carga al abrir la app: deja la pista lista en pausa.
  ensureSelectionLoaded: async () => {
    const song = usePlaylistStore.getState().selectedSong();
    if (!song || loadedYoutubeId === song.youtubeId) return;
    await get().init();
    await loadCurrent(false);
  },

  play: async () => {
    await get().init();
    const song = usePlaylistStore.getState().selectedSong();
    if (!song && loadedYoutubeId === null) return;
    if (song && loadedYoutubeId !== song.youtubeId) {
      if (!(await loadCurrent(false))) return;
    }
    await playPlayer();
    set({ playing: true });
  },

  pause: async () => {
    await pausePlayer();
    set({ playing: false });
  },

  togglePlay: async () => {
    const { playing } = get();
    if (playing) await get().pause();
    else await get().play();
  },

  seek: async (seconds) => {
    await seekPlayerTo(seconds);
  },

  toggleLoop: () => {
    const next = get().loop === "NONE" ? "ALL" : get().loop === "ALL" ? "ONE" : "NONE";
    mmkv.set(K_LOOP, next);
    set({ loop: next, shuffle: false });
    mmkv.set(K_SHUFFLE, false);
  },

  toggleShuffle: () => {
    const next = !get().shuffle;
    mmkv.set(K_SHUFFLE, next);
    set({ shuffle: next, ...(next ? { loop: "NONE" as RepeatState } : {}) });
    if (next) mmkv.set(K_LOOP, "NONE");
  },

  toggleMute: () => {
    const volume = get().volume;
    const last = mmkv.getNumber(K_LAST_VOLUME) ?? 0;
    mmkv.set(K_VOLUME, last);
    mmkv.set(K_LAST_VOLUME, volume);
    set({ volume: last });
    void setPlayerVolume((last || 0) ** 2);
  },

  setVolume: (v) => {
    mmkv.set(K_VOLUME, v);
    set({ volume: v });
    void setPlayerVolume(v ** 2);
  },

  handleNext: async () => {
    const pl = usePlaylistStore.getState();
    if (!pl.selectedSong()) return;
    if (get().shuffle) pl.setRandom();
    else if (pl.hasNext()) pl.setSelectedIndex(pl.selectedIndex + 1);
    else pl.setSelectedIndex(0);
    if (await loadCurrent(true)) set({ playing: true });
  },

  handlePrevious: async () => {
    const pl = usePlaylistStore.getState();
    if (!pl.selectedSong()) return;
    let position = 0;
    try {
      position = await getPlayerPosition();
    } catch {
      position = 0;
    }
    if (pl.hasPrevious() && position < 10) {
      pl.setSelectedIndex(pl.selectedIndex - 1);
      await loadCurrent(true);
    } else {
      await seekPlayerTo(0);
      await playPlayer();
    }
    set({ playing: true });
  },

  handleQueueEnded: async () => {
    const pl = usePlaylistStore.getState();
    if (!pl.selectedSong()) return;
    const loop = get().loop;
    if (loop === "ONE") {
      await seekPlayerTo(0);
      await playPlayer();
      set({ playing: true });
      return;
    }
    if (pl.hasNext()) {
      await get().handleNext();
    } else if (loop === "NONE") {
      await pausePlayer();
      await seekPlayerTo(0);
      set({ playing: false });
    } else {
      pl.setSelectedIndex(0);
      await loadCurrent(true);
      set({ playing: true });
    }
  },

  handleDownload: async () => {
    const song = usePlaylistStore.getState().selectedSong();
    if (!song || get().downloading) return;
    set({ downloading: true });
    const t = getDictionary();
    try {
      await addAudioToCache(song.youtubeId, "highest");
      toast.success(t.DOWNLOAD_STARTED.replace("{song}", song.title));
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      set({ downloading: false });
    }
  },
}));
