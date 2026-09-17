# WeTune Mobile (React Native + Expo, SDK 57)

Port de la web SolidJS/Tauri. El backend Nitro **no** se migra: se reutiliza
(`EXPO_PUBLIC_API_URL`).

## Requisitos

- **No funciona en Expo Go.** Usa módulos nativos (`react-native-track-player`,
  `react-native-mmkv`, `expo-sqlite`) → development build:
  `npx expo run:android` / `npx expo run:ios` o EAS (`eas build --profile development`).

## Env

Copiar `.env.example` a `.env`:

- `EXPO_PUBLIC_API_URL` — backend Nitro (igual que `VITE_API_URL` en web).
- `EXPO_PUBLIC_WEB_URL` — web pública para links `/share/song`.

## Scripts

- `npm start` — Metro.
- `npm run android/ios` — dev build local (requiere Android SDK / Xcode).
- `npm run typecheck` — `tsc --noEmit`.

## Audio (placeholder)

`src/lib/audio-source.ts::resolveAudioUrl` lanza `TODO` a posta: la descarga
debe salir desde la IP del dispositivo (YouTube bloquea datacenters y las
URLs van firmadas por IP). Para desarrollar UI usar
`src/lib/audio-source.mock.ts` (MP3 de prueba).

Cuando exista la implementación real, nada más cambia: player
(`src/store/usePlayerStore.ts`), offline-cache
(`src/services/offline-cache.ts`) y pantallas ya dependen del contrato.

## Notas de port

- `context/playlist.tsx` → `src/store/usePlaylistStore.ts` (misma lógica:
  HISTORY, dedup, unshift, `setRandom`).
- `SignalDB/IndexedDB` → `expo-sqlite + drizzle` (`src/db/`, `src/services/playlist.ts`).
- `HTMLAudio + MediaSession` → `react-native-track-player` + headless service
  (`src/services/playback-service.ts`, registrado en `index.ts`).
- `Cache API` → `expo-file-system` (`Paths.cache/audios`) + índice en MMKV.
- `localStorage/createPersistedSignal` → MMKV (`src/store/storage.ts`).
- `DaisyUI Dropdown/dialog` → `ActionMenu` (bottom-sheet) y `Modal`.
- Sin slider de volumen en UI (botones hardware del SO); el nivel persiste igual.

## Riesgo conocido

`expo-doctor` avisa que `react-native-track-player` figura sin soporte New
Architecture en el directorio. Validar en el primer `prebuild`/dev-build;
si falla, fallback: `expo-audio` + manejo manual de background.
