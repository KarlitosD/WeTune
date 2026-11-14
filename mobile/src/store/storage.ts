import { createMMKV } from "react-native-mmkv";

// Persistencia local con MMKV.
// MMKV v4 (Nitro): createMMKV() en vez de new MMKV().
export const mmkv = createMMKV({ id: "wetune" });
