import { useQuery } from "@tanstack/react-query";
import { fetchMovieWatchProviders } from "../api/movies";
import { fetchTvWatchProviders } from "../api/tv";

export function useMovieProviders() {
  return useQuery({
    queryKey: ["providers-movie"],
    queryFn: () => fetchMovieWatchProviders(),
    staleTime: 1000 * 60 * 60, // 1 saat
  });
}

export function useTvProviders() {
  return useQuery({
    queryKey: ["providers-tv"],
    queryFn: () => fetchTvWatchProviders(),
    staleTime: 1000 * 60 * 60, // 1 saat
  });
}


