import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Linking } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useTvDetails } from "../hooks/useTvDetails";
import { useTvImages, useTvRecommendations } from "../hooks/useImagesAndRecs";
import { useSeasonDetails } from "../hooks/useSeasonDetails";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";
import PosterCard from "../components/PosterCard";
import { FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ParamList = {
  TvDetail: { id: number; name?: string; poster_path?: string | null };
};

export default function TvDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, "TvDetail">>();
  const id = route.params?.id || 0;

  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = React.useState(1);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = React.useState(false);

  const { details, credits, videos } = useTvDetails(id);
  const images = useTvImages(id);
  const recs = useTvRecommendations(id);
  const { season } = useSeasonDetails(id, selectedSeasonNumber);

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
  const avgRuntime = d.episode_run_time?.[0];
  const firstAirYear = d.first_air_date ? new Date(d.first_air_date).getFullYear() : '';

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

        {/* TV Info Overlay */}
        <View style={styles.tvInfoOverlay}>
          {/* Title Background Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
            style={styles.titleBackgroundGradient}
          />
          <Text style={styles.tvTitle}>{d.name}</Text>
          <View style={styles.tvMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.rating}>{d.vote_average?.toFixed(1) ?? "-"}</Text>
            </View>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{firstAirYear}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{d.number_of_seasons} Sezon • {d.number_of_episodes} Bölüm</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
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

        {/* Episodes Section */}
        {!!d.seasons?.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EPISODES</Text>
            <TouchableOpacity
              style={styles.seasonSelector}
              onPress={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
            >
              <Text style={styles.seasonText}>Season {selectedSeasonNumber}</Text>
              <Ionicons
                name={isSeasonDropdownOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color="white"
              />
            </TouchableOpacity>

            {/* Season Dropdown */}
            {isSeasonDropdownOpen && (
              <View style={styles.dropdownContainer}>
                {d.seasons.filter(s => s.season_number > 0).map((seasonItem) => (
                  <TouchableOpacity
                    key={seasonItem.season_number}
                    style={[
                      styles.dropdownItem,
                      selectedSeasonNumber === seasonItem.season_number && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setSelectedSeasonNumber(seasonItem.season_number);
                      setIsSeasonDropdownOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownText,
                      selectedSeasonNumber === seasonItem.season_number && styles.selectedDropdownText
                    ]}>
                      Season {seasonItem.season_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Episodes List */}
            {season.data?.episodes && (
              <View style={styles.episodesContainer}>
                {season.data.episodes.map((episode, index) => (
                  <TouchableOpacity
                    key={episode.id}
                    style={styles.episodeItem}
                    onPress={() => navigation.navigate('Episode', {
                      tvId: d.id,
                      seasonNumber: selectedSeasonNumber,
                      episodeNumber: episode.episode_number,
                      tvTitle: d.name,
                      poster: d.poster_path
                    })}
                  >
                    <View style={styles.episodeImageContainer}>
                      {episode.still_path ? (
                        <Image
                          source={{ uri: buildTmdbImageUrl(episode.still_path, 'w300') }}
                          style={styles.episodeImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.episodeImage, styles.placeholderEpisode]}>
                          <Text style={styles.episodeNumber}>{episode.episode_number}</Text>
                        </View>
                      )}
                      <View style={styles.playOverlay}>
                        <Ionicons name="play" size={24} color="white" />
                      </View>
                    </View>

                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeName}>
                        {episode.episode_number}. {episode.name || `Episode ${episode.episode_number}`}
                      </Text>
                      <Text style={styles.episodeDescription} numberOfLines={2}>
                        {episode.overview || 'Açıklama mevcut değil'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}



        {/* Related TV Shows */}
        {recs.data?.pages?.[0]?.results && recs.data.pages[0].results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOU MAY ALSO LIKE</Text>
            <FlatList
              data={recs.data.pages.flatMap(p => p.results).slice(0, 10)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.relatedItem}
                  onPress={() => navigation.replace('TvDetail', { id: item.id })}
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
  tvInfoOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  titleBackgroundGradient: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -10,
    borderRadius: 12,
  },
  tvTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    zIndex: 1,
    position: 'relative',
  },
  tvMeta: {
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

  // Season Selector
  seasonSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  seasonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  // Dropdown
  dropdownContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  selectedDropdownItem: {
    backgroundColor: 'rgba(255,107,107,0.2)',
  },
  dropdownText: {
    color: 'white',
    fontSize: 16,
  },
  selectedDropdownText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },

  // Episodes Container
  episodesContainer: {
    gap: 16,
  },

  // Episodes
  episodeItem: {
    flexDirection: 'row',
    gap: 12,
  },
  episodeImageContainer: {
    position: 'relative',
  },
  episodeImage: {
    width: 140,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
  },
  placeholderEpisode: {
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  episodeName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeDate: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  episodeDescription: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 18,
  },

  // Show All Button
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  showAllText: {
    color: '#4a9eff',
    fontSize: 16,
    fontWeight: '500',
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

  // Related TV Shows
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
});


