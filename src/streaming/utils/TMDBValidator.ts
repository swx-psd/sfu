import { MovieInfo } from '../types';
import { NetworkUtils } from './NetworkUtils';

interface TMDBMovieInfo {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  imdb_id: string;
  adult: boolean;
  genre_ids: number[];
}

interface TMDBTvInfo {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  adult: boolean;
  genre_ids: number[];
}

export class TMDBValidator {
  private static readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private static apiKey: string = '';
  private static cache: Map<string, any> = new Map();
  private static readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  static setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Validate movie information against TMDB
   */
  static async validateMovie(movieInfo: MovieInfo): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.warn('TMDB API key not set, skipping validation');
        return true;
      }

      const tmdbInfo = await this.getMovieInfo(movieInfo.tmdb_id);
      if (!tmdbInfo) return false;

      // Validate title match
      const titleMatch = this.validateTitle(movieInfo.title, [
        tmdbInfo.title,
        tmdbInfo.original_title
      ]);

      // Validate year match
      const yearMatch = this.validateYear(movieInfo.year, tmdbInfo.release_date);

      return titleMatch && yearMatch;
      
    } catch (error) {
      console.error('Movie validation failed:', error);
      return false;
    }
  }

  /**
   * Validate TV show information against TMDB
   */
  static async validateTv(movieInfo: MovieInfo): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.warn('TMDB API key not set, skipping validation');
        return true;
      }

      const tmdbInfo = await this.getTvInfo(movieInfo.tmdb_id);
      if (!tmdbInfo) return false;

      // Validate title match
      const titleMatch = this.validateTitle(movieInfo.title, [
        tmdbInfo.name,
        tmdbInfo.original_name
      ]);

      // Validate year match
      const yearMatch = this.validateYear(movieInfo.year, tmdbInfo.first_air_date);

      return titleMatch && yearMatch;
      
    } catch (error) {
      console.error('TV validation failed:', error);
      return false;
    }
  }

  /**
   * Get movie information from TMDB
   */
  static async getMovieInfo(movieId: number): Promise<TMDBMovieInfo | null> {
    const cacheKey = `movie_${movieId}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${this.TMDB_BASE_URL}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`;
      const data = await NetworkUtils.safeRequest(url);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
      
    } catch (error) {
      console.error(`Failed to get movie info for ID ${movieId}:`, error);
      return null;
    }
  }

  /**
   * Get TV show information from TMDB
   */
  static async getTvInfo(tvId: number): Promise<TMDBTvInfo | null> {
    const cacheKey = `tv_${tvId}`;
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${this.TMDB_BASE_URL}/tv/${tvId}?api_key=${this.apiKey}&language=en-US`;
      const data = await NetworkUtils.safeRequest(url);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      return data;
      
    } catch (error) {
      console.error(`Failed to get TV info for ID ${tvId}:`, error);
      return null;
    }
  }

  /**
   * Search for movie/TV by title and year
   */
  static async searchContent(
    title: string, 
    year: number, 
    type: 'movie' | 'tv'
  ): Promise<MovieInfo | null> {
    try {
      if (!this.apiKey) return null;

      const query = encodeURIComponent(title);
      const url = `${this.TMDB_BASE_URL}/search/${type}?api_key=${this.apiKey}&language=en-US&query=${query}&year=${year}`;
      
      const data = await NetworkUtils.safeRequest(url);
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        
        return {
          id: result.id,
          title: type === 'movie' ? result.title : result.name,
          year: year,
          type: type,
          tmdb_id: result.id,
          imdb_id: result.imdb_id
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('TMDB search failed:', error);
      return null;
    }
  }

  /**
   * Get IMDB ID for a movie/TV show
   */
  static async getImdbId(tmdbId: number, type: 'movie' | 'tv'): Promise<string | null> {
    try {
      if (!this.apiKey) return null;

      const url = `${this.TMDB_BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${this.apiKey}`;
      const data = await NetworkUtils.safeRequest(url);
      
      return data.imdb_id || null;
      
    } catch (error) {
      console.error('Failed to get IMDB ID:', error);
      return null;
    }
  }

  /**
   * Validate title similarity
   */
  private static validateTitle(searchTitle: string, tmdbTitles: string[]): boolean {
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const normalizedSearch = normalize(searchTitle);

    for (const title of tmdbTitles) {
      if (!title) continue;
      
      const normalizedTitle = normalize(title);
      
      // Exact match
      if (normalizedSearch === normalizedTitle) {
        return true;
      }
      
      // High similarity match
      const similarity = this.calculateSimilarity(normalizedSearch, normalizedTitle);
      if (similarity > 0.85) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate year from date string
   */
  private static validateYear(searchYear: number, dateString: string): boolean {
    if (!dateString) return true; // Skip validation if no date
    
    const year = new Date(dateString).getFullYear();
    const yearDiff = Math.abs(year - searchYear);
    
    // Allow 1 year difference to account for different release dates
    return yearDiff <= 1;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => 
      Array(str1.length + 1).fill(null)
    );
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Clear validation cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}