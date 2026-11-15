import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import CircleArrowDown from "lucide-react-native/icons/circle-arrow-down";
import EllipsisVertical from "lucide-react-native/icons/ellipsis-vertical";
import Heart from "lucide-react-native/icons/heart";
import Music from "lucide-react-native/icons/music";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";
import Plus from "lucide-react-native/icons/plus";
import Shuffle from "lucide-react-native/icons/shuffle";
import Trash2 from "lucide-react-native/icons/trash";
import { PLAYLISTS } from "~/consts";
import type { Song } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { toast } from "~/store/useToastStore";
import { addAudioToCache, listCachedAudioIds } from "~/services/offline-cache";
import { radius, spacing, theme, typography } from "~/theme";
import { formatCount } from "~/utils/plural";
import { getPlaylistTotalDuration } from "~/utils/playlist";
import { formatTotalDuration } from "~/utils/seconds";
import { getThumbnailUrl, Resolution } from "~/utils/thumbnail";
import { SongItem } from "~/components/SongItem";
import { ActionMenu, ActionMenuItem } from "~/components/ActionMenu";
import MiniPlayer from "~/components/MiniPlayer";
import SongPicker from "~/components/SongPicker";

// Detalle de playlist: hero, acciones y tracklist.
export default function PlaylistPage() {
  const t = getDictionary();
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const playlists = usePlaylistStore((s) => s.playlists);
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
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
        <Text style={{ color: theme.text, fontSize: 18, textAlign: "center" }}>
          {t.PLAYLIST_NOT_FOUND}
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          style={{
            backgroundColor: theme.primary,
            borderRadius: radius.full,
            paddingHorizontal: spacing.lg,
            paddingVertical: 10,
          }}
        >
          <Text style={{ color: theme.primaryContent, fontWeight: "700" }}>{t.HOME}</Text>
        </Pressable>
      </View>
    );
  }

  return <PlaylistDetail key={playlist.id} playlistId={playlist.id} />;
}

function PlaylistDetail({ playlistId }: { playlistId: string }) {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const playlist = usePlaylistStore((s) => s.playlists.find((p) => p.id === playlistId));
  const playSong = usePlaylistStore((s) => s.playSong);
  const removeSong = usePlaylistStore((s) => s.removeSong);
  const removePlaylist = usePlaylistStore((s) => s.removePlaylist);
  const actualPlaylistId = usePlaylistStore((s) => s.actualPlaylistId);
  const toggleFavorite = usePlaylistStore((s) => s.toggleFavorite);
  const playing = usePlayerStore((s) => s.playing);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [cachedIds, setCachedIds] = useState(() => new Set(listCachedAudioIds()));

  // Handlers estables: permiten que SongItem memoice y que FlatList no
  // recree las filas al cambiar otros estados de la pantalla.
  const handleSelect = useCallback(
    (song: Song) => {
      void playSong(song, playlistId).then(() => usePlayerStore.getState().playSelected());
    },
    [playSong, playlistId],
  );

  const handleRemoveSong = useCallback(
    (song: Song) => {
      void removeSong(song, playlistId);
    },
    [removeSong, playlistId],
  );

  const renderSong = useCallback(
    ({ item }: { item: Song }) => (
      <View style={{ paddingHorizontal: spacing.lg }}>
        <SongItem
          song={item}
          onSelect={handleSelect}
          onRemove={handleRemoveSong}
          cachedIds={cachedIds}
        />
      </View>
    ),
    [cachedIds, handleRemoveSong, handleSelect],
  );

  if (!playlist) return null;

  const first = playlist.songs[0];
  const hasSongs = playlist.songs.length > 0;
  const isActual = actualPlaylistId === playlist.id;
  const isPlaying = isActual && playing;
  const isHistory = playlist.id === PLAYLISTS.HISTORY;
  const favorite = playlist.favorite === true;
  const title = isHistory ? t.RECENTS : playlist.title;
  const totalDuration = formatTotalDuration(getPlaylistTotalDuration(playlist));
  const subtitle = [formatCount(playlist.songs.length, t.SONGS_IN_PLAYLIST), totalDuration]
    .filter(Boolean)
    .join(" • ");

  // cachedIds se relee una vez por pantalla y tras descargar todo; las filas
  // reciben el Set y evitan consultar el filesystem por canción.
  const allCached = hasSongs && playlist.songs.every((s) => cachedIds.has(s.youtubeId));

  const handlePlayAll = () => {
    if (!first) return;
    if (isActual) {
      void togglePlay();
      return;
    }
    void playSong(first, playlist.id).then(() => usePlayerStore.getState().playSelected());
  };

  const handleDownloadAll = async () => {
    if (allCached || downloadingAll || !hasSongs) return;
    setDownloadingAll(true);
    try {
      for (const song of playlist.songs) {
        await addAudioToCache(song.youtubeId, "highest");
      }
      setCachedIds(new Set(listCachedAudioIds()));
      toast.success(t.DOWNLOAD);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    } finally {
      setDownloadingAll(false);
    }
  };

  const handleRemove = () => {
    setMenuOpen(false);
    router.replace("/(tabs)");
    void removePlaylist(playlist.id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.base100 }}>
      <FlatList
        data={playlist.songs}
        keyExtractor={(song) => song.youtubeId}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.xs }}
        ListHeaderComponent={
          <>
            <PlaylistHero
              title={title}
              subtitle={subtitle}
              first={first}
              hasSongs={hasSongs}
              isPlaying={isPlaying}
              shuffle={shuffle}
              allCached={allCached}
              downloadingAll={downloadingAll}
              favorite={favorite}
              showFavorite={!isHistory}
              showMore={!isHistory}
              onPlay={handlePlayAll}
              onShuffle={toggleShuffle}
              onDownload={() => void handleDownloadAll()}
              onToggleFavorite={() => void toggleFavorite(playlist.id)}
              onAddSongs={() => setPickerOpen(true)}
              onMore={() => setMenuOpen(true)}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.xl,
                paddingBottom: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={typography.sectionTitle}>{t.SONGS}</Text>
                <View
                  style={{
                    minWidth: 24,
                    height: 20,
                    paddingHorizontal: 7,
                    borderRadius: radius.full,
                    backgroundColor: theme.base200,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme.muted,
                      fontSize: 11,
                      fontWeight: "700",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {playlist.songs.length}
                  </Text>
                </View>
              </View>
              {totalDuration ? (
                <Text style={[typography.caption, { fontVariant: ["tabular-nums"] }]}>
                  {totalDuration}
                </Text>
              ) : null}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", gap: spacing.md, padding: spacing.xl }}>
            <Music size={32} color={theme.faint} />
            <Text style={{ color: theme.muted, fontSize: 14, textAlign: "center" }}>
              {t.EMPTY_PLAYLIST}
            </Text>
          </View>
        }
        renderItem={renderSong}
      />

      <View style={{ paddingBottom: insets.bottom }}>
        <MiniPlayer />
      </View>

      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        accessibilityRole="button"
        accessibilityLabel={t.BACK}
        style={{
          position: "absolute",
          top: insets.top + 6,
          left: spacing.lg,
          zIndex: 10,
          width: 40,
          height: 40,
          borderRadius: radius.full,
          backgroundColor: "rgba(15, 23, 42, 0.72)",
          borderWidth: 1,
          borderColor: theme.outline,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ArrowLeft size={20} color={theme.text} />
      </Pressable>

      <SongPicker
        visible={pickerOpen}
        playlistId={playlist.id}
        onClose={() => setPickerOpen(false)}
      />

      <ActionMenu visible={menuOpen} onClose={() => setMenuOpen(false)}>
        <ActionMenuItem onPress={handleRemove}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Trash2 size={16} color={theme.danger} />
            <Text style={{ color: theme.danger }}>{t.DELETE}</Text>
          </View>
        </ActionMenuItem>
      </ActionMenu>
    </View>
  );
}

function PlaylistHero({
  title,
  subtitle,
  first,
  hasSongs,
  isPlaying,
  shuffle,
  allCached,
  downloadingAll,
  favorite,
  showFavorite,
  showMore,
  onPlay,
  onShuffle,
  onDownload,
  onToggleFavorite,
  onAddSongs,
  onMore,
}: {
  title: string;
  subtitle: string;
  first: Song | undefined;
  hasSongs: boolean;
  isPlaying: boolean;
  shuffle: boolean;
  allCached: boolean;
  downloadingAll: boolean;
  favorite: boolean;
  showFavorite: boolean;
  showMore: boolean;
  onPlay: () => void;
  onShuffle: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onAddSongs: () => void;
  onMore: () => void;
}) {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  // Medium (mqdefault) ya es 16:9 sin las bandas negras que YouTube agrega a
  // hqdefault; a 160 dp sobra resolución y el blur tapa el resto.
  const coverUri = first
    ? getThumbnailUrl(first.youtubeId, {
        resolution: Resolution.Medium,
        w: "320",
        h: "320",
        fit: "cover",
      })
    : null;

  return (
    <View
      style={{
        overflow: "hidden",
        borderBottomLeftRadius: radius.xl,
        borderBottomRightRadius: radius.xl,
        backgroundColor: theme.base200,
      }}
    >
      {coverUri ? (
        <>
          <Image
            source={{ uri: coverUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            blurRadius={32}
          />
          <View
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(15, 23, 42, 0.86)" }]}
          />
        </>
      ) : null}

      <View
        style={{
          alignItems: "center",
          paddingHorizontal: spacing.xl,
          paddingTop: insets.top + 56,
          paddingBottom: spacing.xl,
        }}
      >
        <View
          style={{
            width: 160,
            height: 160,
            borderRadius: radius.xl,
            overflow: "hidden",
            backgroundColor: theme.base300,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              alt={title}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : (
            <Music size={52} color={theme.faint} />
          )}
        </View>

        <Text
          numberOfLines={2}
          style={{
            color: theme.text,
            fontSize: 24,
            fontWeight: "700",
            textAlign: "center",
            marginTop: spacing.lg,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            color: theme.muted,
            fontSize: 12,
            fontWeight: "500",
            textAlign: "center",
            marginTop: 6,
          }}
        >
          {subtitle}
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            marginTop: spacing.lg,
          }}
        >
          <Pressable
            onPress={onPlay}
            disabled={!hasSongs}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? t.PAUSE : t.PLAY_ALL}
            style={({ pressed }) => ({
              width: 56,
              height: 56,
              borderRadius: radius.full,
              backgroundColor: theme.primary,
              alignItems: "center",
              justifyContent: "center",
              opacity: !hasSongs ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            {isPlaying ? (
              <Pause size={24} color={theme.primaryContent} />
            ) : (
              <Play size={24} color={theme.primaryContent} />
            )}
          </Pressable>

          <Pressable
            onPress={onShuffle}
            disabled={!hasSongs}
            accessibilityRole="button"
            accessibilityState={{ selected: shuffle, disabled: !hasSongs }}
            accessibilityLabel={t.SHUFFLE}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
              height: 44,
              paddingHorizontal: 14,
              borderRadius: radius.full,
              backgroundColor: shuffle ? "rgba(248, 250, 252, 0.12)" : theme.base200,
              borderWidth: 1,
              borderColor: shuffle ? "rgba(248, 250, 252, 0.28)" : theme.outline,
              opacity: hasSongs ? 1 : 0.4,
            }}
          >
            <Shuffle size={18} color={shuffle ? theme.primary : theme.text} />
            <Text
              style={{
                color: shuffle ? theme.primary : theme.text,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {t.SHUFFLE}
            </Text>
          </Pressable>

          {showFavorite ? (
            <Pressable
              onPress={onToggleFavorite}
              accessibilityRole="button"
              accessibilityState={{ selected: favorite }}
              accessibilityLabel={favorite ? t.REMOVE_FROM_FAVORITES : t.ADD_TO_FAVORITES}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.full,
                backgroundColor: favorite ? "rgba(248, 250, 252, 0.12)" : theme.base200,
                borderWidth: 1,
                borderColor: favorite ? "rgba(248, 250, 252, 0.28)" : theme.outline,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Heart
                size={20}
                color={favorite ? theme.primary : theme.text}
                fill={favorite ? theme.primary : "transparent"}
              />
            </Pressable>
          ) : null}

          <Pressable
            onPress={onDownload}
            disabled={allCached || downloadingAll || !hasSongs}
            accessibilityRole="button"
            accessibilityLabel={t.DOWNLOAD_ALL}
            accessibilityState={{ disabled: allCached || downloadingAll || !hasSongs }}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.full,
              backgroundColor: allCached ? "rgba(248, 250, 252, 0.12)" : theme.base200,
              borderWidth: 1,
              borderColor: allCached ? "rgba(248, 250, 252, 0.28)" : theme.outline,
              alignItems: "center",
              justifyContent: "center",
              opacity: hasSongs ? 1 : 0.4,
            }}
          >
            {downloadingAll ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <CircleArrowDown size={20} color={allCached ? theme.primary : theme.muted} />
            )}
          </Pressable>

          {showMore ? (
            <Pressable
              onPress={onMore}
              accessibilityRole="button"
              accessibilityLabel={t.MORE_OPTIONS}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.full,
                backgroundColor: theme.base200,
                borderWidth: 1,
                borderColor: theme.outline,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EllipsisVertical size={20} color={theme.text} />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={onAddSongs}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t.ADD_SONGS}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: spacing.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 6,
            borderRadius: radius.full,
          }}
        >
          <Plus size={16} color={theme.primary} />
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "600" }}>
            {t.ADD_SONGS}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
