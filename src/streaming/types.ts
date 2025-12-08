// SecFlix Streaming System Types - Simplified Version
export interface MovieInfo {
  id: number;
  title: string;
  year: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  imdb_id?: string;
  tmdb_id: number;
}

export interface StreamingLink {
  url: string;
  quality: string;
  provider: string;
  type: 'mp4' | 'm3u8' | 'dash';
  headers?: Record<string, string>;
  subtitles?: Subtitle[];
}

export interface Subtitle {
  url: string;
  language: string;
  label: string;
  format: 'vtt' | 'srt';
}

export interface ProviderConfig {
  name: string;
  domain: string;
  priority: number;
  active: boolean;
  timeout: number;
  headers?: Record<string, string>;
}

export interface LocalConfig {
  providers: ProviderConfig[];
  apiKeys: {
    tmdb: string;
  };
  timeout: number;
  maxRetries: number;
}

export interface ProviderResponse {
  success: boolean;
  links: StreamingLink[];
  error?: string;
  provider: string;
  executionTime: number;
}

export interface SearchResult {
  title: string;
  year: number;
  type: 'movie' | 'tv';
  url: string;
  poster?: string;
}

// Provider Interface that all providers must implement
export interface IStreamingProvider {
  name: string;
  domain: string;
  priority: number;
  
  search(movieInfo: MovieInfo): Promise<SearchResult[]>;
  extractLinks(movieInfo: MovieInfo, searchResult: SearchResult): Promise<StreamingLink[]>;
  validateContent(movieInfo: MovieInfo, searchResult: SearchResult): boolean;
}