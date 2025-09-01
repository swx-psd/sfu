import { useQuery } from "@tanstack/react-query";
import { fetchPopularMovies } from "../api/movies";

export function usePopularMovies(page: number = 1) {
  return useQuery({
    queryKey: ["popular-movies", page],
    queryFn: () => fetchPopularMovies(page),
  });
}


