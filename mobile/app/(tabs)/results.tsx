import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search } from "lucide-react-native";
import type { Song } from "~/db/schema";
import { searchSongs } from "~/api/client";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { radius, spacing, theme, typography } from "~/theme";
import { SongItem, SongItemSkeleton } from "~/components/SongItem";
import SearchBar from "~/components/SearchBar";

// Búsqueda global: estado local + API.
export default function Results() {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ search?: string }>();
  const [query, setQuery] = useState(params.search ?? "");
  const [activeTab, setActiveTab] = useState<"songs" | "videos">("songs");
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Song[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const playSong = usePlaylistStore((s) => s.playSong);

  const runSearch = async (term: string) => {
    if (!term) return;
    router.setParams({ search: term });
    setSearching(true);
    setSearched(true);
    setFailed(false);
    setLastQuery(term);
    try {
      const result = await searchSongs(term);
      setSongs(result.songs);
      setVideos(result.videos);
    } catch (e) {
      console.error(e);
      setFailed(true);
    } finally {
      setSearching(false);
    }
  };

  const list = activeTab === "songs" ? songs : videos;

  const handleSelect = (song: Song) => {
    void playSong(song).then(() => usePlayerStore.getState().playSelected());
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) return;
    setSearched(false);
    setFailed(false);
    setSongs([]);
    setVideos([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.base100 }}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
          gap: spacing.lg,
        }}
      >
        <Text style={typography.screenTitle}>{t.SEARCH}</Text>
        <SearchBar
          value={query}
          onChangeText={handleQueryChange}
          onSubmit={() => void runSearch(query.trim())}
          placeholder={t.SEARCH}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        {(["songs", "videos"] as const).map((tab) => {
          const selected = activeTab === tab;
          const count = tab === "songs" ? songs.length : videos.length;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                height: 36,
                paddingHorizontal: spacing.md,
                borderRadius: radius.full,
                backgroundColor: selected ? theme.primary : theme.base200,
                borderWidth: 1,
                borderColor: selected ? theme.primary : theme.outline,
              }}
            >
              <Text
                style={{
                  color: selected ? theme.primaryContent : theme.muted,
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {tab === "songs" ? t.SONGS : t.VIDEOS}
              </Text>
              <View
                style={{
                  minWidth: 20,
                  height: 18,
                  paddingHorizontal: 5,
                  borderRadius: 9,
                  backgroundColor: selected ? "rgba(8, 47, 73, 0.18)" : theme.base300,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: selected ? theme.primaryContent : theme.muted,
                    fontSize: 11,
                    fontWeight: "700",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {searching ? (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.xs }}>
          {Array.from({ length: 8 }, (_, i) => (
            <SongItemSkeleton key={i} />
          ))}
        </View>
      ) : !searched ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
          <Search size={44} color={theme.faint} />
          <Text style={{ color: theme.muted, fontSize: 14 }}>{t.SEARCH_HINT}</Text>
        </View>
      ) : failed ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg }}>
          <Text style={{ color: theme.text, fontSize: 16, textAlign: "center", paddingHorizontal: 32 }}>
            {t.RESULTS_ERROR}
          </Text>
          <Pressable
            onPress={() => void runSearch(lastQuery)}
            accessibilityRole="button"
            style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: 10,
              borderRadius: radius.full,
              backgroundColor: theme.primary,
            }}
          >
            <Text style={{ color: theme.primaryContent, fontWeight: "700" }}>{t.SEARCH}</Text>
          </Pressable>
        </View>
      ) : list.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.muted, fontSize: 14 }}>{t.NO_RESULTS}</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(song) => song.youtubeId}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
            gap: spacing.xs,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => <SongItem song={item} onSelect={() => handleSelect(item)} />}
        />
      )}
    </View>
  );
}
