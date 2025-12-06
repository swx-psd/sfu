import { tmdbClient } from "./client";
import { PaginatedResponse, Movie, TvDetails, CreditsResponse, SeasonDetails, EpisodeDetails, ImagesResponse, WatchProvidersResponse, VideosResponse } from "./types";
import Constants from "expo-constants";

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

export async function fetchOnTheAir(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/tv/on_the_air", {
    params: { page },
  });
  return data;
}

export async function fetchTopRatedTv(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/tv/top_rated", {
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

export async function fetchTvImages(id: number) {
  const { data } = await tmdbClient.get<ImagesResponse>(`/tv/${id}/images`, {
    params: { include_image_language: "tr,null,en" },
  });
  return data;
}

export async function fetchTvVideos(id: number) {
  const { data } = await tmdbClient.get<VideosResponse>(`/tv/${id}/videos`);
  return data;
}

export async function fetchTvRecommendations(id: number, page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(`/tv/${id}/recommendations`, { params: { page } });
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

export async function fetchTvWatchProviders() {
  const { data } = await tmdbClient.get<WatchProvidersResponse>(`/watch/providers/tv`);
  return data.results;
}

export async function discoverTvByProvider(providerId: number, page: number = 1) {
  const region = ((Constants.expoConfig?.extra as any)?.tmdb?.region as string) || "TR";
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(`/discover/tv`, {
    params: {
      with_watch_providers: providerId,
      watch_region: region,
      page,
      sort_by: "popularity.desc",
      include_adult: true,
    },
  });
  return data;
}


