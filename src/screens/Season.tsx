import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useSeasonDetails } from "../hooks/useSeasonDetails";
import { Image } from "expo-image";
import { buildTmdbImageUrl } from "../utils";
import { Ionicons } from "@expo/vector-icons";

type ParamList = {
  Season: { tvId: number; seasonNumber: number; tvName?: string };
};

export default function SeasonScreen() {
  const route = useRoute<RouteProp<ParamList, "Season">>();
  const navigation = useNavigation<any>();
  const { tvId, seasonNumber, tvName } = route.params;
  const { season } = useSeasonDetails(tvId, seasonNumber);

  if (season.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />
        <View style={styles.center}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (season.isError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />
        <View style={styles.center}>
          <Text style={styles.errorText}>Hata oluştu</Text>
        </View>
      </SafeAreaView>
    );
  }

  const s = season.data!;
  const episodes = s.episodes ?? [];
  
  const renderEpisode = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={styles.episodeCard}
      onPress={() => navigation.navigate('Episode', { 
        tvId, 
        seasonNumber, 
        episodeNumber: item.episode_number,
        tvTitle: tvName
      })}
    >
      <View style={styles.episodeImageContainer}>
        {item.still_path ? (
          <Image
            source={{ uri: buildTmdbImageUrl(item.still_path, 'w300') }}
            style={styles.episodeImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.episodeImage, styles.placeholderImage]}>
            <Ionicons name="film" size={32} color="#666" />
          </View>
        )}
        
        {/* Episode Number Badge */}
        <View style={styles.episodeNumberBadge}>
          <Text style={styles.episodeNumberText}>{item.episode_number}</Text>
        </View>
        
        {/* Play Overlay */}
        <View style={styles.playOverlay}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="white" />
          </View>
        </View>
        
        {/* Duration if available */}
        {item.runtime && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.runtime}m</Text>
          </View>
        )}
      </View>
      
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle} numberOfLines={2}>
          {item.name || `Episode ${item.episode_number}`}
        </Text>
        
        {item.air_date && (
          <Text style={styles.episodeDate}>
            {new Date(item.air_date).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        )}
        
        {item.vote_average > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#ffd700" />
            <Text style={styles.ratingText}>{item.vote_average.toFixed(1)}</Text>
          </View>
        )}
        
        <Text style={styles.episodeOverview} numberOfLines={3}>
          {item.overview || 'Açıklama mevcut değil'}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.seasonTitle}>{s.name}</Text>
          <Text style={styles.episodeCount}>{episodes.length} Bölüm</Text>
        </View>
      </View>
      
      {/* Episodes List */}
      <FlatList
        data={episodes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderEpisode}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
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
    justifyContent: 'center' 
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  seasonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  episodeCount: {
    fontSize: 14,
    color: '#aaa',
  },
  
  // List
  listContainer: {
    padding: 16,
  },
  separator: {
    height: 16,
  },
  
  // Episode Card
  episodeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  
  // Episode Image
  episodeImageContainer: {
    position: 'relative',
    height: 200,
  },
  episodeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Badges and Overlays
  episodeNumberBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  episodeNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
  },
  
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Episode Info
  episodeInfo: {
    padding: 16,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 22,
  },
  episodeDate: {
    fontSize: 14,
    color: '#ff6b6b',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#ffd700',
    fontWeight: '600',
  },
  episodeOverview: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});


