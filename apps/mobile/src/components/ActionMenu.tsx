import { Modal, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { radius, spacing, theme } from "~/theme";

// Bottom-sheet nativo para menús de acciones.
export function ActionMenu({
  visible,
  onClose,
  children,
  style,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(2, 6, 23, 0.72)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <View
          style={[
            {
              backgroundColor: theme.base200,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              borderTopWidth: 1,
              borderColor: theme.outline,
              padding: spacing.sm,
              paddingBottom: Math.max(insets.bottom, spacing.xl),
            },
            style,
          ]}
        >
          <View
            style={{
              alignSelf: "center",
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.base300,
              marginBottom: spacing.sm,
            }}
          />
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export function ActionMenuItem({
  onPress,
  children,
  disabled = false,
}: {
  onPress: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityState={disabled ? { disabled: true } : undefined}
      style={({ pressed }) => [
        {
          padding: 14,
          borderRadius: radius.md,
          backgroundColor: pressed && !disabled ? theme.base300 : "transparent",
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
