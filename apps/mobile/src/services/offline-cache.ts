import { Directory, File, FileMode, Paths } from "expo-file-system";
import { mmkv } from "~/store/storage";
import { downloadAudio, resolveAudioSource, type Quality } from "~/lib/audio-source";

// Descargas offline en expo-file-system + índice en MMKV.
// Van a Documents, no a Cache: el SO puede purgar Cache y el usuario pierde
// sus descargas. addAudioToCache/fetchAudioUri dependen de audio-source.

const CACHE_KEY = "audioCached";

// Una sola descarga por canción. Dos escritores sobre el mismo archivo (p. ej.
// tocar "Descargar" en dos pantallas a la vez) producen un archivo truncado.
const inFlight = new Map<string, Promise<string>>();

// El índice se lee en cada render de filas y pantallas. Se cachea el Set
// parseado y solo se reconstruye si cambió el string crudo de MMKV; así el
// runtime headless sigue viendo escrituras del runtime principal.
let parsedRaw: string | null = null;
let parsedIds = new Set<string>();

function readIndex(): Set<string> {
  const raw = mmkv.getString(CACHE_KEY) ?? "[]";
  if (raw === parsedRaw) return parsedIds;
  try {
    parsedIds = new Set(JSON.parse(raw) as string[]);
  } catch {
    parsedIds = new Set();
  }
  parsedRaw = raw;
  return parsedIds;
}

type AudioCacheListener = () => void;

const listeners = new Set<AudioCacheListener>();
let cacheVersion = 0;
let cachedSnapshot: ReadonlySet<string> | null = null;
let snapshotVersion = -1;

function notifyAudioCacheChanged() {
  cacheVersion += 1;
  cachedSnapshot = null;
  listeners.forEach((listener) => listener());
}

export function subscribeToAudioCache(listener: AudioCacheListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCachedAudioIdsSnapshot(): ReadonlySet<string> {
  if (cachedSnapshot === null || snapshotVersion !== cacheVersion) {
    // El índice solo se escribe después de validar la descarga; leerlo
    // alcanza y evita un stat de filesystem por cada canción descargada.
    cachedSnapshot = new Set(readIndex());
    snapshotVersion = cacheVersion;
  }
  return cachedSnapshot;
}

function writeIndex(ids: string[]) {
  const unique = [...new Set(ids)];
  const raw = JSON.stringify(unique);
  mmkv.set(CACHE_KEY, raw);
  parsedRaw = raw;
  parsedIds = new Set(unique);
  notifyAudioCacheChanged();
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
  return readIndex().has(id) && audioFile(id).exists;
}

export function listCachedAudioIds(): string[] {
  return [...readIndex()].filter((id) => audioFile(id).exists);
}

/** file:// local si está descargado, si no resuelve streaming. */
export async function fetchAudioUri(id: string, quality: Quality = "lowest"): Promise<string> {
  const file = audioFile(id);
  if (existsAudioInCache(id)) return file.uri;
  const source = await resolveAudioSource(id, quality);
  return source.url;
}

export function addAudioToCache(id: string, quality: Quality = "highest"): Promise<string> {
  if (existsAudioInCache(id)) return Promise.resolve(audioFile(id).uri);

  const current = inFlight.get(id);
  if (current) return current;

  const task = downloadToCache(id, quality).finally(() => {
    inFlight.delete(id);
  });
  inFlight.set(id, task);
  return task;
}

// Descarga a un archivo .part y solo lo publica (move) después de validar el
// tamaño. Así el índice y `audios/<id>.m4a` nunca apuntan a una descarga
// incompleta, y un fallo no deja un archivo a medio escribir con el nombre
// definitivo.
async function downloadToCache(id: string, quality: Quality): Promise<string> {
  const source = await resolveAudioSource(id, quality);
  const part = new File(audioDir(), `${id}.m4a.part`);
  if (part.exists) part.delete();
  part.create();

  const handle = part.open(FileMode.WriteOnly);
  let total: number;
  try {
    // writeBytes es async y el handle no garantiza el orden de operaciones
    // concurrentes: downloadAudio espera a que cada chunk se escriba entero
    // antes de pedir el siguiente.
    total = await downloadAudio(source, {
      onChunk: (bytes) => handle.writeBytes(bytes),
    });
  } catch (error) {
    try {
      handle.close();
    } catch {
      // El handle pudo quedar inválido a mitad de la escritura.
    }
    try {
      part.delete();
    } catch {
      // El archivo parcial puede no existir.
    }
    throw error;
  }
  handle.close();

  const written = part.size;
  if (written !== total) {
    try {
      part.delete();
    } catch {
      // El archivo parcial puede no existir.
    }
    throw new Error(`[audio] archivo incompleto: ${written}/${total} bytes`);
  }

  const file = audioFile(id);
  if (file.exists) file.delete();
  await part.move(file, { overwrite: true });
  writeIndex([...readIndex(), id]);
  return file.uri;
}

export async function removeAudioFromCache(id: string): Promise<void> {
  const file = audioFile(id);
  if (file.exists) file.delete();
  writeIndex([...readIndex()].filter((cached) => cached !== id));
}
