import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PLAYLISTS } from "~/consts";
import { getSong } from "~/api/client";
import { resolveVideoInfo } from "~/lib/audio-source";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { radius, spacing, theme } from "~/theme";
import { songFromShareParams, songFromVideoInfo } from "~/utils/share-url";

// Deep link de canción compartida: link con metadata -> playSong(HISTORY).
// Los links viejos (solo songId) caen a /api/song.
export default function ShareSong() {
  const t = getDictionary();
  const params = useLocalSearchParams<{
    songId?: string;
    title?: string;
    author?: string;
    duration?: string;
    type?: string;
  }>();
  const [error, setError] = useState<string | null>(null);
  const songId = params.songId;
  const sharedSong = useMemo(
    () =>
      songFromShareParams({
        songId: params.songId,
        title: params.title,
        author: params.author,
        duration: params.duration,
        type: params.type,
      }),
    [params.songId, params.title, params.author, params.duration, params.type],
  );

  useEffect(() => {
    if (!songId) {
      router.replace("/(tabs)");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Link viejo sin metadata: resolver en el dispositivo (VISIONOS) y
        // recién si falla usar el backend.
        let song = sharedSong;
        if (!song) {
          try {
            song = songFromVideoInfo(await resolveVideoInfo(songId));
          } catch {
            song = await getSong(songId);
          }
        }
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
  }, [sharedSong, songId]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.base100,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.lg,
        padding: spacing.xl,
      }}
    >
      {error ? (
        <>
          <Text style={{ color: theme.text, fontSize: 16, textAlign: "center" }}>{error}</Text>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            accessibilityRole="button"
            style={{
              backgroundColor: theme.primary,
              borderRadius: radius.full,
              paddingHorizontal: spacing.xl,
              paddingVertical: 10,
            }}
          >
            <Text style={{ color: theme.primaryContent, fontWeight: "700" }}>{t.HOME}</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator size="large" color={theme.primary} />
      )}
    </View>
  );
}
