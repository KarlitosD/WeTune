import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { theme } from "~/theme";

// Pantalla 404.
export default function NotFound() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.base100, alignItems: "center", justifyContent: "center", gap: 16 }}>
      <Text style={{ color: theme.white, fontSize: 48, fontWeight: "200", textTransform: "uppercase" }}>
        Not Found
      </Text>
      <Link href="/(tabs)" asChild>
        <Pressable style={{ backgroundColor: "#404040", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Text style={{ color: theme.white }}>Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
