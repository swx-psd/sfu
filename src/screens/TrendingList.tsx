import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import {
  useInfiniteTrendingMoviesDaily,
  useInfiniteTrendingTvDaily,
  useInfiniteTrendingMoviesWeekly,
  useInfiniteTrendingTvWeekly
} from '../hooks/useInfiniteTrending';
import PosterCard from '../components/PosterCard';
import Skeleton from '../components/Skeleton';
import { Movie, PaginatedResponse } from '../api/types';

type TrendingListParams = {
  TrendingList: {
    type: 'movies-daily' | 'tv-daily' | 'movies-weekly' | 'tv-weekly';
    title: string;
  };
};

type TrendingListRouteProp = RouteProp<TrendingListParams, 'TrendingList'>;

export default function TrendingListScreen() {
  const route = useRoute<TrendingListRouteProp>();
  const navigation = useNavigation<any>();
  const { type, title } = route.params;

  // Hook seçimi
  const moviesDaily = useInfiniteTrendingMoviesDaily();
  const tvDaily = useInfiniteTrendingTvDaily();
  const moviesWeekly = useInfiniteTrendingMoviesWeekly();
  const tvWeekly = useInfiniteTrendingTvWeekly();

  const getHookData = () => {
    switch (type) {
      case 'movies-daily':
        return moviesDaily;
      case 'tv-daily':
        return tvDaily;
      case 'movies-weekly':
        return moviesWeekly;
      case 'tv-weekly':
        return tvWeekly;
      default:
        return moviesDaily;
    }
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = getHookData();

  // Tüm sayfaları birleştir
  const allItems: Movie[] = data?.pages.flatMap((page: PaginatedResponse<Movie>) => page.results) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleItemPress = (item: Movie) => {
    if (type.includes('tv')) {
      navigation.navigate('TvDetail', { id: item.id });
    } else {
      navigation.navigate('MovieDetail', { id: item.id });
    }
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item)}
    >
      <PosterCard title={item.title || item.name || ""} posterPath={item.poster_path} />
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <View style={styles.itemContainer}>
      <Skeleton width={120} height={180} />
      <Skeleton width={120} height={14} style={{ marginTop: 8 }} />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  };

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bir hata oluştu</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      <FlatList
        data={isLoading ? Array(20).fill(null) : allItems}
        renderItem={isLoading ? renderSkeleton : renderItem}
        keyExtractor={(item, index) => isLoading ? `skeleton-${index}` : String(item?.id || index)}
        numColumns={3}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    marginBottom: 20,
    width: '31%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b0b0b',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
  },
  footerLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
  },
});