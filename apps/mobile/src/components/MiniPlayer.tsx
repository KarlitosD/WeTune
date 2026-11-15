import { Pressable, Text, View } from "react-native";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";
import SkipBack from "lucide-react-native/icons/skip-back";
import SkipForward from "lucide-react-native/icons/skip-forward";
import { useProgress } from "react-native-track-player";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { radius, spacing, theme } from "~/theme";
import Thumbnail from "./Thumbnail";

// Mini-player flotante sobre las tabs. La tarjeta abre el drawer; los
// controles de transporte quedan fuera del área presionable.
export default function MiniPlayer() {
  const t = getDictionary();
  const song = usePlaylistStore((s) => s.selectedSong());
  const playing = usePlayerStore((s) => s.playing);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const handleNext = usePlayerStore((s) => s.handleNext);
  const handlePrevious = usePlayerStore((s) => s.handlePrevious);
  const setExpanded = usePlayerStore((s) => s.setExpanded);

  if (!song) return null;

  return (
    <View
      style={{
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 4,
        borderRadius: radius.lg,
        borderCurve: "continuous",
        backgroundColor: theme.base200,
        borderWidth: 1,
        borderColor: theme.outline,
        overflow: "hidden",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: 8 }}>
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel={`${song.title}. ${song.author?.name ?? ""}`}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, minWidth: 0 }}
        >
          <Thumbnail youtubeId={song.youtubeId} title={song.title} size={40} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ color: theme.text, fontSize: 13, fontWeight: "600" }}>
              {song.title}
            </Text>
            <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 11, marginTop: 2 }}>
              {song.author?.name}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => void handlePrevious()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t.PREVIOUS}
          style={{ padding: 4 }}
        >
          <SkipBack size={18} color={theme.muted} />
        </Pressable>

        <Pressable
          onPress={() => void togglePlay()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={playing ? t.PAUSE : t.PLAY}
          style={{
            width: 36,
            height: 36,
            borderRadius: radius.full,
            backgroundColor: theme.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {playing ? (
            <Pause size={16} color={theme.primaryContent} fill={theme.primaryContent} />
          ) : (
            <Play size={16} color={theme.primaryContent} fill={theme.primaryContent} />
          )}
        </Pressable>

        <Pressable
          onPress={() => void handleNext()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t.NEXT}
          style={{ padding: 4 }}
        >
          <SkipForward size={18} color={theme.muted} />
        </Pressable>
      </View>

      <MiniProgressBar />
    </View>
  );
}

// Hoja separada: el polling de progreso re-renderiza solo esta barra, no la
// tarjeta completa (thumbnail, textos y controles).
function MiniProgressBar() {
  const { position, duration } = useProgress(1000);
  const progress = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <View
      style={{
        height: 2,
        marginHorizontal: 10,
        marginBottom: 8,
        borderRadius: 1,
        backgroundColor: "rgba(148, 163, 184, 0.16)",
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: "100%",
          height: 2,
          borderRadius: 1,
          backgroundColor: theme.primary,
          transform: [{ scaleX: progress }],
          transformOrigin: "left",
        }}
      />
    </View>
  );
}
