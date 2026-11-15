# WeTune

Cliente de música personal para crear playlists desde YouTube, escucharlas y
guardarlas offline. Monorepo con la app móvil (Expo) y la API (Nitro).

## Estructura

| Ruta | Qué contiene |
| --- | --- |
| `apps/mobile/` | App React Native + Expo Router, SQLite/Drizzle, MMKV, TrackPlayer |
| `apps/backend/` | API Nitro: búsqueda, playlists, metadatos y audio de YouTube |
| `packages/` | Paquetes compartidos del workspace (vacío por ahora) |
| `app-links/` | Generador y README de `.well-known` + plan del share web |
| `brand/` | Fuente del logo/icono |

El workspace usa **pnpm** y **Turborepo**. Ver [docs/monorepo.md](docs/monorepo.md).

La app no usa Expo Go: requiere un **development build** por los módulos nativos
(`react-native-track-player`, `react-native-mmkv`, `expo-sqlite`,
`expo-file-system`).

## Desarrollo

```bash
pnpm install
pnpm dev          # Metro + API en paralelo
```

O por separado:

```bash
pnpm --filter wetune-mobile start
pnpm --filter @wetune/backend dev
```

En otra terminal, con un emulador/dispositivo:

```bash
pnpm --filter wetune-mobile android   # o ios en macOS
```

Checks:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm --filter wetune-mobile i18n      # tras cambiar en/ o es/
```

## Variables de entorno

App (`apps/mobile/.env`), solo públicas:

- `EXPO_PUBLIC_API_URL`: URL del backend.
- `EXPO_PUBLIC_WEB_URL`: base de los links de share.

Backend (`apps/backend/.env`), secretas y nunca versionadas:

- `YOUTUBE_COOKIE`, `PO_TOKEN`, `VISITOR_DATA`, `ALLOW_ORIGINS`, `PORT`.
- Ver `apps/backend/.env.example`.

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

Más detalle: [apps/mobile/README.md](apps/mobile/README.md),
[docs/expo-migration.md](docs/expo-migration.md), [docs/monorepo.md](docs/monorepo.md)
y [AGENTS.md](AGENTS.md).
