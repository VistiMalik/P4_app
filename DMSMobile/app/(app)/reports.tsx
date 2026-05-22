import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Screen } from "@components/ui/Screen";
import { Card } from "@components/ui/Card";
import { useMyWeighings } from "@features/weighings/hooks/useMyWeighings";
import { colors, radii, spacing } from "@lib/theme";
import { Ionicons } from "@expo/vector-icons";

type TimeFrame = "week" | "month" | "year";

const formatKg = (value: number) =>
  `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })} kg`;

export default function ReportsScreen() {
  const { data: weighings, isLoading } = useMyWeighings();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week");

  const aggregatedData = useMemo(() => {
    if (!weighings) return [];

    const now = new Date();
    const cutoff = new Date();

    if (timeFrame === "week") {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeFrame === "month") {
      cutoff.setMonth(now.getMonth() - 1);
    } else {
      cutoff.setFullYear(now.getFullYear() - 1);
    }

    const filtered = weighings.filter((w) => new Date(w.createdAt) >= cutoff);

    const contributionsMap = new Map<string, { name: string; totalKg: number }>();

    filtered.forEach((w) => {
      const current = contributionsMap.get(w.materialId) || {
        name: w.materialName,
        totalKg: 0
      };
      current.totalKg += w.weightGrams / 1000;
      contributionsMap.set(w.materialId, current);
    });

    return Array.from(contributionsMap.values()).sort((a, b) => b.totalKg - a.totalKg);
  }, [weighings, timeFrame]);

  const totalInPeriod = aggregatedData.reduce((acc, item) => acc + item.totalKg, 0);
  const maxVal = aggregatedData.length > 0 ? aggregatedData[0].totalKg : 0;

  const renderFilterTab = (label: string, value: TimeFrame) => (
    <TouchableOpacity
      style={[
        styles.tab,
        timeFrame === value && styles.activeTab
      ]}
      onPress={() => setTimeFrame(value)}
    >
      <Text
        style={[
          styles.tabText,
          timeFrame === value && styles.activeTabText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Screen appearance="dark" contentStyle={styles.content}>
      <View style={styles.tabsContainer}>
        {renderFilterTab("Semana", "week")}
        {renderFilterTab("Mês", "month")}
        {renderFilterTab("Ano", "year")}
      </View>

      <Card variant="glass" style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total no período</Text>
        <Text style={styles.summaryValue}>{formatKg(totalInPeriod)}</Text>
      </Card>

      <Card variant="glass" style={styles.listCard}>
        <Text style={styles.sectionTitle}>Contribuições por Material</Text>
        
        {isLoading ? (
          <ActivityIndicator color={colors.neonBlue} style={{ marginTop: spacing.xl }} />
        ) : aggregatedData.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum registro neste período.</Text>
        ) : (
          aggregatedData.map((item, index) => {
            const progress = maxVal > 0 ? item.totalKg / maxVal : 0;
            return (
              <View key={index} style={styles.row}>
                <View style={styles.rowHeader}>
                  <Text style={styles.materialName}>{item.name}</Text>
                  <Text style={styles.materialValue}>{formatKg(item.totalKg)}</Text>
                </View>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.max(2, progress * 100)}%`,
                        backgroundColor: index === 0 ? colors.neonGold : colors.neonBlue
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    padding: 4,
    borderRadius: radii.lg,
    marginBottom: spacing.sm
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radii.md
  },
  activeTab: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 14
  },
  activeTabText: {
    color: colors.neonBlue
  },
  summaryCard: {
    alignItems: "center",
    paddingVertical: spacing.xl
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.xs
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "700"
  },
  listCard: {
    padding: spacing.lg,
    minHeight: 200
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: spacing.lg
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.lg
  },
  row: {
    marginBottom: spacing.lg
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  materialName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500"
  },
  materialValue: {
    color: colors.textPrimary,
    fontWeight: "600"
  },
  track: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill
  }
});

