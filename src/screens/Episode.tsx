import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar, Alert, Modal, ActivityIndicator } from "react-native";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { useEpisodeDetails } from "../hooks/useEpisodeDetails";
import { useStreamingLinksForTv } from "../hooks/useStreamingLinks";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ParamList = {
  Episode: { tvId: number; seasonNumber: number; episodeNumber: number; tvTitle?: string; poster?: string | null };
};

export default function EpisodeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, "Episode">>();
  const { tvId, seasonNumber, episodeNumber, tvTitle, poster } = route.params;
  const { data, isLoading, isError } = useEpisodeDetails(tvId, seasonNumber, episodeNumber);

  const [isLoadingLinks, setIsLoadingLinks] = React.useState(false);

  // TV episode için streaming links - başlangıçta devre dışı
  const streamingLinks = useStreamingLinksForTv(
    tvId,
    tvTitle || data?.name || '',
    (data as any)?.air_date ? new Date((data as any).air_date).getFullYear() : new Date().getFullYear(),
    seasonNumber,
    episodeNumber,
    false // Başlangıçta devre dışı
  );

  const handlePlayPress = async () => {
    if (!data) return;

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
        Alert.alert('Link Bulunamadı', 'Bu bölüm için streaming linki bulunamadı.');
        return;
      }

      // Video oynatıcı sayfasına git
      navigation.navigate('VideoPlayer', {
        streamingLinks: links,
        movieTitle: `${tvTitle || 'TV Show'} S${seasonNumber}E${episodeNumber}: ${data.name}`,
        tmdbId: tvId,
        mediaType: 'tv',
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber,
        poster: poster || undefined,
      });

    } catch (error) {
      console.error('Play button error:', error);
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu.');
    } finally {
      setIsLoadingLinks(false);
    }
  };

  if (isLoading) return (
    <View style={styles.center}>
      <Text style={{ color: '#ffffff' }}>Yükleniyor...</Text>
    </View>
  );

  if (isError || !data) return (
    <View style={styles.center}>
      <Text style={{ color: '#ffffff' }}>Hata oluştu</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Hero Section with Episode Image */}
      <View style={styles.heroContainer}>
        {data.still_path ? (
          <Image
            source={{ uri: buildTmdbImageUrl(data.still_path, 'original') }}
            style={styles.backdrop}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.backdrop, styles.placeholderBackdrop]}>
            <Text style={styles.episodeNumberLarge}>E{episodeNumber}</Text>
          </View>
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

        {/* Episode Info Overlay */}
        <View style={styles.episodeInfoOverlay}>
          <Text style={styles.episodeTitle}>
            S{seasonNumber}E{episodeNumber}: {data.name}
          </Text>
          <View style={styles.episodeMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#ffd700" />
              <Text style={styles.rating}>{data.vote_average?.toFixed(1) ?? "-"}</Text>
            </View>
            {(data as any).air_date && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>
                  {new Date((data as any).air_date).toLocaleDateString('tr-TR')}
                </Text>
              </>
            )}
            {(data as any).runtime && (
              <>
                <Text style={styles.metaText}>•</Text>
                <Text style={styles.metaText}>{(data as any).runtime}dk</Text>
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
          <Text style={styles.playButtonText}>BÖLÜMÜ OYNAT</Text>
        </TouchableOpacity>

        {/* Description */}
        {data.overview && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              {data.overview}
            </Text>
          </View>
        )}

        {/* Episode Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>BÖLÜM DETAYLARI</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sezon:</Text>
            <Text style={styles.detailValue}>{seasonNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bölüm:</Text>
            <Text style={styles.detailValue}>{episodeNumber}</Text>
          </View>

          {(data as any).air_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Yayın Tarihi:</Text>
              <Text style={styles.detailValue}>
                {new Date((data as any).air_date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          )}

          {(data as any).runtime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Süre:</Text>
              <Text style={styles.detailValue}>{(data as any).runtime} dakika</Text>
            </View>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0b0b0b'
  },

  // Hero Section
  heroContainer: {
    height: screenHeight * 0.4,
    position: 'relative',
  },
  backdrop: {
    width: screenWidth,
    height: '100%',
  },
  placeholderBackdrop: {
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodeNumberLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
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
  episodeInfoOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  episodeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  episodeMeta: {
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

  // Details
  detailsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    letterSpacing: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  detailValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 12,
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
    color: '#ccc',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
});


