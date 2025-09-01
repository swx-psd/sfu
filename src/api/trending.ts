import { tmdbClient } from "./client";
import { PaginatedResponse, Movie } from "./types";

export async function fetchTrendingAllDaily(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/trending/all/day", {
    params: { page },
  });
  return data;
}


