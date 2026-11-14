# Migración a Expo-only

## Decisión

La app Expo es el único cliente. El desktop/Tauri y el frontend Solid/Vite se
retiraron de esta rama. No hay usuarios previos, así que **no hay migración de
datos ni sync**.

## Qué se retiró

- `src/` (SolidJS/Vite), `index.html`, `vite.config.ts`, `tsconfig.json`.
- `src-tauri/` completo, incluido `src-tauri/gen/android` y el `release.jks`
  trackeado.
- `public/`, salvo el branding y el README de App Links, que se movieron a
  `brand/` y `app-links/`.
- Root `package.json`, `bun.lock`, `.typesafe-i18n.json` y el toolchain web.
- `mobile/src/components/PlaylistCard.tsx` (sin uso).

Se conservaron:

- `mobile/` completo.
- `app-links/` (generador + README).
- `brand/icon.svg`, `brand/icon.png`, `brand/icon-transparent.png`.
- `.github/workflows/mobile.yml`.

## Revisión del audio Tauri

El resolver de Tauri (`src-tauri/src/youtube.rs`) se comparó con
`mobile/src/lib/youtube.ts`. En general **el cliente móvil es superior**:

- Usa `visitorData` + perfil VISIONOS y refresca el visitor.
- Valida `Content-Range`, tamaño total y bytes escritos; descarga en chunks de
  2 MiB.
- Tiene backoff/retry, timeout de operación y una taxonomía de errores
  (bot, age, region, rate, blocked, range, integrity).
- Escribe a archivo con validación de tamaño; no acumula el audio entero en
  memoria.

Cosas que se portearon o evaluaron:

- **Portado:** las descargas ahora van a `Paths.document/audios` en vez de
  `Paths.cache/audios`. El SO puede purgar Cache; el cache de Tauri vivía en
  app data y era durable.
- **No portado:** soporte de cookie manual. Requiere una UI de ajustes y
  almacenamiento seguro; VISIONOS cubre el caso normal. Revisar si aparece
  contenido age-restricted.
- **No portado:** fallback multi-cliente (IOS/ANDROID/TV) del Rust. Esos
  perfiles son más viejos, no usan visitor y el flujo VISIONOS actual está más
  validado. Revisar solo si VISIONOS se rompe.
- **Pendiente menor:** el cliente Tauri usaba un timeout HTTP global de 30 s.
  En mobile solo el picker tiene abort/timeout explícito; el resto depende del
  fetch. Se puede agregar un timeout común si aparecen cuelgues.

No hay features de UI del desktop que se pierdan: el desktop no es target y el
share público es un artefacto de despliegue, no una pantalla de la app.

## Firma Android

`src-tauri/gen/android/app/release.jks` estaba trackeado. Se eliminó del árbol y
se agregó `*.jks` al `.gitignore`, pero **sigue en el historial de git**. Si ese
keystore se usó para publicar `com.wetune.dev`, hay que rotarlo y decidir si el
applicationId de Expo se mantiene o cambia. La contraseña no estaba disponible.

## Pendientes de release

1. EAS: login, `extra.eas.projectId`, keystore de release y applicationId final.
2. App Links: generar con identidad de release y desplegar
   `app-links/.well-known/*` en `wetune.app`.
3. Share público: sitio mínimo para `/share/song` o app links verificados +
   fallback. Hoy el dominio devuelve un lander.
4. iOS: build/test vía EAS (no hay macOS local).
5. QA de dispositivo: lockscreen/Bluetooth, descargas offline, share y
   actualizaciones.
6. Stores: metadata, privacy policy y capturas.

## Estado de la rama

Los cambios están sin commitear. Antes de abrir un PR conviene separar:

- rediseño/chips/schema v2/Add songs;
- retiro Tauri/web y limpieza de docs;
- fix de cache durable;
- configuración de i18n mobile.
