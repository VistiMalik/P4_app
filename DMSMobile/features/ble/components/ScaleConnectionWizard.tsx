import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Device } from "react-native-ble-plx";
import { useBleScaleContext } from "../context/BleScaleContext";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { colors, radii, spacing } from "@lib/theme";

type WizardStep = "bluetooth" | "scanning" | "connecting" | "connected";

const STEP_CONFIG = {
    bluetooth: { index: 0, title: "Bluetooth", icon: "bluetooth" as const },
    scanning: { index: 1, title: "Buscar", icon: "search" as const },
    connecting: { index: 2, title: "Conectar", icon: "link" as const },
    connected: { index: 3, title: "Pronto", icon: "checkmark-circle" as const }
};

interface ScaleConnectionWizardProps {
    onConnectionComplete?: () => void;
}

export const ScaleConnectionWizard: React.FC<ScaleConnectionWizardProps> = ({
    onConnectionComplete
}) => {
    const {
        devices,
        status,
        connectedDevice,
        errorMessage,
        startScan,
        connectToDevice,
        disconnect
    } = useBleScaleContext();

    const [currentStep, setCurrentStep] = useState<WizardStep>("bluetooth");
    const [pulseAnim] = useState(new Animated.Value(1));

    // Pulse animation for scanning
    useEffect(() => {
        if (status === "scanning") {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true
                    })
                ])
            );
            pulse.start();
            return () => pulse.stop();
        }
    }, [status, pulseAnim]);

    // Update step based on status
    useEffect(() => {
        if (status === "connected" && connectedDevice) {
            setCurrentStep("connected");
        } else if (status === "connecting") {
            setCurrentStep("connecting");
        } else if (status === "scanning") {
            setCurrentStep("scanning");
        }
    }, [status, connectedDevice]);

    const handleCheckBluetooth = () => {
        setCurrentStep("scanning");
        startScan();
    };

    const handleScanAgain = () => {
        startScan();
    };

    const handleConnect = (deviceId: string) => {
        setCurrentStep("connecting");
        connectToDevice(deviceId);
    };

    const handleDisconnect = () => {
        disconnect();
        setCurrentStep("bluetooth");
    };

    const handleStartWeighing = () => {
        onConnectionComplete?.();
    };

    const renderStepIndicator = () => (
        <View style={styles.stepperContainer}>
            {Object.entries(STEP_CONFIG).map(([key, config], index) => {
                const isActive = STEP_CONFIG[currentStep].index >= config.index;
                const isCurrent = currentStep === key;
                return (
                    <View key={key} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                isActive && styles.stepCircleActive,
                                isCurrent && styles.stepCircleCurrent
                            ]}
                        >
                            <Ionicons
                                name={config.icon}
                                size={16}
                                color={isActive ? colors.background : colors.textMuted}
                            />
                        </View>
                        {index < 3 && (
                            <View
                                style={[
                                    styles.stepLine,
                                    isActive && styles.stepLineActive
                                ]}
                            />
                        )}
                    </View>
                );
            })}
        </View>
    );

    const renderBluetoothStep = () => (
        <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
                <Ionicons name="bluetooth" size={64} color={colors.neonBlue} />
            </View>
            <Text style={styles.stepTitle}>Verificar Bluetooth</Text>
            <Text style={styles.stepDescription}>
                Certifique-se de que o Bluetooth do seu celular está ativado para
                encontrar a balança.
            </Text>
            <Button
                label="Buscar Balanças"
                onPress={handleCheckBluetooth}
                leftIcon={<Ionicons name="search" size={20} color={colors.background} />}
                style={styles.mainButton}
            />
        </View>
    );

    const renderScanningStep = () => (
        <View style={styles.stepContent}>
            {status === "scanning" ? (
                <>
                    <Animated.View
                        style={[
                            styles.iconContainer,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <Ionicons name="radio" size={64} color={colors.neonBlue} />
                    </Animated.View>
                    <Text style={styles.stepTitle}>Buscando balanças...</Text>
                    <ActivityIndicator
                        color={colors.neonBlue}
                        size="large"
                        style={styles.loader}
                    />
                </>
            ) : (
                <>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={devices.length > 0 ? "checkmark-circle" : "alert-circle"}
                            size={64}
                            color={devices.length > 0 ? colors.success : colors.textMuted}
                        />
                    </View>
                    <Text style={styles.stepTitle}>
                        {devices.length > 0
                            ? `${devices.length} balança(s) encontrada(s)`
                            : "Nenhuma balança encontrada"}
                    </Text>
                </>
            )}

            {devices.length > 0 && (
                <View style={styles.deviceList}>
                    <FlatList
                        data={devices}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <DeviceCard
                                device={item}
                                onConnect={() => handleConnect(item.id)}
                                isConnecting={status === "connecting"}
                            />
                        )}
                        ItemSeparatorComponent={() => <View style={styles.deviceSeparator} />}
                    />
                </View>
            )}

            {status !== "scanning" && (
                <Button
                    label="Buscar Novamente"
                    variant="outline"
                    onPress={handleScanAgain}
                    leftIcon={<Ionicons name="refresh" size={18} color={colors.neonBlue} />}
                    style={styles.secondaryButton}
                />
            )}

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        </View>
    );

    const renderConnectingStep = () => (
        <View style={styles.stepContent}>
            <View style={styles.iconContainer}>
                <ActivityIndicator size={64} color={colors.neonBlue} />
            </View>
            <Text style={styles.stepTitle}>Conectando...</Text>
            <Text style={styles.stepDescription}>
                Estabelecendo conexão com a balança. Aguarde um momento.
            </Text>
        </View>
    );

    const renderConnectedStep = () => (
        <View style={styles.stepContent}>
            <View style={[styles.iconContainer, styles.successIcon]}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>
            <Text style={styles.stepTitle}>Conectado!</Text>
            <Text style={styles.connectedDevice}>{connectedDevice?.name}</Text>
            <Text style={styles.stepDescription}>
                A balança está pronta para uso. Você pode iniciar uma nova pesagem.
            </Text>
            <Button
                label="Iniciar Pesagem"
                onPress={handleStartWeighing}
                leftIcon={<Ionicons name="scale" size={20} color={colors.background} />}
                style={styles.mainButton}
            />
            <Button
                label="Desconectar"
                variant="ghost"
                onPress={handleDisconnect}
                style={styles.ghostButton}
            />
        </View>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case "bluetooth":
                return renderBluetoothStep();
            case "scanning":
                return renderScanningStep();
            case "connecting":
                return renderConnectingStep();
            case "connected":
                return renderConnectedStep();
        }
    };

    return (
        <View style={styles.container}>
            <Card variant="glass" style={styles.card}>
                <Text style={styles.header}>Conectar Balança</Text>
                {renderStepIndicator()}
                {renderCurrentStep()}
            </Card>
        </View>
    );
};

interface DeviceCardProps {
    device: Device;
    onConnect: () => void;
    isConnecting: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = ({
    device,
    onConnect,
    isConnecting
}) => {
    const signalStrength = device.rssi
        ? device.rssi > -60
            ? "Forte"
            : device.rssi > -80
                ? "Médio"
                : "Fraco"
        : "Desconhecido";

    const signalColor =
        signalStrength === "Forte"
            ? colors.success
            : signalStrength === "Médio"
                ? colors.neonGold
                : colors.textMuted;

    return (
        <TouchableOpacity
            style={styles.deviceCard}
            onPress={onConnect}
            disabled={isConnecting}
            activeOpacity={0.7}
        >
            <View style={styles.deviceInfo}>
                <View style={styles.deviceIconWrapper}>
                    <Ionicons name="hardware-chip" size={24} color={colors.neonBlue} />
                </View>
                <View style={styles.deviceText}>
                    <Text style={styles.deviceName}>{device.name || "Sem nome"}</Text>
                    <View style={styles.signalRow}>
                        <Ionicons name="wifi" size={12} color={signalColor} />
                        <Text style={[styles.signalText, { color: signalColor }]}>
                            Sinal: {signalStrength}
                        </Text>
                    </View>
                </View>
            </View>
            <Button
                label={isConnecting ? "..." : "Conectar"}
                size="sm"
                onPress={onConnect}
                disabled={isConnecting}
                loading={isConnecting}
                style={styles.connectButton}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    card: {
        padding: spacing.xl,
        marginVertical: spacing.md
    },
    header: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.lg
    },
    stepperContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.xl
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "center"
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceAlt,
        borderWidth: 2,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center"
    },
    stepCircleActive: {
        backgroundColor: colors.neonBlue,
        borderColor: colors.neonBlue
    },
    stepCircleCurrent: {
        borderColor: colors.neonBlue,
        borderWidth: 3
    },
    stepLine: {
        width: 32,
        height: 2,
        backgroundColor: colors.border,
        marginHorizontal: spacing.xs
    },
    stepLineActive: {
        backgroundColor: colors.neonBlue
    },
    stepContent: {
        alignItems: "center",
        paddingVertical: spacing.lg
    },
    iconContainer: {
        marginBottom: spacing.lg
    },
    successIcon: {
        backgroundColor: `${colors.success}22`,
        borderRadius: 50,
        padding: spacing.md
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.sm
    },
    stepDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md
    },
    connectedDevice: {
        fontSize: 16,
        color: colors.neonBlue,
        fontWeight: "600",
        marginBottom: spacing.sm
    },
    mainButton: {
        marginTop: spacing.md
    },
    secondaryButton: {
        marginTop: spacing.md
    },
    ghostButton: {
        marginTop: spacing.xs
    },
    loader: {
        marginVertical: spacing.lg
    },
    deviceList: {
        width: "100%",
        marginVertical: spacing.md
    },
    deviceSeparator: {
        height: spacing.sm
    },
    deviceCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md
    },
    deviceInfo: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1
    },
    deviceIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: radii.md,
        backgroundColor: `${colors.neonBlue}22`,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md
    },
    deviceText: {
        flex: 1
    },
    deviceName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.textPrimary
    },
    signalRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },
    signalText: {
        fontSize: 12,
        marginLeft: 4
    },
    connectButton: {
        width: 100,
        marginVertical: 0
    },
    errorText: {
        color: colors.danger,
        fontSize: 14,
        marginTop: spacing.md,
        textAlign: "center"
    }
});
