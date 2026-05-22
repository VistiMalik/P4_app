import { useMutation } from "@tanstack/react-query";
import { login } from "@lib/api/auth";
import { LoginPayload } from "@lib/api/types";
import { useToast } from "@components/ui/ToastProvider";
import { useAuth } from "./useAuth";

export const useLogin = () => {
  const toast = useToast();
  const { setSession } = useAuth();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      if (!payload.cpf || !payload.password) {
        throw new Error("Informe CPF e senha.");
      }

      return login(payload);
    },
    onSuccess: async (data) => {
      await setSession(data.accessToken, data.user);
      toast.show("Você entrou com sucesso.");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível acessar. Tente novamente.";
      toast.show(message);
    }
  });
};
