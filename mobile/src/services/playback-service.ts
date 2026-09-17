import TrackPlayer, { Event } from "react-native-track-player";
import { usePlayerStore } from "~/store/usePlayerStore";
import { usePlaylistStore } from "~/store/usePlaylistStore";

// Headless playback service (lockscreen / BT / app kill).
// Registrado en index.ts top-level. Autocontenido: rehidrata SQLite/MMKV
// porque en el isolate headless el estado en memoria está vacío.
async function withHydrated(fn: () => Promise<void> | void) {
  try {
    const pl = usePlaylistStore.getState();
    if (!pl.hydrated) await pl.hydrate();
    await usePlayerStore.getState().init();
    await fn();
  } catch (e) {
    console.error("[playback-service]", e);
  }
}

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => void withHydrated(() => usePlayerStore.getState().play()));
  TrackPlayer.addEventListener(Event.RemotePause, () => void withHydrated(() => usePlayerStore.getState().pause()));
  TrackPlayer.addEventListener(Event.RemoteNext, () => void withHydrated(() => usePlayerStore.getState().handleNext()));
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    void withHydrated(() => usePlayerStore.getState().handlePrevious()),
  );
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) =>
    void withHydrated(() => usePlayerStore.getState().seek(e.position)),
  );
  TrackPlayer.addEventListener(Event.RemoteStop, () => void withHydrated(() => usePlayerStore.getState().pause()));
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () =>
    void withHydrated(() => usePlayerStore.getState().handleQueueEnded()),
  );
}

export default playbackService;
