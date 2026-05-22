import React from "react";
import { Screen } from "@components/ui/Screen";
import { LoginForm } from "@features/auth/components/LoginForm";

export default function LoginScreen() {
  return (
    <Screen appearance="dark">
      <LoginForm />
    </Screen>
  );
}
