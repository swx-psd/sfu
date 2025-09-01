import { useQuery } from "@tanstack/react-query";
import { fetchNowPlayingMovies } from "../api/movies";

export function useNowPlayingMovies(page: number = 1) {
  return useQuery({
    queryKey: ["now-playing-movies", page],
    queryFn: () => fetchNowPlayingMovies(page),
  });
}


