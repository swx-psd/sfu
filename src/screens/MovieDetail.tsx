import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Linking, Alert, Modal, ActivityIndicator } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { useMovieImages, useMovieRecommendations } from "../hooks/useImagesAndRecs";
import { useStreamingLinksForMovie } from "../hooks/useStreamingLinks";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";
import PosterCard from "../components/PosterCard";
import { FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ParamList = {
  MovieDetail: { id: number; title?: string; poster_path?: string | null };
};

export default function MovieDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, "MovieDetail">>();
  const id = route.params?.id || 0;
  const { details, credits, videos } = useMovieDetails(id);
  const images = useMovieImages(id);
  const recs = useMovieRecommendations(id);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = React.useState(false);

  // Streaming links hook'u - başlangıçta devre dışı
  const streamingLinks = useStreamingLinksForMovie(
    id,
    details.data?.title || '',
    details.data?.release_date ? new Date(details.data.release_date).getFullYear() : 0,
    false // Başlangıçta devre dışı
  );

  const handleTrailerPress = () => {
    const trailers = videos.data?.results?.filter(video =>
      video.site === 'YouTube' &&
      (video.type === 'Trailer' || video.type === 'Teaser')
    ) || [];

    if (trailers.length > 0) {
      const trailer = trailers[0];
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      Linking.openURL(youtubeUrl).catch(err => {
        console.error('Trailer açılamadı:', err);
      });
    }
  };

  const handlePlayPress = async () => {
    if (!details.data) return;

    // Linkleri aramaya başla
    setIsLoadingLinks(true);

    try {
      // Manuel olarak streaming linkleri getir
      const result = await streamingLinks.refetch();

      if (result.isError) {
        Alert.alert('Hata', 'Streaming linkleri alınırken bir hata oluştu.');
        return;
      }

      const links = result.data;
      if (!links || links.length === 0) {
        Alert.alert('Link Bulunamadı', 'Bu film için streaming linki bulunamadı.');
        return;
      }

      // Video oynatıcı sayfasına git
      navigation.navigate('VideoPlayer', {
        streamingLinks: links,
        movieTitle: details.data.title,
        tmdbId: id, // OpenSubtitles TMDB ID ile çalışıyor
        mediaType: 'movie',
        poster: d.poster_path
      });

    } catch (error) {
      console.error('Play button error:', error);
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu.');
    } finally {
      setIsLoadingLinks(false);
    }
  };

  if (details.isLoading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#ffffff' }}>Yükleniyor...</Text>
      </View>
    );
  }

  if (details.isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#ffffff' }}>Hata oluştu</Text>
      </View>
    );
  }

  const d = details.data!;
  const cast = credits.data?.cast?.slice(0, 6) ?? [];
  const runtimeHours = d.runtime ? Math.floor(d.runtime / 60) : 0;
  const runtimeMinutes = d.runtime ? d.runtime % 60 : 0;
  const releaseYear = d.release_date ? new Date(d.release_date).getFullYear() : '';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Hero Section with Backdrop */}
      <View style={styles.heroContainer}>
        {d.backdrop_path ? (
          <Image
            source={{ uri: buildTmdbImageUrl(d.backdrop_path, 'original') }}
            style={styles.backdrop}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.backdrop, styles.placeholderBackdrop]} />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(11,11,11,0.3)', 'rgba(11,11,11,0.8)', '#0b0b0b']}
          style={styles.gradientOverlay}
        />

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Movie Info Overlay */}
        <View style={styles.movieInfoOverlay}>
          <Text style={styles.movieTitle}>{d.title}</Text>
          <View style={styles.movieMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.rating}>{d.vote_average?.toFixed(1) ?? "-"}</Text>
            </View>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{releaseYear}</Text>
            {(runtimeHours > 0 || runtimeMinutes > 0) && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>
                  {runtimeHours > 0 ? `${runtimeHours}s ` : ''}{runtimeMinutes}dk
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Play Button */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPress}
          disabled={isLoadingLinks}
        >
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.playButtonText}>OYNAT</Text>
        </TouchableOpacity>

        {/* Description */}
        {d.overview && (
          <View style={styles.descriptionContainer}>
            <Text
              style={styles.description}
              numberOfLines={isDescriptionExpanded ? undefined : 3}
            >
              {d.overview}
            </Text>
            <TouchableOpacity onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
              <Text style={styles.seeMore}>
                {isDescriptionExpanded ? 'See Less' : 'See More'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTrailerPress}
          >
            <Ionicons name="play-circle-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Trailer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.actionButtonText}>My List</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="white" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Cast Section */}
        {cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CAST</Text>
            <FlatList
              data={cast}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={styles.castItem}>
                  {item.profile_path ? (
                    <Image
                      source={{ uri: buildTmdbImageUrl(item.profile_path, 'w185') }}
                      style={styles.castImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.castImage, styles.placeholderCast]} />
                  )}
                </View>
              )}
            />
          </View>
        )}

        {/* Related Movies */}
        {recs.data?.pages?.[0]?.results && recs.data.pages[0].results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RELATED</Text>
            <FlatList
              data={recs.data.pages.flatMap(p => p.results).slice(0, 10)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedItem}
                  onPress={() => navigation.replace('MovieDetail', { id: item.id })}
                >
                  {item.poster_path ? (
                    <Image
                      source={{ uri: buildTmdbImageUrl(item.poster_path, 'w342') }}
                      style={styles.relatedPoster}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.relatedPoster, styles.placeholderPoster]} />
                  )}
                  <View style={styles.relatedOverlay}>
                    <View style={styles.relatedRating}>
                      <Text style={styles.relatedRatingText}>{item.vote_average?.toFixed(1)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Loading Modal */}
      <Modal
        visible={isLoadingLinks}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ff6b6b" />
            <Text style={styles.loadingText}>Lütfen bekleyin</Text>
            <Text style={styles.loadingSubText}>Streaming linkleri aranıyor...</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b'
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#0b0b0b'
  },

  // Hero Section
  heroContainer: {
    height: screenHeight * 0.6,
    position: 'relative',
  },
  backdrop: {
    width: screenWidth,
    height: '100%',
  },
  placeholderBackdrop: {
    backgroundColor: '#1e1e1e',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfoOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  movieTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    zIndex: 1,
    position: 'relative',
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '600',
  },
  metaText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },

  // Content Section
  contentContainer: {
    padding: 20,
  },
  playButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Description
  descriptionContainer: {
    marginBottom: 20,
  },
  description: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  seeMore: {
    color: '#4a9eff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },

  // Sections
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },

  // Cast
  castItem: {
    marginRight: 12,
  },
  castImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  placeholderCast: {
    backgroundColor: '#1e1e1e',
  },

  // Related Movies
  relatedItem: {
    marginRight: 12,
    position: 'relative',
  },
  relatedPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  placeholderPoster: {
    backgroundColor: '#1e1e1e',
  },
  relatedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  relatedRating: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  relatedRatingText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Loading Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#1e1e1e',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  loadingSubText: {
    color: '#cccccc',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});


