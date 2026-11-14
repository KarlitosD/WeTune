import { Image } from "expo-image";
import { radius, theme } from "~/theme";
import { getThumbnailUrl } from "~/utils/thumbnail";

// Thumbnail de YouTube con proxy y fallback de fondo.
export default function Thumbnail({
  youtubeId,
  title,
  size = 60,
}: {
  youtubeId: string;
  title: string;
  size?: number;
}) {
  return (
    <Image
      source={{ uri: getThumbnailUrl(youtubeId) }}
      alt={title}
      style={{
        width: size,
        height: size,
        borderRadius: radius.sm,
        backgroundColor: theme.base300,
      }}
      contentFit="cover"
    />
  );
}
