export interface Movie {
  id: number;
  title?: string;
  name?: string; // bazı uçlarda TV sonuçları için
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface SearchResult extends Movie {
  media_type?: 'movie' | 'tv' | 'person';
  profile_path?: string | null; // person için
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres?: Genre[];
  runtime?: number;
  status?: string;
  tagline?: string;
}

export interface Cast {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

export interface CreditsResponse {
  cast: Cast[];
}

export interface TvDetails extends Movie {
  genres?: Genre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  status?: string;
  tagline?: string;
  seasons?: Array<{
    season_number: number;
    episode_count?: number;
    name?: string;
    poster_path?: string | null;
    air_date?: string;
  }>;
}

export interface Episode {
  id: number;
  name?: string;
  overview?: string;
  still_path?: string | null;
  episode_number?: number;
  season_number?: number;
  vote_average?: number;
}

export interface SeasonDetails {
  id: number;
  name?: string;
  season_number: number;
  overview?: string;
  episodes?: Episode[];
}

export interface EpisodeDetails extends Episode {}


