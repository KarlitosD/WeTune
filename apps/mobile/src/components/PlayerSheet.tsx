import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import CircleArrowDown from "lucide-react-native/icons/circle-arrow-down";
import Pause from "lucide-react-native/icons/pause";
import Play from "lucide-react-native/icons/play";
import Repeat from "lucide-react-native/icons/repeat";
import Share2 from "lucide-react-native/icons/share-2";
import Shuffle from "lucide-react-native/icons/shuffle";
import SkipBack from "lucide-react-native/icons/skip-back";
import SkipForward from "lucide-react-native/icons/skip-forward";
import X from "lucide-react-native/icons/x";
import { useProgress } from "react-native-track-player";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { usePlaylistStore } from "~/store/usePlaylistStore";
import { usePlayerStore } from "~/store/usePlayerStore";
import { useShare } from "~/hooks/useShare";
import { useCachedAudioIds } from "~/hooks/useCachedAudioIds";
import { getDictionary } from "~/i18n";
import { radius, theme, typography } from "~/theme";
import { formatSeconds } from "~/utils/seconds";
import { Resolution, getThumbnailUrl } from "~/utils/thumbnail";

// Drawer del player: ocupa una fracción de la pantalla y se cierra
// deslizando el handle hacia abajo o tocando el overlay.
export default function PlayerSheet() {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const song = usePlaylistStore((s) => s.selectedSong());
  const expanded = usePlayerStore((s) => s.expanded);
  const setExpanded = usePlayerStore((s) => s.setExpanded);
  const playing = usePlayerStore((s) => s.playing);
  const loop = usePlayerStore((s) => s.loop);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const downloading = usePlayerStore((s) => s.downloading);

  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const handleNext = usePlayerStore((s) => s.handleNext);
  const handlePrevious = usePlayerStore((s) => s.handlePrevious);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const toggleShuffle = usePlayerStore((s) => s.toggleShuffle);
  const handleDownload = usePlayerStore((s) => s.handleDownload);
  // Después de todos los hooks: useShare debe correr siempre (rules-of-hooks),
  // acepta undefined y no hace nada en ese caso.
  const { handleShare } = useShare(song);
  const cachedIds = useCachedAudioIds();
  const downloaded = song ? cachedIds.has(song.youtubeId) : false;

  const sheetHeight = Math.min(windowHeight - 96, Math.max(400, windowHeight * 0.78));
  const [translateY] = useState(() => new Animated.Value(sheetHeight));

  const settleOpen = () => {
    Animated.spring(translateY, {
      toValue: 0,
      damping: 20,
      stiffness: 220,
      useNativeDriver: false,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: sheetHeight,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setExpanded(false));
  };

  const [panResponder] = useState(() =>
    PanResponder.create({
      // El gesto se reclama en el touch start: registrando solo "on move", RN
      // no entrega los movimientos y la hoja no sigue al dedo. Los handlers
      // viven en el handle, el header y la carátula, así que el ScrollView y
      // los controles siguen funcionando; el botón cerrar gana por ser un
      // Pressable hijo más profundo.
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(Math.max(0, gesture.dy));
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > sheetHeight * 0.25 || gesture.vy > 0.8) closeSheet();
        else settleOpen();
      },
      onPanResponderTerminate: settleOpen,
      onPanResponderTerminationRequest: () => false,
    }),
  );

  useEffect(() => {
    if (!expanded) return;
    Animated.timing(translateY, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [expanded, translateY]);

  if (!song) return null;
  const coverSize = Math.min(240, windowWidth - 96);

  return (
    <Modal
      visible={expanded}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          onPress={closeSheet}
          accessibilityRole="button"
          accessibilityLabel={t.CLOSE}
          style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(2, 6, 23, 0.64)" }]}
        />

        <Animated.View
          style={{
            height: sheetHeight,
            backgroundColor: theme.base200,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: theme.outline,
            transform: [{ translateY }],
          }}
        >
          <View {...panResponder.panHandlers}>
            <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 4 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: theme.base300,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 24,
                paddingTop: 4,
                paddingBottom: 8,
              }}
            >
              <Text style={[typography.label, { flex: 1 }]}>{t.NOW_PLAYING}</Text>
              <Pressable
                onPress={closeSheet}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.CLOSE}
                style={{ padding: 4 }}
              >
                <X size={20} color={theme.muted} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <View
              {...panResponder.panHandlers}
              style={{
                width: coverSize,
                height: coverSize,
                borderRadius: radius.lg,
                backgroundColor: theme.base300,
              }}
            >
              <Image
                source={{
                  uri: getThumbnailUrl(song.youtubeId, {
                    resolution: Resolution.Max,
                    w: "512",
                    h: "512",
                    fit: "cover",
                  }),
                }}
                style={{ width: "100%", height: "100%", borderRadius: radius.lg }}
                contentFit="cover"
              />
            </View>
            <Text
              numberOfLines={1}
              style={{
                color: theme.text,
                fontSize: 20,
                fontWeight: "700",
                marginTop: 16,
                alignSelf: "stretch",
                textAlign: "center",
              }}
            >
              {song.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ color: theme.muted, marginTop: 4, alignSelf: "stretch", textAlign: "center" }}
            >
              {song.author?.name}
            </Text>

            <PlayerProgress />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
                alignSelf: "stretch",
                marginTop: 12,
              }}
            >
              <Pressable
                onPress={() => void handleShare()}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.SHARE}
              >
                <Share2 size={20} color={theme.muted} />
              </Pressable>
              <Pressable
                onPress={toggleShuffle}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.SHUFFLE}
              >
                <Shuffle size={22} color={shuffle ? theme.primary : theme.muted} />
              </Pressable>
              <Pressable
                onPress={() => void handlePrevious()}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.PREVIOUS}
              >
                <SkipBack size={30} color={theme.text} />
              </Pressable>
              <Pressable
                onPress={() => void togglePlay()}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={playing ? t.PAUSE : t.PLAY}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.primary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {playing ? (
                  <Pause size={26} color={theme.primaryContent} />
                ) : (
                  <Play size={26} color={theme.primaryContent} />
                )}
              </Pressable>
              <Pressable
                onPress={() => void handleNext()}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.NEXT}
              >
                <SkipForward size={30} color={theme.text} />
              </Pressable>
              <Pressable
                onPress={toggleLoop}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.REPEAT}
                style={{ alignItems: "center" }}
              >
                <Repeat size={22} color={loop !== "NONE" ? theme.primary : theme.muted} />
                {loop === "ONE" ? (
                  <Text style={{ color: theme.primary, fontSize: 10 }}>1</Text>
                ) : null}
              </Pressable>
              <Pressable
                onPress={() => void handleDownload()}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t.DOWNLOAD}
                disabled={downloaded}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <CircleArrowDown
                    size={20}
                    color={downloaded ? theme.primary : theme.muted}
                  />
                )}
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// El slider y los tiempos son la única parte que depende del progreso.
// Al vivir en una hoja, el resto del drawer no se re-renderiza cada 500 ms.
function PlayerProgress() {
  const seek = usePlayerStore((s) => s.seek);
  const { position, duration } = useProgress(500);
  const [sliding, setSliding] = useState<number | null>(null);
  const shown = sliding ?? position;

  return (
    <View style={{ alignSelf: "stretch", marginTop: 20 }}>
      <Slider
        value={shown}
        minimumValue={0}
        maximumValue={Math.max(duration, 0)}
        onSlidingStart={() => setSliding(position)}
        onValueChange={setSliding}
        onSlidingComplete={(v) => {
          setSliding(null);
          void seek(v);
        }}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.base300}
        thumbTintColor={theme.primary}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: theme.muted, fontSize: 12 }}>{formatSeconds(shown)}</Text>
        <Text style={{ color: theme.muted, fontSize: 12 }}>{formatSeconds(duration)}</Text>
      </View>
    </View>
  );
}
