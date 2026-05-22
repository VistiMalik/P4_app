import React, { useState } from "react";
import { StyleSheet, Text, Alert } from "react-native";
import { Screen } from "@components/ui/Screen";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { TextInputField } from "@components/ui/TextInputField";
import { useAuth } from "@features/auth/hooks/useAuth";
import { updateProfile } from "@lib/api/auth";
import { useMutation } from "@tanstack/react-query";
import { colors, spacing } from "@lib/theme";
import { useToast } from "@components/ui/ToastProvider";

export default function ProfileScreen() {
  const { user, token, setSession, clearSession } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bankNumber, setBankNumber] = useState(user?.bank_number || "");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      toast.show("Perfil atualizado com sucesso!");
      if (token) {
        await setSession(token, data.user);
      }
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (error: any) => {
        console.error(error);
        const message = error.response?.data?.message || "Falha ao atualizar perfil.";
        Alert.alert("Erro", message);
    }
  });

  const handleUpdate = () => {
    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "A nova senha e a confirmação não conferem.");
      return;
    }

    if (newPassword && !currentPassword) {
        Alert.alert("Erro", "Informe a senha atual para definir uma nova.");
        return;
    }

    mutation.mutate({
      name,
      email,
      bank_number: bankNumber,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined
    });
  };

  const handleLogout = async () => {
      await clearSession();
  };

  return (
    <Screen appearance="dark" contentStyle={styles.content}>
        <Card variant="glass" style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            
            <TextInputField 
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
            />
            
            <TextInputField 
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInputField 
                label="Número do banco"
                value={bankNumber}
                onChangeText={setBankNumber}
                placeholder="Número do banco"
            />

            <TextInputField 
                label="CPF"
                value={user?.cpf || ""}
                editable={false}
                style={{ opacity: 0.7 }}
            />
        </Card>

        <Card variant="glass" style={styles.section}>
            <Text style={styles.sectionTitle}>Alterar Senha</Text>
            <Text style={styles.helperText}>Preencha apenas se quiser mudar sua senha atual.</Text>

            <TextInputField 
                label="Senha Atual"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Necessário para alterar senha"
            />

            <TextInputField 
                label="Nova Senha"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Mínimo 6 caracteres"
            />

             <TextInputField 
                label="Confirmar Nova Senha"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                placeholder="Repita a nova senha"
            />
        </Card>

        <Button 
            label="Salvar Alterações"
            onPress={handleUpdate}
            loading={mutation.isPending}
            size="lg"
            style={styles.saveButton}
        />

        <Button 
            label="Sair da conta"
            variant="outline"
            onPress={handleLogout}
            style={styles.logoutButton}
        />
    </Screen>
  );
}

const styles = StyleSheet.create({
    content: {
        padding: spacing.lg,
        gap: spacing.lg
    },
    section: {
        padding: spacing.xl,
        gap: spacing.md
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.sm
    },
    helperText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.sm
    },
    saveButton: {
        marginTop: spacing.md
    },
    logoutButton: {
        marginTop: spacing.sm,
        borderColor: colors.error
    }
});

