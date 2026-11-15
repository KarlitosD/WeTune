// Cliente YouTube/InnerTube para el port móvil.
// Basado en docs/especificacion-youtube-downloader.md (audio-downloader):
// perfil mínimo visitorData -> player VISIONOS -> selección -> probe -> rangos.
// Sin backend: la URL se resuelve desde la IP del dispositivo.
// InnerTube no es una API pública; clientes y versiones son observaciones.

export type Quality = "highest" | "lowest";
export type FetchFn = typeof fetch;

export type AudioSource = {
  videoId: string;
  url: string;
  mimeType: string;
  bitrate: number;
  itag?: number;
  durationMs?: number;
  client: "visionos";
};

export type YoutubeErrorKind =
  | "input"
  | "visitor"
  | "bot"
  | "age"
  | "region"
  | "private"
  | "rate"
  | "live"
  | "stub"
  | "unavailable"
  | "noFormats"
  | "http"
  | "blocked"
  | "network"
  | "timeout"
  | "range"
  | "integrity";

export class YoutubeError extends Error {
  readonly kind: YoutubeErrorKind;
  readonly fatal: boolean;
  readonly status?: number;

  constructor(message: string, meta: { kind: YoutubeErrorKind; fatal?: boolean; status?: number }) {
    super(message);
    this.name = "YoutubeError";
    this.kind = meta.kind;
    this.fatal = Boolean(meta.fatal);
    this.status = meta.status;
  }
}

const API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const PLAYER_ENDPOINT = `https://www.youtube.com/youtubei/v1/player?key=${API_KEY}&prettyPrint=false`;
const VISITOR_ENDPOINT = `https://www.youtube.com/youtubei/v1/visitor_id?key=${API_KEY}&prettyPrint=false`;
const HOME_URL = "https://www.youtube.com/";
const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const WEB_VERSION = "2.20260708.00.00";
const MEDIA_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const VISITOR_TTL_MS = 30 * 60_000;
const PLAYER_TIMEOUT_MS = 15_000;
const MEDIA_TIMEOUT_MS = 30_000;
const PLAYER_RETRIES = 2;
const MEDIA_RETRIES = 5;
const CHUNK_SIZE = 2 * 1024 * 1024;

// Snapshot del perfil VISIONOS. Si YouTube lo rompe, actualizar desde
// core/src/shared/client-profiles.json del repo audio-downloader.
const VISIONOS = {
  clientName: "VISIONOS",
  clientId: 101,
  version: "1.02",
  headerAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
  bodyAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
  deviceMake: "Apple",
  deviceModel: "RealityDevice17,1",
  osName: "visionOS",
  osVersion: "26.5.23O471",
} as const;

class TimeoutError extends Error {}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw signal.reason instanceof Error ? signal.reason : new Error("Aborted");
  }
}

function abortReason(signal?: AbortSignal) {
  return signal?.reason instanceof Error ? signal.reason : new Error("Aborted");
}

function sleep(ms: number, signal?: AbortSignal) {
  throwIfAborted(signal);
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function backoff(attempt: number, retryAfter: string | null) {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    const ms = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter) - Date.now();
    if (Number.isFinite(ms)) return Math.max(0, Math.min(ms, 30_000));
  }
  return Math.min(500 * 2 ** attempt + Math.random() * 250, 10_000);
}

async function discard(response: Response) {
  try {
    await response.body?.cancel();
  } catch {
    // El cuerpo ya se consumió o el runtime no soporta cancel().
  }
}

async function request(
  fetchFn: FetchFn,
  url: string,
  init: RequestInit,
  opts: { timeoutMs?: number; retries?: number; signal?: AbortSignal } = {},
): Promise<Response> {
  const { timeoutMs = PLAYER_TIMEOUT_MS, retries = PLAYER_RETRIES, signal } = opts;
  for (let attempt = 0; ; attempt++) {
    throwIfAborted(signal);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(new TimeoutError("Request timeout")), timeoutMs);
    const onAbort = () => controller.abort(abortReason(signal));
    signal?.addEventListener("abort", onAbort, { once: true });

    try {
      const response = await fetchFn(url, { ...init, signal: controller.signal });
      if (response.status === 429 || response.status >= 500) {
        const retryAfter = response.headers.get("retry-after");
        await discard(response);
        if (attempt >= retries) {
          throw new YoutubeError(`HTTP ${response.status}`, {
            kind: response.status === 429 ? "rate" : "http",
            status: response.status,
            fatal: response.status === 429,
          });
        }
        await sleep(backoff(attempt, retryAfter), signal);
        continue;
      }
      return response;
    } catch (error) {
      if (signal?.aborted) throw abortReason(signal);
      if (error instanceof YoutubeError) throw error;
      const timedOut = controller.signal.aborted;
      if (attempt >= retries) {
        if (timedOut) throw new YoutubeError("YouTube request timed out", { kind: "timeout" });
        throw new YoutubeError((error as Error)?.message ?? "Network error", { kind: "network" });
      }
      await sleep(backoff(attempt, null), signal);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  }
}

function isHtml(response: Response) {
  return (response.headers.get("content-type") ?? "").toLowerCase().includes("text/html");
}

function playerHeaders(visitorData: string, referer: string) {
  return {
    "content-type": "application/json",
    "User-Agent": VISIONOS.headerAgent,
    "Accept-Language": "en-US,en;q=0.9",
    Origin: "https://www.youtube.com",
    Referer: referer,
    "X-YouTube-Client-Name": String(VISIONOS.clientId),
    "X-YouTube-Client-Version": VISIONOS.version,
    "X-Goog-Visitor-Id": visitorData,
  };
}

export function mediaHeaders(referer: string) {
  return {
    "User-Agent": MEDIA_UA,
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: referer,
  };
}

function decodeVisitor(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export type VisitorStore = {
  get: () => { value: string; expires: number } | null;
  set: (value: string, expires: number) => void;
  clear: () => void;
};

type PlayerFormat = {
  mimeType?: string;
  url?: string;
  bitrate?: number;
  itag?: number;
  approxDurationMs?: string;
  isDrc?: boolean;
  drmFamilies?: unknown[];
  licenseInfos?: unknown[];
  drmTrackType?: unknown;
  audioTrack?: { audioIsDefault?: boolean };
};

type PlayerResponse = {
  videoDetails?: { videoId?: string };
  playabilityStatus?: {
    status?: string;
    reason?: string;
    errorScreen?: {
      playerErrorMessageRenderer?: {
        reason?: { simpleText?: string };
        subreason?: { simpleText?: string };
      };
    };
  };
  streamingData?: {
    adaptiveFormats?: PlayerFormat[];
    formats?: PlayerFormat[];
  };
};

export type PlayerClassification =
  | { ok: true; status?: string }
  | { ok: false; kind: Exclude<YoutubeErrorKind, "input" | "http" | "network" | "timeout">; fatal: boolean; reason: string };

export function hasDrm(format: PlayerFormat) {
  return Boolean(
    (Array.isArray(format.drmFamilies) && format.drmFamilies.length) ||
      (Array.isArray(format.licenseInfos) && format.licenseInfos.length) ||
      format.drmTrackType,
  );
}

export function classifyPlayer(player: PlayerResponse, videoId: string): PlayerClassification {
  if (player.videoDetails?.videoId && player.videoDetails.videoId !== videoId) {
    return {
      ok: false,
      kind: "stub",
      fatal: true,
      reason: `YouTube devolvió el video ${player.videoDetails.videoId}`,
    };
  }

  const status = player.playabilityStatus?.status;
  const reason = String(player.playabilityStatus?.reason ?? "");
  const errorScreen = player.playabilityStatus?.errorScreen?.playerErrorMessageRenderer;
  const text = `${reason} ${errorScreen?.reason?.simpleText ?? ""} ${errorScreen?.subreason?.simpleText ?? ""}`.trim();

  if (status === "OK" || (!status && player.streamingData)) return { ok: true, status };
  if (/bot|sign in to confirm/i.test(text)) return { ok: false, kind: "bot", fatal: true, reason: text };
  if (/age/i.test(text) || status === "AGE_VERIFICATION_REQUIRED") {
    return { ok: false, kind: "age", fatal: false, reason: text };
  }
  if (/country|region|in your location/i.test(text)) {
    return { ok: false, kind: "region", fatal: false, reason: text };
  }
  if (/private/i.test(text)) return { ok: false, kind: "private", fatal: true, reason: text };
  if (/request limit|rate limit|too many requests/i.test(text)) {
    return { ok: false, kind: "rate", fatal: true, reason: text };
  }
  if (status === "LIVE_STREAM_OFFLINE") return { ok: false, kind: "live", fatal: true, reason: text };
  return { ok: false, kind: "unavailable", fatal: false, reason: text || status || "sin playabilityStatus" };
}

export function isDirectAudio(format: PlayerFormat) {
  if (typeof format.mimeType !== "string" || !format.mimeType.startsWith("audio/")) return false;
  if (typeof format.url !== "string" || !format.url || hasDrm(format)) return false;
  if (format.isDrc) return false;
  if (format.audioTrack && format.audioTrack.audioIsDefault !== true) return false;
  return true;
}

export function pickAudio(player: PlayerResponse, videoId: string, quality: Quality): AudioSource | null {
  const streaming = player.streamingData;
  if (!streaming) return null;
  const formats = [...(streaming.adaptiveFormats ?? []), ...(streaming.formats ?? [])];
  const audio = formats.filter(isDirectAudio);
  if (!audio.length) return null;

  const aac = audio.filter((format) => format.mimeType?.includes("mp4a"));
  const pool = aac.length ? aac : audio;
  pool.sort((a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0));
  const selected = quality === "lowest" ? pool[0] : pool[pool.length - 1];
  const duration = Number(selected.approxDurationMs);

  return {
    videoId,
    url: selected.url ?? "",
    mimeType: selected.mimeType?.split(";")[0] || "audio/mp4",
    bitrate: selected.bitrate ?? 0,
    itag: selected.itag,
    durationMs: Number.isFinite(duration) && duration > 0 ? duration : undefined,
    client: "visionos",
  };
}

export function parseContentRange(value: string | null) {
  const match = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(value ?? "");
  if (!match) throw new YoutubeError("Content-Range ausente o inválido", { kind: "range" });
  const start = Number(match[1]);
  const end = Number(match[2]);
  const total = match[3] === "*" ? undefined : Number(match[3]);
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    end < start ||
    (total !== undefined && (!Number.isSafeInteger(total) || total <= end))
  ) {
    throw new YoutubeError("Content-Range fuera de rango", { kind: "range" });
  }
  return { start, end, total };
}

export type YoutubeClientOptions = {
  fetchFn?: FetchFn;
  visitorStore?: VisitorStore;
};

export function createYoutubeClient(options: YoutubeClientOptions = {}) {
  const fetchFn = options.fetchFn ?? fetch;
  let memoryVisitor: { value: string; expires: number } | null = null;
  let inflightVisitor: Promise<string> | null = null;

  function readVisitor() {
    if (memoryVisitor && memoryVisitor.expires > Date.now()) return memoryVisitor.value;
    const cached = options.visitorStore?.get();
    if (cached && cached.expires > Date.now()) {
      memoryVisitor = cached;
      return cached.value;
    }
    return null;
  }

  function saveVisitor(value: string) {
    const entry = { value, expires: Date.now() + VISITOR_TTL_MS };
    memoryVisitor = entry;
    options.visitorStore?.set(value, entry.expires);
  }

  async function fetchVisitorFromApi(signal?: AbortSignal) {
    try {
      const response = await request(
        fetchFn,
        VISITOR_ENDPOINT,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "User-Agent": MEDIA_UA,
            "Accept-Language": "en-US,en;q=0.9",
            Origin: "https://www.youtube.com",
            Referer: HOME_URL,
          },
          body: JSON.stringify({
            context: {
              client: {
                clientName: "WEB",
                clientVersion: WEB_VERSION,
                hl: "en",
                gl: "US",
                timeZone: "UTC",
                utcOffsetMinutes: 0,
              },
            },
            request: { internalExperimentFlags: [], useSsl: true },
            user: { lockedSafetyMode: false },
          }),
        },
        { signal, retries: 1 },
      );
      if (!response.ok) {
        await discard(response);
        return null;
      }
      const json = (await response.json()) as { responseContext?: { visitorData?: unknown } };
      const raw = json.responseContext?.visitorData;
      return typeof raw === "string" && raw ? decodeVisitor(raw) : null;
    } catch {
      if (signal?.aborted) throw abortReason(signal);
      return null;
    }
  }

  async function fetchVisitorFromHome(signal?: AbortSignal) {
    try {
      const response = await request(
        fetchFn,
        HOME_URL,
        { headers: { "User-Agent": MEDIA_UA, "Accept-Language": "en-US,en;q=0.9" } },
        { signal, retries: 1 },
      );
      if (!response.ok) {
        await discard(response);
        return null;
      }
      const html = await response.text();
      return html.match(/visitorData\W{0,8}([A-Za-z0-9_\-=]{30,})/)?.[1] ?? null;
    } catch {
      if (signal?.aborted) throw abortReason(signal);
      return null;
    }
  }

  async function getVisitor(signal?: AbortSignal) {
    const cached = readVisitor();
    if (cached) return cached;
    if (inflightVisitor) return inflightVisitor;

    inflightVisitor = (async () => {
      const value = (await fetchVisitorFromApi(signal)) ?? (await fetchVisitorFromHome(signal));
      throwIfAborted(signal);
      if (!value) throw new YoutubeError("No se pudo obtener visitorData", { kind: "visitor", fatal: true });
      saveVisitor(value);
      return value;
    })().finally(() => {
      inflightVisitor = null;
    });

    return inflightVisitor;
  }

  async function fetchPlayer(videoId: string, visitorData: string, signal?: AbortSignal) {
    const body = {
      context: {
        client: {
          clientName: VISIONOS.clientName,
          clientVersion: VISIONOS.version,
          hl: "en",
          gl: "US",
          timeZone: "UTC",
          utcOffsetMinutes: 0,
          visitorData,
          userAgent: VISIONOS.bodyAgent,
          osName: VISIONOS.osName,
          osVersion: VISIONOS.osVersion,
          deviceMake: VISIONOS.deviceMake,
          deviceModel: VISIONOS.deviceModel,
        },
      },
      videoId,
      playbackContext: {
        contentPlaybackContext: {
          vis: 0,
          splay: false,
          lactMilliseconds: "-1",
          html5Preference: "HTML5_PREF_WANTS",
        },
      },
      contentCheckOk: true,
      racyCheckOk: true,
    };

    const response = await request(
      fetchFn,
      PLAYER_ENDPOINT,
      {
        method: "POST",
        headers: playerHeaders(visitorData, `https://www.youtube.com/watch?v=${videoId}`),
        body: JSON.stringify(body),
      },
      { signal, retries: PLAYER_RETRIES },
    );

    if (!response.ok) {
      await discard(response);
      throw new YoutubeError(`Player respondió ${response.status}`, {
        kind: response.status === 429 ? "rate" : "http",
        status: response.status,
        fatal: response.status === 429,
      });
    }
    if (isHtml(response)) {
      await discard(response);
      throw new YoutubeError("YouTube devolvió HTML (posible bloqueo)", { kind: "blocked" });
    }
    try {
      return (await response.json()) as PlayerResponse;
    } catch {
      throw new YoutubeError("Player devolvió JSON inválido", { kind: "blocked" });
    }
  }

  async function resolve(videoId: string, quality: Quality = "highest", signal?: AbortSignal) {
    if (!VIDEO_ID_RE.test(videoId)) throw new YoutubeError("Invalid videoId", { kind: "input", fatal: true });
    const visitor = await getVisitor(signal);
    const player = await fetchPlayer(videoId, visitor, signal);
    const classification = classifyPlayer(player, videoId);
    if (!classification.ok) {
      throw new YoutubeError(classification.reason || classification.kind, {
        kind: classification.kind,
        fatal: classification.fatal,
      });
    }
    const source = pickAudio(player, videoId, quality);
    if (!source) throw new YoutubeError("No hay formato de audio directo", { kind: "noFormats" });
    return source;
  }

  function invalidateVisitor() {
    memoryVisitor = null;
    options.visitorStore?.clear();
  }

  return { getVisitor, resolve, invalidateVisitor };
}

export type ProbeResult = { total: number; ranged: boolean };

export async function probeAudio(
  source: AudioSource,
  options: { fetchFn?: FetchFn; signal?: AbortSignal } = {},
): Promise<ProbeResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const response = await request(
    fetchFn,
    source.url,
    { headers: { ...mediaHeaders(`https://www.youtube.com/watch?v=${source.videoId}`), Range: "bytes=0-0" } },
    { signal: options.signal, timeoutMs: MEDIA_TIMEOUT_MS, retries: 2 },
  );
  try {
    if (response.status !== 200 && response.status !== 206) {
      throw new YoutubeError(`Probe respondió ${response.status}`, {
        kind: response.status === 403 ? "blocked" : "http",
        status: response.status,
      });
    }
    if (isHtml(response)) throw new YoutubeError("El media devolvió HTML", { kind: "blocked" });
    if (response.status === 206) {
      const range = parseContentRange(response.headers.get("content-range"));
      if (range.start !== 0 || range.end !== 0) {
        throw new YoutubeError("Probe recibió otro rango", { kind: "range" });
      }
      return { total: range.total ?? 0, ranged: range.total !== undefined };
    }
    const length = Number(response.headers.get("content-length") ?? 0);
    return { total: Number.isFinite(length) ? length : 0, ranged: false };
  } finally {
    await discard(response);
  }
}

async function fetchRange(
  fetchFn: FetchFn,
  source: AudioSource,
  start: number,
  end: number,
  total: number,
  signal?: AbortSignal,
) {
  const response = await request(
    fetchFn,
    source.url,
    {
      headers: {
        ...mediaHeaders(`https://www.youtube.com/watch?v=${source.videoId}`),
        Range: `bytes=${start}-${end}`,
      },
    },
    { signal, timeoutMs: MEDIA_TIMEOUT_MS, retries: MEDIA_RETRIES },
  );

  try {
    if (response.status !== 206) {
      throw new YoutubeError("El servidor ignoró el Range", { kind: "range", status: response.status });
    }
    if (isHtml(response)) throw new YoutubeError("El media devolvió HTML", { kind: "blocked" });
    const range = parseContentRange(response.headers.get("content-range"));
    if (range.start !== start || range.end !== end || (range.total !== undefined && range.total !== total)) {
      throw new YoutubeError("Content-Range no coincide con el rango solicitado", { kind: "range" });
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length !== end - start + 1) {
      throw new YoutubeError(`Audio incompleto: ${bytes.length} bytes, esperados ${end - start + 1}`, {
        kind: "integrity",
      });
    }
    return bytes;
  } finally {
    await discard(response);
  }
}

export type DownloadOptions = {
  fetchFn?: FetchFn;
  signal?: AbortSignal;
  // Puede devolver una promesa: el escritor de archivos debe completarse antes
  // del siguiente chunk para no perder bytes ni desordenar la escritura.
  onChunk?: (bytes: Uint8Array) => void | Promise<void>;
  onProgress?: (downloaded: number, total: number) => void;
};

/** Descarga validada: probe + chunks de 2 MiB, sin confiar en 206 a ciegas. */
export async function downloadAudio(source: AudioSource, options: DownloadOptions = {}) {
  const fetchFn = options.fetchFn ?? fetch;
  const probe = await probeAudio(source, { fetchFn, signal: options.signal });
  throwIfAborted(options.signal);

  if (!probe.ranged || probe.total <= 0) {
    const response = await request(
      fetchFn,
      source.url,
      { headers: mediaHeaders(`https://www.youtube.com/watch?v=${source.videoId}`) },
      { signal: options.signal, timeoutMs: MEDIA_TIMEOUT_MS, retries: MEDIA_RETRIES },
    );
    try {
      if (response.status !== 200) {
        throw new YoutubeError(`Descarga respondió ${response.status}`, {
          kind: response.status === 403 ? "blocked" : "http",
          status: response.status,
        });
      }
      if (isHtml(response)) throw new YoutubeError("El media devolvió HTML", { kind: "blocked" });
      const expected = response.headers.get("content-encoding")
        ? undefined
        : Number(response.headers.get("content-length") ?? 0) || undefined;
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (expected !== undefined && bytes.length !== expected) {
        throw new YoutubeError(`Audio incompleto: ${bytes.length} bytes, esperados ${expected}`, {
          kind: "integrity",
        });
      }
      await options.onChunk?.(bytes);
      options.onProgress?.(bytes.length, bytes.length);
      return bytes.length;
    } finally {
      await discard(response);
    }
  }

  let downloaded = 0;
  for (let start = 0; start < probe.total; start += CHUNK_SIZE) {
    throwIfAborted(options.signal);
    const end = Math.min(start + CHUNK_SIZE, probe.total) - 1;
    const bytes = await fetchRange(fetchFn, source, start, end, probe.total, options.signal);
    await options.onChunk?.(bytes);
    downloaded += bytes.length;
    options.onProgress?.(downloaded, probe.total);
  }
  if (downloaded !== probe.total) {
    throw new YoutubeError(`Descarga incompleta: ${downloaded}/${probe.total}`, { kind: "integrity" });
  }
  return downloaded;
}
