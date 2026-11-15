import { Pressable, TextInput, View } from "react-native";
import Search from "lucide-react-native/icons/search";
import X from "lucide-react-native/icons/x";
import { getDictionary } from "~/i18n";
import { radius, spacing, theme } from "~/theme";

// Campo de búsqueda compartido por Playlists y Resultados.
// Es controlado para que la pantalla decida si filtra en vivo o busca al enviar.
export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder,
  autoFocus = false,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const t = getDictionary();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        height: 46,
        paddingLeft: spacing.md,
        paddingRight: spacing.sm,
        borderRadius: radius.full,
        backgroundColor: theme.base200,
        borderWidth: 1,
        borderColor: theme.outline,
      }}
    >
      <Search size={18} color={theme.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={theme.faint}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        style={{ flex: 1, color: theme.text, fontSize: 15, paddingVertical: 0 }}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText("")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t.CLEAR}
          style={{
            width: 24,
            height: 24,
            borderRadius: radius.full,
            backgroundColor: theme.base300,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={13} color={theme.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}
