import { useState } from "react";
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { Music } from "lucide-react-native";
import { getDictionary } from "~/i18n";
import { getPlaylist } from "~/api/client";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { toast } from "~/store/useToastStore";
import { createId } from "~/utils/id";
import PlaylistCard from "~/components/PlaylistCard";

// Puerto de web ~/pages/home.tsx (CreatePlaylistModal con <dialog> -> Modal).
const YOUTUBE_HOSTS = ["music.youtube.com", "www.youtube.com", "m.youtube.com"];

export default function Home() {
  const t = getDictionary();
  const playlists = usePlaylistStore((s) => s.playlists);
  const addPlaylist = usePlaylistStore((s) => s.addPlaylist);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const createPlaylist = () => {
    if (!name.trim()) return;
    void addPlaylist({ id: createId(), title: name.trim(), songs: [] });
    setName("");
    setModalOpen(false);
  };

  const importPlaylist = async () => {
    try {
      const parsed = new URL(url);
      const listId = parsed.searchParams.get("list");
      if (!listId || !YOUTUBE_HOSTS.includes(parsed.host)) return;
      const playlist = await getPlaylist(listId);
      await addPlaylist(playlist);
      setUrl("");
      setModalOpen(false);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f0f", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 24, marginVertical: 12 }}>{t.PLAYLISTS}</Text>
      <FlatList
        data={playlists}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ gap: 16 }}
        ListHeaderComponent={
          <Pressable onPress={() => setModalOpen(true)} style={{ width: 128 }}>
            <View style={{ width: 128, height: 128, borderRadius: 4, backgroundColor: "#262626", alignItems: "center", justifyContent: "center" }}>
              <Music size={48} color="#fff" />
            </View>
            <Text style={{ color: "#fff", fontWeight: "500", textAlign: "center", marginTop: 4 }}>{t.NEW_PLAYLIST}</Text>
          </Pressable>
        }
        renderItem={({ item }) => <PlaylistCard playlist={item} />}
      />

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 }} onPress={() => setModalOpen(false)}>
          <View style={{ backgroundColor: "#1c1c1c", borderRadius: 12, padding: 20, gap: 12 }} onStartShouldSetResponder={() => true}>
            <Text style={{ color: "#fff", fontSize: 20, textAlign: "center" }}>{t.CREATE_PLAYLIST}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="Youtube Playlist URL"
                placeholderTextColor="#737373"
                autoCapitalize="none"
                style={{ flex: 1, backgroundColor: "#0f0f0f", color: "#fff", borderRadius: 8, paddingHorizontal: 12, height: 44 }}
              />
              <Pressable onPress={() => void importPlaylist()} style={{ backgroundColor: "#404040", borderRadius: 8, paddingHorizontal: 16, justifyContent: "center" }}>
                <Text style={{ color: "#fff" }}>{t.IMPORT}</Text>
              </Pressable>
            </View>
            <Text style={{ color: "#737373", textAlign: "center" }}>{t.OR}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.NAME_PLAYLIST}
                placeholderTextColor="#737373"
                style={{ flex: 1, backgroundColor: "#0f0f0f", color: "#fff", borderRadius: 8, paddingHorizontal: 12, height: 44 }}
              />
              <Pressable onPress={createPlaylist} style={{ backgroundColor: "#404040", borderRadius: 8, paddingHorizontal: 16, justifyContent: "center" }}>
                <Text style={{ color: "#fff" }}>{t.ADD}</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
