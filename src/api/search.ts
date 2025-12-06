import { tmdbClient } from "./client";
import { PaginatedResponse, SearchResult } from "./types";

export async function fetchMultiSearch(query: string, page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<SearchResult>>("/search/multi", {
    params: { query, page, include_adult: true },
  });
  return data;
}


