import "@lib/polyfills";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { AppProviders } from "../providers/AppProviders";
import { useAuth } from "@features/auth/hooks/useAuth";
import { colors } from "@lib/theme";

export const unstable_settings = {
  initialRouteName: "(auth)"
};

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background
        }}
      >
        <ActivityIndicator size="large" color={colors.neonBlue} />
      </View>
    );
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGuard>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontWeight: "600" }
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(app)"
            options={{
              headerShown: false
            }}
          />
        </Stack>
      </AuthGuard>
    </AppProviders>
  );
}
