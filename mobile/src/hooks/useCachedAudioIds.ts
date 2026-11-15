import { useSyncExternalStore } from "react";
import {
  getCachedAudioIdsSnapshot,
  subscribeToAudioCache,
} from "~/services/offline-cache";

// Set reactivo de audios descargados. Se invalida cuando termina una
// descarga o se elimina un archivo caché.
export function useCachedAudioIds(): ReadonlySet<string> {
  return useSyncExternalStore(subscribeToAudioCache, getCachedAudioIdsSnapshot);
}
