import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from "react-native-track-player";
import { fetchAudioUri } from "./offline-cache";
import { getThumbnailUrl } from "~/utils/thumbnail";
import type { Song } from "~/db/schema";

// Ops finas sobre TrackPlayer. Sin imports al store (el headless service
// corre en otro isolate y usa el store directamente, ver playback-service).

let ready = false;

export async function ensurePlayer(): Promise<void> {
  if (ready) return;
  await TrackPlayer.setupPlayer();
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
  // file:// si está en offline-cache, si no streaming (TODO audio-source).
  const url = await fetchAudioUri(song.youtubeId, "lowest");
  await TrackPlayer.reset();
  await TrackPlayer.add({
    url,
    title: song.title,
    artist: song.author.name,
    album: song.album?.name,
    artwork: getThumbnailUrl(song.youtubeId),
  });
  if (autoplay) await TrackPlayer.play();
}

export const playPlayer = () => TrackPlayer.play();
export const pausePlayer = () => TrackPlayer.pause();
export const seekPlayerTo = (seconds: number) => TrackPlayer.seekTo(seconds);
export const setPlayerVolume = (level: number) => TrackPlayer.setVolume(level);
export const getPlayerPosition = () => TrackPlayer.getProgress().then((p) => p.position);
