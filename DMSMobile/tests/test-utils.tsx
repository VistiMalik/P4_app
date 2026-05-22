import React, { PropsWithChildren } from "react";
import { renderHook, RenderHookResult } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { ToastProvider } from "@components/ui/ToastProvider";
import { AuthProvider } from "@features/auth/context/AuthContext";

const createTestQueryClient = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return client;
};

const createWrapper = () => {
  const client = createTestQueryClient();
  const Wrapper: React.FC<PropsWithChildren> = ({ children }) => (
    <PaperProvider>
      <ToastProvider>
        <QueryClientProvider client={client}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </ToastProvider>
    </PaperProvider>
  );

  return Wrapper;
};

export const renderHookWithProviders = <Result, Props>(
  callback: (props: Props) => Result
): RenderHookResult<Result, Props> => {
  const wrapper = createWrapper();
  return renderHook(callback, { wrapper });
};
