import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0f0f0f" },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: "#0f0f0f" },
        tabBarActiveTintColor: "#fff",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Playlists" }} />
      <Tabs.Screen name="results" options={{ title: "Search" }} />
    </Tabs>
  );
}
