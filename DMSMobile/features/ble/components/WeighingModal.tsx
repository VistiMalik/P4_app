import React, { useState, useEffect } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBleScaleContext } from "../context/BleScaleContext";
import { Button } from "@components/ui/Button";
import { TextInputField } from "@components/ui/TextInputField";
import { colors, radii, spacing } from "@lib/theme";

interface WeighingModalProps {
    visible: boolean;
    onClose: () => void;
    onWeighingComplete?: (weight: number, materialId: string) => void;
}

type ModalStep = "setup" | "weighing" | "confirm" | "success";

const MATERIALS = [
    { id: "papel", label: "Papel", icon: "document" as const },
    { id: "plastico", label: "Plástico", icon: "water" as const },
    { id: "metal", label: "Metal", icon: "hardware-chip" as const },
    { id: "vidro", label: "Vidro", icon: "wine" as const },
    { id: "organico", label: "Orgânico", icon: "leaf" as const },
    { id: "eletronico", label: "Eletrônico", icon: "phone-portrait" as const }
];

export const WeighingModal: React.FC<WeighingModalProps> = ({
    visible,
    onClose,
    onWeighingComplete
}) => {
    const {
        connectedDevice,
        lastWeight,
        isWeightStable,
        weightVariation,
        sendUserInfo,
        startWeighing,
        confirmResult,
        disconnect
    } = useBleScaleContext();

    const [step, setStep] = useState<ModalStep>("setup");
    const [selectedMaterial, setSelectedMaterial] = useState<string>("papel");
    const [customMaterial, setCustomMaterial] = useState("");
    const [pulseAnim] = useState(new Animated.Value(1));

    // Pulse animation for weight display
    useEffect(() => {
        if (step === "weighing" && !isWeightStable) {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 500,
                        useNativeDriver: true
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true
                    })
                ])
            );
            pulse.start();
            return () => pulse.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [step, isWeightStable, pulseAnim]);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setStep("setup");
        }
    }, [visible]);

    const handleStartWeighing = async () => {
        try {
            const materialId = customMaterial || selectedMaterial;
            console.log("[WeighingModal] Starting weighing with material:", materialId);
            console.log("[WeighingModal] Sending user info...");
            await sendUserInfo(materialId);
            console.log("[WeighingModal] User info sent, starting weighing...");
            await startWeighing();
            console.log("[WeighingModal] Start command sent successfully");
            setStep("weighing");
        } catch (error) {
            console.error("[WeighingModal] Error starting weighing:", error);
            // Error handled in hook
        }
    };

    const handleConfirmWeight = async () => {
        setStep("confirm");
        try {
            await confirmResult();
            setStep("success");
            const materialId = customMaterial || selectedMaterial;
            onWeighingComplete?.(lastWeight || 0, materialId);
        } catch (error) {
            setStep("weighing");
        }
    };

    const handleNewWeighing = () => {
        setStep("setup");
    };

    const handleClose = () => {
        setStep("setup");
        onClose();
    };

    const renderSetupStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Selecione o Material</Text>
            <Text style={styles.stepDescription}>
                Escolha o tipo de material que será pesado
            </Text>

            <View style={styles.materialGrid}>
                {MATERIALS.map((material) => (
                    <TouchableOpacity
                        key={material.id}
                        style={[
                            styles.materialChip,
                            selectedMaterial === material.id && styles.materialChipSelected
                        ]}
                        onPress={() => {
                            setSelectedMaterial(material.id);
                            setCustomMaterial("");
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={material.icon}
                            size={20}
                            color={
                                selectedMaterial === material.id
                                    ? colors.neonBlue
                                    : colors.textSecondary
                            }
                        />
                        <Text
                            style={[
                                styles.materialChipText,
                                selectedMaterial === material.id && styles.materialChipTextSelected
                            ]}
                        >
                            {material.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInputField
                label="Ou digite outro material"
                value={customMaterial}
                onChangeText={(text) => {
                    setCustomMaterial(text);
                    if (text) setSelectedMaterial("");
                }}
                placeholder="Ex: Papelão"
                appearance="dark"
            />

            <Button
                label="Iniciar Pesagem"
                onPress={handleStartWeighing}
                leftIcon={<Ionicons name="scale" size={20} color={colors.background} />}
                style={styles.mainButton}
                disabled={!selectedMaterial && !customMaterial}
            />
        </View>
    );

    const renderWeighingStep = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pesagem em Andamento</Text>
            <Text style={styles.stepDescription}>
                Material: {customMaterial || MATERIALS.find(m => m.id === selectedMaterial)?.label}
            </Text>

            <Animated.View
                style={[
                    styles.weightDisplay,
                    { transform: [{ scale: pulseAnim }] },
                    isWeightStable && styles.weightDisplayStable
                ]}
            >
                <Text style={styles.weightValue}>
                    {lastWeight !== null ? (lastWeight * 1000).toFixed(0) : "---"}
                </Text>
                <Text style={styles.weightUnit}>g</Text>
                {lastWeight !== null && (
                    <Text style={styles.weightSecondary}>
                        {lastWeight.toFixed(3)} kg
                    </Text>
                )}
            </Animated.View>

            <View style={styles.stabilityIndicator}>
                <Ionicons
                    name={isWeightStable ? "checkmark-circle" : "sync"}
                    size={20}
                    color={isWeightStable ? colors.success : colors.neonGold}
                />
                <Text
                    style={[
                        styles.stabilityText,
                        { color: isWeightStable ? colors.success : colors.neonGold }
                    ]}
                >
                    {isWeightStable ? "Peso estável" : "Estabilizando..."}
                </Text>
            </View>

            {!isWeightStable && weightVariation !== null && (
                <Text style={styles.variationText}>
                    Variação: {(weightVariation * 1000).toFixed(1)}g
                </Text>
            )}

            <Button
                label="Confirmar Peso"
                onPress={handleConfirmWeight}
                disabled={!isWeightStable || lastWeight === null || lastWeight <= 0}
                leftIcon={<Ionicons name="checkmark" size={20} color={colors.background} />}
                style={styles.mainButton}
            />
            <Button
                label="Cancelar"
                variant="ghost"
                onPress={handleClose}
            />
        </View>
    );

    const renderConfirmStep = () => (
        <View style={styles.stepContent}>
            <View style={styles.loadingContainer}>
                <Ionicons name="cloud-upload" size={48} color={colors.neonBlue} />
                <Text style={styles.stepTitle}>Enviando dados...</Text>
                <Text style={styles.stepDescription}>
                    Registrando pesagem no sistema
                </Text>
            </View>
        </View>
    );

    const renderSuccessStep = () => (
        <View style={styles.stepContent}>
            <View style={[styles.iconContainer, styles.successIcon]}>
                <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            </View>
            <Text style={styles.stepTitle}>Pesagem Registrada!</Text>
            <View style={styles.successSummary}>
                <Text style={styles.summaryLabel}>Material</Text>
                <Text style={styles.summaryValue}>
                    {customMaterial || MATERIALS.find(m => m.id === selectedMaterial)?.label}
                </Text>
                <Text style={styles.summaryLabel}>Peso</Text>
                <Text style={styles.summaryValueLarge}>
                    {lastWeight !== null ? (lastWeight * 1000).toFixed(0) : "0"}g
                </Text>
            </View>
            <Button
                label="Nova Pesagem"
                onPress={handleNewWeighing}
                leftIcon={<Ionicons name="add" size={20} color={colors.background} />}
                style={styles.mainButton}
            />
            <Button
                label="Fechar"
                variant="ghost"
                onPress={handleClose}
            />
        </View>
    );

    const renderCurrentStep = () => {
        switch (step) {
            case "setup":
                return renderSetupStep();
            case "weighing":
                return renderWeighingStep();
            case "confirm":
                return renderConfirmStep();
            case "success":
                return renderSuccessStep();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <View style={styles.connectionBadge}>
                            <Ionicons name="bluetooth" size={14} color={colors.success} />
                            <Text style={styles.connectionText}>
                                {connectedDevice?.name || "Balança"}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    {renderCurrentStep()}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: "flex-end"
    },
    modalContainer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radii.xl,
        borderTopRightRadius: radii.xl,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
        maxHeight: "90%"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    connectionBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: `${colors.success}22`,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.md,
        borderRadius: radii.pill
    },
    connectionText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: "600",
        marginLeft: spacing.xs
    },
    closeButton: {
        padding: spacing.xs
    },
    stepContent: {
        paddingVertical: spacing.xl
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.sm
    },
    stepDescription: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: "center",
        marginBottom: spacing.lg
    },
    materialGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: spacing.sm,
        marginBottom: spacing.lg
    },
    materialChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        gap: spacing.xs
    },
    materialChipSelected: {
        borderColor: colors.neonBlue,
        backgroundColor: `${colors.neonBlue}15`
    },
    materialChipText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "500"
    },
    materialChipTextSelected: {
        color: colors.neonBlue
    },
    mainButton: {
        marginTop: spacing.lg
    },
    weightDisplay: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.xl,
        borderWidth: 2,
        borderColor: colors.border,
        paddingVertical: spacing.xxl,
        paddingHorizontal: spacing.xl,
        alignItems: "center",
        marginVertical: spacing.lg
    },
    weightDisplayStable: {
        borderColor: colors.success,
        backgroundColor: `${colors.success}11`
    },
    weightValue: {
        fontSize: 56,
        fontWeight: "800",
        color: colors.neonBlue,
        fontVariant: ["tabular-nums"]
    },
    weightUnit: {
        fontSize: 24,
        color: colors.textSecondary,
        fontWeight: "600",
        marginTop: spacing.xs
    },
    stabilityIndicator: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs
    },
    stabilityText: {
        fontSize: 14,
        fontWeight: "600"
    },
    weightSecondary: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: spacing.xxs
    },
    variationText: {
        fontSize: 13,
        color: colors.neonGold,
        textAlign: "center",
        marginTop: spacing.xs
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: spacing.xxl
    },
    iconContainer: {
        alignSelf: "center",
        marginBottom: spacing.lg
    },
    successIcon: {
        backgroundColor: `${colors.success}22`,
        borderRadius: 50,
        padding: spacing.md
    },
    successSummary: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: radii.lg,
        padding: spacing.lg,
        marginBottom: spacing.md
    },
    summaryLabel: {
        fontSize: 12,
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: spacing.xxs
    },
    summaryValue: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: "600",
        marginBottom: spacing.md
    },
    summaryValueLarge: {
        fontSize: 28,
        color: colors.neonBlue,
        fontWeight: "700"
    }
});
