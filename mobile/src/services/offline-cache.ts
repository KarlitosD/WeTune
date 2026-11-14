import { Directory, File, FileMode, Paths } from "expo-file-system";
import { mmkv } from "~/store/storage";
import { downloadAudio, resolveAudioSource, type Quality } from "~/lib/audio-source";

// Descargas offline en expo-file-system + índice en MMKV.
// Van a Documents, no a Cache: el SO puede purgar Cache y el usuario pierde
// sus descargas. addAudioToCache/fetchAudioUri dependen de audio-source.

const CACHE_KEY = "audioCached";

function readIndex(): string[] {
  try {
    return JSON.parse(mmkv.getString(CACHE_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeIndex(ids: string[]) {
  mmkv.set(CACHE_KEY, JSON.stringify([...new Set(ids)]));
}

function audioDir(): Directory {
  const dir = new Directory(Paths.document, "audios");
  if (!dir.exists) dir.create();
  return dir;
}

function audioFile(id: string): File {
  return new File(audioDir(), `${id}.m4a`);
}

export function existsAudioInCache(id: string): boolean {
  return readIndex().includes(id) && audioFile(id).exists;
}

export function listCachedAudioIds(): string[] {
  return readIndex().filter((id) => audioFile(id).exists);
}

/** file:// local si está descargado, si no resuelve streaming. */
export async function fetchAudioUri(id: string, quality: Quality = "lowest"): Promise<string> {
  const file = audioFile(id);
  if (existsAudioInCache(id)) return file.uri;
  const source = await resolveAudioSource(id, quality);
  return source.url;
}

export async function addAudioToCache(id: string, quality: Quality = "highest"): Promise<string> {
  if (existsAudioInCache(id)) return audioFile(id).uri;
  const source = await resolveAudioSource(id, quality);
  const file = audioFile(id);
  if (file.exists) file.delete();
  file.create();
  const handle = file.open(FileMode.WriteOnly);
  try {
    const total = await downloadAudio(source, {
      onChunk: (bytes) => handle.writeBytes(bytes),
    });
    if (file.size !== total) {
      throw new Error(`[audio] archivo incompleto: ${file.size}/${total} bytes`);
    }
  } catch (error) {
    try {
      file.delete();
    } catch {
      // El archivo parcial puede no existir.
    }
    throw error;
  } finally {
    handle.close();
  }
  writeIndex([...readIndex(), id]);
  return file.uri;
}

export async function removeAudioFromCache(id: string): Promise<void> {
  const file = audioFile(id);
  if (file.exists) file.delete();
  writeIndex(readIndex().filter((cached) => cached !== id));
}
