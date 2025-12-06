import { useQuery } from '@tanstack/react-query';
import { StreamingManager } from '../streaming/StreamingManager';
import { MovieInfo, StreamingLink } from '../streaming/types';

export interface UseStreamingLinksProps {
  movieInfo: MovieInfo;
  enabled?: boolean;
}

export function useStreamingLinks({ movieInfo, enabled = true }: UseStreamingLinksProps) {
  return useQuery({
    queryKey: ['streamingLinks', movieInfo.id, movieInfo.type],
    queryFn: async (): Promise<StreamingLink[]> => {
      const manager = StreamingManager.getInstance();
      
      // Initialize streaming system if not already done
      await StreamingManager.initialize();
      
      // Get streaming links
      const links = await manager.getStreamingLinks(movieInfo);
      return links;
    },
    enabled: enabled && !!movieInfo.id,
    staleTime: 30 * 60 * 1000, // 30 dakika önbellek
    gcTime: 60 * 60 * 1000,    // 1 saat garbage collection
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useStreamingLinksForMovie(
  movieId: number, 
  title: string, 
  year: number,
  enabled = true
) {
  const movieInfo: MovieInfo = {
    id: movieId,
    title,
    year,
    type: 'movie',
    tmdb_id: movieId
  };

  return useStreamingLinks({ movieInfo, enabled });
}

export function useStreamingLinksForTv(
  tvId: number,
  title: string,
  year: number,
  season?: number,
  episode?: number,
  enabled = true
) {
  const movieInfo: MovieInfo = {
    id: tvId,
    title,
    year,
    type: 'tv',
    season,
    episode,
    tmdb_id: tvId
  };

  return useStreamingLinks({ movieInfo, enabled });
}