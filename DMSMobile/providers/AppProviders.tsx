import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { ToastProvider } from "@components/ui/ToastProvider";
import { AuthProvider } from "@features/auth/context/AuthContext";
import { queryClient } from "@lib/query/client";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children
}) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <PaperProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ToastProvider>
    </PaperProvider>
  </GestureHandlerRootView>
);
