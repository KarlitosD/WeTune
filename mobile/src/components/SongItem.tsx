import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { CircleArrowDown, Download, EllipsisVertical, Plus, Share2 } from "lucide-react-native";
import type { Song } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { toast } from "~/store/useToastStore";
import { useShare } from "~/hooks/useShare";
import { addAudioToCache, existsAudioInCache } from "~/services/offline-cache";
import { formatSeconds } from "~/utils/seconds";
import Thumbnail from "./Thumbnail";
import { ActionMenu, ActionMenuItem } from "./ActionMenu";

// Puerto de web ~/components/SongItem (dropdown -> ActionMenu,
// descarga blob+anchor -> offline-cache, iconos lucide-solid -> -native).
export function SongItem({
  song,
  onSelect,
  trailing,
}: {
  song: Song;
  onSelect: () => void;
  // Como render-prop recibe close() para cerrar el menú tras la acción.
  trailing?: ReactNode | ((close: () => void) => ReactNode);
}) {
  const t = getDictionary();
  const playlists = usePlaylistStore((s) => s.playlists);
  const addSong = usePlaylistStore((s) => s.addSong);
  const { handleShare } = useShare(song);
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
  const [cached, setCached] = useState(() => existsAudioInCache(song.youtubeId));

  const handleDownload = async () => {
    setMenuOpen(false);
    try {
      await addAudioToCache(song.youtubeId, "highest");
      setCached(true);
      toast.success(t.DOWNLOAD_STARTED.replace("{song}", song.title));
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 }}>
      <Pressable onPress={onSelect} style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
        <Thumbnail youtubeId={song.youtubeId} title={song.title} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: "#e5e5e5", fontSize: 14, fontWeight: "600" }}>
            {song.title}
          </Text>
          <Text numberOfLines={1} style={{ color: "#a3a3a3", fontSize: 12, marginTop: 2 }}>
            {song.author?.name}
            {song.album?.name ? ` - ${song.album.name}` : ""} - {formatSeconds(song.duration)}
          </Text>
        </View>
      </Pressable>
      {cached ? <CircleArrowDown size={16} color="#cbd5e1" /> : null}
      <Pressable
        onPress={() => {
          setCached(existsAudioInCache(song.youtubeId));
          setMenuOpen(true);
        }}
        hitSlop={12}
        accessibilityRole="button"
        style={{ padding: 4 }}
      >
        <EllipsisVertical size={20} color="#e5e5e5" />
      </Pressable>

      <ActionMenu visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <ActionMenuItem
          onPress={() => {
            setMenuOpen(false);
            setPlaylistPickerOpen(true);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Plus size={16} color="#e5e5e5" />
            <Text style={{ color: "#e5e5e5" }}>{t.ADD_PLAYLIST}</Text>
          </View>
        </ActionMenuItem>
        <ActionMenuItem onPress={handleDownload}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Download size={16} color="#e5e5e5" />
            <Text style={{ color: "#e5e5e5" }}>{t.DOWNLOAD_MP3}</Text>
          </View>
        </ActionMenuItem>
        <ActionMenuItem
          onPress={() => {
            setMenuOpen(false);
            void handleShare();
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Share2 size={16} color="#e5e5e5" />
            <Text style={{ color: "#e5e5e5" }}>{t.SHARE}</Text>
          </View>
        </ActionMenuItem>
        {typeof trailing === "function" ? trailing(() => setMenuOpen(false)) : trailing}
      </ActionMenu>

      <ActionMenu visible={playlistPickerOpen} onClose={() => setPlaylistPickerOpen(false)}>
        {playlists.map((p) => (
          <ActionMenuItem
            key={p.id}
            onPress={() => {
              void addSong(song, p.id);
              setPlaylistPickerOpen(false);
            }}
          >
            <Text style={{ color: "#e5e5e5" }}>{p.title}</Text>
          </ActionMenuItem>
        ))}
      </ActionMenu>
    </View>
  );
}

export function SongItemSkeleton() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}>
      <View style={{ width: 60, height: 60, backgroundColor: "#262626", borderRadius: 4 }} />
      <View style={{ gap: 6 }}>
        <View style={{ height: 14, width: 120, backgroundColor: "#262626", borderRadius: 7 }} />
        <View style={{ height: 12, width: 200, backgroundColor: "#262626", borderRadius: 6 }} />
      </View>
    </View>
  );
}
