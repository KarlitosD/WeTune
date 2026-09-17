import { Tabs } from "expo-router";
import { ListMusic, Search } from "lucide-react-native";
import { getDictionary } from "~/i18n";

export default function TabsLayout() {
  const t = getDictionary();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f0f0f" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#0f0f0f", borderTopColor: "#262626" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#737373",
        sceneStyle: { backgroundColor: "#0f0f0f" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.PLAYLISTS, tabBarIcon: ({ color, size }) => <ListMusic size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="results"
        options={{ title: t.SEARCH, tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }}
      />
    </Tabs>
  );
}
