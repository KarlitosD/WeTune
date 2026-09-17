// PLACEHOLDER - Fase 4/5 la implementan después del port.
// Contrato con el resto de la app (player, offline-cache):
//  - Debe resolverse SIEMPRE desde la IP del dispositivo (nunca backend,
//    YouTube bloquea datacenters y las URLs van firmadas por IP).
//  - Devuelve una URL reproducible por TrackPlayer:
//    remota (streaming) o file:// local (offline).

export type Quality = "highest" | "lowest";

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

export async function resolveAudioUrl(videoId: string, quality: Quality = "highest"): Promise<string> {
  if (!YOUTUBE_ID_RE.test(videoId)) throw new Error("Invalid videoId");
  void quality;
  // TODO: tu nueva implementación cliente aquí.
  throw new Error(`[TODO audio] resolveAudioUrl not implemented: ${videoId}`);
}

export async function prefetchAudio(videoId: string): Promise<void> {
  if (!YOUTUBE_ID_RE.test(videoId)) return;
  // TODO opcional: precarga del nextSong. No-op por ahora.
  return;
}
