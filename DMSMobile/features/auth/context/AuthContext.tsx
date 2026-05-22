import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { deleteAccessToken, getAccessToken, saveAccessToken } from "@lib/storage/tokenStorage";
import { User } from "@lib/api/types";
import { getCurrentUser } from "@lib/api/auth";

export interface AuthContextValue {
  isLoading: boolean;
  token: string | null;
  user: User | null;
  setSession: (token: string, user?: User) => Promise<void>;
  clearSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = await getAccessToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const profile = await getCurrentUser();
        setUser(profile);
      } catch (error) {
        console.warn("Falha ao carregar usuário autenticado:", error);
        await deleteAccessToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const setSession = async (newToken: string, newUser?: User) => {
    await saveAccessToken(newToken);
    setToken(newToken);

    if (newUser) {
      setUser(newUser);
      return;
    }

    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch (error) {
      console.warn("Não foi possível carregar o perfil após o login:", error);
      setUser(null);
    }
  };

  const clearSession = async () => {
    await deleteAccessToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isLoading,
      token,
      user,
      setSession,
      clearSession
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuthContext precisa estar dentro do AuthProvider");
  }

  return ctx;
};
