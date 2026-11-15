# App Links y share (`wetune.app`)

Artefactos de despliegue del dominio, separados de la app Expo. No forman parte
del bundle móvil: el dominio `wetune.app` los sirve y la app los consulta al
abrir links `https://wetune.app/share/...`.

## Generar

```bash
ANDROID_SHA256="AA:BB:...:FF" \
  node app-links/scripts/generate-app-links.mjs
```

- `ANDROID_SHA256`: SHA-256 del keystore de **release** (EAS o local). Para
  probar un build debug se puede añadir también el fingerprint del debug
  keystore, separado por coma, pero **nunca debe ser el único**.

El generador escribe `app-links/.well-known/assetlinks.json`. iOS no es un
target del proyecto, así que no se genera AASA.

> No versionar esos archivos generados solo con el fingerprint de debug. La
> identidad de release es obligatoria; el generador debe ejecutarse con ella
> antes de publicar.

## Publicar

1. Generar los archivos con la identidad de release y desplegar el contenido de
   `app-links/.well-known/` en el dominio que usa `apps/mobile/app.json`
   (`wetune.app`).
2. `assetlinks.json` debe responder `200` con `application/json`.
3. Verificar Android:

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

El share de la app ahora usa `wetune://share/song?songId=...`; no depende de este
landing. Para receptores sin la app instalada, el sitio https sigue pendiente.

## Bloqueos actuales (2026-11-14)

- No hay archivos de asociación versionados: falta la identidad de release.
- `https://wetune.app/.well-known/assetlinks.json` devuelve el lander HTML del
  dominio (114 bytes), no el archivo.
- No hay SHA-256 del keystore de release de Expo (el `release.jks` de Tauri usaba
  una contraseña no disponible y queda fuera del repo; hay que rotarlo).
- No hay sesión de EAS (`eas whoami` → not logged in).
- El sitio de share no existe; el dominio no está sirviendo el build web (ya no
  hay build web en esta rama).
