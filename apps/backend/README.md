# WeTune backend

API de YouTube para el cliente móvil WeTune. Nitro v3 (RC) sobre Node.

## Requisitos

- **Node.js ≥ 22.22** (mínimo de Nitro v3).
- Variables de entorno: ver `.env.example`.

## Comandos

Desde la raíz del monorepo:

- `pnpm --filter @wetune/backend dev` — servidor de desarrollo.
- `pnpm --filter @wetune/backend build` — build de producción en `.output/`.
- `pnpm --filter @wetune/backend start` — sirve el build.
- `pnpm --filter @wetune/backend test` — Vitest.
- `pnpm --filter @wetune/backend typecheck` — `tsc --noEmit` (estricto).

También existe `nitro serve`: corre desde las fuentes sin build.

Bun carga `.env` automáticamente. Con Node plano hay que pasarlo explícito:
`node --env-file=.env .output/server/index.mjs`.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto del servidor |
| `YOUTUBE_COOKIE` | Cookie de sesión de YouTube. Sin ella se usa acceso anónimo y algunas rutas fallan |
| `PO_TOKEN` | `po_token` para `/api/song/data` |
| `VISITOR_DATA` | `visitor_data` para `/api/song/data` |
| `ALLOW_ORIGINS` | Orígenes CORS (`*` por defecto) |

`.env` no se versiona. Si una credencial estuvo en git, hay que rotarla: el
historial la conserva.

## Endpoints

| Ruta | Descripción |
| --- | --- |
| `GET /api/search?query=` | `{ songs, videos }` |
| `GET /api/playlist?list=` | Playlist con canciones |
| `GET /api/song?songId=` | Metadatos de una canción |
| `GET /api/song/data?songId=` | Streaming data vía `youtubei.js` |
| `GET /api/song/blob?songId=&quality=` | Audio (`highest` / `lowest`, con caché en disco) |
| `POST /api/song/blob?songId=&quality=` | Sube un audio (`audioBlob` en multipart) |

El audio se guarda en `.data/songs_tmp` (driver `fsLite` de `unstorage`, montado
como `kv.songs` en `nitro.config.ts`).

## Arquitectura

- `server/api/` y `server/routes/` son rutas escaneadas por Nitro.
- `server/services/` se importa explícitamente (v3 no tiene auto-imports).
- El contrato de la API vive en `@wetune/contracts`; `server/schema/index.ts`
  solo lo re-exporta.
