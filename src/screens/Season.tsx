import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSeasonDetails } from "../hooks/useSeasonDetails";

type ParamList = {
  Season: { tvId: number; seasonNumber: number; tvName?: string };
};

export default function SeasonScreen() {
  const route = useRoute<RouteProp<ParamList, "Season">>();
  const navigation = useNavigation<any>();
  const { tvId, seasonNumber } = route.params;
  const { season } = useSeasonDetails(tvId, seasonNumber);

  if (season.isLoading) {
    return (
      <View style={styles.center}><Text>Yükleniyor...</Text></View>
    );
  }
  if (season.isError) {
    return (
      <View style={styles.center}><Text>Hata oluştu</Text></View>
    );
  }

  const s = season.data!;
  const episodes = s.episodes ?? [];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{s.name}</Text>
      <FlatList
        data={episodes}
        keyExtractor={(e) => String(e.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Episode', { tvId, seasonNumber, episodeNumber: item.episode_number })}
          >
            <Text style={styles.rowTitle}>{item.episode_number}. {item.name}</Text>
            <Text numberOfLines={2} style={styles.rowSub}>{item.overview}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', margin: 16 },
  row: { marginBottom: 16 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSub: { color: '#999', marginTop: 4 },
});


