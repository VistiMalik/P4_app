import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "@lib/theme";

interface CardProps {
  children: React.ReactNode;
  variant?: "elevated" | "glass";
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "elevated",
  style
}) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginVertical: spacing.xs
  },
  elevated: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2
  },
  glass: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  }
});
