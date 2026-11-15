# Migración a Nitro v3

Análisis verificado el 2026-11-14 sobre el backend real. La migración **no se ha
aplicado**: este documento es la guía para hacerla después del movimiento al
monorepo.

Rutas actuales: `wetune-backend/server/...`. Después del monorepo:
`apps/backend/server/...`. Los cambios son los mismos.

## Estado de v3

| Paquete | `latest` | Fecha |
| --- | --- | --- |
| `nitropack` (v2) | 2.13.6 | 2026-11-02 |
| `nitro` (v3) | 3.0.261103-rc | 2026-11-03 |

- v3 se anunció como **Release Candidate** el 2026-10-29. `latest` publica una
  RC con versiones fechadas, no una estable.
- El paquete se renombra: `nitropack` → `nitro`.
- v2 sigue mantenido; 2.13.6 incluye tres parches de seguridad.

**Conclusión:** la migración es viable hoy, pero introduce una dependencia
prerelease. No es urgente.

## Prueba realizada

Se copió el backend a `/tmp` y se migró allí, sin tocar el repo:

- `nitro@3.0.261103-rc` + `rolldown@1.3.2`.
- `nitro build` → OK, 1.39 MB (269 kB gzip).
- `node .output/server/index.mjs`:
  - `GET /` → 200 con el HTML.
  - `GET /api/song?songId=bad` → 400 `{"error":"invalid_song"}`.
  - `OPTIONS /api/search` → 204 con los cinco headers CORS.
- Alias `~/services/player` resuelto sin configurar nada.

## Cambios necesarios

Nueve archivos. Ninguno cambia el contrato de la API.

| Archivo | Cambio |
| --- | --- |
| `nitro.config.ts` | `defineNitroConfig` → `defineConfig`; `srcDir` → `serverDir`; `storage` → `kv`; se quitan `imports` y `esbuild` |
| `server/api/playlist.ts` | imports explícitos; `toWebRequest(event)` → `event.req` |
| `server/api/search.ts` | idem |
| `server/api/song/index.ts` | idem |
| `server/api/song/data.ts` | idem; `useRuntimeConfig` → `process.env` |
| `server/api/song/blob.get.ts` | `useStorage` → `useKV`; `setHeaders` desde `nitro/h3` |
| `server/api/song/blob.post.ts` | `useStorage` → `useKV` |
| `server/middleware/cors.ts` | `event.method` → `event.req.method`; `defineHandler` |
| `server/routes/index.ts` | `defineHandler` |

### Config

```ts
// antes
export default defineNitroConfig({
  srcDir: "server",
  imports: { dirs: ["./server/services"] },
  storage: { songs: { driver: "fsLite", base: "./.data/songs_tmp" } },
  esbuild: { options: { target: "esnext" } },
  compatibilityDate: "2024-12-03",
})

// después
import { defineConfig } from "nitro"

export default defineConfig({
  serverDir: "./server",
  kv: {
    songs: { driver: "fsLite", base: "./.data/songs_tmp" },
  },
  compatibilityDate: "2024-12-03",
})
```

### Handler típico

```ts
import { defineHandler } from "nitro"
import { getSong } from "../../services/youtube"

export default defineHandler(async (event) => {
  const req = event.req // antes: await toWebRequest(event)
  // ...
  return Response.json(song)
})
```

Puntos clave:

- Los **auto-imports desaparecen**. `defineEventHandler`, `toWebRequest`,
  `useStorage`, `setHeaders`, `setResponseHeaders`, `setResponseStatus` y los
  servicios de `imports.dirs` pasan a imports explícitos.
- `useStorage` sigue existiendo como alias deprecado en `nitro/storage`; se usa
  `useKV` desde `nitro/kv`.
- `setHeaders`, `setResponseHeaders` y `setResponseStatus` siguen disponibles en
  `nitro/h3`, así que los handlers que solo ponen headers casi no cambian.

## Lo que no cambia

- `server/api/`, `server/routes/` y `server/middleware/` se siguen escaneando.
- `blob.get.ts` y `blob.post.ts` siguen mapeando al mismo path y método; no hay
  que renombrar archivos.
- El alias `~/...`.
- El formato de las respuestas y las URLs de la API (el cliente móvil no se
  entera).
- `node .output/server/index.mjs` para arrancar.

## Requisitos antes de migrar

1. **Node ≥ 22.22** en runtime, CI y VPS. Local hay 26.
2. **`rolldown` en devDependencies.** Sin builder, `nitro dev` corre desde
   fuentes pero `build` lo instala on-demand; en CI no instala nada.
3. **`unstorage` en dependencies** si se usa `kv`/`fsLite`. Mismo motivo.
4. **Fijar la versión exacta** de `nitro` (sin `^`): las RCs cambian seguido.
5. Opcional: `"type": "module"` en `package.json`, para evitar el warning de
   `nitro.config.ts` sin tipo de módulo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Churn de RCs fechadas | pin exacto + renovar manualmente |
| Runtime del VPS < 22.22 | verificar nixpacks/host antes de desplegar |
| `tsc --noEmit` no lo cubre `nitro build` | gate explícito en CI |
| `fsLite` no se probó de punta a punta | subir y leer un blob en staging |
| `nitro dev` sin builder no se probó | probarlo en la rama de migración |

## Plan de ejecución

1. Rama propia (`feat/nitro-v3`), sin mezclar con el monorepo ni con Zod.
2. Aplicar los nueve cambios de la tabla.
3. `bunx nitro build` y `bunx tsc --noEmit`.
4. Runtime: `/`, `/api/song?songId=bad` y preflight CORS.
5. Subir y leer un blob de `.data/songs_tmp` para validar `fsLite`.
6. Desplegar en staging con Node ≥ 22.22 antes de producción.
7. Si algo falla: revertir la rama. `nitropack` v2 no se toca hasta que v3
   esté estable y desplegado.

## Referencias

- Guía oficial: <https://nitro.build/guide/migration>
- Anuncio del RC: <https://nitro.build/blog/v3-rc>
