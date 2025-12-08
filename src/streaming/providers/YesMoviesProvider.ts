import { IStreamingProvider, MovieInfo, StreamingLink, SearchResult } from '../types';

/**
 * YesMovies Provider Implementation
 * Based on yesmovies.ag implementation from hula project
 */
export class YesMoviesProvider implements IStreamingProvider {
  name = 'yesmovies';
  domain = 'https://ww.yesmovies.ag';
  priority = 3;

  /**
   * Search for content on YesMovies
   */
  async search(movieInfo: MovieInfo): Promise<SearchResult[]> {
    try {
      console.log(`[YesMovies] Searching for: ${movieInfo.title}`);
      
      const searchTerm = movieInfo.title.replace(/\s+/g, '+');
      const searchUrl = `${this.domain}/searching?q=${searchTerm}&limit=40&offset=0`;
      
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Referer': this.domain
      };

      const response = await fetch(searchUrl, { headers });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const searchData = await response.json();
      return this.parseSearchResults(searchData, movieInfo);

    } catch (error) {
      console.error('[YesMovies] Search failed:', error);
      return [];
    }
  }

  /**
   * Extract streaming links from YesMovies
   */
  async extractLinks(movieInfo: MovieInfo, searchResult: SearchResult): Promise<StreamingLink[]> {
    try {
      console.log(`[YesMovies] Extracting links for: ${movieInfo.title}`);
      
      const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
      const headers = {
        'User-Agent': userAgent,
        'Referer': this.domain
      };

      // Extract ID from URL
      const idMatch = searchResult.url.match(/([0-9]+)\.html$/i);
      if (!idMatch) {
        throw new Error('Movie ID not found in URL');
      }
      
      const movieId = idMatch[1];
      console.log(`[YesMovies] Movie ID: ${movieId}`);

      // Get movie detail page
      const detailResponse = await fetch(searchResult.url, { headers });
      
      if (!detailResponse.ok) {
        throw new Error(`Failed to get detail page: ${detailResponse.status}`);
      }
      
      const detailHtml = await detailResponse.text();
      
      // Extract play URL
      const playUrlMatch = detailHtml.match(/plyURL *\= *\"([^\"]+)/i);
      if (!playUrlMatch) {
        throw new Error('Play URL not found');
      }
      
      const playUrl = this.base64Decode(playUrlMatch[1]);
      console.log(`[YesMovies] Play URL: ${playUrl}`);
      
      if (!playUrl) {
        throw new Error('Failed to decode play URL');
      }

      // Get IP location
      const ipData = await this.getIPLocation(playUrl);
      if (!ipData || !ipData.loc) {
        throw new Error('Failed to get IP location');
      }
      
      const loc = ipData.loc;
      console.log(`[YesMovies] Location: ${loc}`);

      // Prepare parameters
      const sv = 1;
      const eid = movieInfo.type === 'movie' ? 1 : (movieInfo.episode || 1);
      const mid = movieId;
      const tsx = Math.floor(new Date().getTime() / 1000);

      // Generate hash
      const hashData = await this.generateHash(loc, sv, mid, eid, tsx);
      if (!hashData) {
        throw new Error('Failed to generate hash');
      }
      
      console.log(`[YesMovies] Hash generated`);

      // Decode hash
      const decodedHash = await this.decodeHash(loc, hashData, tsx);
      if (!decodedHash) {
        throw new Error('Failed to decode hash');
      }
      
      console.log(`[YesMovies] Hash decoded`);

      // Get streaming info
      const hashUrl = `${playUrl}/get/${decodedHash}`;
      const hashResponse = await fetch(hashUrl, { headers });
      
      if (!hashResponse.ok) {
        throw new Error(`Failed to get hash data: ${hashResponse.status}`);
      }
      
      const hashResult = await hashResponse.json();
      
      if (!hashResult.info) {
        throw new Error('No streaming info found');
      }

      // Build final streaming URL
      const streamUrl = `${playUrl}/hls/${hashResult.info}/master.m3u8`;
      
      console.log(`[YesMovies] Stream URL: ${streamUrl}`);

      return [{
        url: streamUrl,
        quality: '1080p',
        provider: this.name,
        type: 'm3u8' as const,
        headers: {
          'User-Agent': userAgent,
          'Referer': this.domain
        }
      }];

    } catch (error) {
      console.error('[YesMovies] Link extraction failed:', error);
      return [];
    }
  }

  /**
   * Get IP location data
   */
  private async getIPLocation(baseUrl: string): Promise<any> {
    try {
      const traceUrl = `${baseUrl}/cdn-cgi/trace`;
      const response = await fetch(traceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'Referer': this.domain
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const traceData = await response.text();
      const lines = traceData.trim().split('\n').map(line => line.split('='));
      
      return Object.fromEntries(lines);
      
    } catch (error) {
      console.error('[YesMovies] Failed to get IP location:', error);
      return null;
    }
  }

  /**
   * Generate hash (simplified version)
   */
  private async generateHash(loc: string, sv: number, mid: string, eid: number, tsx: number): Promise<string | null> {
    try {
      // This would normally use the aquariumtv.app service
      // For now, we'll use a simplified approach
      const hashUrl = `https://aquariumtv.app/yesgenhash?loc=${loc}&sv=${sv}&mid=${mid}&eid=${eid}&tsx=${tsx}`;
      
      const response = await fetch(hashUrl);
      
      if (!response.ok) {
        return null;
      }
      
      return await response.text();
      
    } catch (error) {
      console.error('[YesMovies] Hash generation failed:', error);
      return null;
    }
  }

  /**
   * Decode hash (simplified version)
   */
  private async decodeHash(loc: string, hash: string, tsx: number): Promise<string | null> {
    try {
      // This would normally use the aquariumtv.app service
      // For now, we'll use a simplified approach
      const decodeUrl = `https://aquariumtv.app/yesdehash?loc=${loc}&hash=${hash}&tsx=${tsx}`;
      
      const response = await fetch(decodeUrl);
      
      if (!response.ok) {
        return null;
      }
      
      return await response.text();
      
    } catch (error) {
      console.error('[YesMovies] Hash decoding failed:', error);
      return null;
    }
  }

  /**
   * Parse search results from JSON response
   */
  private parseSearchResults(searchData: any, movieInfo: MovieInfo): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      if (!searchData.data || !Array.isArray(searchData.data)) {
        return results;
      }
      
      for (const item of searchData.data) {
        const title = item.t;
        const href = item.s;
        
        if (!title || !href) {
          continue;
        }
        
        // Extract season info
        const seasonMatch = title.match(/\- *season *([0-9]+)/i);
        const season = seasonMatch ? parseInt(seasonMatch[1]) : 0;
        const cleanTitle = title.replace(/\- *season *[0-9]+/i, '').trim();
        
        const type = season ? 'tv' : 'movie';
        
        // Check if this matches our search criteria
        if (this.isMatchingContent(movieInfo, cleanTitle, type as 'movie' | 'tv', season)) {
          const fullUrl = `${this.domain}/movie/${href}.html`;
          
          results.push({
            title: cleanTitle,
            year: movieInfo.year, // YesMovies search doesn't always return year
            type: type as 'movie' | 'tv',
            url: fullUrl,
            poster: ''
          });
        }
      }
      
    } catch (error) {
      console.error('[YesMovies] Failed to parse search results:', error);
    }
    
    return results;
  }

  /**
   * Check if content matches search criteria
   */
  private isMatchingContent(movieInfo: MovieInfo, title: string, type: 'movie' | 'tv', season: number): boolean {
    // Type must match
    if (movieInfo.type !== type) {
      return false;
    }
    
    // For TV shows, season must match
    if (movieInfo.type === 'tv' && season !== movieInfo.season) {
      return false;
    }
    
    // Title similarity
    const similarity = this.calculateSimilarity(
      movieInfo.title.toLowerCase(),
      title.toLowerCase()
    );
    
    return similarity > 0.7;
  }

  /**
   * Validate content match
   */
  validateContent(movieInfo: MovieInfo, searchResult: SearchResult): boolean {
    if (searchResult.type !== movieInfo.type) {
      return false;
    }
    
    const similarity = this.calculateSimilarity(
      movieInfo.title.toLowerCase(),
      searchResult.title.toLowerCase()
    );
    
    return similarity > 0.7;
  }

  /**
   * Base64 decode
   */
  private base64Decode(encoded: string): string {
    try {
      return atob(encoded);
    } catch (error) {
      console.error('[YesMovies] Base64 decode failed:', error);
      return '';
    }
  }

  /**
   * Calculate string similarity
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
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
}

// Default export for provider registry
export default YesMoviesProvider;