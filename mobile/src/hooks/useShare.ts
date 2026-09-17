import { Platform, Share } from "react-native";
import type { Song } from "~/db/schema";

// Puerto de web ~/hooks/useShare (navigator.share) a Share nativo.
// La URL apunta a la web para que el receptor abra /share/song.
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://wetune.app";

export function shareUrlFor(song: Pick<Song, "youtubeId">) {
  return `${WEB_URL}/share/song?songId=${song.youtubeId}`;
}

export function useShare(song: Song) {
  const handleShare = async () => {
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
