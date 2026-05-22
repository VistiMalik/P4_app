import { useMemo } from "react";
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const { token, user, isLoading, setSession, clearSession } = useAuthContext();

  return useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      user,
      isLoading,
      setSession,
      clearSession
    }),
    [token, user, isLoading, setSession, clearSession]
  );
};
