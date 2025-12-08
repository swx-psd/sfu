/**
 * Update Splash Screen
 * Shown during initial load and update download
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UpdateSplashProps {
    status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error' | 'applying';
    progress: number;
    error?: string;
    currentVersion?: string;
    latestVersion?: string;
    onRetry?: () => void;
    onApply?: () => void;
}

export const UpdateSplash: React.FC<UpdateSplashProps> = ({
    status,
    progress,
    error,
    currentVersion,
    latestVersion,
    onRetry,
    onApply,
}) => {
    const [fadeAnim] = React.useState(new Animated.Value(0));
    const [scaleAnim] = React.useState(new Animated.Value(0.8));

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getMessage = () => {
        switch (status) {
            case 'checking':
                return 'Güncellemeler kontrol ediliyor...';
            case 'downloading':
                return 'Güncelleme indiriliyor...';
            case 'ready':
                return 'Güncelleme hazır!';
            case 'applying':
                return 'Güncelleme uygulanıyor...';
            case 'error':
                return error || 'Bir hata oluştu';
            default:
                return 'SecFlix yükleniyor...';
        }
    };

    return (
        <LinearGradient
            colors={['#0f0c29', '#302b63', '#24243e']}
            style={styles.container}
        >
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>SecFlix</Text>
                    <Text style={styles.subtitle}>Secure Streaming</Text>
                </View>

                {/* Status Message */}
                <Text style={styles.message}>{getMessage()}</Text>

                {/* Progress Bar (for downloading) */}
                {status === 'downloading' && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[styles.progressFill, { width: `${progress}%` }]}
                            />
                        </View>
                        <Text style={styles.progressText}>{progress}%</Text>
                    </View>
                )}

                {/* Loading Spinner */}
                {(status === 'checking' || status === 'applying') && (
                    <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
                )}

                {/* Version Info */}
                {(currentVersion || latestVersion) && (
                    <View style={styles.versionContainer}>
                        {currentVersion && (
                            <Text style={styles.versionText}>
                                Mevcut: v{currentVersion}
                            </Text>
                        )}
                        {latestVersion && latestVersion !== currentVersion && (
                            <Text style={styles.versionText}>
                                Yeni: v{latestVersion}
                            </Text>
                        )}
                    </View>
                )}

                {/* Error State */}
                {status === 'error' && onRetry && (
                    <TouchableOpacity
                        style={styles.button}
                        onPress={onRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                )}

                {/* Ready to Apply */}
                {status === 'ready' && onApply && (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={onApply}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Güncellemeyi Uygula</Text>
                    </TouchableOpacity>
                )}

                {/* Footer */}
                <Text style={styles.footer}>
                    Güvenli içerik yönetimi için tasarlandı
                </Text>
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 40,
        width: '100%',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 8,
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    message: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 30,
        textAlign: 'center',
        opacity: 0.9,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    spinner: {
        marginVertical: 20,
    },
    versionContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginVertical: 2,
    },
    button: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    primaryButton: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
    },
});
