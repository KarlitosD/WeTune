# WeTune Mobile (React Native + Expo, SDK 58)

Cliente único de WeTune. La API vive en `apps/backend` y se reutiliza
(`EXPO_PUBLIC_API_URL`). La web/Tauri y el target Android de Tauri se retiraron;
no hay migración de datos porque no hubo usuarios previos.

## Requisitos

- **No funciona en Expo Go.** Usa módulos nativos (`react-native-track-player`,
  `react-native-mmkv`, `expo-sqlite`, `expo-file-system`) → development build:
  `pnpm --filter wetune-mobile android` o EAS
  (`eas build --profile development`).

## Env

Copiar `.env.example` a `.env`:

- `EXPO_PUBLIC_API_URL` — backend Nitro.
- `EXPO_PUBLIC_WEB_URL` — base pública de los links de share.

## Scripts

Desde la raíz del monorepo: `pnpm --filter wetune-mobile <script>`.

- `start` — Metro.
- `android` / `ios` — dev build local (requiere Android SDK / Xcode).
- `typecheck` — `tsc --noEmit` (strict + noUnusedLocals/Parameters).
  TypeScript queda en 6.0.x: es la última que soporta `typescript-eslint`.
- `lint` — ESLint (config Expo, ESLint 9: la 10 aún rompe
  `eslint-plugin-react`).
- `test` — Vitest (lógica pura: utils, api client, schema, audio contract).
- `i18n` — regenera `src/i18n/i18n-types.ts` tras cambiar las traducciones en `en/` o `es/`.

## Deep links https

La app declara App Links (`wetune.app/share/*`, ver `intentFilters` y
`associatedDomains` en `app.json`). El generador vive en el proyecto de
artefactos de dominio y se ejecuta desde la raíz del repo:

```bash
ANDROID_SHA256="AA:BB:...:FF" APPLE_TEAM_ID="XXXXXXXXXX" \
  node app-links/scripts/generate-app-links.mjs
```

- No hay `assetlinks.json`/AASA versionados: el generador exige el SHA-256 del
  keystore de **release** y el `APPLE_TEAM_ID`. El fingerprint de debug solo
  sirve para pruebas locales y no debe ser el único.
- El output queda en `app-links/.well-known/`; está ignorado por git.
- `wetune.app` hoy responde con un lander y no sirve los archivos de asociación;
  mientras siga así, ningún App Link https verificará. El scheme `wetune://`
  funciona sin nada.
- El share público (`/share/song`) todavía no tiene sitio. Ver
  `app-links/README.md`.
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
  `Paths.document/audios` (índice en MMKV). Va a Documents, no a Cache, para que
  el SO no purgue las descargas.
- `src/services/playback.ts` pasa a TrackPlayer el `User-Agent` y `Referer` que
  exige el media URL; sin ellos ExoPlayer recibe 403.
- Test real opcional:
  `YOUTUBE_INTEGRATION=1 npx vitest run src/lib/youtube.integration.test.ts`.

Si YouTube rompe VISIONOS, actualizar el perfil desde
`core/src/shared/client-profiles.json` del repo `audio-downloader`. InnerTube
no es una API estable; este perfil no resuelve firmas ni PO Tokens.

## Notas de implementación

- Playlists: `src/store/usePlaylistStore.ts` (HISTORY, dedup, unshift,
  `setRandom`).
- Persistencia: `expo-sqlite + drizzle` (`src/db/`, `src/services/playlist.ts`).
- DB local v2: `playlists.favorite` y `playlists.last_played_at`.
  `migrateIfNeeded()` en `src/db/client.ts` agrega las columnas a una DB v1 sin
  perder datos.
- Las respuestas del backend se validan con Zod en `src/api/client.ts`;
  `/api/song` inválido produce un error amigable en lugar de un
  `NOT NULL constraint failed` en SQLite.
- Playback: `react-native-track-player@5.0.0-alpha0` + headless service
  (`src/services/playback-service.ts`); `package.json#main` debe ser `index.ts`
  para registrarlo antes de que arranque el player.
- Offline: `expo-file-system` (`Paths.document/audios`) + índice en MMKV, con
  descarga por rangos validados (no `downloadFileAsync` a ciegas).
- Settings/index: MMKV (`src/store/storage.ts`).
- Menús: `ActionMenu` (bottom-sheet) y `Modal`.
- Sin slider de volumen en UI (botones hardware del SO); el nivel persiste igual.
- Idioma fijo al arrancar (`expo-localization`); cambiar idioma del SO requiere
  reiniciar la app. El adapter react completo de typesafe-i18n queda para Fase 3b.
- Branding: `brand/icon.svg` y `brand/icon.png`; los assets de la app están en
  `assets/` (`icon.png`, `android-icon-*.png`, `splash.png`, `favicon.png`).
- Verificado por prebuild: scheme `wetune://` en el manifest; los permisos
  `FOREGROUND_SERVICE*` del player los fusiona Gradle desde el AAR
  (no aparecen en el manifest de prebuild, es lo esperado).

## EAS y release

`eas.json` tiene los perfiles `development`, `preview` y `production`, pero
falta `eas login` + `eas init` para crear `extra.eas.projectId`. Sin esa sesión
no se pueden lanzar builds/submits cloud; por ahora el build local es
`npx expo run:android`.

Pendientes antes de publicar:

- Keystore de release nuevo y applicationId final (hoy `com.wetune.dev`).
- App Links desplegados en `wetune.app`.
- Sitio mínimo de share.
- Build/test iOS.
- QA de dispositivo: lockscreen/Bluetooth, descargas, share.

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
