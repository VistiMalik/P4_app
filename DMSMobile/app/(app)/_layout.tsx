import React from "react";
import { Stack } from "expo-router";
import { colors } from "@lib/theme";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary
      }}
    >
      <Stack.Screen name="index" options={{ title: "Dashboard" }} />
      <Stack.Screen name="ble" options={{ title: "Conectar balança" }} />
      <Stack.Screen name="profile" options={{ title: "Meu Perfil" }} />
      <Stack.Screen name="reports" options={{ title: "Relatórios" }} />
      <Stack.Screen name="history" options={{ title: "Histórico Completo" }} />
    </Stack>
  );
}
