import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Check from "lucide-react-native/icons/check";
import Plus from "lucide-react-native/icons/plus";
import Search from "lucide-react-native/icons/search";
import X from "lucide-react-native/icons/x";
import { searchSongs } from "~/api/client";
import type { Song } from "~/db/schema";
import { getDictionary } from "~/i18n";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { toast } from "~/store/useToastStore";
import { radius, spacing, theme, typography } from "~/theme";
import { formatSeconds } from "~/utils/seconds";
import SearchBar from "./SearchBar";
import Thumbnail from "./Thumbnail";

// Selector de canciones para agregar a una playlist sin salir del detalle.
// Reutiliza la búsqueda de la app y deja el modal abierto para agregar varias.
export default function SongPicker({
  visible,
  playlistId,
  onClose,
}: {
  visible: boolean;
  playlistId: string;
  onClose: () => void;
}) {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const playlist = usePlaylistStore((s) => s.playlists.find((p) => p.id === playlistId));
  const addSong = usePlaylistStore((s) => s.addSong);
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [failed, setFailed] = useState(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const existing = new Set(playlist?.songs.map((song) => song.youtubeId) ?? []);

  const handleClose = () => {
    request.current?.abort();
    request.current = null;
    setQuery("");
    setSongs([]);
    setSearching(false);
    setSearched(false);
    setFailed(false);
    onClose();
  };

  const runSearch = async (term: string) => {
    if (!term) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);

    setSearching(true);
    setSearched(true);
    setFailed(false);
    try {
      const result = await searchSongs(term, controller.signal);
      if (request.current !== controller) return;
      const seen = new Set<string>();
      setSongs(
        [...result.songs, ...result.videos].filter((song) => {
          if (seen.has(song.youtubeId)) return false;
          seen.add(song.youtubeId);
          return true;
        }),
      );
    } catch (e) {
      if (request.current !== controller) return;
      if (!(e instanceof Error && e.name === "AbortError")) console.error(e);
      setFailed(true);
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setSearching(false);
      }
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) return;
    setSongs([]);
    setSearched(false);
    setFailed(false);
  };

  const handleAdd = async (song: Song) => {
    try {
      await addSong(song, playlistId);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.base100,
          paddingTop: insets.top + spacing.sm,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
          }}
        >
          <Text style={[typography.sectionTitle, { flex: 1 }]}>{t.ADD_SONGS}</Text>
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t.CLOSE}
            style={{ padding: 4 }}
          >
            <X size={20} color={theme.muted} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <SearchBar
            value={query}
            onChangeText={handleQueryChange}
            onSubmit={() => void runSearch(query.trim())}
            placeholder={t.SEARCH_SONGS}
            autoFocus
          />
        </View>

        {searching ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : !searched ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md }}>
            <Search size={40} color={theme.faint} />
            <Text style={{ color: theme.muted, fontSize: 14 }}>{t.SEARCH_HINT}</Text>
          </View>
        ) : failed ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg }}>
            <Text
              style={{
                color: theme.text,
                fontSize: 16,
                textAlign: "center",
                paddingHorizontal: spacing.xxl,
              }}
            >
              {t.RESULTS_ERROR}
            </Text>
            <Pressable
              onPress={() => void runSearch(query.trim())}
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
        ) : songs.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: theme.muted, fontSize: 14 }}>{t.NO_RESULTS}</Text>
          </View>
        ) : (
          <FlatList
            data={songs}
            keyExtractor={(song) => song.youtubeId}
            contentContainerStyle={{
              paddingHorizontal: spacing.lg,
              paddingBottom: insets.bottom + spacing.xl,
              gap: spacing.xs,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            renderItem={({ item }) => {
              const added = existing.has(item.youtubeId);
              return (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    padding: 6,
                    borderRadius: radius.md,
                    backgroundColor: added ? theme.base200 : "transparent",
                  }}
                >
                  <Thumbnail youtubeId={item.youtubeId} title={item.title} size={48} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      numberOfLines={1}
                      style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{ color: theme.muted, fontSize: 12, marginTop: 3 }}
                    >
                      {[item.author?.name, formatSeconds(item.duration)].filter(Boolean).join(" • ")}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => void handleAdd(item)}
                    disabled={added}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`${added ? t.ADDED : t.ADD}: ${item.title}`}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.full,
                      backgroundColor: added ? theme.base300 : theme.primary,
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: added ? 0.8 : 1,
                    }}
                  >
                    {added ? (
                      <Check size={18} color={theme.primary} />
                    ) : (
                      <Plus size={18} color={theme.primaryContent} />
                    )}
                  </Pressable>
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
