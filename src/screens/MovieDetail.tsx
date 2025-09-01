import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useMovieDetails } from "../hooks/useMovieDetails";
import PosterCard from "../components/PosterCard";

type ParamList = {
  MovieDetail: { id: number; title?: string; poster_path?: string | null };
};

export default function MovieDetailScreen() {
  const route = useRoute<RouteProp<ParamList, "MovieDetail">>();
  const id = route.params?.id || 0;
  const { details, credits } = useMovieDetails(id);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <PosterCard title={d.title || ""} posterPath={d.poster_path} />
      <Text style={styles.title}>{d.title}</Text>
      {!!d.tagline && <Text style={styles.tagline}>{d.tagline}</Text>}
      <Text style={styles.sub}>Puan: {d.vote_average?.toFixed(1) ?? "-"}</Text>
      <Text style={styles.sub}>Süre: {d.runtime ? `${d.runtime} dk` : "-"}</Text>
      <Text style={styles.overview}>{d.overview}</Text>

      {!!cast.length && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.section}>Oyuncular (ilk 10)</Text>
          {cast.map((c) => (
            <Text key={c.id} style={styles.cast}>{c.name} {c.character ? `as ${c.character}` : ""}</Text>
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


