import React from "react";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1B5E20" },
        headerTintColor: "#FFFFFF",
        headerTitle: "Entrar"
      }}
    />
  );
}
