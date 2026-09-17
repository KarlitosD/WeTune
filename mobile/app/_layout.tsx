import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0f0f0f" },
          headerTintColor: "#fff",
          contentStyle: { backgroundColor: "#0f0f0f" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[playlistId]" options={{ title: "" }} />
        <Stack.Screen name="share/song" options={{ title: "" }} />
      </Stack>
    </>
  );
}
