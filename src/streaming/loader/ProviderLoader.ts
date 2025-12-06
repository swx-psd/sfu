import { IStreamingProvider, MovieInfo, StreamingLink, SearchResult } from '../types';
import { LocalConfigManager } from '../config/LocalConfigManager';
import { TMDBValidator } from '../utils/TMDBValidator';
import { NetworkUtils } from '../utils/NetworkUtils';
import { getProvider } from '../providers';

export class ProviderLoader {
  private static loadedProviders: Map<string, IStreamingProvider> = new Map();
  private static loadingPromises: Map<string, Promise<IStreamingProvider | null>> = new Map();

  /**
   * Load a local streaming provider
   */
  static async loadProvider(providerName: string): Promise<IStreamingProvider | null> {
    // Return cached provider
    if (this.loadedProviders.has(providerName)) {
      return this.loadedProviders.get(providerName) || null;
    }

    // Return existing loading promise to avoid duplicate loads
    if (this.loadingPromises.has(providerName)) {
      return this.loadingPromises.get(providerName) || null;
    }

    // Start loading process
    const loadingPromise = this.loadProviderInternal(providerName);
    this.loadingPromises.set(providerName, loadingPromise);

    try {
      const provider = await loadingPromise;
      if (provider) {
        this.loadedProviders.set(providerName, provider);
      }
      return provider;
    } finally {
      this.loadingPromises.delete(providerName);
    }
  }

  private static async loadProviderInternal(providerName: string): Promise<IStreamingProvider | null> {
    try {
      console.log(`🔄 Loading provider: ${providerName}`);

      // Get provider class from registry
      const ProviderClass = getProvider(providerName);
      
      if (!ProviderClass) {
        throw new Error(`Provider not found in registry: ${providerName}`);
      }

      const provider = new ProviderClass();

      // Validate provider interface
      if (!this.validateProviderInterface(provider)) {
        throw new Error(`Provider does not implement required interface: ${providerName}`);
      }

      // Set provider metadata
      provider.name = providerName;
      
      console.log(`✅ Provider loaded successfully: ${providerName}`);
      return provider as IStreamingProvider;

    } catch (error) {
      console.error(`❌ Failed to load provider ${providerName}:`, error);
      return null;
    }
  }

  /**
   * Validate that provider implements required interface
   */
  private static validateProviderInterface(provider: any): boolean {
    const requiredMethods = ['search', 'extractLinks', 'validateContent'];
    const requiredProperties = ['name', 'domain', 'priority'];

    for (const method of requiredMethods) {
      if (typeof provider[method] !== 'function') {
        console.error(`Provider missing required method: ${method}`);
        return false;
      }
    }

    for (const prop of requiredProperties) {
      if (!(prop in provider)) {
        console.error(`Provider missing required property: ${prop}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Title matching utility for providers
   */
  private static titleMatcher(movieInfo: MovieInfo, title: string): boolean {
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const movieTitle = normalize(movieInfo.title);
    const searchTitle = normalize(title);

    // Exact match
    if (movieTitle === searchTitle) return true;

    // Partial match with high similarity
    const similarity = this.stringSimilarity(movieTitle, searchTitle);
    return similarity > 0.85;
  }

  /**
   * String similarity calculation
   */
  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
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
          matrix[j][i - 1] + 1, // insertion
          matrix[j - 1][i] + 1, // deletion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Create URL slug for search
   */
  private static createUrlSlug(movieInfo: MovieInfo): string {
    const title = movieInfo.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    return encodeURIComponent(title);
  }

  /**
   * Get all loaded providers
   */
  static getLoadedProviders(): IStreamingProvider[] {
    return Array.from(this.loadedProviders.values());
  }

  /**
   * Clear provider cache
   */
  static clearCache(): void {
    this.loadedProviders.clear();
    this.loadingPromises.clear();
    console.log('🗑️ Provider cache cleared');
  }

  /**
   * Preload providers based on configuration
   */
  static async preloadProviders(): Promise<void> {
    try {
      const config = await LocalConfigManager.getConfig();
      const activeProviders = config.providers
        .filter((p: any) => p.active)
        .sort((a: any, b: any) => a.priority - b.priority)
        .slice(0, 3); // Preload top 3 providers

      console.log(`🚀 Preloading ${activeProviders.length} providers...`);

      const loadPromises = activeProviders.map((provider: any) => 
        this.loadProvider(provider.name)
      );

      await Promise.allSettled(loadPromises);
      console.log('✅ Provider preloading completed');
      
    } catch (error) {
      console.error('❌ Provider preloading failed:', error);
    }
  }
}