import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";

type TmdbExtra = {
  tmdb?: {
    apiBase?: string;
    imageBase?: string;
    apiKey?: string;
    language?: string;
    region?: string;
  };
};

const extra = (Constants?.expoConfig?.extra || {}) as TmdbExtra;
const tmdb = extra.tmdb || {};

const apiBaseUrl = tmdb.apiBase ?? "https://api.themoviedb.org/3";
const apiKey = tmdb.apiKey ?? "";

export const tmdbClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  params: {
    api_key: apiKey,
    language: tmdb.language ?? "tr-TR",
    region: tmdb.region ?? "TR",
  },
});

tmdbClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Basit yeniden deneme/backoff örneği (429 ve ağ hataları için)
    const status = error?.response?.status;
    const config = error?.config as any;
    if (!config) throw error;
    config.__retryCount = config.__retryCount || 0;
    const shouldRetry = status === 429 || !status;
    if (shouldRetry && config.__retryCount < 2) {
      config.__retryCount += 1;
      const waitMs = 300 * config.__retryCount;
      await new Promise((r) => setTimeout(r, waitMs));
      return tmdbClient(config);
    }
    throw error;
  }
);

export type { AxiosInstance };


