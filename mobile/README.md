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
`associatedDomains` en `app.json`). El generador de los archivos del dominio es
`scripts/generate-app-links.mjs`:

```bash
ANDROID_SHA256="AA:BB:...:FF" APPLE_TEAM_ID="XXXXXXXXXX" \
  node scripts/generate-app-links.mjs
```

- `public/.well-known/assetlinks.json` está generado con el fingerprint del
  debug keystore actual para poder probar en desarrollo; antes de publicar hay
  que añadir el SHA-256 del keystore de **release**.
- `public/.well-known/apple-app-site-association` no existe todavía: falta el
  `APPLE_TEAM_ID`.
- `wetune.app` hoy responde con un lander HTML (114 bytes), no con el build web;
  mientras siga así, ningún App Link https verificará. El scheme `wetune://`
  funciona sin nada.
- `apple-app-site-association` debe servirse con `Content-Type: application/json`
  y sin extensión.

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
- Las respuestas del backend se validan con TypeBox en `src/api/client.ts`;
  `/api/song` inválido ahora produce un error amigable en lugar de un
  `NOT NULL constraint failed` en SQLite.
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

## EAS

`eas.json` tiene los perfiles `development`, `preview` y `production`, pero
falta `eas login` + `eas init` para crear `extra.eas.projectId`. Sin esa sesión
no se pueden lanzar builds/submits cloud; por ahora el build local es
`npx expo run:android`.

## Riesgo conocido

- `react-native-track-player@5.0.0-alpha0` es un TurboModule y compila/arranca
  en RN 0.86. Los eventos remotos se registran también en el runtime principal
  como fallback del headless service (ver `app/_layout.tsx`); validar lockscreen
  y Bluetooth en un dispositivo físico antes de release.
- `expo-doctor` marca RNTP como "Unsupported on New Architecture" por metadata
  desactualizado de React Native Directory; el build real usa codegen TurboModule.
- `expo-sqlite@57.0.5` publica un AAR con `libexpo-sqlite.so` solo para
  `arm64-v8a`. `mobile/package.json` fuerza `expo.autolinking.buildFromSource`
  para compilarlo desde fuente y que funcione en emuladores x86_64.
