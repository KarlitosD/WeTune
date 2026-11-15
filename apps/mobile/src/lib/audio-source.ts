// Resolución de audio en el dispositivo (InnerTube VISIONOS).
// La implementación vive en ./youtube.ts; este módulo solo fija el cliente
// por defecto para no acoplar la lógica pura a React Native.
import { createYoutubeClient, type AudioSource, type Quality, type VideoInfo } from "./youtube";

export type { AudioSource, Quality, VideoInfo } from "./youtube";
export {
  YoutubeError,
  probeAudio,
  downloadAudio,
  classifyPlayer,
  pickAudio,
  parseContentRange,
  type YoutubeErrorKind,
  type VisitorStore,
} from "./youtube";

const client = createYoutubeClient();

export async function resolveAudioSource(
  videoId: string,
  quality: Quality = "highest",
): Promise<AudioSource> {
  return client.resolve(videoId, quality);
}

export async function resolveAudioUrl(
  videoId: string,
  quality: Quality = "highest",
): Promise<string> {
  return (await client.resolve(videoId, quality)).url;
}

export async function resolveVideoInfo(videoId: string): Promise<VideoInfo> {
  return client.getVideoInfo(videoId);
}

export async function prefetchAudio(videoId: string): Promise<void> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return;
  try {
    // Calienta visitorData/DNS; no se cachea la URL firmada.
    await client.resolve(videoId, "lowest");
  } catch {
    // La precarga es best-effort.
  }
}
