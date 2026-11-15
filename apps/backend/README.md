# WeTune backend

API de YouTube para el cliente móvil WeTune. Nitro + Bun.

## Requisitos

- Node.js 22 o superior (o Bun 1.3+ como runner).
- Variables de entorno: ver `.env.example`.

## Comandos

- `bun install` — instala dependencias.
- `bun run dev` — servidor de desarrollo.
- `bun run build` — build de producción en `.output/`.
- `bun run start` — sirve el build (`node .output/server/index.mjs`).

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

El audio se guarda en `.data/songs_tmp` (driver `fsLite` de Nitro storage).
