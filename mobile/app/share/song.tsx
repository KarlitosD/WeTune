import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

// TODO(Fase 3): portar pages/share/song.tsx (getSong -> playSong(HISTORY) -> replace('/'))
export default function ShareSong() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff" }}>Shared song {songId} (pendiente Fase 3)</Text>
    </View>
  );
}
