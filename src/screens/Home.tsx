import React from "react";
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, Platform, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getWatchHistory, WatchHistoryItem, removeFromHistory } from "../utils/watchHistory";
import { useTrendingMoviesDaily } from "../hooks/useTrendingMoviesDaily";
import { useTrendingTvDaily } from "../hooks/useTrendingTvDaily";
import { useTrendingMoviesWeekly } from "../hooks/useTrendingMoviesWeekly";
import { useTrendingTvWeekly } from "../hooks/useTrendingTvWeekly";
import { useTrendingAllDaily } from "../hooks/useTrendingAllDaily";
import PosterCard from "../components/PosterCard";
import AutoScrollingHero from "../components/AutoScrollingHero";
import SectionHeader from "../components/SectionHeader";
import Skeleton from "../components/Skeleton";
import { useTvProviders } from "../hooks/useProviders";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";
import { SearchResult } from "../api/types";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    console.log('🏠 Home ekrani yuklendi');
    console.log('📱 Platform:', Platform.OS);
  }, []);

  const { data: moviesDayData, isLoading: moviesDayLoading, refetch: refetchMoviesDay } = useTrendingMoviesDaily();
  const { data: tvDayData, isLoading: tvDayLoading, refetch: refetchTvDay } = useTrendingTvDaily();
  const { data: moviesWeekData, isLoading: moviesWeekLoading, refetch: refetchMoviesWeek } = useTrendingMoviesWeekly();
  const { data: tvWeekData, isLoading: tvWeekLoading, refetch: refetchTvWeek } = useTrendingTvWeekly();
  const { data: trendingAllData, isLoading: trendingAllLoading, refetch: refetchTrendingAll } = useTrendingAllDaily();

  const tvProviders = useTvProviders();
  const loading = moviesDayLoading || tvDayLoading || moviesWeekLoading || tvWeekLoading || tvProviders.isLoading || trendingAllLoading;

  const moviesDay = moviesDayData?.results ?? [];
  const tvDay = tvDayData?.results ?? [];
  const moviesWeek = moviesWeekData?.results ?? [];
  const tvWeek = tvWeekData?.results ?? [];

  const [continueWatching, setContinueWatching] = React.useState<WatchHistoryItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const history = await getWatchHistory();
    setContinueWatching(history);
  };

  const handleHistoryPress = (item: WatchHistoryItem) => {
    if (item.mediaType === 'movie') {
      navigation.navigate('MovieDetail', { id: item.tmdbId });
    } else {
      navigation.navigate('Episode', {
        tvId: item.tmdbId,
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber,
        tvTitle: item.title.split(' S')[0] // Basic parsing or just use title
      });
    }
  };

  const handleHistoryLongPress = (item: WatchHistoryItem) => {
    Alert.alert(
      "İzleme Geçmişinden Kaldır",
      "Bu içeriği izlemeye devam et listesinden kaldırmak istiyor musunuz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Kaldır",
          style: "destructive",
          onPress: async () => {
            await removeFromHistory(item.id);
            loadHistory();
          }
        }
      ]
    );
  };

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([
      refetchMoviesDay(),
      refetchTvDay(),
      refetchMoviesWeek(),
      refetchTvWeek(),
      refetchTrendingAll(),
      tvProviders.refetch(),
    ]).finally(() => setRefreshing(false));
  }, [refetchMoviesDay, refetchTvDay, refetchMoviesWeek, refetchTvWeek, refetchTrendingAll, tvProviders]);

  const normalize = (s: string) => s.toLowerCase();
  const getProviderKey = (name: string | undefined) => {
    const n = normalize(name || "");
    if (n.includes("netflix")) return "netflix";
    if (n.includes("apple tv")) return "apple";
    if (n.includes("amazon") || n.includes("prime video")) return "amazon";
    if (n.includes("hulu")) return "hulu";
    if (n.includes("disney")) return "disney";
    if (n.includes("hbo") || n === "axios" || n.includes("axios")) return "hbo";
    if (n.includes("amc")) return "amc";
    if (n.includes("paramount")) return "paramount";
    return undefined;
  };

  const filteredProviders = React.useMemo(() => {
    const list = (tvProviders.data || []);
    const desiredOrder = ["netflix", "apple", "amazon", "hulu", "disney", "hbo", "amc", "paramount"];
    const picked: Record<string, typeof list[number]> = {} as any;
    for (const p of list) {
      const key = getProviderKey(p.provider_name || "");
      if (!key) continue;
      if (!(key in picked)) picked[key] = p;
    }
    return desiredOrder.map(k => picked[k]).filter(Boolean);
  }, [tvProviders.data]);

  const handleHeroItemPress = (item: SearchResult) => {
    if (item.media_type === 'movie') {
      navigation.navigate('MovieDetail', { id: item.id });
    } else if (item.media_type === 'tv') {
      navigation.navigate('TvDetail', { id: item.id });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={<RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} />}
    >
      {/* Hero Section */}
      <AutoScrollingHero
        data={trendingAllData?.results || []}
        isLoading={trendingAllLoading}
        onItemPress={handleHeroItemPress}
      />

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <View>
          <SectionHeader title="İzlemeye Devam Et" />
          <FlatList
            data={continueWatching}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ marginRight: 12, width: 140 }}
                onPress={() => handleHistoryPress(item)}
                onLongPress={() => handleHistoryLongPress(item)}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                <PosterCard
                  title={item.title}
                  posterPath={item.posterPath}
                />
                <View style={{ height: 3, backgroundColor: '#333', marginTop: 4, borderRadius: 2 }}>
                  <View style={{
                    height: '100%',
                    backgroundColor: '#ff6b6b',
                    width: `${Math.min((item.currentTime / item.duration) * 100, 100)}%`,
                    borderRadius: 2
                  }} />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Movies Daily */}
      <SectionHeader
        title="Bugün Trend Filmler"
        onShowAllPress={() => navigation.navigate('TrendingList', { type: 'movies-daily', title: 'Bugün Trend Filmler' })}
      />
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
          data={moviesDay}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ marginRight: 12, width: 120 }}
              onPress={() => navigation.navigate('MovieDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* TV Daily */}
      <SectionHeader
        title="Bugün Trend Diziler"
        onShowAllPress={() => navigation.navigate('TrendingList', { type: 'tv-daily', title: 'Bugün Trend Diziler' })}
      />
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
            </View>
          )}
        />
      ) : (
        <FlatList
          data={tvDay}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          removeClippedSubviews={true}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ marginRight: 12, width: 120 }}
              onPress={() => navigation.navigate('TvDetail', { id: item.id })}
              activeOpacity={0.7}
            >
              <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Platforms */}
      <SectionHeader title="Platformlar" />
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => String(item.provider_id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.providerLogo}
            onPress={() => navigation.navigate('ProviderContent', { type: 'tv', providerId: item.provider_id, providerName: item.provider_name })}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: buildTmdbImageUrl(item.logo_path, 'w92') }}
              style={styles.providerImage}
              contentFit="contain"
            />
          </TouchableOpacity>
        )}
      />

      {/* Movies Weekly */}
      <SectionHeader
        title="Bu Hafta Popüler Filmler"
        onShowAllPress={() => navigation.navigate('TrendingList', { type: 'movies-weekly', title: 'Bu Hafta Popüler Filmler' })}
      />
      <FlatList
        data={moviesWeek}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        removeClippedSubviews={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginRight: 12, width: 120 }}
            onPress={() => navigation.navigate('MovieDetail', { id: item.id })}
            activeOpacity={0.7}
          >
            <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
          </TouchableOpacity>
        )}
      />

      {/* TV Weekly */}
      <SectionHeader
        title="Bu Hafta Popüler Diziler"
        onShowAllPress={() => navigation.navigate('TrendingList', { type: 'tv-weekly', title: 'Bu Hafta Popüler Diziler' })}
      />
      <FlatList
        data={tvWeek}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        removeClippedSubviews={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ marginRight: 12, width: 120 }}
            onPress={() => navigation.navigate('TvDetail', { id: item.id })}
            activeOpacity={0.7}
          >
            <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  providerLogo: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerImage: {
    width: '100%',
    height: '100%',
  },
});
