import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "@lib/theme";

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  appearance?: "light" | "dark";
  contentStyle?: StyleProp<ViewStyle>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = true,
  appearance = "light",
  contentStyle
}) => {
  const content = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.nonScrollable, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      style={
        appearance === "dark" ? styles.safeAreaDark : styles.safeAreaLight
      }
    >
      <StatusBar
        barStyle={appearance === "dark" ? "light-content" : "dark-content"}
      />
      {appearance === "dark" ? (
        <LinearGradient
          colors={[colors.background, colors.surfaceAlt, colors.background]}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaLight: {
    flex: 1,
    backgroundColor: "#F1F8E9",
    paddingHorizontal: 20
  },
  safeAreaDark: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg
  },
  gradient: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20
  },
  nonScrollable: {
    flex: 1,
    paddingVertical: spacing.lg
  }
});
