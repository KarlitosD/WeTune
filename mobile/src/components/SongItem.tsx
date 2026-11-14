import { useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { CircleArrowDown, Download, EllipsisVertical, Plus, Share2 } from "lucide-react-native";
import type { Song } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { toast } from "~/store/useToastStore";
import { useShare } from "~/hooks/useShare";
import { addAudioToCache, existsAudioInCache } from "~/services/offline-cache";
import { radius, spacing, theme } from "~/theme";
import { formatSeconds } from "~/utils/seconds";
import Thumbnail from "./Thumbnail";
import { ActionMenu, ActionMenuItem } from "./ActionMenu";

// Fila de canción: selección, descarga, share y menú de playlist.
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
  const selectedSong = usePlaylistStore((s) => s.selectedSong());
  const { handleShare } = useShare(song);
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
  const [cached, setCached] = useState(() => existsAudioInCache(song.youtubeId));

  const active = selectedSong?.youtubeId === song.youtubeId;
  const subtitle = [song.author?.name, song.album?.name].filter(Boolean).join(" • ");

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
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.xs,
        padding: 6,
        borderRadius: radius.md,
        borderCurve: "continuous",
        backgroundColor: active ? theme.base200 : "transparent",
      }}
    >
      <View
        style={{
          width: 3,
          height: 36,
          borderRadius: 2,
          backgroundColor: active ? theme.primary : "transparent",
        }}
      />

      <Pressable
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${song.title}. ${subtitle}. ${formatSeconds(song.duration)}`}
        style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, minWidth: 0 }}
      >
        <Thumbnail youtubeId={song.youtubeId} title={song.title} size={48} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              color: active ? theme.primary : theme.text,
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {song.title}
          </Text>
          <Text numberOfLines={1} style={{ color: theme.muted, fontSize: 12, marginTop: 3 }}>
            {subtitle}
          </Text>
        </View>
      </Pressable>

      {cached ? <CircleArrowDown size={14} color={theme.primary} /> : null}

      <Text
        style={{
          color: theme.muted,
          fontSize: 12,
          fontVariant: ["tabular-nums"],
          marginRight: 2,
        }}
      >
        {formatSeconds(song.duration)}
      </Text>

      <Pressable
        onPress={() => {
          setCached(existsAudioInCache(song.youtubeId));
          setMenuOpen(true);
        }}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={t.MORE_OPTIONS}
        style={{ padding: 6 }}
      >
        <EllipsisVertical size={18} color={theme.muted} />
      </Pressable>

      <ActionMenu visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <ActionMenuItem
          onPress={() => {
            setMenuOpen(false);
            setPlaylistPickerOpen(true);
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Plus size={16} color={theme.text} />
            <Text style={{ color: theme.text }}>{t.ADD_PLAYLIST}</Text>
          </View>
        </ActionMenuItem>
        <ActionMenuItem onPress={handleDownload}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Download size={16} color={theme.text} />
            <Text style={{ color: theme.text }}>{t.DOWNLOAD_MP3}</Text>
          </View>
        </ActionMenuItem>
        <ActionMenuItem
          onPress={() => {
            setMenuOpen(false);
            void handleShare();
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Share2 size={16} color={theme.text} />
            <Text style={{ color: theme.text }}>{t.SHARE}</Text>
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
            <Text style={{ color: theme.text }}>{p.title}</Text>
          </ActionMenuItem>
        ))}
      </ActionMenu>
    </View>
  );
}

export function SongItemSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        padding: 6,
        borderRadius: radius.md,
        backgroundColor: theme.base200,
      }}
    >
      <View style={{ width: 3, height: 36, borderRadius: 2, backgroundColor: theme.base300 }} />
      <View style={{ width: 48, height: 48, borderRadius: radius.sm, backgroundColor: theme.base300 }} />
      <View style={{ flex: 1, gap: 7 }}>
        <View style={{ height: 13, width: "62%", backgroundColor: theme.base300, borderRadius: 7 }} />
        <View style={{ height: 11, width: "38%", backgroundColor: theme.base300, borderRadius: 6 }} />
      </View>
      <View style={{ width: 28, height: 11, backgroundColor: theme.base300, borderRadius: 6 }} />
    </View>
  );
}
