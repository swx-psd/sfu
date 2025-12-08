import { tmdbClient } from "./client";
import { PaginatedResponse, Movie, MovieDetails, CreditsResponse, ImagesResponse, WatchProvidersResponse, VideosResponse } from "./types";
import Constants from "expo-constants";

export async function fetchPopularMovies(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/movie/popular", {
    params: { page },
  });
  return data;
}

export async function fetchNowPlayingMovies(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/movie/now_playing", {
    params: { page },
  });
  return data;
}

export async function fetchTopRatedMovies(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/movie/top_rated", {
    params: { page },
  });
  return data;
}

export async function fetchUpcomingMovies(page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>("/movie/upcoming", {
    params: { page },
  });
  return data;
}

export async function fetchMovieDetails(id: number) {
  const { data } = await tmdbClient.get<MovieDetails>(`/movie/${id}`);
  return data;
}

export async function fetchMovieCredits(id: number) {
  const { data } = await tmdbClient.get<CreditsResponse>(`/movie/${id}/credits`);
  return data;
}

export async function fetchMovieImages(id: number) {
  const { data } = await tmdbClient.get<ImagesResponse>(`/movie/${id}/images`, {
    params: { include_image_language: "tr,null,en" },
  });
  return data;
}

export async function fetchMovieVideos(id: number) {
  const { data } = await tmdbClient.get<VideosResponse>(`/movie/${id}/videos`);
  return data;
}

export async function fetchMovieRecommendations(id: number, page: number = 1) {
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(`/movie/${id}/recommendations`, { params: { page } });
  return data;
}

export async function fetchMovieWatchProviders() {
  const { data } = await tmdbClient.get<WatchProvidersResponse>(`/watch/providers/movie`);
  return data.results;
}

export async function discoverMoviesByProvider(providerId: number, page: number = 1) {
  const region = ((Constants.expoConfig?.extra as any)?.tmdb?.region as string) || "TR";
  const { data } = await tmdbClient.get<PaginatedResponse<Movie>>(`/discover/movie`, {
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


