import { useQuery } from "@tanstack/react-query";
import { fetchEpisodeDetails } from "../api/tv";

export function useEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number) {
  return useQuery({
    queryKey: ["episode-details", tvId, seasonNumber, episodeNumber],
    queryFn: () => fetchEpisodeDetails(tvId, seasonNumber, episodeNumber),
    enabled: !!tvId && !!seasonNumber && !!episodeNumber,
  });
}


