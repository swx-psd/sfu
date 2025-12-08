import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchMovieImages, fetchMovieRecommendations } from "../api/movies";
import { fetchTvImages, fetchTvRecommendations } from "../api/tv";

export function useMovieImages(id: number) {
  return useQuery({ queryKey: ["movie-images", id], queryFn: () => fetchMovieImages(id), enabled: !!id });
}

export function useTvImages(id: number) {
  return useQuery({ queryKey: ["tv-images", id], queryFn: () => fetchTvImages(id), enabled: !!id });
}

export function useMovieRecommendations(id: number) {
  return useInfiniteQuery({
    queryKey: ["movie-recs", id],
    enabled: !!id,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchMovieRecommendations(id, pageParam as number),
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
  });
}

export function useTvRecommendations(id: number) {
  return useInfiniteQuery({
    queryKey: ["tv-recs", id],
    enabled: !!id,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchTvRecommendations(id, pageParam as number),
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
  });
}


