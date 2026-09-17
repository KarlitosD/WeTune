import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Music } from "lucide-react-native";
import { PLAYLISTS } from "~/consts";
import type { Playlist } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { getThumbnailUrl } from "~/utils/thumbnail";
import { formatCount } from "~/utils/plural";

// Puerto de web PlaylistCard (home.tsx).
export default function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const t = getDictionary();
  const first = playlist.songs[0];

  return (
    <Link
      href={{ pathname: "/playlist/[playlistId]", params: { playlistId: playlist.id } }}
      asChild
    >
      <Pressable style={{ width: 128 }}>
        <View
          style={{
            width: 128,
            height: 128,
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: "#262626",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {first ? (
            <Image
              source={{ uri: getThumbnailUrl(first.youtubeId) }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <Music size={48} color="#fff" />
          )}
        </View>
        <Text numberOfLines={1} style={{ color: "#fff", fontWeight: "500", textAlign: "center", marginTop: 4 }}>
          {playlist.id === PLAYLISTS.HISTORY ? t.RECENTS : playlist.title}
        </Text>
        <Text style={{ color: "#a3a3a3", textAlign: "center", fontSize: 12 }}>
          {formatCount(playlist.songs.length, t.SONGS_IN_PLAYLIST)}
        </Text>
      </Pressable>
    </Link>
  );
}
