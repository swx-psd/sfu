import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTvDetails } from "../hooks/useTvDetails";
import PosterCard from "../components/PosterCard";

type ParamList = {
  TvDetail: { id: number; name?: string; poster_path?: string | null };
};

export default function TvDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, "TvDetail">>();
  const id = route.params?.id || 0;
  const { details, credits } = useTvDetails(id);

  if (details.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  if (details.isError) {
    return (
      <View style={styles.center}>
        <Text>Hata oluştu</Text>
      </View>
    );
  }

  const d = details.data!;
  const cast = credits.data?.cast?.slice(0, 10) ?? [];

  const avgRuntime = d.episode_run_time?.[0];
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <PosterCard title={d.name || ""} posterPath={d.poster_path} />
      <Text style={styles.title}>{d.name}</Text>
      {!!d.tagline && <Text style={styles.tagline}>{d.tagline}</Text>}
      <Text style={styles.sub}>Puan: {d.vote_average?.toFixed(1) ?? "-"}</Text>
      <Text style={styles.sub}>Sezon/Bölüm: {d.number_of_seasons ?? "-"}/{d.number_of_episodes ?? "-"}</Text>
      <Text style={styles.sub}>Ortalama bölüm süresi: {avgRuntime ? `${avgRuntime} dk` : "-"}</Text>
      <Text style={styles.overview}>{d.overview}</Text>

      {!!cast.length && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Oyuncular (ilk 10)</Text>
          {cast.map((c) => (
            <Text key={c.id} style={styles.cast}>{c.name} {c.character ? `as ${c.character}` : ""}</Text>
          ))}
        </View>
      )}

      {!!d.seasons?.length && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Sezonlar</Text>
          {d.seasons.map((item) => (
            <TouchableOpacity key={item.season_number} style={{ marginVertical: 8 }} onPress={() => navigation.navigate('Season', { tvId: d.id, seasonNumber: item.season_number })}>
              <Text style={{ fontWeight: '600' }}>Sezon {item.season_number} • Bölüm: {item.episode_count ?? '-'}</Text>
              {!!item.name && <Text style={{ color: '#999' }}>{item.name}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 12, fontSize: 22, fontWeight: "700" },
  tagline: { marginTop: 4, fontStyle: "italic", color: "#999" },
  sub: { marginTop: 6 },
  overview: { marginTop: 12, lineHeight: 20 },
  section: { fontSize: 18, fontWeight: "600" },
  cast: { marginTop: 6 },
});


