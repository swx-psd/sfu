import { useQuery } from "@tanstack/react-query";
import { fetchTrendingTvDaily } from "../api/trending";

export function useTrendingTvDaily(page: number = 1) {
  return useQuery({
    queryKey: ["trending-tv-day", page],
    queryFn: () => fetchTrendingTvDaily(page),
  });
}


