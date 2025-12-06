import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { StreamingLink } from '../streaming/types';

interface WebVideoPlayerProps {
  links: StreamingLink[];
  initialLinkIndex?: number;
  onClose?: () => void;
  movieTitle?: string;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
}

export const WebVideoPlayer: React.FC<WebVideoPlayerProps> = ({
  links,
  initialLinkIndex = 0,
  onClose,
  movieTitle,
  onError,
  onProgress
}) => {


  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentLinkIndex, setCurrentLinkIndex] = useState(initialLinkIndex);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (links.length > 0 && videoRef.current) {
      const currentLink = links[currentLinkIndex];
      videoRef.current.src = currentLink.url;
      videoRef.current.load();
    }
  }, [links, currentLinkIndex]);

  const handleError = () => {
    if (currentLinkIndex < links.length - 1) {
      setCurrentLinkIndex(currentLinkIndex + 1);
    } else {
      onError?.('Tüm video linkleri başarısız oldu');
    }
  };

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      onProgress?.(progress);
    }
  };

  if (links.length === 0) {
    return (
      <View style={styles.container}>
        <div style={styles.message}>Video linki bulunamadı</div>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <video
        ref={videoRef}
        style={styles.video}
        controls
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        crossOrigin="anonymous"
      />
      {isLoading && (
        <div style={styles.loading}>Yükleniyor...</div>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  } as any,
  loading: {
    position: 'absolute',
    color: '#fff',
    fontSize: 18,
  } as any,
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  } as any,
});