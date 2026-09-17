import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { Song } from "~/db/schema";
import { searchSongs } from "~/api/client";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { SongItem, SongItemSkeleton } from "~/components/SongItem";
import SearchBar from "~/components/SearchBar";

// Puerto de web ~/pages/results.tsx (createAsync/load -> estado local).
export default function Results() {
  const t = getDictionary();
  const params = useLocalSearchParams<{ search?: string }>();
  const [activeTab, setActiveTab] = useState<"songs" | "videos">("songs");
  const [songs, setSongs] = useState<Song[]>([]);
  const [videos, setVideos] = useState<Song[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const playSong = usePlaylistStore((s) => s.playSong);

  const runSearch = async (query: string) => {
    if (!query) return;
    router.setParams({ search: query });
    setSearching(true);
    setSearched(true);
    const result = await searchSongs(query);
    setSongs(result.songs);
    setVideos(result.videos);
    setSearching(false);
  };

  const list = activeTab === "songs" ? songs : videos;

  const handleSelect = (song: Song) => {
    void playSong(song).then(() => usePlayerStore.getState().playSelected());
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <SearchBar initialValue={params.search ?? ""} onSubmit={(q) => void runSearch(q)} />
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        {(["songs", "videos"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: activeTab === tab ? "#404040" : "#1c1c1c" }}
          >
            <Text style={{ color: "#fff" }}>{tab === "songs" ? t.SONGS : t.VIDEOS}</Text>
          </Pressable>
        ))}
      </View>
      {searching ? (
        <View style={{ paddingHorizontal: 16, gap: 4 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <SongItemSkeleton key={i} />
          ))}
        </View>
      ) : !searched ? null : list.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 20 }}>{t.NO_RESULTS}</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(s) => s.youtubeId}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4, paddingBottom: 16 }}
          renderItem={({ item }) => <SongItem song={item} onSelect={() => handleSelect(item)} />}
        />
      )}
    </View>
  );
}
