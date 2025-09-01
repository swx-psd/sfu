import { useQuery } from "@tanstack/react-query";
import { fetchTvDetails, fetchTvCredits } from "../api/tv";

export function useTvDetails(id: number) {
  const details = useQuery({ queryKey: ["tv-details", id], queryFn: () => fetchTvDetails(id), enabled: !!id });
  const credits = useQuery({ queryKey: ["tv-credits", id], queryFn: () => fetchTvCredits(id), enabled: !!id });
  return { details, credits };
}


