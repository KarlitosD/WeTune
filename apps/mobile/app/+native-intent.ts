import type { NativeIntent } from "expo-router";

// TrackPlayer abre la app con intents propios para la notificación de
// reproducción (`trackplayer://notification.click`) y para despertar el
// servicio (`trackplayer://service-bound`). No son rutas de la app: si se
// resuelven como path, Expo Router cae en +not-found. Devolver null deja la
// navegación donde estaba (o en la ruta inicial si la app estaba cerrada).
const TRACKPLAYER_SCHEME = "trackplayer://";

export const redirectSystemPath: NativeIntent["redirectSystemPath"] = ({ path }) =>
  path.startsWith(TRACKPLAYER_SCHEME) ? null : path;
