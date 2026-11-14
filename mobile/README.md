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

## Audio

Implementado en `src/lib/youtube.ts` siguiendo el perfil mínimo de la
especificación de `audio-downloader`: `visitorData` → player VISIONOS →
selección AAC (descarta DRC/DRM/pistas no default) → probe `Range: bytes=0-0` →
descarga por chunks de 2 MiB con validación estricta de `Content-Range` y
tamaño. Todo se resuelve desde la IP del dispositivo; no pasa por el backend.

- Streaming: `resolveAudioSource` devuelve la URL directa de `googlevideo`.
- Offline: `downloadAudio` escribe el archivo validado con `FileHandle` en
  `Paths.cache/audios` (índice en MMKV).
- `src/services/playback.ts` pasa a TrackPlayer el `User-Agent` y `Referer` que
  exige el media URL; sin ellos ExoPlayer recibe 403.
- Test real opcional:
  `YOUTUBE_INTEGRATION=1 npx vitest run src/lib/youtube.integration.test.ts`.

Si YouTube rompe VISIONOS, actualizar el perfil desde
`core/src/shared/client-profiles.json` del repo `audio-downloader`. InnerTube
no es una API estable; este perfil no resuelve firmas ni PO Tokens.

## Notas de port

- `context/playlist.tsx` → `src/store/usePlaylistStore.ts` (misma lógica:
  HISTORY, dedup, unshift, `setRandom`).
- `SignalDB/IndexedDB` → `expo-sqlite + drizzle` (`src/db/`, `src/services/playlist.ts`).
- `HTMLAudio + MediaSession` → `react-native-track-player@5.0.0-alpha0` + headless
  service (`src/services/playback-service.ts`); `package.json#main` debe ser
  `index.ts` para registrarlo antes de que arranque el player.
- `Cache API` → `expo-file-system` (`Paths.cache/audios`) + índice en MMKV,
  con descarga por rangos validados (no `downloadFileAsync` a ciegas).
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

- `react-native-track-player@5.0.0-alpha0` es un TurboModule y compila/arranca
  en RN 0.86, pero los controles remotos/lockscreen (play/pause vía MediaSession
  y headless service) no quedaron verificados en el emulador. Validar en
  dispositivo físico antes de release.
- `expo-doctor` sigue marcando RNTP como "Unsupported on New Architecture" por
  metadata desactualizado de React Native Directory; el build real usa codegen
  TurboModule.
- Quedan 6 paquetes Expo con patch desactualizado (`npx expo install --check`).
