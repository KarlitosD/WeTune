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
| `GET /api/song/blob?songId=&quality=` | **Legacy**: audio (`highest` / `lowest`, con caché) |
| `POST /api/song/blob?songId=&quality=` | **Legacy**: sube un audio (`audioBlob` en multipart) |

Las rutas `/api/song/blob` son legacy: la app móvil resuelve el audio en el
dispositivo (`apps/mobile/src/lib/youtube.ts`) y no las usa. Se conservan para
clientes viejos. Responden con `X-WeTune-Deprecated: song-blob`.

El caché `kv.songs` depende del entorno (`nitro.config.ts`): `fsLite` en
`.data/songs_tmp` en local o en un host con disco, y `memory` en Vercel porque
el filesystem serverless no es persistente.

## Deploy en Vercel

El backend vive en el monorepo, así que el proyecto de Vercel apunta a este
repositorio (rama `feat/nitro-v3` o `main` una vez mergeado), no al repo viejo.

1. **Add New → Project → Import** el repositorio.
2. **Root Directory**: `apps/backend`.
3. Activá **Include files outside of the Root Directory in the Build Step**
   (necesario para el workspace pnpm).
4. **Framework Preset**: Other. Node.js 22.x (≥ 22.22).
5. Variables de entorno: `YOUTUBE_COOKIE`, `PO_TOKEN`, `VISITOR_DATA` y,
   opcionalmente, `ALLOW_ORIGINS`.
6. Deploy. `apps/backend/vercel.json` ya define install/build con
   `NITRO_PRESET=vercel`; el output queda en `apps/backend/.vercel/output`
   (Build Output API, no configurar Output Directory).

Validación rápida:

```bash
curl "https://<deploy>/api/song?songId=d7woYjGWs6k"
curl "https://<deploy>/api/search?query=daft%20punk"
```

Después actualizá `EXPO_PUBLIC_API_URL` en `apps/mobile/.env` (y en el entorno
de EAS si es una build de release). En Vercel el KV de `/api/song/blob` es en
memoria; si en el futuro esa ruta necesita persistencia, cambiar el driver de
`kv.songs` a un storage externo.

## Arquitectura

- `server/api/` y `server/routes/` son rutas escaneadas por Nitro.
- `server/services/` se importa explícitamente (v3 no tiene auto-imports).
- El contrato de la API vive en `@wetune/contracts`; `server/schema/index.ts`
  solo lo re-exporta.
