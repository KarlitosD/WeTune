# App Links (`/.well-known`)

Estos archivos los sirve el dominio web (`wetune.app`), no la app móvil.

## Generar

```bash
ANDROID_SHA256="AA:BB:...:FF" \
APPLE_TEAM_ID="XXXXXXXXXX" \
node scripts/generate-app-links.mjs
```

- `ANDROID_SHA256`: SHA-256 del keystore de **release** (EAS o local). Para
  probar un build debug se puede añadir también el fingerprint del debug
  keystore, separado por coma, pero **nunca debe ser el único**.
- `APPLE_TEAM_ID`: Team ID de Apple. Sin él, el script omite la AASA y iOS no
  abre links `https`.

> No versionar `assetlinks.json` ni `apple-app-site-association` generados solo
> con el fingerprint de debug. La identidad de release es obligatoria; el
> generador debe ejecutarse con ella antes de publicar.

## Publicar

1. Generar los archivos con la identidad de release y desplegar
   `public/.well-known/*` en el dominio que usa `mobile/app.json`
   (`wetune.app`).
2. `assetlinks.json` debe responder `200` con `application/json`.
3. `apple-app-site-association` debe responder `200` con
   `application/json` **sin extensión**.
4. Verificar Android:

   ```bash
   adb shell pm get-app-links com.wetune.dev
   ```

   El estado debe ser `verified`.

## Bloqueos actuales (2026-11-14)

- No hay archivos de asociación versionados: falta la identidad de release.
- `https://wetune.app/.well-known/assetlinks.json` devuelve el lander HTML del
  dominio (114 bytes), no el archivo. El dominio no está sirviendo el build web.
- No hay SHA-256 del keystore de release de Expo (el `release.jks` de Tauri usa
  una contraseña no disponible en el repo).
- No hay `APPLE_TEAM_ID` ni sesión de EAS (`eas whoami` → not logged in).
