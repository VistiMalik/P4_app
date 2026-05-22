import { AppState, AppStateStatus } from "react-native";
import {
  QueryClient,
  focusManager,
  onlineManager
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
      gcTime: 1000 * 60 * 5
    },
    mutations: {
      retry: 0
    }
  }
});

// Reativa queries quando o app volta ao primeiro plano.
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener(
    "change",
    (state: AppStateStatus) => {
      if (state === "active") {
        handleFocus();
      }
    }
  );

  return () => subscription.remove();
});

// Assume que o app está online em ambiente de desenvolvimento.
onlineManager.setOnline(true);
