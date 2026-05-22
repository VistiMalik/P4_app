import { act, waitFor } from "@testing-library/react-native";
import { useLogin } from "@features/auth/hooks/useLogin";
import * as SecureStore from "expo-secure-store";
import { renderHookWithProviders } from "./test-utils";
import { login as loginApi } from "@lib/api/auth";

describe("useLogin", () => {
  it("salva o token e o usuário ao realizar login", async () => {
    const { result } = renderHookWithProviders(() => useLogin());

    (loginApi as jest.Mock).mockResolvedValue({
      accessToken: "token-123",
      user: {
        id: "1",
        name: "Usuário Teste",
        email: "usuario@example.com",
        cpf: "12345678901",
        cooperativeId: "1",
        cooperativeName: "Cooperativa Aurora"
      }
    });

    await act(async () => {
      await result.current.mutateAsync({
        cpf: "12345678901",
        password: "segredo"
      });
    });

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalled();
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
