import { IStreamingProvider } from '../types';
import YesMoviesProvider from './YesMoviesProvider';
import VidLinkProvider from './VidLinkProvider';

// Provider Registry - Metro bundler ile uyumlu static imports
export const PROVIDERS: Record<string, new () => IStreamingProvider> = {
  yesmovies: YesMoviesProvider,
  vidlink: VidLinkProvider,
};

export function getProvider(providerName: string): (new () => IStreamingProvider) | null {
  const normalizedName = providerName.toLowerCase();
  console.log(`[Registry] Looking for provider: ${normalizedName}`);
  console.log(`[Registry] Available providers:`, Object.keys(PROVIDERS));

  const provider = PROVIDERS[normalizedName];
  if (provider) {
    console.log(`[Registry] Found provider: ${normalizedName}`);
    return provider;
  } else {
    console.log(`[Registry] Provider not found: ${normalizedName}`);
    return null;
  }
}

export function getAllProviderNames(): string[] {
  return Object.keys(PROVIDERS);
}

export default PROVIDERS;