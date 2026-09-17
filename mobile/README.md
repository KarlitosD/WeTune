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
- `npm run typecheck` — `tsc --noEmit` (strict + noUnusedLocals/Parameters).
- `npm run lint` — ESLint (config Expo).
- `npm run test` — Vitest (lógica pura: utils, api client, schema, audio contract).

## Deep links https

La app declara App Links (`wetune.app/share/*`, ver `intentFilters` y
`associatedDomains` en `app.json`). Falta la contraparte en el servidor web:

- `https://wetune.app/.well-known/assetlinks.json`:
  `[{"relation":["delegate_permission/common.handle_all_urls"],"target":{"namespace":"android_app","package_name":"com.wetune.dev","sha256_cert_fingerprints":["<SHA256_RELEASE_AÚN_NO_GENERADO>"]}}]`
- `https://wetune.app/.well-known/apple-app-site-association` (sin extensión):
  `{"applinks":{"apps":[],"details":[{"appID":"<TEAMID>.com.wetune.dev","paths":["/share/*"]}]}}`

Sin esos ficheros (más el SHA256 del keystore release), los links https
abren el navegador en vez de la app. El scheme `wetune://` funciona sin nada.

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
- Idioma fijo al arrancar (`expo-localization`); cambiar idioma del SO requiere
  reiniciar la app. El adapter react completo de typesafe-i18n queda para Fase 3b.
- Branding generado desde web `LogoApp.svg` (`assets/icon.png`,
  `android-icon-*.png`, `splash.png`, `favicon.png`); refinable por diseño.
- Verificado por prebuild: scheme `wetune://` en el manifest; los permisos
  `FOREGROUND_SERVICE*` del player los fusiona Gradle desde el AAR
  (no aparecen en el manifest de prebuild, es lo esperado).

## Riesgo conocido

`expo-doctor` avisa que `react-native-track-player` figura sin soporte New
Architecture en el directorio. Validar en el primer `prebuild`/dev-build;
si falla, fallback: `expo-audio` + manejo manual de background.
