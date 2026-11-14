# App Links y share (`wetune.app`)

Artefactos de despliegue del dominio, separados de la app Expo. No forman parte
del bundle móvil: el dominio `wetune.app` los sirve y la app los consulta al
abrir links `https://wetune.app/share/...`.

## Generar

```bash
ANDROID_SHA256="AA:BB:...:FF" \
APPLE_TEAM_ID="XXXXXXXXXX" \
node app-links/scripts/generate-app-links.mjs
```

- `ANDROID_SHA256`: SHA-256 del keystore de **release** (EAS o local). Para
  probar un build debug se puede añadir también el fingerprint del debug
  keystore, separado por coma, pero **nunca debe ser el único**.
- `APPLE_TEAM_ID`: Team ID de Apple. Sin él, el script omite la AASA y iOS no
  abre links `https`.

El generador escribe `app-links/.well-known/assetlinks.json` y, si hay team ID,
`app-links/.well-known/apple-app-site-association`.

> No versionar esos archivos generados solo con el fingerprint de debug. La
> identidad de release es obligatoria; el generador debe ejecutarse con ella
> antes de publicar.

## Publicar

1. Generar los archivos con la identidad de release y desplegar el contenido de
   `app-links/.well-known/` en el dominio que usa `mobile/app.json`
   (`wetune.app`).
2. `assetlinks.json` debe responder `200` con `application/json`.
3. `apple-app-site-association` debe responder `200` con
   `application/json` **sin extensión**.
4. Verificar Android:

   ```bash
   adb shell pm get-app-links com.wetune.dev
   ```

   El estado debe ser `verified`.

## Share web

La app maneja el deep link `wetune://share/song?songId=...` y también el path
`/share/song`. Para receptores sin la app instalada hace falta una página
mínima en `wetune.app/share/song` que:

1. lea `songId`;
2. consulte `GET /api/song?songId=...` del backend;
3. muestre portada, título y artista;
4. ofrezca “Abrir en WeTune” (App Link) y un fallback a la tienda.

No se implementó todavía. Mientras tanto, `EXPO_PUBLIC_WEB_URL` apunta a un
dominio que hoy devuelve un lander, así que compartir canciones no tiene una
página pública útil.

## Bloqueos actuales (2026-11-14)

- No hay archivos de asociación versionados: falta la identidad de release.
- `https://wetune.app/.well-known/assetlinks.json` devuelve el lander HTML del
  dominio (114 bytes), no el archivo.
- No hay SHA-256 del keystore de release de Expo (el `release.jks` de Tauri usaba
  una contraseña no disponible y queda fuera del repo; hay que rotarlo).
- No hay `APPLE_TEAM_ID` ni sesión de EAS (`eas whoami` → not logged in).
- El sitio de share no existe; el dominio no está sirviendo el build web (ya no
  hay build web en esta rama).
