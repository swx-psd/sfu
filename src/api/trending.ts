import { tmdbClient } from "./client";
import { PaginatedResponse, Movie, SearchResult } from "./types";

export async function fetchTrendingAllDaily(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<SearchResult>>("/trending/all/day", {
    params: { page },
  });
  return data;
}

export async function fetchTrendingMoviesDaily(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/trending/movie/day", {
    params: { page },
  });
  return data;
}

export async function fetchTrendingTvDaily(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/trending/tv/day", {
    params: { page },
  });
  return data;
}

export async function fetchTrendingMoviesWeekly(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/trending/movie/week", {
    params: { page },
  });
  return data;
}

export async function fetchTrendingTvWeekly(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/trending/tv/week", {
    params: { page },
  });
  return data;
}


