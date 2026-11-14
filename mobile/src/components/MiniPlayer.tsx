import { Pressable, Text, View } from "react-native";
import { Pause, Play } from "lucide-react-native";
import { useProgress } from "react-native-track-player";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { radius, spacing, theme } from "~/theme";
import Thumbnail from "./Thumbnail";

// Mini-player fijo sobre las tabs; se expande al PlayerSheet.
export default function MiniPlayer() {
  const t = getDictionary();
  const song = usePlaylistStore((s) => s.selectedSong());
  const playing = usePlayerStore((s) => s.playing);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const { position, duration } = useProgress(500);

  if (!song) return null;
  const progress = duration > 0 ? position / duration : 0;

  return (
    <Pressable
      onPress={() => setExpanded(true)}
      accessibilityRole="button"
      accessibilityLabel={`${song.title}. ${song.author?.name ?? ""}`}
      style={{
        backgroundColor: theme.base200,
        borderTopWidth: 1,
        borderTopColor: theme.outline,
      }}
    >
      <View style={{ height: 2, backgroundColor: theme.base300 }}>
        <View
          style={{
            width: `${Math.min(100, progress * 100)}%`,
            height: 2,
            backgroundColor: theme.primary,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}
      >
        <Thumbnail youtubeId={song.youtubeId} title={song.title} size={44} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ color: theme.text, fontSize: 14, fontWeight: "600" }}>
            {song.title}
          </Text>
          <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>
            {song.author?.name}
          </Text>
        </View>
        <Pressable
          onPress={() => void togglePlay()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={playing ? t.PAUSE : t.PLAY}
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.full,
            backgroundColor: theme.base300,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {playing ? (
            <Pause size={18} color={theme.text} />
          ) : (
            <Play size={18} color={theme.text} />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}
