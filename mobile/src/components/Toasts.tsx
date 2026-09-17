import { Pressable, Text, View } from "react-native";
import { AlertTriangle, Check, Info, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToastStore, type ToastType } from "~/store/useToastStore";
import { theme } from "~/theme";

// Puerto de web ~/components/Toaster + ToastItem (icono por tipo + botón X;
// abajo en vez de arriba-derecha: es lo correcto en móvil con el player fijo).
const TOAST_META: Record<ToastType, { color: string; Icon: typeof Check }> = {
  success: { color: "#22c55e", Icon: Check },
  error: { color: "#ef4444", Icon: X },
  info: { color: "#3b82f6", Icon: Info },
  loading: { color: "#a3a3a3", Icon: AlertTriangle },
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
      {toasts.map((t) => {
        const { color, Icon } = TOAST_META[t.type];
        return (
          <Pressable
            key={t.id}
            onPress={() => dismiss(t.id)}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              backgroundColor: theme.base200,
              borderLeftWidth: 4,
              borderLeftColor: color,
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Icon size={20} color={color} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.white, fontWeight: "600" }}>{t.title}</Text>
              {t.description ? (
                <Text style={{ color: "#d4d4d4", marginTop: 2 }}>{t.description}</Text>
              ) : null}
            </View>
            <Pressable onPress={() => dismiss(t.id)} hitSlop={8} style={{ padding: 4 }}>
              <X size={16} color={theme.muted} />
            </Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}
