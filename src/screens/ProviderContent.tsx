import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useProviderContent } from "../hooks/useProviderContent";
import PosterCard from "../components/PosterCard";

type ParamList = {
  ProviderContent: { type: "movie" | "tv"; providerId: number; providerName?: string };
};

export default function ProviderContentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, "ProviderContent">>();
  const { type, providerId } = route.params;
  const query = useProviderContent(type, providerId);

  if (query.isLoading) return <View style={styles.center}><Text style={{ color: '#fff' }}>Yükleniyor...</Text></View>;
  if (query.isError) return <View style={styles.center}><Text style={{ color: '#fff' }}>Hata oluştu</Text></View>;

  const data = query.data?.pages.flatMap(p => p.results) ?? [];
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        numColumns={3}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        onEndReachedThreshold={0.6}
        onEndReached={() => query.hasNextPage && query.fetchNextPage()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: '32%' }}
            onPress={() => navigation.navigate(type === 'movie' ? 'MovieDetail' : 'TvDetail', { id: item.id })}
          >
            <PosterCard title={item.title || item.name || ''} posterPath={item.poster_path} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0b' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0b' },
});


