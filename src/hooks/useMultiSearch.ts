import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchMultiSearch } from "../api/search";

export function useMultiSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ["multi-search", query],
    enabled: !!query,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchMultiSearch(query, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) return lastPage.page + 1;
      return undefined;
    },
  });
}


