import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { PLAYLISTS } from "~/consts";
import { getSong } from "~/api/client";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { theme } from "~/theme";

// Puerto de web ~/pages/share/song.tsx:
// getSong -> playSong(HISTORY) -> reproducir -> volver al home.
export default function ShareSong() {
  const { songId } = useLocalSearchParams<{ songId?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!songId) {
      router.replace("/(tabs)");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const song = await getSong(songId);
        if (cancelled) return;
        await usePlaylistStore.getState().playSong(song, PLAYLISTS.HISTORY);
        if (cancelled) return;
        await usePlayerStore.getState().playSelected();
        if (!cancelled) router.replace("/(tabs)");
      } catch (e) {
        if (!cancelled) setError(String((e as Error)?.message ?? e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [songId]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.base100, alignItems: "center", justifyContent: "center", gap: 16 }}>
      {error ? (
        <>
          <Text style={{ color: "#fff", fontSize: 16 }}>{error}</Text>
          <Link href="/(tabs)" asChild>
            <Pressable style={{ backgroundColor: "#404040", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{ color: "#fff" }}>Home</Text>
            </Pressable>
          </Link>
        </>
      ) : (
        <ActivityIndicator size="large" color={theme.primary} />
      )}
    </View>
  );
}
