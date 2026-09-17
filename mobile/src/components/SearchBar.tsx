import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";
import { getDictionary } from "~/i18n";
import { theme } from "~/theme";

// Puerto de web ~/components/Layout/Header (form action -> router).
export default function SearchBar({
  initialValue = "",
  onSubmit,
}: {
  initialValue?: string;
  onSubmit: (query: string) => void;
}) {
  const t = getDictionary();
  const [value, setValue] = useState(initialValue);

  return (
    <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={() => onSubmit(value.trim())}
        returnKeyType="search"
        placeholder={t.SEARCH}
        placeholderTextColor="#737373"
        style={{ flex: 1, backgroundColor: theme.base200, color: "#fff", borderRadius: 8, paddingHorizontal: 12, height: 44 }}
      />
      <Pressable
        onPress={() => onSubmit(value.trim())}
        style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: "#404040", alignItems: "center", justifyContent: "center" }}
      >
        <Search size={20} color="#fff" />
      </Pressable>
    </View>
  );
}
