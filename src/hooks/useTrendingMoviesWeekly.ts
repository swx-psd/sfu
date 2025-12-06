import { useQuery } from "@tanstack/react-query";
import { fetchTrendingMoviesWeekly } from "../api/trending";

export function useTrendingMoviesWeekly(page: number = 1) {
  return useQuery({
    queryKey: ["trending-movies-week", page],
    queryFn: () => fetchTrendingMoviesWeekly(page),
  });
}


