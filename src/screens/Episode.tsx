import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEpisodeDetails } from "../hooks/useEpisodeDetails";

type ParamList = {
  Episode: { tvId: number; seasonNumber: number; episodeNumber: number };
};

export default function EpisodeScreen() {
  const route = useRoute<RouteProp<ParamList, "Episode">>();
  const { tvId, seasonNumber, episodeNumber } = route.params;
  const { data, isLoading, isError } = useEpisodeDetails(tvId, seasonNumber, episodeNumber);

  if (isLoading) return <View style={styles.center}><Text>Yükleniyor...</Text></View>;
  if (isError || !data) return <View style={styles.center}><Text>Hata oluştu</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{data.episode_number}. {data.name}</Text>
      <Text style={{ marginTop: 8 }}>{data.overview}</Text>
      <Text style={{ marginTop: 8, color: '#999' }}>Puan: {data.vote_average?.toFixed(1) ?? '-'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
});


