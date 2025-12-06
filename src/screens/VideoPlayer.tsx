import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import StreamingPlayer from '../components/StreamingPlayer/index';
import { StreamingLink } from '../streaming/types';

type ParamList = {
    VideoPlayer: {
        streamingLinks: StreamingLink[];
        movieTitle: string;
        tmdbId?: number;
        imdbId?: string;
        mediaType?: 'movie' | 'tv';
        seasonNumber?: number;
        episodeNumber?: number;
        poster?: string;
    };
};

export default function VideoPlayerScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ParamList, 'VideoPlayer'>>();

    const { streamingLinks, movieTitle, tmdbId, imdbId, mediaType, seasonNumber, episodeNumber, poster } = route.params;

    const handleClose = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StreamingPlayer
                links={streamingLinks}
                movieTitle={movieTitle}
                tmdbId={tmdbId}
                imdbId={imdbId}
                mediaType={mediaType}
                seasonNumber={seasonNumber}
                episodeNumber={episodeNumber}
                poster={poster}
                onClose={handleClose}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});
