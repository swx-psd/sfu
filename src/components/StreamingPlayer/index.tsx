import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Animated,
    StatusBar,
    TouchableWithoutFeedback,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import { StreamingLink } from '../../streaming/types';
import { WebVideoPlayer } from '../WebVideoPlayer';
import { searchSubtitles, downloadSubtitle, SubtitleTrack, getImdbIdFromTmdb } from '../../api/opensubtitles';
import { parseSRT, SubtitleItem } from '../../utils/subtitleParser';
import { saveWatchProgress, getHistoryId, getSavedProgress } from '../../utils/watchHistory';

// Sub Components
import { styles } from './styles';
import { PlayerControls } from './PlayerControls';
import { SubtitleOverlay } from './SubtitleOverlay';
import { ProviderSelectionModal } from './Modals/ProviderSelectionModal';
import { QualitySelectionModal } from './Modals/QualitySelectionModal';
import { SubtitleSelectionModal } from './Modals/SubtitleSelectionModal';

interface StreamingPlayerProps {
    links: StreamingLink[];
    initialLinkIndex?: number;
    onClose: () => void;
    movieTitle: string;
    tmdbId?: number;
    imdbId?: string;
    mediaType?: 'movie' | 'tv';
    seasonNumber?: number;
    episodeNumber?: number;
    poster?: string;
}

export default function StreamingPlayer({
    links,
    initialLinkIndex = 0,
    onClose,
    movieTitle,
    imdbId,
    tmdbId,
    seasonNumber,
    episodeNumber,
    mediaType,
    poster,
}: StreamingPlayerProps) {
    // --------------------------------------------------------
    // State Management
    // --------------------------------------------------------
    const [currentLinkIndex, setCurrentLinkIndex] = useState(initialLinkIndex);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showControls, setShowControls] = useState(true);
    const [showProviderList, setShowProviderList] = useState(false);
    const [showQualityList, setShowQualityList] = useState(false);

    // Playback State
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    // Subtitle State
    const [subtitleText, setSubtitleText] = useState<string | null>(null);
    const [availableSubtitles, setAvailableSubtitles] = useState<SubtitleTrack[]>([]);
    const [subtitleItems, setSubtitleItems] = useState<SubtitleItem[]>([]);
    const [loadingSubtitles, setLoadingSubtitles] = useState(false);
    const [showSubtitleList, setShowSubtitleList] = useState(false);
    const [selectedSubtitleId, setSelectedSubtitleId] = useState<string | 'none'>('none');

    // --------------------------------------------------------
    // Refs & Animations
    // --------------------------------------------------------
    const controlsOpacity = useRef(new Animated.Value(1)).current;
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveTimeRef = useRef(0);
    const initialSeekDone = useRef(false);

    // --------------------------------------------------------
    // Helper: Provider & Link Logic
    // --------------------------------------------------------
    const uniqueProviders = Array.from(new Set(links.map(link => link.provider)))
        .map(providerName => {
            return links.find(link => link.provider === providerName);
        })
        .filter((link): link is StreamingLink => link !== undefined);

    const currentLink = links[currentLinkIndex];
    const currentProviderLinks = links.filter(link => link.provider === currentLink?.provider);

    // --------------------------------------------------------
    // Player Instance
    // --------------------------------------------------------
    const player = useVideoPlayer(currentLink?.url || '', player => {
        player.loop = false;
        player.play();
    });

    // Resume Logic
    useEffect(() => {
        if (!player || !tmdbId || !mediaType || initialSeekDone.current) return;

        const checkResume = async () => {
            const id = getHistoryId(tmdbId, mediaType, seasonNumber, episodeNumber);
            const savedTime = await getSavedProgress(id);
            if (savedTime > 5) {
                // Seek if saved progress exists (> 5s)
                player.currentTime = savedTime;
                setCurrentTime(savedTime);
                initialSeekDone.current = true;
            }
        };
        checkResume();
    }, [player, tmdbId, mediaType]);

    // --------------------------------------------------------
    // Effects
    // --------------------------------------------------------

    // Time Tracking & Subtitle Sync
    useEffect(() => {
        const interval = setInterval(() => {
            if (player && !isSeeking) {
                const time = player.currentTime;
                setCurrentTime(time);
                setDuration(player.duration);
                if (player.duration > 0 && isLoading) {
                    setIsLoading(false);
                }

                // Check for subtitles
                // Check for subtitles
                const currentSub = subtitleItems.find(sub => time >= sub.start && time <= sub.end);
                setSubtitleText(currentSub ? currentSub.text : null);

                // Save Progress (every 10s)
                if (Math.abs(time - lastSaveTimeRef.current) > 10 && tmdbId && mediaType) {
                    const id = getHistoryId(tmdbId, mediaType, seasonNumber, episodeNumber);
                    saveWatchProgress({
                        id,
                        tmdbId,
                        mediaType,
                        title: movieTitle,
                        posterPath: poster,
                        seasonNumber,
                        episodeNumber,
                        currentTime: time,
                        duration: player.duration
                    });
                    lastSaveTimeRef.current = time;
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [player, isSeeking, isLoading, subtitleItems]);

    // Error on empty links
    useEffect(() => {
        if (links.length === 0) {
            setError('No streaming links available');
            setIsLoading(false);
        }
    }, [links]);

    // Landscape Lock & Immersive Mode
    useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        StatusBar.setHidden(true);
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden');
            NavigationBar.setBehaviorAsync('overlay-swipe');
        }

        return () => {
            ScreenOrientation.unlockAsync();
            StatusBar.setHidden(false);
            if (Platform.OS === 'android') {
                NavigationBar.setVisibilityAsync('visible');
            }
        };
    }, []);

    // Controls Animation & Visibility
    useEffect(() => {
        Animated.timing(controlsOpacity, {
            toValue: showControls && !isLoading ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        if (Platform.OS === 'android') {
            if (showControls) {
                NavigationBar.setVisibilityAsync('visible');
            } else {
                NavigationBar.setVisibilityAsync('hidden');
            }
        }
    }, [showControls, isLoading]);

    // Link Change Handler
    useEffect(() => {
        if (currentLink) {
            player.replace(currentLink.url);
            setError(null);
            setIsLoading(true);
        }
    }, [currentLinkIndex]);

    // Load Subtitles on Mount
    useEffect(() => {
        loadSubtitles();
    }, [imdbId, tmdbId]);

    // --------------------------------------------------------
    // Handlers
    // --------------------------------------------------------
    const loadSubtitles = async () => {
        if (!imdbId && !tmdbId) return;

        setLoadingSubtitles(true);
        try {
            let searchImdbId = imdbId;

            // If no IMDB ID, try to get from TMDB
            if (!searchImdbId && tmdbId) {
                const fetchedImdbId = await getImdbIdFromTmdb(tmdbId, mediaType || 'movie');
                if (fetchedImdbId) {
                    searchImdbId = fetchedImdbId;
                }
            }

            if (searchImdbId) {
                const subtitles = await searchSubtitles(searchImdbId, seasonNumber, episodeNumber);
                setAvailableSubtitles(subtitles);
            }
        } catch (error) {
            console.error('[Player] Subtitle loading error:', error);
        } finally {
            setLoadingSubtitles(false);
        }
    };

    const handleSubtitleSelect = async (track: SubtitleTrack | null) => {
        if (!track) {
            setSubtitleItems([]);
            setSelectedSubtitleId('none');
            setSubtitleText(null);
            setShowSubtitleList(false);
            return;
        }

        try {
            setLoadingSubtitles(true);
            const srtContent = await downloadSubtitle(track.url);
            if (srtContent) {
                const parsed = parseSRT(srtContent);
                setSubtitleItems(parsed);
                setSelectedSubtitleId(track.id);
            }
            setShowSubtitleList(false);
        } catch (error) {
            console.error('[Player] Subtitle parsing error:', error);
        } finally {
            setLoadingSubtitles(false);
        }
    };

    const handleProviderSelect = (providerName: string) => {
        const newIndex = links.findIndex(link => link.provider === providerName);
        if (newIndex !== -1) {
            setCurrentLinkIndex(newIndex);
            setShowProviderList(false);
        }
    };

    const handleQualitySelect = (link: StreamingLink) => {
        const newIndex = links.indexOf(link);
        if (newIndex !== -1) {
            setCurrentLinkIndex(newIndex);
            setShowQualityList(false);
        }
    };

    const toggleControls = () => {
        if (showControls) {
            setShowControls(false);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        } else {
            setShowControls(true);
            resetControlsTimeout();
        }
    };

    const resetControlsTimeout = () => {
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
        }, 4000);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            player.pause();
            setIsPlaying(false);
        } else {
            player.play();
            setIsPlaying(true);
        }
        resetControlsTimeout();
    };

    const handleRewind = () => {
        player.currentTime = Math.max(0, player.currentTime - 10);
        resetControlsTimeout();
    };

    const handleFastForward = () => {
        player.currentTime = Math.min(duration, player.currentTime + 10);
        resetControlsTimeout();
    };

    const handleSeekStart = () => {
        setIsSeeking(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
    };

    const handleSeekChange = (value: number) => {
        setCurrentTime(value);
    };

    const handleSeekComplete = (value: number) => {
        player.currentTime = value;
        setIsSeeking(false);
        resetControlsTimeout();
    };

    if (Platform.OS === 'web') {
        return (
            <WebVideoPlayer
                links={links}
                initialLinkIndex={initialLinkIndex}
                onClose={onClose}
                movieTitle={movieTitle}
            />
        );
    }

    if (!currentLink) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No video source available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.videoContainer}>
                <VideoView
                    style={styles.video}
                    player={player}
                    allowsFullscreen={false}
                    allowsPictureInPicture={false}
                    nativeControls={false}
                    contentFit="contain"
                />

                <SubtitleOverlay text={subtitleText} />

                <TouchableWithoutFeedback onPress={toggleControls}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>

                {isLoading && (
                    <View style={styles.loadingContainer} pointerEvents="none">
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color="#ff6b6b" />
                            <Text style={styles.loadingText}>Yükleniyor...</Text>
                        </View>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Kapat</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <PlayerControls
                showControls={showControls}
                isLoading={isLoading}
                opacity={controlsOpacity}
                movieTitle={movieTitle}
                onClose={onClose}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onRewind={handleRewind}
                onFastForward={handleFastForward}
                currentTime={currentTime}
                duration={duration}
                onSeekStart={handleSeekStart}
                onSeekChange={handleSeekChange}
                onSeekComplete={handleSeekComplete}
                hasSubtitles={subtitleItems.length > 0}
                onSubtitlePress={() => { setShowSubtitleList(true); resetControlsTimeout(); }}
                onQualityPress={() => { setShowQualityList(true); resetControlsTimeout(); }}
                onProviderPress={() => { setShowProviderList(true); resetControlsTimeout(); }}
            />

            <ProviderSelectionModal
                visible={showProviderList}
                onClose={() => setShowProviderList(false)}
                providers={uniqueProviders}
                currentProvider={currentLink?.provider}
                onSelect={handleProviderSelect}
            />

            <QualitySelectionModal
                visible={showQualityList}
                onClose={() => setShowQualityList(false)}
                links={currentProviderLinks}
                currentLink={currentLink}
                onSelect={handleQualitySelect}
            />

            <SubtitleSelectionModal
                visible={showSubtitleList}
                onClose={() => setShowSubtitleList(false)}
                isLoading={loadingSubtitles}
                subtitles={availableSubtitles}
                selectedSubtitleId={selectedSubtitleId}
                onSelect={handleSubtitleSelect}
            />
        </View>
    );
}
