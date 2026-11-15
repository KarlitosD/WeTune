import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CircleArrowDown from "lucide-react-native/icons/circle-arrow-down";
import Heart from "lucide-react-native/icons/heart";
import Music from "lucide-react-native/icons/music";
import Plus from "lucide-react-native/icons/plus";
import Search from "lucide-react-native/icons/search";
import X from "lucide-react-native/icons/x";
import type { Playlist } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { getPlaylist } from "~/api/client";
import { PLAYLISTS } from "~/consts";
import { useCachedAudioIds } from "~/hooks/useCachedAudioIds";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { toast } from "~/store/useToastStore";
import { radius, spacing, theme, typography } from "~/theme";
import { createId } from "~/utils/id";
import { formatCount } from "~/utils/plural";
import { applyPlaylistView, type PlaylistView } from "~/utils/playlistFilters";
import PlaylistRow from "~/components/PlaylistRow";
import SearchBar from "~/components/SearchBar";

// Home: lista de playlists + creación/importación en modal.
const YOUTUBE_HOSTS = ["music.youtube.com", "www.youtube.com", "m.youtube.com"];

const keyExtractor = (playlist: Playlist) => playlist.id;

export default function Home() {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const playlists = usePlaylistStore((s) => s.playlists);
  const cachedIds = useCachedAudioIds();
  const addPlaylist = usePlaylistStore((s) => s.addPlaylist);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<PlaylistView>("all");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const closeModal = () => {
    setModalOpen(false);
    setName("");
    setUrl("");
  };

  const createPlaylist = () => {
    if (!name.trim()) return;
    void addPlaylist({ id: createId(), title: name.trim(), songs: [] });
    closeModal();
  };

  const importPlaylist = async () => {
    try {
      const parsed = new URL(url);
      const listId = parsed.searchParams.get("list");
      if (!listId || !YOUTUBE_HOSTS.includes(parsed.host)) return;
      const playlist = await getPlaylist(listId);
      await addPlaylist(playlist);
      closeModal();
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const term = query.trim().toLowerCase();
  // cachedIds es reactivo: se actualiza al terminar una descarga.
  const viewed = useMemo(
    () => applyPlaylistView(playlists, view, cachedIds),
    [playlists, view, cachedIds],
  );
  const filtered = useMemo(
    () =>
      term
        ? viewed.filter((playlist) => {
            const title = playlist.id === PLAYLISTS.HISTORY ? t.RECENTS : playlist.title;
            return title.toLowerCase().includes(term);
          })
        : viewed,
    [viewed, term, t.RECENTS],
  );

  const emptyText =
    playlists.length === 0
      ? t.NO_PLAYLISTS
      : term
        ? t.NO_RESULTS
        : view === "favorites"
          ? t.NO_FAVORITES
          : view === "downloaded"
            ? t.NO_DOWNLOADED
            : t.NO_RESULTS;
  const EmptyIcon =
    playlists.length === 0
      ? Music
      : view === "favorites"
        ? Heart
        : view === "downloaded"
          ? CircleArrowDown
          : Search;
  const filters = useMemo<{ id: PlaylistView; label: string }[]>(
    () => [
      { id: "all", label: t.ALL },
      { id: "recent", label: t.RECENTS },
      { id: "favorites", label: t.FAVORITES },
      { id: "downloaded", label: t.DOWNLOADED },
    ],
    [t],
  );
  const canCreate = name.trim().length > 0;
  const canImport = useMemo(() => {
    try {
      const parsed = new URL(url);
      return parsed.searchParams.get("list") !== null && YOUTUBE_HOSTS.includes(parsed.host);
    } catch {
      return false;
    }
  }, [url]);
  const renderPlaylist = useCallback(
    ({ item }: { item: Playlist }) => <PlaylistRow playlist={item} />,
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.base100 }}>
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.md,
          gap: spacing.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={typography.screenTitle}>{t.PLAYLISTS}</Text>
            <Text style={[typography.caption, { marginTop: 2 }]}>
              {formatCount(playlists.length, t.PLAYLIST_COUNT)}
            </Text>
          </View>
          <Pressable
            onPress={() => setModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t.NEW_PLAYLIST}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              height: 36,
              paddingHorizontal: 14,
              borderRadius: radius.full,
              backgroundColor: theme.primary,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Plus size={16} color={theme.primaryContent} />
            <Text
              numberOfLines={1}
              style={{ color: theme.primaryContent, fontSize: 13, fontWeight: "700" }}
            >
              {t.NEW_PLAYLIST}
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t.SEARCH_PLAYLISTS}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}
          >
            {filters.map((filter) => {
              const selected = view === filter.id;
              return (
                <Pressable
                  key={filter.id}
                  onPress={() => setView(filter.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={{
                    height: 32,
                    paddingHorizontal: 14,
                    borderRadius: radius.full,
                    backgroundColor: selected ? theme.primary : theme.base200,
                    borderWidth: 1,
                    borderColor: selected ? theme.primary : theme.outline,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: selected ? theme.primaryContent : theme.muted,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderPlaylist}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          gap: spacing.xs,
        }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ alignItems: "center", gap: spacing.md, paddingTop: 72 }}>
            <EmptyIcon size={40} color={theme.faint} />
            <Text style={{ color: theme.muted, fontSize: 14, textAlign: "center" }}>
              {emptyText}
            </Text>
            {playlists.length === 0 ? (
              <Pressable
                onPress={() => setModalOpen(true)}
                accessibilityRole="button"
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: 10,
                  borderRadius: radius.full,
                  backgroundColor: theme.primary,
                }}
              >
                <Text style={{ color: theme.primaryContent, fontWeight: "700" }}>
                  {t.NEW_PLAYLIST}
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
      />

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(2, 6, 23, 0.72)",
              justifyContent: "center",
              padding: spacing.xl,
            }}
            onPress={closeModal}
          >
            <View
              onStartShouldSetResponder={() => true}
              style={{
                backgroundColor: theme.base200,
                borderRadius: radius.xl,
                borderWidth: 1,
                borderColor: theme.outline,
                padding: spacing.xl,
                gap: spacing.lg,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text style={[typography.sectionTitle, { flex: 1 }]}>{t.CREATE_PLAYLIST}</Text>
                <Pressable
                  onPress={closeModal}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={t.CLOSE}
                  style={{ padding: 4 }}
                >
                  <X size={20} color={theme.muted} />
                </Pressable>
              </View>

              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="YouTube playlist URL"
                  placeholderTextColor={theme.faint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  style={{
                    flex: 1,
                    height: 44,
                    backgroundColor: theme.base100,
                    color: theme.text,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: theme.outline,
                    paddingHorizontal: spacing.md,
                    fontSize: 14,
                  }}
                />
                <Pressable
                  onPress={() => void importPlaylist()}
                  disabled={!canImport}
                  accessibilityRole="button"
                  style={{
                    height: 44,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: theme.base300,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: canImport ? 1 : 0.4,
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: "600" }}>{t.IMPORT}</Text>
                </Pressable>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.outline }} />
                <Text style={typography.label}>{t.OR}</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.outline }} />
              </View>

              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={createPlaylist}
                  placeholder={t.NAME_PLAYLIST}
                  placeholderTextColor={theme.faint}
                  style={{
                    flex: 1,
                    height: 44,
                    backgroundColor: theme.base100,
                    color: theme.text,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: theme.outline,
                    paddingHorizontal: spacing.md,
                    fontSize: 14,
                  }}
                />
                <Pressable
                  onPress={createPlaylist}
                  disabled={!canCreate}
                  accessibilityRole="button"
                  style={{
                    height: 44,
                    paddingHorizontal: spacing.md,
                    borderRadius: radius.md,
                    backgroundColor: theme.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: canCreate ? 1 : 0.4,
                  }}
                >
                  <Text style={{ color: theme.primaryContent, fontWeight: "700" }}>{t.ADD}</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
