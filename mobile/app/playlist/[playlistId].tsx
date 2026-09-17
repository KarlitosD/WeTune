import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

// TODO(Fase 3): portar pages/playlist/[playlistId].tsx
export default function PlaylistPage() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff" }}>Playlist {playlistId} (pendiente Fase 3)</Text>
    </View>
  );
}
