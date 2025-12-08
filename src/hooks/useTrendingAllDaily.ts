import { useQuery } from "@tanstack/react-query";
import { fetchTrendingAllDaily } from "../api/trending";

export function useTrendingAllDaily() {
  return useQuery({
    queryKey: ["trending", "all", "day"],
    queryFn: () => fetchTrendingAllDaily(),
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}