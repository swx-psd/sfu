import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalConfig, ProviderConfig } from '../types';
import Constants from 'expo-constants';

export class LocalConfigManager {
  private static readonly CACHE_KEY = 'secflix_streaming_config';
  private static config: LocalConfig | null = null;

  /**
   * Get local configuration
   */
  static async getConfig(): Promise<LocalConfig> {
    if (this.config) {
      return this.config;
    }

    // Try to get cached config
    const cachedConfig = await this.getCachedConfig();
    if (cachedConfig) {
      this.config = cachedConfig;
      return cachedConfig;
    }

    // Return default config
    const defaultConfig = this.getDefaultConfig();
    this.config = defaultConfig;
    await this.cacheConfig(defaultConfig);
    return defaultConfig;
  }

  /**
   * Update configuration
   */
  static async updateConfig(config: Partial<LocalConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const updatedConfig = { ...currentConfig, ...config };

    this.config = updatedConfig;
    await this.cacheConfig(updatedConfig);

    console.log('✅ Configuration updated successfully');
  }

  /**
   * Cache configuration to AsyncStorage
   */
  private static async cacheConfig(config: LocalConfig): Promise<void> {
    try {
      const configData = {
        config,
        timestamp: Date.now()
      };

      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(configData));
    } catch (error) {
      console.error('Failed to cache config:', error);
    }
  }

  /**
   * Get cached configuration from AsyncStorage
   */
  private static async getCachedConfig(): Promise<LocalConfig | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        console.log('📁 Using cached config');
        return data.config;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached config:', error);
      return null;
    }
  }

  /**
   * Default configuration
   */
  private static getDefaultConfig(): LocalConfig {
    // Try to get key from different sources
    const tmdbKey = process.env.EXPO_PUBLIC_TMDB_KEY ||
      Constants.expoConfig?.extra?.tmdb?.apiKey ||
      '';

    return {
      providers: [
        {
          name: 'yesmovies',
          domain: 'https://ww.yesmovies.ag',
          priority: 1,
          active: true,
          timeout: 18000
        },
        {
          name: 'vidlink',
          domain: 'https://vidlink.pro',
          priority: 2,
          active: true,
          timeout: 25000
        }
      ],
      apiKeys: {
        tmdb: tmdbKey
      },
      timeout: 30000,
      maxRetries: 3
    };
  }

  /**
   * Add new provider
   */
  static async addProvider(provider: ProviderConfig): Promise<void> {
    const config = await this.getConfig();

    // Check if provider already exists
    const existingIndex = config.providers.findIndex(p => p.name === provider.name);

    if (existingIndex >= 0) {
      // Update existing provider
      config.providers[existingIndex] = provider;
    } else {
      // Add new provider
      config.providers.push(provider);
    }

    await this.updateConfig({ providers: config.providers });
    console.log(`✅ Provider ${provider.name} added/updated`);
  }

  /**
   * Remove provider
   */
  static async removeProvider(providerName: string): Promise<void> {
    const config = await this.getConfig();
    const filteredProviders = config.providers.filter(p => p.name !== providerName);

    await this.updateConfig({ providers: filteredProviders });
    console.log(`🗑️ Provider ${providerName} removed`);
  }

  /**
   * Toggle provider active state
   */
  static async toggleProvider(providerName: string, active: boolean): Promise<void> {
    const config = await this.getConfig();
    const provider = config.providers.find(p => p.name === providerName);

    if (provider) {
      provider.active = active;
      await this.updateConfig({ providers: config.providers });
      console.log(`${active ? '✅' : '❌'} Provider ${providerName} ${active ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Clear cached configuration
   */
  static async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      this.config = null;
      console.log('🗑️ Config cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get provider statistics
   */
  static async getProviderStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const config = await this.getConfig();
    const active = config.providers.filter(p => p.active).length;

    return {
      total: config.providers.length,
      active,
      inactive: config.providers.length - active
    };
  }
}