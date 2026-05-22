import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import { TextInputField } from "@components/ui/TextInputField";
import { Button } from "@components/ui/Button";
import { useLogin } from "../hooks/useLogin";
import { colors, spacing } from "@lib/theme";
import { useToast } from "@components/ui/ToastProvider";

const formatCpf = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const extractDigits = (value: string) => value.replace(/\D/g, "");

export const LoginForm: React.FC = () => {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync, isPending } = useLogin();
  const toast = useToast();

  const handleSubmit = async () => {
    const normalizedCpf = extractDigits(cpf);
    if (normalizedCpf.length !== 11) {
      toast.show("Informe um CPF válido.");
      return;
    }

    if (!password) {
      toast.show("Informe a senha.");
      return;
    }

    await mutateAsync({ cpf: normalizedCpf, password });
  };

  const handleCpfChange = useCallback((value: string) => {
    setCpf(formatCpf(value));
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo(a)</Text>
        <Text style={styles.subtitle}>Entre para registrar suas coletas.</Text>
      </View>
      <TextInputField
        label="CPF"
        appearance="dark"
        keyboardType="number-pad"
        autoCapitalize="none"
        autoComplete="off"
        value={cpf}
        onChangeText={handleCpfChange}
        placeholder="000.000.000-00"
        maxLength={14}
      />
      <TextInputField
        label="Senha"
        appearance="dark"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Digite sua senha"
      />
      <Button
        label="Entrar"
        onPress={handleSubmit}
        loading={isPending}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 16,
    color: colors.textSecondary
  }
});
