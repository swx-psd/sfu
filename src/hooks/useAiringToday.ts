import { useQuery } from "@tanstack/react-query";
import { fetchAiringToday } from "../api/tv";

export function useAiringToday(page: number = 1) {
  return useQuery({
    queryKey: ["airing-today", page],
    queryFn: () => fetchAiringToday(page),
  });
}


