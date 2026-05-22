import { useQuery } from "@tanstack/react-query";
import { fetchCooperativeLeaderboard } from "@lib/api/weighings";
import { CollectorRanking } from "@lib/api/types";

export const useCooperativeLeaderboard = () => {
  return useQuery<CollectorRanking[]>({
    queryKey: ["leaderboard", "cooperative"],
    queryFn: fetchCooperativeLeaderboard,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5
  });
};

