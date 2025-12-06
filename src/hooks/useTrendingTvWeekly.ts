import { useQuery } from "@tanstack/react-query";
import { fetchTrendingTvWeekly } from "../api/trending";

export function useTrendingTvWeekly(page: number = 1) {
  return useQuery({
    queryKey: ["trending-tv-week", page],
    queryFn: () => fetchTrendingTvWeekly(page),
  });
}


