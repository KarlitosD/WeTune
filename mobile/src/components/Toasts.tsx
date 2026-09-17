import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore, type ToastType } from "~/store/useToastStore";

// Puerto de web ~/components/Toaster.
const COLORS: Record<ToastType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#3b82f6",
  loading: "#a3a3a3",
};

export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 16, right: 16, bottom: 96 + insets.bottom, gap: 8 }}
    >
      {toasts.map((t) => (
        <Pressable
          key={t.id}
          onPress={() => dismiss(t.id)}
          style={{ backgroundColor: "#1c1c1c", borderLeftWidth: 4, borderLeftColor: COLORS[t.type], borderRadius: 8, padding: 12 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>{t.title}</Text>
          {t.description ? <Text style={{ color: "#d4d4d4", marginTop: 2 }}>{t.description}</Text> : null}
        </Pressable>
      ))}
    </View>
  );
}
