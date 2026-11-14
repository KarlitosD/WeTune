import { Platform, Share } from "react-native";
import type { Song } from "~/db/schema";

// Share nativo. La URL apunta a wetune.app/share/song; hace falta el sitio
// público de share para receptores sin la app.
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://wetune.app";

export function shareUrlFor(song: Pick<Song, "youtubeId">) {
  return `${WEB_URL}/share/song?songId=${song.youtubeId}`;
}

export function useShare(song: Song | undefined) {
  const handleShare = async () => {
    if (!song) return;
    const url = shareUrlFor(song);
    try {
      if (Platform.OS === "ios") {
        await Share.share({ url, title: song.title });
      } else {
        await Share.share({ message: `${song.title} ${url}`, title: song.title });
      }
    } catch {
      // usuario canceló
    }
  };

  return { handleShare };
}
