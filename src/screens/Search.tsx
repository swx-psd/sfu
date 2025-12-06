import React from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useMultiSearch } from "../hooks/useMultiSearch";
import { useInfiniteTrendingAllDaily } from "../hooks/useInfiniteTrending";
import PosterCard from "../components/PosterCard";
import Skeleton from "../components/Skeleton";
import { Ionicons } from "@expo/vector-icons";

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const [text, setText] = React.useState("");
  const debounced = useDebouncedValue(text, 400);
  const { data, isFetching, fetchNextPage, hasNextPage } = useMultiSearch(debounced);
  const {
    data: trendingData,
    isLoading: trendingLoading,
    fetchNextPage: fetchNextTrendingPage,
    hasNextPage: hasNextTrendingPage,
    isFetchingNextPage: isFetchingNextTrendingPage
  } = useInfiniteTrendingAllDaily();

  const results = React.useMemo(() => {
    return data?.pages.flatMap((p) => p.results) ?? [];
  }, [data]);

  const trendingItems = React.useMemo(() => {
    return trendingData?.pages.flatMap((p: any) => p.results) ?? [];
  }, [trendingData]);

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

      {!debounced ? (
        // Show trending when no search query
        <View style={styles.trendingContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#ff6b6b" />
            <Text style={styles.sectionTitle}>En Çok Arananlar</Text>
          </View>

          {trendingLoading ? (
            <View style={styles.skeletonContainer}>
              {[...Array(6).keys()].map((i) => (
                <View key={i} style={styles.skeletonItem}>
                  <Skeleton width={80} height={120} style={styles.skeletonPoster} />
                  <Skeleton width={80} height={14} style={styles.skeletonText} />
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              data={trendingItems}
              keyExtractor={(item) => String(item.id)}
              numColumns={3}
              contentContainerStyle={styles.trendingGrid}
              onEndReached={() => {
                if (hasNextTrendingPage && !isFetchingNextTrendingPage) {
                  fetchNextTrendingPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() => {
                if (isFetchingNextTrendingPage) {
                  return (
                    <View style={styles.loadingFooter}>
                      <View style={styles.loadingSpinner} />
                      <Text style={styles.loadingText}>Daha fazla yükleniyor...</Text>
                    </View>
                  );
                }
                return null;
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.trendingItem}
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
                    posterPath={item.poster_path}
                  />

                  <View style={styles.trendingMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#ffd700" />
                      <Text style={styles.ratingText}>{item.vote_average?.toFixed(1)}</Text>
                    </View>
                    <Text style={styles.mediaType}>
                      {item.media_type === 'movie' ? 'Film' : 'Dizi'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      ) : (
        // Show search results
        <>
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
              numColumns={3}
              contentContainerStyle={styles.trendingGrid}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.trendingItem}
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

                  <View style={styles.trendingMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#ffd700" />
                      <Text style={styles.ratingText}>{item.vote_average?.toFixed(1) || '0.0'}</Text>
                    </View>
                    <Text style={styles.mediaType}>
                      {item.media_type === 'movie' ? 'Film' : item.media_type === 'tv' ? 'Dizi' : 'Kişi'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ alignItems: "center", marginTop: 24 }}>
                  <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                </View>
              )}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    backgroundColor: '#0b0b0b'
  },
  input: {
    marginHorizontal: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    fontSize: 16,
  },

  // Trending Section
  trendingContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // Trending Grid
  trendingGrid: {
    paddingBottom: 24,
  },
  trendingItem: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
    maxWidth: '31%',
  },
  trendingTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
  trendingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    color: '#ffd700',
    fontSize: 10,
    fontWeight: '600',
  },
  mediaType: {
    color: '#ff6b6b',
    fontSize: 10,
    fontWeight: '500',
  },

  // Skeleton
  skeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonItem: {
    width: '31%',
    marginBottom: 16,
    alignItems: 'center',
  },
  skeletonPoster: {
    borderRadius: 8,
  },
  skeletonText: {
    marginTop: 8,
    borderRadius: 4,
  },

  // Search Results
  row: {
    marginBottom: 12
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: "#ccc"
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },

  // Loading Footer
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff6b6b',
    borderTopColor: 'transparent',
    // Note: Animation would need to be implemented with Animated API
  },
  loadingText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
});


