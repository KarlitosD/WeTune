import { Platform, Share } from "react-native";
import type { Song } from "~/db/schema";
import { shareUrlFor } from "~/utils/share-url";

// Share nativo con el deep link propio. Para receptores sin la app no hay
// landing https todavía; el scheme funciona sin infraestructura.
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
