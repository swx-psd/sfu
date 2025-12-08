import { useQuery } from "@tanstack/react-query";
import { fetchSeasonDetails } from "../api/tv";

export function useSeasonDetails(tvId: number, seasonNumber: number) {
  const season = useQuery({ queryKey: ["season-details", tvId, seasonNumber], queryFn: () => fetchSeasonDetails(tvId, seasonNumber), enabled: !!tvId });
  return { season };
}


