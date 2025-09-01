import { tmdbClient } from "./client";
import { PaginatedResponse, Movie, MovieDetails, CreditsResponse } from "./types";

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

export async function fetchMovieDetails(id: number) {
  const { data } = await tmdbClient.get<MovieDetails>(`/movie/${id}`);
  return data;
}

export async function fetchMovieCredits(id: number) {
  const { data } = await tmdbClient.get<CreditsResponse>(`/movie/${id}/credits`);
  return data;
}


