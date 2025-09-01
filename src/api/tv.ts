import { tmdbClient } from "./client";
import { PaginatedResponse, Movie, TvDetails, CreditsResponse, SeasonDetails, EpisodeDetails } from "./types";

export async function fetchPopularTv(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/tv/popular", {
    params: { page },
  });
  return data;
}

export async function fetchAiringToday(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/tv/airing_today", {
    params: { page },
  });
  return data;
}

export async function fetchTvDetails(id: number) {
  const { data } = await tmdbClient.get<TvDetails>(`/tv/${id}`);
  return data;
}

export async function fetchTvCredits(id: number) {
  const { data } = await tmdbClient.get<CreditsResponse>(`/tv/${id}/credits`);
  return data;
}

export async function fetchSeasonDetails(tvId: number, seasonNumber: number) {
  const { data } = await tmdbClient.get<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`);
  return data;
}

export async function fetchEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number) {
  const { data } = await tmdbClient.get<EpisodeDetails>(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
  return data;
}


