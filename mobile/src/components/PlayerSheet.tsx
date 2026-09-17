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
import { theme } from "~/theme";
import { formatSeconds } from "~/utils/seconds";
import { Resolution, getThumbnailUrl } from "~/utils/thumbnail";

// Puerto de web ~/components/AudioPlayer a bottom-sheet de pantalla completa.
// Sin slider de volumen (iOS/Android usan botones hardware); el nivel persiste
// igual en el store para cuando exista UI.
export default function PlayerSheet() {
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

  if (!song) return null;
  const { handleShare } = useShare(song);
  const downloaded = existsAudioInCache(song.youtubeId);
  const shown = sliding ?? position;

  return (
    <Modal visible={expanded} animationType="slide" onRequestClose={() => setExpanded(false)}>
      <View style={{ flex: 1, backgroundColor: theme.base100, paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <Pressable onPress={() => setExpanded(false)} hitSlop={12} style={{ alignSelf: "flex-end", padding: 8 }}>
          <X size={24} color="#fff" />
        </Pressable>

        <View style={{ alignItems: "center", marginTop: 12 }}>
          <Image
            source={{ uri: getThumbnailUrl(song.youtubeId, { resolution: Resolution.Max, w: "512", h: "512", fit: "cover" }) }}
            style={{ width: 256, height: 256, borderRadius: 12, backgroundColor: "#262626" }}
            contentFit="cover"
          />
          <Text numberOfLines={1} style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 16 }}>
            {song.title}
          </Text>
          <Text numberOfLines={1} style={{ color: "#a3a3a3", marginTop: 4 }}>
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
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="#404040"
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: "#a3a3a3", fontSize: 12 }}>{formatSeconds(shown)}</Text>
            <Text style={{ color: "#a3a3a3", fontSize: 12 }}>{formatSeconds(duration)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 16 }}>
          <Pressable onPress={() => void handleShare()} hitSlop={12}>
            <Share2 size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={toggleShuffle} hitSlop={12}>
            <Shuffle size={22} color={shuffle ? theme.primary : "#fff"} />
          </Pressable>
          <Pressable onPress={() => void handlePrevious()} hitSlop={12}>
            <SkipBack size={32} color="#fff" />
          </Pressable>
          <Pressable onPress={() => void togglePlay()} hitSlop={12}>
            {playing ? <Pause size={56} color="#fff" /> : <Play size={56} color="#fff" />}
          </Pressable>
          <Pressable onPress={() => void handleNext()} hitSlop={12}>
            <SkipForward size={32} color="#fff" />
          </Pressable>
          <Pressable onPress={toggleLoop} hitSlop={12} style={{ alignItems: "center" }}>
            <Repeat size={22} color={loop !== "NONE" ? theme.primary : "#fff"} />
            {loop === "ONE" ? <Text style={{ color: theme.primary, fontSize: 10 }}>1</Text> : null}
          </Pressable>
          <Pressable onPress={() => void handleDownload()} hitSlop={12} disabled={downloaded}>
            {downloading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <CircleArrowDown size={20} color={downloaded ? theme.primary : "#fff"} />
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
