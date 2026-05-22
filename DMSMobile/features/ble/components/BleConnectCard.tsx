import React, { useMemo, useState, useEffect } from "react";
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { TextInputField } from "@components/ui/TextInputField";
import { useBleScale } from "../hooks/useBleScale";
import { colors, spacing, radii } from "@lib/theme";
import { Ionicons } from "@expo/vector-icons";

export const BleConnectCard: React.FC = () => {
  const {
    devices,
    status,
    connectedDevice,
    lastWeight,
    errorMessage,
    startScan,
    connectToDevice,
    disconnect,
    sendUserInfo,
    startWeighing,
    confirmResult
  } = useBleScale();

  const [materialId, setMaterialId] = useState("papel");
  const [step, setStep] = useState<"connect" | "setup" | "weighing" | "validating">("connect");

  const isScanning = status === "scanning";
  const isConnected = status === "connected" && connectedDevice;

  // Reset step if disconnected
  useEffect(() => {
    if (!isConnected) {
      setStep("connect");
    } else if (step === "connect") {
      setStep("setup");
    }
  }, [isConnected]);

  const sortedDevices = useMemo(
    () => devices.sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [devices]
  );

  const handleSendInfo = async () => {
    try {
      await sendUserInfo(materialId);
      setStep("weighing");
    } catch (e) {
      // Error handled in hook
    }
  };

  const handleStartWeighing = async () => {
    try {
      await startWeighing();
      // Stay in weighing step, but now we expect data
    } catch (e) {
      // Error handled in hook
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmResult();
      setStep("validating");
      // Ideally we wait for success response, but for now we just show validating state
      // You might want to add a "Reset" or "New Weighing" button after success
    } catch (e) {
      // Error handled in hook
    }
  };

  const renderContent = () => {
    if (step === "connect") {
      return (
        <>
          <Button
            label={isScanning ? "Buscando..." : "Buscar balança"}
            onPress={startScan}
            loading={isScanning}
            variant="outline"
          />

          <FlatList
            data={sortedDevices}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <View style={styles.deviceRow}>
                <View>
                  <Text style={styles.deviceName}>{item.name || "Sem nome"}</Text>
                  <Text style={styles.deviceId}>{item.id}</Text>
                </View>
                <Button
                  label="Conectar"
                  size="sm"
                  onPress={() => connectToDevice(item.id)}
                  loading={status === "connecting" && !connectedDevice}
                />
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>
                {isScanning ? "Procurando..." : "Nenhuma balança encontrada."}
              </Text>
            }
            style={styles.list}
          />
        </>
      );
    }

    if (step === "setup") {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.connectedHeader}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.connectedText}>Conectado a {connectedDevice?.name}</Text>
          </View>

          <TextInputField
            label="Material"
            value={materialId}
            appearance="dark"
            onChangeText={setMaterialId}
            placeholder="Ex.: papel"
          />

          <Button
            label="Enviar Dados"
            onPress={handleSendInfo}
            style={{ marginTop: spacing.md }}
          />
          <Button
            label="Desconectar"
            variant="ghost"
            onPress={disconnect}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      );
    }

    if (step === "weighing" || step === "validating") {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.connectedHeader}>
            <Text style={styles.connectedText}>Material: {materialId}</Text>
          </View>

          <View style={styles.weightBox}>
            <Text style={styles.weightLabel}>Peso Atual</Text>
            <Text style={styles.weightValue}>
              {lastWeight !== null ? `${lastWeight.toFixed(2)}` : "---"}
              <Text style={styles.unit}> kg</Text>
            </Text>
          </View>

          {lastWeight === null ? (
            <Button
              label="Iniciar Pesagem"
              onPress={handleStartWeighing}
              style={{ marginTop: spacing.md }}
            />
          ) : (
            <Button
              label={step === "validating" ? "Validado" : "Validar Peso"}
              onPress={handleConfirm}
              disabled={step === "validating"}
              style={{ marginTop: spacing.md }}
              variant={step === "validating" ? "outline" : "primary"}
            />
          )}

          <Button
            label="Cancelar / Voltar"
            variant="ghost"
            onPress={() => setStep("setup")}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      );
    }
  };

  return (
    <Card variant="glass">
      <View style={styles.header}>
        <Text style={styles.title}>Nova Pesagem</Text>
        <Text style={styles.subtitle}>
          {step === "connect" && "Conecte-se à balança para começar."}
          {step === "setup" && "Identifique o material."}
          {step === "weighing" && "Coloque o peso na balança."}
          {step === "validating" && "Peso registrado com sucesso!"}
        </Text>
      </View>

      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : null}

      {renderContent()}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.xs
  },
  separator: {
    height: spacing.sm
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary
  },
  deviceId: {
    fontSize: 12,
    color: colors.textMuted
  },
  emptyMessage: {
    textAlign: "center",
    color: colors.textMuted,
    marginVertical: spacing.md
  },
  list: {
    maxHeight: 200,
    marginVertical: spacing.md
  },
  stepContainer: {
    gap: spacing.sm
  },
  connectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  connectedText: {
    color: colors.success,
    fontWeight: "600"
  },
  weightBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.md
  },
  weightLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  weightValue: {
    fontSize: 48,
    fontWeight: "800",
    color: colors.neonBlue,
    marginTop: spacing.xs
  },
  unit: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: "600"
  }
});
