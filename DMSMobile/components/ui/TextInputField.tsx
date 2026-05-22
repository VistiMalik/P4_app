import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View
} from "react-native";
import { colors } from "@lib/theme";

interface TextInputFieldProps extends TextInputProps {
  label: string;
  errorMessage?: string;
  appearance?: "light" | "dark";
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  errorMessage,
  appearance = "light",
  ...rest
}) => {
  const isDark = appearance === "dark";

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          isDark ? styles.inputDark : styles.inputLight,
          errorMessage ? styles.inputError : null
        ]}
        placeholderTextColor={isDark ? colors.textMuted : "#9E9E9E"}
        accessibilityLabel={label}
        {...rest}
      />
      {errorMessage ? (
        <Text style={[styles.error, isDark ? styles.errorDark : null]}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4
  },
  labelLight: {
    color: "#1B5E20"
  },
  labelDark: {
    color: colors.textSecondary
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16
  },
  inputLight: {
    borderColor: "#C8E6C9",
    backgroundColor: "#FFFFFF",
    color: "#212121"
  },
  inputDark: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary
  },
  inputError: {
    borderColor: "#D32F2F"
  },
  error: {
    marginTop: 4,
    color: "#D32F2F"
  },
  errorDark: {
    color: colors.danger
  }
});
