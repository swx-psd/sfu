import React, { useRef, useEffect } from 'react';
import { View, FlatList, Dimensions, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { SearchResult } from '../api/types';
import { buildTmdbImageUrl } from '../utils';
import Skeleton from './Skeleton';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AutoScrollingHeroProps {
  data: SearchResult[];
  isLoading: boolean;
  onItemPress: (item: SearchResult) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth;
const ITEM_HEIGHT = screenHeight * 0.35;

export default React.memo(function AutoScrollingHero({ data, isLoading, onItemPress }: AutoScrollingHeroProps) {
  const flatListRef = useRef<FlatList>(null);
  const currentIndexRef = useRef(0);
  const insets = useSafeAreaInsets();

  // Otomatik kaydırma
  useEffect(() => {
    if (!data || data.length === 0) return;

    currentIndexRef.current = 0;
    const maxIndex = Math.min(data.length, 10) - 1;

    const interval = setInterval(() => {
      if (flatListRef.current && maxIndex >= 0) {
        currentIndexRef.current = (currentIndexRef.current + 1) % (maxIndex + 1);

        try {
          flatListRef.current.scrollToIndex({
            index: currentIndexRef.current,
            animated: true,
          });
        } catch (error) {
          currentIndexRef.current = 0;
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [data]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.skeletonContainer}>
          <Skeleton width={ITEM_WIDTH} height={ITEM_HEIGHT} />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: SearchResult }) => {
    const title = item.title || item.name || '';
    const mediaType = item.media_type === 'tv' ? 'Dizi' : 'Film';

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onItemPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.posterContainer}>
          {item.backdrop_path ? (
            <Image
              source={{ uri: buildTmdbImageUrl(item.backdrop_path, 'w780') }}
              style={styles.poster}
              contentFit="cover"
            />
          ) : item.poster_path ? (
            <Image
              source={{ uri: buildTmdbImageUrl(item.poster_path, 'w500') }}
              style={styles.poster}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.poster, styles.placeholderPoster]} />
          )}

          {/* Rating Badge - Simplified */}
          {item.vote_average && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
            </View>
          )}

          {/* Bottom Overlay - SINGLE GRADIENT (Android Fix) */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
            style={styles.bottomOverlay}
          >
            <View style={styles.mediaTypeContainer}>
              <Text style={styles.mediaType}>{mediaType}</Text>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        data={data.slice(0, 10)}
        renderItem={renderItem}
        keyExtractor={(item) => `hero-${item.id}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={3}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          currentIndexRef.current = 0;
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToIndex({
                index: 0,
                animated: false,
              });
            }
          }, 100);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    marginBottom: 0,
    marginTop: -(StatusBar.currentHeight || 0),
  },
  skeletonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: ITEM_HEIGHT,
  },
  listContainer: {
    alignItems: 'center',
  },
  itemContainer: {
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholderPoster: {
    backgroundColor: '#0a0a0a',
  },
  ratingBadge: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 0) + 20,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },
  ratingText: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  mediaTypeContainer: {
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  titleContainer: {
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  mediaType: {
    color: '#e0e0e0',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    color: '#e0e0e0',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'left',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});