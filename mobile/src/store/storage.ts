import { createMMKV } from "react-native-mmkv";
import { createJSONStorage, type StateStorage } from "zustand/middleware";

// Reemplaza localStorage + createPersistedSignal de la web.
// MMKV v4 (Nitro): createMMKV() en vez de new MMKV().
export const mmkv = createMMKV({ id: "wetune" });

const mmkvStorage: StateStorage = {
  setItem: (key, value) => mmkv.set(key, value),
  getItem: (key) => mmkv.getString(key) ?? null,
  removeItem: (key) => mmkv.remove(key),
};

export const persistedMmkvStorage = createJSONStorage(() => mmkvStorage);
