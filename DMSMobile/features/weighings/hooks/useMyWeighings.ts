import { useQuery } from "@tanstack/react-query";
import { fetchMyWeighings } from "@lib/api/weighings";
import { Weighing } from "@lib/api/types";

export const useMyWeighings = () => {
  return useQuery<Weighing[]>({
    queryKey: ["weighings", "me"],
    queryFn: fetchMyWeighings
  });
};
