import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWeighing } from "@lib/api/weighings";
import { CreateWeighingPayload, Weighing } from "@lib/api/types";
import { useToast } from "@components/ui/ToastProvider";

export const useCreateWeighing = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWeighingPayload) => createWeighing(payload),
    onSuccess: async (newWeighing: Weighing) => {
      toast.show("Peso salvo com sucesso.");
      queryClient.setQueryData<Weighing[]>(
        ["weighings", "me"],
        (current = []) => [newWeighing, ...current]
      );
    },
    onError: () => {
      toast.show("Não foi possível salvar o peso. Tente novamente.");
    }
  });
};
