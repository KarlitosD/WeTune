import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { playbackService } from "~/services/playback-service";
import { theme } from "~/theme";
import MiniPlayer from "~/components/MiniPlayer";
import PlayerSheet from "~/components/PlayerSheet";
import Toasts from "~/components/Toasts";

// Equivale a web ~/app.tsx (providers) + ~/layouts/main.tsx (player fijo).
export default function RootLayout() {
  useEffect(() => {
    // Fallback para RNTP 5 alpha: el headless service no siempre recibe los
    // botones de la notificación; estos listeners viven en el runtime principal.
    void playbackService();
    void usePlaylistStore
      .getState()
      .hydrate()
      .then(() => usePlayerStore.getState().ensureSelectionLoaded())
      .catch(console.error);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.base100 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.base100 },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: theme.base100 },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[playlistId]" options={{ title: "" }} />
        <Stack.Screen name="share/song" options={{ title: "" }} />
      </Stack>
      <MiniPlayer />
      <PlayerSheet />
      <Toasts />
    </View>
  );
}
