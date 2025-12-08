import { MovieInfo, StreamingLink, ProviderResponse, ProviderConfig } from './types';
import { LocalConfigManager } from './config/LocalConfigManager';
import { ProviderLoader } from './loader/ProviderLoader';
import { TMDBValidator } from './utils/TMDBValidator';
import { NetworkUtils } from './utils/NetworkUtils';

export class StreamingManager {
  private static instance: StreamingManager | null = null;
  private static initialized: boolean = false;

  /**
   * Singleton pattern for StreamingManager
   */
  static getInstance(): StreamingManager {
    if (!this.instance) {
      this.instance = new StreamingManager();
    }
    return this.instance;
  }

  /**
   * Initialize the streaming system
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🚀 Initializing SecFlix Streaming System...');

      // Clear cached config to load latest provider configuration
      await LocalConfigManager.clearCache();
      
      // Get configuration
      const config = await LocalConfigManager.getConfig();
      
      console.log(`📦 Loaded ${config.providers.length} providers:`, config.providers.map(p => p.name));
      
      // Set TMDB API key
      if (config.apiKeys.tmdb) {
        TMDBValidator.setApiKey(config.apiKeys.tmdb);
        console.log('✅ TMDB API configured');
      }

      // Preload priority providers
      await ProviderLoader.preloadProviders();

      this.initialized = true;
      console.log('✅ SecFlix Streaming System initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize streaming system:', error);
      throw error;
    }
  }

  /**
   * Force reinitialize the streaming system (useful for config updates)
   */
  static async reinitialize(): Promise<void> {
    this.initialized = false;
    this.instance = null;
    await this.initialize();
  }

  /**
   * Get streaming links for movie/TV show
   */
  async getStreamingLinks(movieInfo: MovieInfo): Promise<StreamingLink[]> {
    try {
      if (!StreamingManager.initialized) {
        await StreamingManager.initialize();
      }

      console.log(`🔍 Getting streaming links for: ${movieInfo.title} (${movieInfo.year})`);

      // Validate movie info with TMDB
      const isValid = await this.validateMovieInfo(movieInfo);
      if (!isValid) {
        console.warn('⚠️ Movie validation failed, proceeding anyway...');
      }

      // Get provider configuration
      const config = await LocalConfigManager.getConfig();
      const providers = this.getSortedProviders(config.providers);

      const allLinks: StreamingLink[] = [];
      const providerResults: ProviderResponse[] = [];

      // Process providers with concurrency control
      const maxConcurrent = 3;
      const providerGroups = this.chunkArray(providers, maxConcurrent);

      for (const group of providerGroups) {
        const groupPromises = group.map(provider => 
          this.getLinksFromProvider(provider, movieInfo)
        );

        const groupResults = await Promise.allSettled(groupPromises);
        
        for (const result of groupResults) {
          if (result.status === 'fulfilled' && result.value) {
            providerResults.push(result.value);
            if (result.value.success) {
              allLinks.push(...result.value.links);
            }
          }
        }

        // Stop if we have enough high-quality links
        const qualityLinks = allLinks.filter(link => 
          link.quality.includes('1080') || link.quality.includes('720')
        );
        
        if (qualityLinks.length >= 3) {
          console.log(`✅ Found ${qualityLinks.length} quality links, stopping search`);
          break;
        }
      }

      // Log results
      this.logProviderResults(providerResults);

      // Deduplicate and sort links
      const uniqueLinks = this.deduplicateLinks(allLinks);
      const sortedLinks = this.sortLinksByQuality(uniqueLinks);

      console.log(`🎯 Found ${sortedLinks.length} streaming links`);
      return sortedLinks;

    } catch (error) {
      console.error('❌ Failed to get streaming links:', error);
      return [];
    }
  }

  /**
   * Get links from a specific provider
   */
  private async getLinksFromProvider(
    providerConfig: ProviderConfig, 
    movieInfo: MovieInfo
  ): Promise<ProviderResponse> {
    const startTime = Date.now();
    
    try {
      // Load provider
      const provider = await ProviderLoader.loadProvider(providerConfig.name);
      if (!provider) {
        return {
          success: false,
          links: [],
          error: 'Provider not available',
          provider: providerConfig.name,
          executionTime: Date.now() - startTime
        };
      }

      // Execute with timeout
      const links = await NetworkUtils.withRetry(
        () => this.executeProviderWithTimeout(provider, movieInfo, providerConfig.timeout),
        2, // max retries
        1000 // delay
      );

      return {
        success: true,
        links: links || [],
        provider: providerConfig.name,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        links: [],
        error: error instanceof Error ? error.message : String(error),
        provider: providerConfig.name,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute provider with timeout
   */
  private async executeProviderWithTimeout(
    provider: any, 
    movieInfo: MovieInfo, 
    timeout: number
  ): Promise<StreamingLink[]> {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Provider timeout'));
      }, timeout);

      try {
        // Search for content
        const searchResults = await provider.search(movieInfo);
        if (!searchResults || searchResults.length === 0) {
          clearTimeout(timeoutId);
          resolve([]);
          return;
        }

        // Find best match
        const bestMatch = searchResults.find((result: any) => 
          provider.validateContent(movieInfo, result)
        ) || searchResults[0];

        // Extract links
        const links = await provider.extractLinks(movieInfo, bestMatch);
        
        clearTimeout(timeoutId);
        resolve(links || []);

      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Validate movie info with TMDB
   */
  private async validateMovieInfo(movieInfo: MovieInfo): Promise<boolean> {
    try {
      if (movieInfo.type === 'movie') {
        return await TMDBValidator.validateMovie(movieInfo);
      } else {
        return await TMDBValidator.validateTv(movieInfo);
      }
    } catch (error) {
      console.error('TMDB validation error:', error);
      return false;
    }
  }

  /**
   * Sort providers by priority and filter active ones
   */
  private getSortedProviders(providers: ProviderConfig[]): ProviderConfig[] {
    return providers
      .filter(p => p.active)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6); // Limit to top 6 providers
  }

  /**
   * Deduplicate links by URL
   */
  private deduplicateLinks(links: StreamingLink[]): StreamingLink[] {
    const seen = new Set<string>();
    return links.filter(link => {
      const key = `${link.url}_${link.quality}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Sort links by quality preference
   */
  private sortLinksByQuality(links: StreamingLink[]): StreamingLink[] {
    const qualityOrder = ['1080p', '720p', '480p', '360p', 'unknown'];
    
    return links.sort((a, b) => {
      const aIndex = qualityOrder.findIndex(q => a.quality.includes(q));
      const bIndex = qualityOrder.findIndex(q => b.quality.includes(q));
      
      const aOrder = aIndex === -1 ? qualityOrder.length : aIndex;
      const bOrder = bIndex === -1 ? qualityOrder.length : bIndex;
      
      return aOrder - bOrder;
    });
  }

  /**
   * Split array into chunks for concurrent processing
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Log provider execution results
   */
  private logProviderResults(results: ProviderResponse[]): void {
    console.log('\n📊 Provider Results Summary:');
    console.log('─'.repeat(50));
    
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const time = `${result.executionTime}ms`;
      
      console.log(`${status} ${result.provider.padEnd(15)} | ${(result.success ? `${result.links.length} links` : (result.error || 'Unknown error')).padEnd(20)} | ${time}`);
    });
    
    console.log('─'.repeat(50));
  }

  /**
   * Get provider statistics
   */
  async getProviderStats(): Promise<{
    totalProviders: number;
    activeProviders: number;
    loadedProviders: number;
  }> {
    const config = await LocalConfigManager.getConfig();
    const loaded = ProviderLoader.getLoadedProviders();
    
    return {
      totalProviders: config.providers.length,
      activeProviders: config.providers.filter((p: any) => p.active).length,
      loadedProviders: loaded.length
    };
  }

  /**
   * Clear all caches
   */
  static clearAllCaches(): void {
    ProviderLoader.clearCache();
    TMDBValidator.clearCache();
    LocalConfigManager.clearCache();
    console.log('🗑️ All caches cleared');
  }

  /**
   * Refresh configuration and providers
   */
  static async refresh(): Promise<void> {
    this.initialized = false;
    this.clearAllCaches();
    await this.initialize();
    console.log('🔄 Streaming system refreshed');
  }
}