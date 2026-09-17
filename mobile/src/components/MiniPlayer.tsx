import { Pressable, Text, View } from "react-native";
import { Pause, Play } from "lucide-react-native";
import { useProgress } from "react-native-track-player";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import Thumbnail from "./Thumbnail";

// Mini-player fijo sobre las tabs (equivale al <AudioPlayer> colapsado;
// la web lo renderiza en layouts/main.tsx).
export default function MiniPlayer() {
  const song = usePlaylistStore((s) => s.selectedSong());
  const playing = usePlayerStore((s) => s.playing);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const { position, duration } = useProgress(500);

  if (!song) return null;
  const progress = duration > 0 ? position / duration : 0;

  return (
    <Pressable onPress={() => setExpanded(true)} style={{ backgroundColor: "#171717" }}>
      <View style={{ height: 2, backgroundColor: "#262626" }}>
        <View style={{ width: `${Math.min(100, progress * 100)}%`, height: 2, backgroundColor: "#fff" }} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }}>
        <Thumbnail youtubeId={song.youtubeId} title={song.title} size={44} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: "#fff", fontWeight: "600" }}>
            {song.title}
          </Text>
          <Text numberOfLines={1} style={{ color: "#a3a3a3", fontSize: 12 }}>
            {song.author?.name}
          </Text>
        </View>
        <Pressable onPress={() => void togglePlay()} hitSlop={12} style={{ padding: 8 }}>
          {playing ? <Pause size={28} color="#fff" /> : <Play size={28} color="#fff" />}
        </Pressable>
      </View>
    </Pressable>
  );
}
