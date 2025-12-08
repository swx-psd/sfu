import { useInfiniteQuery } from "@tanstack/react-query";
import { 
  fetchTrendingMoviesDaily, 
  fetchTrendingTvDaily, 
  fetchTrendingMoviesWeekly, 
  fetchTrendingTvWeekly,
  fetchTrendingAllDaily
} from "../api/trending";
import { PaginatedResponse, Movie, SearchResult } from "../api/types";

export function useInfiniteTrendingAllDaily() {
  return useInfiniteQuery<PaginatedResponse<SearchResult>, Error>({
    queryKey: ["trending", "all", "day", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchTrendingAllDaily(pageParam as number),
    getNextPageParam: (lastPage: PaginatedResponse<SearchResult>) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}

export function useInfiniteTrendingMoviesDaily() {
  return useInfiniteQuery<PaginatedResponse<Movie>, Error>({
    queryKey: ["trending", "movies", "day", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchTrendingMoviesDaily(pageParam as number),
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}

export function useInfiniteTrendingTvDaily() {
  return useInfiniteQuery<PaginatedResponse<Movie>, Error>({
    queryKey: ["trending", "tv", "day", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchTrendingTvDaily(pageParam as number),
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}

export function useInfiniteTrendingMoviesWeekly() {
  return useInfiniteQuery<PaginatedResponse<Movie>, Error>({
    queryKey: ["trending", "movies", "week", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchTrendingMoviesWeekly(pageParam as number),
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}

export function useInfiniteTrendingTvWeekly() {
  return useInfiniteQuery<PaginatedResponse<Movie>, Error>({
    queryKey: ["trending", "tv", "week", "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchTrendingTvWeekly(pageParam as number),
    getNextPageParam: (lastPage: PaginatedResponse<Movie>) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 15, // 15 dakika
  });
}