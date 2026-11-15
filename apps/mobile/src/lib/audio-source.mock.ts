// Mock para desarrollar UI/player (Fases 3-4) sin la implementación real.
// Uso: aliasear ~/lib/audio-source a este archivo en tsconfig o import directo
// hasta que resolveAudioUrl real exista.
import type { Quality } from "./audio-source";

export async function resolveAudioUrl(_videoId: string, _quality: Quality = "highest"): Promise<string> {
  return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
}

export async function prefetchAudio(_videoId: string): Promise<void> {
  return;
}
