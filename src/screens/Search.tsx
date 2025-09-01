import React from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useMultiSearch } from "../hooks/useMultiSearch";
import PosterCard from "../components/PosterCard";
import Skeleton from "../components/Skeleton";

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [text, setText] = React.useState("");
  const debounced = useDebouncedValue(text, 400);
  const { data, isFetching, fetchNextPage, hasNextPage } = useMultiSearch(debounced);

  const results = React.useMemo(() => {
    return data?.pages.flatMap((p) => p.results) ?? [];
  }, [data]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Film, dizi veya kişi ara"
        placeholderTextColor="#888"
        value={text}
        onChangeText={setText}
        style={styles.input}
        autoCorrect={false}
      />

      {isFetching && results.length === 0 ? (
        <View style={{ paddingHorizontal: 12 }}>
          <Skeleton height={42} style={{ marginBottom: 12 }} />
          <Skeleton height={42} style={{ marginBottom: 12 }} />
          <Skeleton height={42} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                if (item.media_type === 'movie') {
                  navigation.navigate('MovieDetail', { id: item.id });
                } else if (item.media_type === 'tv') {
                  navigation.navigate('TvDetail', { id: item.id });
                }
              }}
            >
              <PosterCard
                title={item.title || item.name || ""}
                posterPath={item.poster_path || (item as any).profile_path}
              />
              <Text style={styles.meta}>{item.media_type}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            debounced
              ? undefined
              : () => (
                  <View style={{ alignItems: "center", marginTop: 24 }}>
                    <Text>Aramak için yazmaya başlayın</Text>
                  </View>
                )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  input: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
    color: "#fff",
  },
  row: { marginBottom: 12 },
  meta: { marginTop: 6, fontSize: 12, color: "#888" },
});


