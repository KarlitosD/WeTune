# WeTune

Cliente de música personal para crear playlists desde YouTube, escucharlas y
guardarlas offline. Esta rama es **Expo-only**: la app móvil es el único cliente
del producto.

El backend es externo (`/api/...`); este repo contiene la app, los artefactos de
App Links y el branding.

## Estructura

| Ruta | Qué contiene |
| --- | --- |
| `mobile/` | App React Native + Expo Router, SQLite/Drizzle, MMKV, TrackPlayer |
| `app-links/` | Generador y README de `.well-known` + plan del share web |
| `brand/` | Fuente del logo/icono |
| `.github/workflows/mobile.yml` | Typecheck, lint, tests y export Android |

La app no usa Expo Go: requiere un **development build** por los módulos nativos
(`react-native-track-player`, `react-native-mmkv`, `expo-sqlite`,
`expo-file-system`).

## Desarrollo

```bash
cd mobile
npm ci
npm start
```

En otra terminal, con un emulador/dispositivo:

```bash
cd mobile
npm run android   # o npm run ios en macOS
```

Checks:

```bash
cd mobile
npm run typecheck
npm run lint
npm test
npm run i18n      # tras cambiar en/ o es/
```

Variables públicas en `mobile/.env`:

- `EXPO_PUBLIC_API_URL`: backend Nitro.
- `EXPO_PUBLIC_WEB_URL`: base de los links de share.

No pongas secretos en variables `EXPO_PUBLIC_*`: se bundlean en la app.

## App Links y share

Los archivos de asociación se generan aparte y se despliegan en `wetune.app`:

```bash
ANDROID_SHA256="AA:BB:...:FF" \
APPLE_TEAM_ID="XXXXXXXXXX" \
node app-links/scripts/generate-app-links.mjs
```

Ver [app-links/README.md](app-links/README.md). El share público
(`/share/song`) todavía no tiene sitio; es un bloqueo de release.

## Estado

- La app Expo cubre playlists, búsqueda, detalle, player, descargas, share,
  i18n, offline, rediseño, chips (Todas/Recientes/Favoritas/Descargadas),
  schema v2 y “Add songs”.
- La versión Tauri/web y el target Android de Tauri fueron retirados de esta
  rama. El desktop ya no es un target.
- No hay migración de datos: no había usuarios previos.
- Release pendiente: EAS, keystore, applicationId final, App Links, sitio de
  share y metadata de stores.

Más detalle: [mobile/README.md](mobile/README.md),
[docs/expo-migration.md](docs/expo-migration.md) y [AGENTS.md](AGENTS.md).
