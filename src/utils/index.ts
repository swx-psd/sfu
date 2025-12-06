import Constants from "expo-constants";

export type TmdbImageSize =
  | "w92" | "w154" | "w185" | "w300" | "w342" | "w500" | "w780" | "original";

export function buildTmdbImageUrl(filePath?: string | null, size: TmdbImageSize = "w300") {
  if (!filePath) return undefined;
  const base = ((Constants.expoConfig?.extra as any)?.tmdb?.imageBase as string) || "https://image.tmdb.org/t/p/";
  return `${base}${size}${filePath}`;
}
