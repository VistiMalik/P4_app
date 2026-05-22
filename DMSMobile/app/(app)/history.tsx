import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Screen } from "@components/ui/Screen";
import { useMyWeighings } from "@features/weighings/hooks/useMyWeighings";
import { colors, spacing, radii } from "@lib/theme";
import { Weighing } from "@lib/api/types";

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function HistoryScreen() {
  const { data: weighings, isLoading } = useMyWeighings();

  const renderItem = ({ item }: { item: Weighing }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.materialName}>{item.materialName}</Text>
        <Text style={styles.date}>{formatDateTime(item.createdAt)}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.weight}>
          {(item.weightGrams / 1000).toLocaleString("pt-BR", {
            minimumFractionDigits: 2
          })}{" "}
          kg
        </Text>
        <Text style={styles.xp}>
          +{Math.round((item.weightGrams / 1000) * 15)} XP
        </Text>
      </View>
    </View>
  );

  return (
    <Screen appearance="dark" contentStyle={styles.content} scrollable={false}>
      {isLoading ? (
        <ActivityIndicator color={colors.neonBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={weighings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma pesagem registrada ainda.</Text>
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 0 // FlatList handles padding
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  materialName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600"
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  weight: {
    color: colors.neonBlue,
    fontSize: 20,
    fontWeight: "700"
  },
  xp: {
    color: colors.neonGold,
    fontSize: 14,
    fontWeight: "600"
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xl,
    fontSize: 16
  }
});

