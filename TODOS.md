# WeTune — TODOs

## Hecho en esta rama

- [x] Cliente Expo único; retiro de Solid/Vite/Tauri y de Tauri Android.
- [x] Rediseño de las 3 vistas (playlists, búsqueda, detalle) + player.
- [x] Mini player arriba de las tabs.
- [x] Chips Todas / Recientes / Favoritas / Descargadas.
- [x] Schema SQLite v2 con migración (`favorite`, `last_played_at`).
- [x] “Add songs” desde el detalle con picker.
- [x] Descargas offline en `Paths.document` (durables).
- [x] `npm run i18n` y tipos generados para mobile.

## Release (bloqueante)

- [ ] EAS: `eas login`, `eas init` / `extra.eas.projectId`.
- [ ] Keystore de release nuevo; rotar el `release.jks` viejo y purgar del
      historial si corresponde.
- [ ] Definir `applicationId`/bundle ID final (hoy `com.wetune.dev`).
- [ ] Generar App Links con identidad de release y desplegar
      `app-links/.well-known/*` en `wetune.app`.
- [ ] Sitio mínimo de share en `/share/song` (portada/título + abrir app).
- [ ] Build iOS + QA en dispositivo (lockscreen, Bluetooth, descargas, share).
- [ ] Metadata de stores, privacy policy y capturas.
- [ ] Actualizar CI para builds nativos (no solo `expo export`).

## Producto

- [ ] Renombrar playlists.
- [ ] Sincronizar playlist importada de YouTube (detectar altas/bajas).
- [ ] Distinguir playlist local vs importada.
- [ ] Virtual playlist / estado de shuffle correcto y autoplay futuro.
- [ ] Preload del siguiente tema.
- [ ] Ajuste de cookies para contenido age-restricted (solo si hace falta).
- [ ] Evaluar timeout HTTP global y fallback multi-cliente si VISIONOS se rompe.

## Mantenimiento

- [ ] Comentarios de `mobile/src` que aún dicen “puerto de web”: limpiar cuando
      se toque cada archivo.
- [ ] Revisar el `.env` raíz viejo (`VITE_*`, cookie de YouTube) y borrarlo.
- [ ] No reintroducir web/Tauri sin decisión de producto.
