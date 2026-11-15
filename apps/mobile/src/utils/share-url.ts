import type { Song } from "~/db/schema";

// Deep link propio de la app. No depende de wetune.app ni de App Links.
const SHARE_URL = "wetune://share/song";

export function shareUrlFor(song: Pick<Song, "youtubeId">) {
  return `${SHARE_URL}?songId=${encodeURIComponent(song.youtubeId)}`;
}
