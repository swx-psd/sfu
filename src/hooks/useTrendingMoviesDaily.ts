import { useQuery } from "@tanstack/react-query";
import { fetchTrendingMoviesDaily } from "../api/trending";

export function useTrendingMoviesDaily(page: number = 1) {
  return useQuery({
    queryKey: ["trending-movies-day", page],
    queryFn: () => fetchTrendingMoviesDaily(page),
  });
}


