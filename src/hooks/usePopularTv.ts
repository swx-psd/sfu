import { useQuery } from "@tanstack/react-query";
import { fetchPopularTv } from "../api/tv";

export function usePopularTv(page: number = 1) {
  return useQuery({
    queryKey: ["popular-tv", page],
    queryFn: () => fetchPopularTv(page),
  });
}


