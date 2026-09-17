import { Modal, Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { theme } from "~/theme";

// Reemplaza web ~/components/Dropdown (DaisyUI) con bottom-sheet nativo.
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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <View style={[{ backgroundColor: theme.base200, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 8 }, style]}>
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export function ActionMenuItem({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ padding: 14, opacity: pressed ? 0.6 : 1 }]}
    >
      {children}
    </Pressable>
  );
}
