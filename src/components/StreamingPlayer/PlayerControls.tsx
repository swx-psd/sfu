import React from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import { styles } from './styles';

interface PlayerControlsProps {
    showControls: boolean;
    isLoading: boolean;
    opacity: any; // Animated.Value
    movieTitle: string;
    onClose: () => void;

    // Playback
    isPlaying: boolean;
    onPlayPause: () => void;
    onRewind: () => void;
    onFastForward: () => void;

    // Seek
    currentTime: number;
    duration: number;
    onSeekStart: () => void;
    onSeekChange: (val: number) => void;
    onSeekComplete: (val: number) => void;

    // UI Toggles
    hasSubtitles: boolean;
    onSubtitlePress: () => void;
    onQualityPress: () => void;
    onProviderPress: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    showControls,
    isLoading,
    opacity,
    movieTitle,
    onClose,
    isPlaying,
    onPlayPause,
    onRewind,
    onFastForward,
    currentTime,
    duration,
    onSeekStart,
    onSeekChange,
    onSeekComplete,
    hasSubtitles,
    onSubtitlePress,
    onQualityPress,
    onProviderPress,
}) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <Animated.View style={[styles.controls, { opacity }]} pointerEvents={showControls && !isLoading ? 'box-none' : 'none'}>
            {/* Top Bar */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={[styles.topBar, { paddingTop: isLandscape ? 20 : 40, paddingHorizontal: isLandscape ? 40 : 10 }]}
            >
                <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>
                    {movieTitle}
                </Text>
                <View style={styles.topRightControls}>
                    {/* Subtitle Button */}
                    <TouchableOpacity
                        onPress={onSubtitlePress}
                        style={styles.iconButton}
                    >
                        <Ionicons name="text" size={24} color={hasSubtitles ? "#ff6b6b" : "#fff"} />
                    </TouchableOpacity>

                    {/* Quality Button */}
                    <TouchableOpacity
                        onPress={onQualityPress}
                        style={styles.iconButton}
                    >
                        <Ionicons name="settings-outline" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Provider Button */}
                    <TouchableOpacity
                        onPress={onProviderPress}
                        style={styles.iconButton}
                    >
                        <Ionicons name="server-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Center Play/Pause */}
            <View style={[styles.centerControls, { gap: isLandscape ? 80 : 40 }]}>
                <TouchableOpacity onPress={onRewind} style={styles.skipButton}>
                    <View>
                        <Ionicons name="reload-outline" size={36} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
                        <View style={styles.skipTextOverlay}>
                            <Text style={styles.skipText}>10</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onFastForward} style={styles.skipButton}>
                    <View>
                        <Ionicons name="reload-outline" size={36} color="#fff" />
                        <View style={styles.skipTextOverlay}>
                            <Text style={styles.skipText}>10</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Bottom Bar with Seek */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={[styles.bottomBar, { paddingBottom: isLandscape ? 20 : 30, paddingHorizontal: isLandscape ? 40 : 10 }]}
            >
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        value={currentTime}
                        minimumTrackTintColor="#ff6b6b"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbTintColor="#ff6b6b"
                        onSlidingStart={onSeekStart}
                        onValueChange={onSeekChange}
                        onSlidingComplete={onSeekComplete}
                    />
                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};
