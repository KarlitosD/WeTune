import type { Song } from "~/db/schema";

// Deep link propio de la app. No depende de wetune.app ni de App Links.
const SHARE_URL = "wetune://share/song";

export type ShareLinkParams = {
  songId?: string | string[];
  title?: string | string[];
  author?: string | string[];
  duration?: string | string[];
  type?: string | string[];
};

// El link viaja con la metadata de la canción para que quien lo abre no
// dependa de /api/song (el backend desplegado puede estar viejo y responder
// canciones parciales). Los links viejos, con solo songId, siguen usando la API.
export function shareUrlFor(
  song: Pick<Song, "youtubeId" | "title" | "author" | "duration" | "type">,
) {
  const params = [
    ["songId", song.youtubeId],
    ["title", song.title],
    ["author", song.author.name],
    ["duration", String(Math.round(song.duration))],
    ["type", song.type],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${SHARE_URL}?${params}`;
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function songFromShareParams(params: ShareLinkParams): Song | null {
  const songId = param(params.songId);
  const title = param(params.title);
  const author = param(params.author);
  if (!songId || !title || !author) return null;

  const parsedDuration = Number(param(params.duration));
  return {
    youtubeId: songId,
    title,
    thumbnailUrl: `https://i.ytimg.com/vi/${songId}/mqdefault.jpg`,
    duration: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 0,
    type: param(params.type) === "song" ? "song" : "video",
    author: { name: author, id: "" },
  };
}
