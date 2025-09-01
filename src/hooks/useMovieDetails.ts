import { useQuery } from "@tanstack/react-query";
import { fetchMovieDetails, fetchMovieCredits } from "../api/movies";

export function useMovieDetails(id: number) {
  const details = useQuery({ queryKey: ["movie-details", id], queryFn: () => fetchMovieDetails(id), enabled: !!id });
  const credits = useQuery({ queryKey: ["movie-credits", id], queryFn: () => fetchMovieCredits(id), enabled: !!id });
  return { details, credits };
}


