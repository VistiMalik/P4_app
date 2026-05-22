import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import { colors, radii, spacing } from "@lib/theme";

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  leftIcon,
  style
}) => {
  const isDisabled = disabled || loading;
  const palette = variantStyles[variant];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: palette.background,
          borderColor: palette.borderColor,
          borderWidth: palette.borderColor ? 1 : 0
        },
        isDisabled && styles.disabled,
        style
      ]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          color={palette.indicatorColor}
          accessibilityHint="Carregando"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.iconWrapper}>{leftIcon}</View> : null}
          <Text
            style={[
              styles.label,
              sizeTextStyles[size],
              { color: palette.labelColor, fontWeight: palette.fontWeight }
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    width: "100%",
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.xs,
    flexDirection: "row"
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 16
  },
  disabled: {
    opacity: 0.6
  },
  iconWrapper: {
    marginRight: spacing.xs
  }
});

const sizeStyles: Record<"sm" | "md" | "lg", ViewStyle> = {
  sm: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md
  },
  md: {
    minHeight: 52,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg
  },
  lg: {
    minHeight: 60,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl
  }
};

const sizeTextStyles: Record<"sm" | "md" | "lg", { fontSize: number }> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 }
};

const variantStyles = {
  primary: {
    background: colors.neonBlue,
    labelColor: colors.background,
    indicatorColor: colors.background,
    borderColor: undefined,
    fontWeight: "600"
  },
  secondary: {
    background: colors.surfaceAlt,
    labelColor: colors.textPrimary,
    indicatorColor: colors.neonBlue,
    borderColor: colors.border,
    fontWeight: "500"
  },
  outline: {
    background: "transparent",
    labelColor: colors.neonBlue,
    indicatorColor: colors.neonBlue,
    borderColor: colors.neonBlue,
    fontWeight: "600"
  },
  ghost: {
    background: "transparent",
    labelColor: colors.textSecondary,
    indicatorColor: colors.textSecondary,
    borderColor: undefined,
    fontWeight: "500"
  }
} as const;

