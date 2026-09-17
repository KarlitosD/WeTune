import { Directory, File, Paths } from "expo-file-system";
import { mmkv } from "~/store/storage";
import { resolveAudioUrl, type Quality } from "~/lib/audio-source";

// Puerto de web ~/services/cache (Cache API "audios" + ReactiveSet en
// localStorage) a expo-file-system + MMKV.
// NOTE: addAudioToCache/fetchAudioUri lanzan el TODO de audio-source
// hasta que la nueva implementación cliente exista. removeAudioFromCache
// y existsAudioInCache funcionan desde ya.

const CACHE_KEY = "audioCached";

function readIndex(): string[] {
  try {
    return JSON.parse(mmkv.getString(CACHE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  mmkv.set(CACHE_KEY, JSON.stringify(ids));
}

function audioDir(): Directory {
  const dir = new Directory(Paths.cache, "audios");
  if (!dir.exists) dir.create();
  return dir;
}

function audioFile(id: string): File {
  return new File(audioDir(), `${id}.m4a`);
}

export function existsAudioInCache(id: string): boolean {
  return readIndex().includes(id);
}

export function listCachedAudioIds(): string[] {
  return readIndex();
}

/** file:// local si está descargado, si no resuelve streaming (TODO). */
export async function fetchAudioUri(id: string, quality: Quality = "lowest"): Promise<string> {
  const file = audioFile(id);
  if (existsAudioInCache(id) && file.exists) return file.uri;
  return resolveAudioUrl(id, quality);
}

export async function addAudioToCache(id: string, quality: Quality = "highest"): Promise<string> {
  if (existsAudioInCache(id) && audioFile(id).exists) return audioFile(id).uri;
  const url = await resolveAudioUrl(id, quality);
  const file = await File.downloadFileAsync(url, audioFile(id));
  writeIndex([...readIndex(), id]);
  return file.uri;
}

export async function removeAudioFromCache(id: string): Promise<void> {
  const file = audioFile(id);
  if (file.exists) file.delete();
  writeIndex(readIndex().filter((cached) => cached !== id));
}
