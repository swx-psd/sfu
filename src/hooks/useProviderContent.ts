import { useInfiniteQuery } from "@tanstack/react-query";
import { discoverMoviesByProvider } from "../api/movies";
import { discoverTvByProvider } from "../api/tv";

export function useProviderContent(type: "movie" | "tv", providerId: number) {
  return useInfiniteQuery({
    queryKey: ["provider-content", type, providerId],
    enabled: !!providerId,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      type === "movie"
        ? discoverMoviesByProvider(providerId, pageParam as number)
        : discoverTvByProvider(providerId, pageParam as number),
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
  });
}


