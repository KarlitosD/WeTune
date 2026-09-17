import { Image } from "expo-image";
import { getThumbnailUrl } from "~/utils/thumbnail";

// Puerto de web ~/components/Thumbnail.
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
      style={{ width: size, height: size, borderRadius: 4, backgroundColor: "#262626" }}
      contentFit="cover"
    />
  );
}
