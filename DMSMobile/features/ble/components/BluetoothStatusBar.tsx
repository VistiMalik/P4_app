import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBleScale } from "../hooks/useBleScale";
import { colors, radii, spacing } from "@lib/theme";

interface BluetoothStatusBarProps {
    onPress?: () => void;
    compact?: boolean;
}

export const BluetoothStatusBar: React.FC<BluetoothStatusBarProps> = ({
    onPress,
    compact = false
}) => {
    const { status, connectedDevice, startScan } = useBleScale();

    const isConnected = status === "connected" && connectedDevice;
    const isScanning = status === "scanning";
    const isConnecting = status === "connecting";

    const getStatusConfig = () => {
        if (isConnected) {
            return {
                icon: "bluetooth" as const,
                iconColor: colors.success,
                label: connectedDevice.name || "Balança conectada",
                sublabel: "Pronto para pesagem",
                bgColor: `${colors.success}15`,
                borderColor: `${colors.success}44`
            };
        }
        if (isScanning) {
            return {
                icon: "search" as const,
                iconColor: colors.neonBlue,
                label: "Buscando balanças...",
                sublabel: "Aguarde",
                bgColor: `${colors.neonBlue}15`,
                borderColor: `${colors.neonBlue}44`
            };
        }
        if (isConnecting) {
            return {
                icon: "link" as const,
                iconColor: colors.neonGold,
                label: "Conectando...",
                sublabel: "Aguarde",
                bgColor: `${colors.neonGold}15`,
                borderColor: `${colors.neonGold}44`
            };
        }
        return {
            icon: "bluetooth-outline" as const,
            iconColor: colors.textMuted,
            label: "Balança desconectada",
            sublabel: "Toque para conectar",
            bgColor: colors.surfaceAlt,
            borderColor: colors.border
        };
    };

    const config = getStatusConfig();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (!isConnected && !isScanning && !isConnecting) {
            startScan();
        }
    };

    if (compact) {
        return (
            <TouchableOpacity
                style={[
                    styles.compactContainer,
                    {
                        backgroundColor: config.bgColor,
                        borderColor: config.borderColor
                    }
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Ionicons name={config.icon} size={16} color={config.iconColor} />
                <Text style={[styles.compactLabel, { color: config.iconColor }]}>
                    {isConnected ? "Conectado" : "Desconectado"}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor
                }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.iconWrapper}>
                <Ionicons name={config.icon} size={24} color={config.iconColor} />
            </View>
            <View style={styles.textWrapper}>
                <Text style={styles.label}>{config.label}</Text>
                <Text style={styles.sublabel}>{config.sublabel}</Text>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: radii.lg,
        borderWidth: 1,
        padding: spacing.md,
        marginVertical: spacing.sm
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: radii.md,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md
    },
    textWrapper: {
        flex: 1
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textPrimary
    },
    sublabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2
    },
    compactContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: radii.pill,
        borderWidth: 1,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        gap: spacing.xs
    },
    compactLabel: {
        fontSize: 12,
        fontWeight: "600"
    }
});
