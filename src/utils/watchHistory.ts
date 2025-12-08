import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchHistoryItem {
    id: string; // unique id: movie_{id} or tv_{id}_{s}_{e}
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    currentTime: number; // seconds
    duration: number; // seconds
    lastWatched: number; // timestamp
}

const STORAGE_KEY = '@secflix_watch_history';

export const saveWatchProgress = async (item: Omit<WatchHistoryItem, 'lastWatched'>) => {
    try {
        const history = await getWatchHistory();
        const newItem: WatchHistoryItem = {
            ...item,
            lastWatched: Date.now(),
        };

        // Remove existing entry if exists (same show/movie)
        const filtered = history.filter(h =>
            !(h.tmdbId === item.tmdbId && h.mediaType === item.mediaType)
        );

        // Add to top
        const newHistory = [newItem, ...filtered].slice(0, 20); // Keep last 20 items

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error('Error saving watch history:', error);
    }
};

export const getWatchHistory = async (): Promise<WatchHistoryItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error reading watch history:', error);
        return [];
    }
};

export const removeFromHistory = async (id: string) => {
    try {
        const history = await getWatchHistory();
        const newHistory = history.filter(h => h.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error('Error removing from watch history:', error);
    }
};

export const getHistoryId = (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => {
    if (mediaType === 'movie') {
        return `movie_${tmdbId}`;
    }
    return `tv_${tmdbId}_s${season}_e${episode}`;
};

export const getSavedProgress = async (id: string): Promise<number> => {
    try {
        const history = await getWatchHistory();
        const item = history.find(h => h.id === id);
        return item ? item.currentTime : 0;
    } catch {
        return 0;
    }
}
