import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { playbackService } from "~/services/playback-service";
import { theme } from "~/theme";
import PlayerSheet from "~/components/PlayerSheet";
import Toasts from "~/components/Toasts";

// Providers globales, stack y player fijo.
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
          headerTintColor: theme.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.base100 },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="playlist/[playlistId]"
          options={{ headerShown: false, contentStyle: { backgroundColor: theme.base100 } }}
        />
        <Stack.Screen name="share/song" options={{ title: "" }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <PlayerSheet />
      <Toasts />
    </View>
  );
}
