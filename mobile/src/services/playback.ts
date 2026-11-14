import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player";
import { fetchAudioUri } from "./offline-cache";
import { getThumbnailUrl } from "~/utils/thumbnail";
import { mediaHeaders } from "~/lib/youtube";
import type { Song } from "~/db/schema";

// Ops finas sobre TrackPlayer. Sin imports al store (el headless service
// corre en otro isolate y usa el store directamente, ver playback-service).

let ready = false;

export async function ensurePlayer(): Promise<void> {
  if (ready) return;
  try {
    await TrackPlayer.setupPlayer();
  } catch (error) {
    // El headless playback service comparte el player nativo ya inicializado
    // por la UI: setupPlayer rechaza con este código y debe continuar.
    if ((error as { code?: string })?.code !== "player_already_initialized") throw error;
  }
  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
      Capability.SeekTo,
    ],
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    progressUpdateEventInterval: 1,
  });
  ready = true;
}

export async function loadSong(song: Song, autoplay = true): Promise<void> {
  await ensurePlayer();
  // file:// si está en offline-cache, si no streaming (fetchYT on-device).
  const url = await fetchAudioUri(song.youtubeId, "lowest");
  const headers = mediaHeaders(`https://www.youtube.com/watch?v=${song.youtubeId}`);
  const { "User-Agent": userAgent, ...httpHeaders } = headers;
  await TrackPlayer.reset();
  await TrackPlayer.add({
    url,
    title: song.title,
    artist: song.author.name,
    album: song.album?.name,
    artwork: getThumbnailUrl(song.youtubeId),
    // ExoPlayer debe enviar el mismo UA/Referer que usó el probe de fetchYT.
    userAgent,
    headers: httpHeaders,
  });
  if (autoplay) await TrackPlayer.play();
}

export const playPlayer = () => TrackPlayer.play();
export const pausePlayer = () => TrackPlayer.pause();
export const seekPlayerTo = (seconds: number) => TrackPlayer.seekTo(seconds);
export const setPlayerVolume = (level: number) => TrackPlayer.setVolume(level);
export const getPlayerPosition = () => TrackPlayer.getProgress().then((p) => p.position);
