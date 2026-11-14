import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "expo-router/tabs";
import { ListMusic, Search } from "lucide-react-native";
import { getDictionary } from "~/i18n";
import { theme } from "~/theme";
import MiniPlayer from "~/components/MiniPlayer";
import { usePlaylistStore } from "~/store/usePlaylistStore";

export default function TabsLayout() {
  const t = getDictionary();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.base100 },
      }}
      tabBar={(props) => <PlayerTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: t.PLAYLISTS }} />
      <Tabs.Screen name="results" options={{ title: t.SEARCH }} />
    </Tabs>
  );
}

// Barra propia para poder apilar el mini player arriba de las tabs, como en
// el mockup. Si no hay canción, MiniPlayer no renderiza nada.
function PlayerTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const hasSong = Boolean(usePlaylistStore((s) => s.selectedSong()));

  return (
    <View style={{ backgroundColor: theme.base100, paddingBottom: insets.bottom }}>
      <MiniPlayer />
      <View
        style={{
          flexDirection: "row",
          height: 56,
          borderTopWidth: hasSong ? 0 : StyleSheet.hairlineWidth,
          borderTopColor: theme.outline,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const color = focused ? theme.primary : theme.faint;
          const Icon = route.name === "results" ? Search : ListMusic;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key })
              }
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 2 }}
            >
              <Icon size={23} color={color} />
              <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
