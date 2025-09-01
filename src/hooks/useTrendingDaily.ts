import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAllDaily } from "../api/trending";

export function useTrendingDaily(page: number = 1) {
  return useQuery({
    queryKey: ["trending-all-day", page],
    queryFn: () => fetchTrendingAllDaily(page),
  });
}


