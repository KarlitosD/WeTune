import { createMMKV } from "react-native-mmkv";

// Reemplaza localStorage + createPersistedSignal de la web.
// MMKV v4 (Nitro): createMMKV() en vez de new MMKV().
export const mmkv = createMMKV({ id: "wetune" });
