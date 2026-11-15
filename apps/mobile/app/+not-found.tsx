import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import House from "lucide-react-native/icons/house";
import Search from "lucide-react-native/icons/search";
import SearchX from "lucide-react-native/icons/search-x";
import { getDictionary } from "~/i18n";
import { radius, spacing, theme, typography } from "~/theme";

// Pantalla 404: ruta inexistente o enlace roto (incluye deep links de share).
// Muestra el path intentado para que el enlace roto sea identificable.
export default function NotFound() {
  const t = getDictionary();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.base100,
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingTop: insets.top + spacing.xl,
        paddingBottom: insets.bottom + spacing.xl,
      }}
    >
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: radius.full,
          backgroundColor: theme.base200,
          borderWidth: 1,
          borderColor: theme.outline,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: spacing.sm,
        }}
      >
        <SearchX size={40} color={theme.primary} />
      </View>

      <Text style={typography.label}>404</Text>
      <Text
        style={{
          color: theme.text,
          fontSize: 24,
          fontWeight: "700",
          letterSpacing: -0.4,
          textAlign: "center",
        }}
      >
        {t.NOT_FOUND_TITLE}
      </Text>
      <Text
        style={{
          color: theme.muted,
          fontSize: 14,
          lineHeight: 20,
          textAlign: "center",
          maxWidth: 320,
        }}
      >
        {t.NOT_FOUND_DESCRIPTION}
      </Text>

      {pathname && pathname !== "/" ? (
        <View
          style={{
            maxWidth: "100%",
            marginTop: spacing.xs,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: radius.full,
            backgroundColor: theme.base200,
            borderWidth: 1,
            borderColor: theme.outline,
          }}
        >
          <Text numberOfLines={1} style={{ color: theme.faint, fontSize: 12 }}>
            {pathname}
          </Text>
        </View>
      ) : null}

      <View style={{ width: "100%", maxWidth: 360, gap: spacing.sm, marginTop: spacing.lg }}>
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          accessibilityRole="button"
          accessibilityLabel={t.HOME}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            height: 48,
            borderRadius: radius.full,
            backgroundColor: theme.primary,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <House size={18} color={theme.primaryContent} />
          <Text style={{ color: theme.primaryContent, fontSize: 15, fontWeight: "700" }}>
            {t.HOME}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(tabs)/results")}
          accessibilityRole="button"
          accessibilityLabel={t.SEARCH}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.sm,
            height: 48,
            borderRadius: radius.full,
            backgroundColor: theme.base200,
            borderWidth: 1,
            borderColor: theme.outline,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Search size={18} color={theme.text} />
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: "600" }}>{t.SEARCH}</Text>
        </Pressable>
      </View>
    </View>
  );
}
