import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import Heart from "lucide-react-native/icons/heart";
import Music from "lucide-react-native/icons/music";
import { PLAYLISTS } from "~/consts";
import type { Playlist } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { radius, spacing, theme, typography } from "~/theme";
import { formatCount } from "~/utils/plural";
import { getPlaylistTotalDuration } from "~/utils/playlist";
import { formatTotalDuration } from "~/utils/seconds";
import { getThumbnailUrl, Resolution } from "~/utils/thumbnail";

export default memo(function PlaylistRow({ playlist }: { playlist: Playlist }) {
  const t = getDictionary();
  const first = playlist.songs[0];
  const title = playlist.id === PLAYLISTS.HISTORY ? t.RECENTS : playlist.title;
  const duration = formatTotalDuration(getPlaylistTotalDuration(playlist));
  const subtitle = [formatCount(playlist.songs.length, t.SONGS_IN_PLAYLIST), duration]
    .filter(Boolean)
    .join(" • ");

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/playlist/[playlistId]",
          params: { playlistId: playlist.id },
        })
      }
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        padding: spacing.sm,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: pressed ? theme.base300 : theme.base200,
      })}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.md,
          overflow: "hidden",
          backgroundColor: theme.base300,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {first ? (
          <Image
            source={{
              uri: getThumbnailUrl(first.youtubeId, {
                resolution: Resolution.Medium,
                w: "128",
                h: "128",
                fit: "cover",
              }),
            }}
            alt={title}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        ) : (
          <Music size={28} color={theme.faint} />
        )}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={typography.rowTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[typography.caption, { marginTop: 4 }]}>
          {subtitle}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {playlist.favorite ? <Heart size={16} color={theme.primary} fill={theme.primary} /> : null}
        <ChevronRight size={18} color={theme.faint} />
      </View>
    </Pressable>
  );
});
