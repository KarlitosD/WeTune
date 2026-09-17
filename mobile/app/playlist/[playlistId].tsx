import { useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { CircleArrowDown, EllipsisVertical, Pause, Play, Trash2 } from "lucide-react-native";
import { PLAYLISTS } from "~/consts";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { toast } from "~/store/useToastStore";
import { addAudioToCache, existsAudioInCache } from "~/services/offline-cache";
import { SongItem } from "~/components/SongItem";
import { ActionMenu, ActionMenuItem } from "~/components/ActionMenu";

// Puerto de web ~/pages/playlist/[playlistId].tsx.
export default function PlaylistPage() {
  const t = getDictionary();
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const playlists = usePlaylistStore((s) => s.playlists);
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0f0f0f", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Text style={{ color: "#fff", fontSize: 18 }}>Playlist not found</Text>
        <Link href="/(tabs)" asChild>
          <Pressable style={{ backgroundColor: "#404040", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ color: "#fff" }}>Home</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return <PlaylistDetail key={playlist.id} playlistId={playlist.id} />;
}

function PlaylistDetail({ playlistId }: { playlistId: string }) {
  const t = getDictionary();
  const playlist = usePlaylistStore((s) => s.playlists.find((p) => p.id === playlistId));
  const playSong = usePlaylistStore((s) => s.playSong);
  const removeSong = usePlaylistStore((s) => s.removeSong);
  const removePlaylist = usePlaylistStore((s) => s.removePlaylist);
  const actualPlaylistId = usePlaylistStore((s) => s.actualPlaylistId);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cacheBump, setCacheBump] = useState(0);

  if (!playlist) return null;
  const isActual = actualPlaylistId === playlist.id;
  // cacheBump fuerza relectura de existsAudioInCache tras descargar todo.
  const allCached =
    cacheBump >= 0 && playlist.songs.length > 0 && playlist.songs.every((s) => existsAudioInCache(s.youtubeId));

  const handlePlayAll = () => {
    if (!isActual) {
      const first = playlist.songs[0];
      if (!first) return;
      void playSong(first, playlist.id).then(() => usePlayerStore.getState().playSelected());
    } else {
      void togglePlay();
    }
  };

  const handleDownloadAll = async () => {
    if (allCached) return;
    try {
      for (const song of playlist.songs) {
        await addAudioToCache(song.youtubeId, "highest");
      }
      setCacheBump((n) => n + 1);
      toast.success(t.DOWNLOAD);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const handleRemove = () => {
    setMenuOpen(false);
    router.replace("/(tabs)");
    void removePlaylist(playlist.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f0f0f" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#404040" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <Text numberOfLines={1} style={{ color: "#fff", fontSize: 20 }}>
            {playlist.id === PLAYLISTS.HISTORY ? t.RECENTS : playlist.title}
          </Text>
          <Pressable onPress={() => void handleDownloadAll()} hitSlop={12}>
            <CircleArrowDown size={22} color={allCached ? "#22c55e" : "#fff"} />
          </Pressable>
          {playlist.id !== PLAYLISTS.HISTORY ? (
            <Pressable onPress={() => setMenuOpen(true)} hitSlop={12}>
              <EllipsisVertical size={20} color="#fff" />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={handlePlayAll}
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center" }}
        >
          {isActual ? <Pause size={24} color="#000" /> : <Play size={24} color="#000" />}
        </Pressable>
      </View>

      <FlatList
        data={playlist.songs}
        keyExtractor={(s) => s.youtubeId}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 4 }}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            onSelect={() => void playSong(item, playlist.id).then(() => usePlayerStore.getState().playSelected())}
            trailing={
              <ActionMenuItem onPress={() => void removeSong(item, playlist.id)}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={{ color: "#ef4444" }}>{t.DELETE}</Text>
                </View>
              </ActionMenuItem>
            }
          />
        )}
      />

      <ActionMenu visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <ActionMenuItem onPress={handleRemove}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Trash2 size={16} color="#ef4444" />
            <Text style={{ color: "#ef4444" }}>{t.DELETE}</Text>
          </View>
        </ActionMenuItem>
      </ActionMenu>
    </View>
  );
}
