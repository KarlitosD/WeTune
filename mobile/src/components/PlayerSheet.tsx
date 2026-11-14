import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import {
  CircleArrowDown,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react-native";
import { useProgress } from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { useShare } from "~/hooks/useShare";
import { existsAudioInCache } from "~/services/offline-cache";
import { getDictionary } from "~/i18n";
import { theme } from "~/theme";
import { formatSeconds } from "~/utils/seconds";
import { Resolution, getThumbnailUrl } from "~/utils/thumbnail";

// Player de pantalla completa. Sin slider de volumen (iOS/Android usan
// botones hardware); el nivel persiste igual en el store.
export default function PlayerSheet() {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const song = usePlaylistStore((s) => s.selectedSong());
  const expanded = usePlayerStore((s) => s.expanded);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const playing = usePlayerStore((s) => s.playing);
  const loop = usePlayerStore((s) => s.loop);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const downloading = usePlayerStore((s) => s.downloading);
  const { position, duration } = useProgress(500);
  const [sliding, setSliding] = useState<number | null>(null);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seek = usePlayerStore((s) => s.seek);
  const handleNext = usePlayerStore((s) => s.handleNext);
  const handlePrevious = usePlayerStore((s) => s.handlePrevious);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const handleDownload = usePlayerStore((s) => s.handleDownload);
  // Después de todos los hooks: useShare debe correr siempre (rules-of-hooks),
  // acepta undefined y no hace nada en ese caso.
  const { handleShare } = useShare(song);

  if (!song) return null;
  const downloaded = existsAudioInCache(song.youtubeId);
  const shown = sliding ?? position;

  return (
    <Modal visible={expanded} animationType="slide" onRequestClose={() => setExpanded(false)}>
      <View style={{ flex: 1, backgroundColor: theme.base100, paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Pressable
          onPress={() => setExpanded(false)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={t.CLOSE}
          style={{ alignSelf: "flex-end", padding: 8 }}
        >
          <X size={24} color={theme.text} />
        </Pressable>

        <View style={{ alignItems: "center", marginTop: 12 }}>
          <Image
            source={{ uri: getThumbnailUrl(song.youtubeId, { resolution: Resolution.Max, w: "512", h: "512", fit: "cover" }) }}
            style={{ width: 256, height: 256, borderRadius: 20, backgroundColor: theme.base300 }}
            contentFit="cover"
          />
          <Text numberOfLines={1} style={{ color: theme.text, fontSize: 22, fontWeight: "700", marginTop: 16 }}>
            {song.title}
          </Text>
          <Text numberOfLines={1} style={{ color: theme.muted, marginTop: 4 }}>
            {song.author?.name}
          </Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Slider
            value={shown}
            minimumValue={0}
            maximumValue={Math.max(duration, 0)}
            onSlidingStart={() => setSliding(position)}
            onValueChange={setSliding}
            onSlidingComplete={(v) => {
              setSliding(null);
              void seek(v);
            }}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.base300}
            thumbTintColor={theme.primary}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{formatSeconds(shown)}</Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>{formatSeconds(duration)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 16 }}>
          <Pressable onPress={() => void handleShare()} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.SHARE}>
            <Share2 size={20} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={toggleShuffle}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t.SHUFFLE}
          >
            <Shuffle size={22} color={shuffle ? theme.primary : theme.text} />
          </Pressable>
          <Pressable
            onPress={() => void handlePrevious()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t.PREVIOUS}
          >
            <SkipBack size={32} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={() => void togglePlay()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={playing ? t.PAUSE : t.PLAY}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {playing ? (
              <Pause size={28} color={theme.primaryContent} />
            ) : (
              <Play size={28} color={theme.primaryContent} />
            )}
          </Pressable>
          <Pressable
            onPress={() => void handleNext()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t.NEXT}
          >
            <SkipForward size={32} color={theme.text} />
          </Pressable>
          <Pressable
            onPress={toggleLoop}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={t.REPEAT}
            style={{ alignItems: "center" }}
          >
            <Repeat size={22} color={loop !== "NONE" ? theme.primary : theme.text} />
            {loop === "ONE" ? <Text style={{ color: theme.primary, fontSize: 10 }}>1</Text> : null}
          </Pressable>
          <Pressable onPress={() => void handleDownload()} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.DOWNLOAD} disabled={downloaded}>
            {downloading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <CircleArrowDown size={20} color={downloaded ? theme.primary : theme.text} />
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
