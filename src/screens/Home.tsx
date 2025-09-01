import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { usePopularMovies } from "../hooks/usePopularMovies";
import { usePopularTv } from "../hooks/usePopularTv";
import { useTrendingDaily } from "../hooks/useTrendingDaily";
import { useNowPlayingMovies } from "../hooks/useNowPlayingMovies";
import { useAiringToday } from "../hooks/useAiringToday";
import PosterCard from "../components/PosterCard";
import Skeleton from "../components/Skeleton";
import ReactNative from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { data: moviesData, isLoading: moviesLoading, isError: moviesError, refetch: refetchMovies } = usePopularMovies();
  const { data: tvData, isLoading: tvLoading, isError: tvError } = usePopularTv();
  const { data: trendData, isLoading: trendLoading, isError: trendError } = useTrendingDaily();
  const { data: nowPlayingData, isLoading: nowPlayingLoading, isError: nowPlayingError, refetch: refetchNowPlaying } = useNowPlayingMovies();
  const { data: airingTodayData, isLoading: airingLoading, isError: airingError, refetch: refetchAiring } = useAiringToday();

  const loading = moviesLoading || tvLoading || trendLoading || nowPlayingLoading || airingLoading;

  if (moviesError || tvError || trendError || nowPlayingError || airingError) {
    return (
      <View style={styles.center}> 
        <Text>Bir hata oluştu</Text>
      </View>
    );
  }

  const movies = moviesData?.results ?? [];
  const tvs = tvData?.results ?? [];
  const trends = trendData?.results ?? [];
  const nowPlaying = nowPlayingData?.results ?? [];
  const airing = airingTodayData?.results ?? [];

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      refetchMovies(),
      refetchNowPlaying(),
      refetchAiring(),
    ]).finally(() => setRefreshing(false));
  }, [refetchMovies, refetchNowPlaying, refetchAiring]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
    >
      <Text style={styles.sectionTitle}>Popüler Filmler</Text>
      {loading ? (
        <FlatList
          data={[...Array(8).keys()]}
          keyExtractor={(i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => (
            <View style={{ marginRight: 12 }}>
              <Skeleton width={120} height={180} />
              <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
            </View>
          )}
        />
      ) : (
        <FlatList
        data={movies}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ marginRight: 12 }} onPress={() => navigation.navigate('MovieDetail', { id: item.id })}>
            <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
          </TouchableOpacity>
        )}
        />
      )}

      <Text style={styles.sectionTitle}>Popüler Diziler</Text>
      {loading ? (
        <FlatList
          data={[...Array(8).keys()]}
          keyExtractor={(i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => (
            <View style={{ marginRight: 12 }}>
              <Skeleton width={120} height={180} />
              <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
            </View>
          )}
        />
      ) : (
        <FlatList
        data={tvs}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ marginRight: 12 }} onPress={() => navigation.navigate('TvDetail', { id: item.id })}>
            <PosterCard title={item.name || item.title || ""} posterPath={item.poster_path} />
          </TouchableOpacity>
        )}
        />
      )}

      <Text style={styles.sectionTitle}>Trend (Günlük)</Text>
      {loading ? (
        <FlatList
          data={[...Array(8).keys()]}
          keyExtractor={(i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => (
            <View style={{ marginRight: 12 }}>
              <Skeleton width={120} height={180} />
              <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
            </View>
          )}
        />
      ) : (
        <FlatList
        data={trends}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ marginRight: 12 }} onPress={() => navigation.navigate('MovieDetail', { id: item.id })}>
            <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
          </TouchableOpacity>
        )}
        />
      )}

      <Text style={styles.sectionTitle}>Now Playing</Text>
      {loading ? (
        <FlatList
          data={[...Array(8).keys()]}
          keyExtractor={(i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => (
            <View style={{ marginRight: 12 }}>
              <Skeleton width={120} height={180} />
              <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={nowPlaying}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <View style={{ marginRight: 12 }}>
              <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
            </View>
          )}
        />
      )}

      <Text style={styles.sectionTitle}>Airing Today</Text>
      {loading ? (
        <FlatList
          data={[...Array(8).keys()]}
          keyExtractor={(i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={() => (
            <View style={{ marginRight: 12 }}>
              <Skeleton width={120} height={180} />
              <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={airing}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={{ marginRight: 12 }} onPress={() => navigation.navigate('TvDetail', { id: item.id })}>
              <PosterCard title={item.name || item.title || ""} posterPath={item.poster_path} />
            </TouchableOpacity>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, paddingHorizontal: 12 },
});


