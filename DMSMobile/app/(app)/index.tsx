import React, { useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from "react-native";
import { Screen } from "@components/ui/Screen";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { useMyWeighings } from "@features/weighings/hooks/useMyWeighings";
import { useCooperativeLeaderboard } from "@features/weighings/hooks/useCooperativeLeaderboard";
import { BluetoothStatusBar } from "@features/ble/components/BluetoothStatusBar";
import { colors, radii, spacing } from "@lib/theme";
import { useToast } from "@components/ui/ToastProvider";
import { useAuthContext } from "@features/auth/context/AuthContext";
import { Weighing } from "@lib/api/types";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const XP_PER_KG = 15;
const LEVEL_STEP = 150;

const tierScale = [
  { minLevel: 15, label: "Mestre" },
  { minLevel: 10, label: "Especialista" },
  { minLevel: 6, label: "Experiente" },
  { minLevel: 3, label: "Aprendiz" },
  { minLevel: 1, label: "Iniciante" }
] as const;

type MaterialContribution = {
  materialId: string;
  materialName: string;
  totalKg: number;
};

const formatKg = (value: number, fractionDigits = 1) =>
  `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  })} kg`;

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

const formatHoursAgo = (isoDate?: string) => {
  if (!isoDate) {
    return "Sem registros";
  }
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours === 0) {
    return "Última coleta há menos de 1h";
  }
  return `Última coleta há ${diffHours}h`;
};

export default function DashboardScreen() {
  const { user } = useAuthContext();
  const toast = useToast();
  const router = useRouter();
  const {
    data: weighings,
    isLoading: isWeighingsLoading,
    isError: isWeighingsError,
    refetch: refetchWeighings
  } = useMyWeighings();
  const {
    data: leaderboard,
    isLoading: isLeaderboardLoading,
    isError: isLeaderboardError,
    refetch: refetchLeaderboard
  } = useCooperativeLeaderboard();

  const handleNewWeighing = () => {
    router.push("/(app)/ble");
  };

  const metrics = useMemo(() => {
    if (!weighings || weighings.length === 0) {
      return {
        totalKg: 0,
        totalGrams: 0,
        weighingsCount: 0,
        averageKg: 0,
        contributions: [] as MaterialContribution[],
        xp: 0,
        level: 1,
        xpProgress: 0,
        xpToNext: LEVEL_STEP,
        tier: "Iniciante",
        recentWeighings: [] as Weighing[],
        lastWeighing: undefined as Weighing | undefined
      };
    }

    const sorted = [...weighings].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Filter for contributions: only last 7 days
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);

    const lastWeekWeighings = sorted.filter(
      (w) => new Date(w.createdAt) >= oneWeekAgo
    );

    const contributionsMap = new Map<string, MaterialContribution>();
    let totalGrams = 0;

    // Calculate total grams from ALL weighings for XP/Level logic
    sorted.forEach((item) => {
      totalGrams += item.weightGrams;
    });

    // Calculate contributions ONLY from last week
    lastWeekWeighings.forEach((item) => {
      const existing = contributionsMap.get(item.materialId);
      const weightKg = item.weightGrams / 1000;
      if (existing) {
        existing.totalKg += weightKg;
      } else {
        contributionsMap.set(item.materialId, {
          materialId: item.materialId,
          materialName: item.materialName,
          totalKg: weightKg
        });
      }
    });

    // Recent weighings: Unique per material
    const seenMaterials = new Set<string>();
    const uniqueRecentWeighings: Weighing[] = [];

    for (const w of sorted) {
      if (!seenMaterials.has(w.materialId)) {
        seenMaterials.add(w.materialId);
        uniqueRecentWeighings.push(w);
        if (uniqueRecentWeighings.length >= 5) break;
      }
    }

    const totalKg = totalGrams / 1000;
    const weighingsCount = sorted.length;
    const averageKg = weighingsCount ? totalKg / weighingsCount : 0;
    const xp = Math.round(totalKg * XP_PER_KG);
    const level = Math.max(1, Math.floor(xp / LEVEL_STEP) + 1);
    const xpForCurrentLevel = (level - 1) * LEVEL_STEP;
    const xpIntoLevel = xp - xpForCurrentLevel;
    const xpToNext = Math.max(0, LEVEL_STEP - xpIntoLevel);
    const xpProgress =
      level > 1 || xp > 0 ? Math.min(1, xpIntoLevel / LEVEL_STEP) : 0;
    const tier =
      tierScale.find((item) => level >= item.minLevel)?.label ?? "Iniciante";

    const contributions = Array.from(contributionsMap.values()).sort(
      (a, b) => b.totalKg - a.totalKg
    );

    return {
      totalKg,
      totalGrams,
      weighingsCount,
      averageKg,
      contributions,
      xp,
      level,
      xpProgress,
      xpToNext,
      tier,
      recentWeighings: uniqueRecentWeighings,
      lastWeighing: sorted[0]
    };
  }, [weighings]);

  const maxContributionKg =
    metrics.contributions.length > 0 ? metrics.contributions[0].totalKg : 0;

  return (
    <Screen
      appearance="dark"
      contentStyle={styles.screenContent}
    >
      <Card variant="glass" style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.heroGreeting}>
              Olá, {user?.name ?? "coletor(a)"}
            </Text>
            <Text style={styles.heroSubtitle}>{formatHoursAgo(metrics.lastWeighing?.createdAt)}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center" }}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Nível {metrics.level}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(app)/profile")}>
              <Ionicons name="person-circle-outline" size={32} color={colors.neonBlue} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.heroStatsRow}>
          <View>
            <Text style={styles.heroXpLabel}>Tier atual</Text>
            <Text style={styles.heroTier}>{metrics.tier}</Text>
          </View>
          <View>
            <Text style={styles.heroXpLabel}>XP total</Text>
            <Text style={styles.heroTier}>
              {metrics.xp.toLocaleString("pt-BR")}
            </Text>
          </View>
        </View>
        <View style={styles.progressWrapper}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso para o próximo nível</Text>
            <Text style={styles.progressValue}>
              {Math.round(metrics.xpProgress * 100)}%
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${metrics.xpProgress * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressFooter}>
            Faltam {metrics.xpToNext.toLocaleString("pt-BR")} XP para o nível{" "}
            {metrics.level + 1}
          </Text>
        </View>
      </Card>

      <BluetoothStatusBar onPress={handleNewWeighing} />

      <Button
        label="Nova Pesagem"
        size="lg"
        onPress={handleNewWeighing}
        leftIcon={<Ionicons name="scale" size={20} color={colors.background} />}
        style={styles.ctaButton}
      />

      <View style={styles.quickStatsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Text style={styles.statLabel}>Total coletado</Text>
          <Text style={styles.statValue}>
            {formatKg(metrics.totalKg, metrics.totalKg >= 10 ? 0 : 1)}
          </Text>
        </View>
        <View style={[styles.statCard, styles.statCardNeutral]}>
          <Text style={styles.statLabel}>Pesagens</Text>
          <Text style={styles.statValue}>
            {metrics.weighingsCount.toLocaleString("pt-BR")}
          </Text>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={[styles.statCard, styles.statCardAccent]}>
          <Text style={styles.statLabel}>Média por pesagem</Text>
          <Text style={styles.statValue}>
            {metrics.weighingsCount
              ? formatKg(metrics.averageKg, metrics.averageKg >= 10 ? 0 : 2)
              : "0 kg"}
          </Text>
        </View>
        <View style={[styles.statCard, styles.statCardEmerald]}>
          <Text style={styles.statLabel}>XP por pesagem</Text>
          <Text style={styles.statValue}>
            {metrics.weighingsCount
              ? Math.round(
                (metrics.totalKg / Math.max(metrics.weighingsCount, 1)) *
                XP_PER_KG
              ).toLocaleString("pt-BR")
              : 0}{" "}
            XP
          </Text>
        </View>
      </View>

      <Card variant="glass" style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contribuições (Últimos 7 dias)</Text>
          <TouchableOpacity onPress={() => router.push("/(app)/reports")}>
            <Text style={{ color: colors.neonBlue, fontSize: 14 }}>Ver mais</Text>
          </TouchableOpacity>
        </View>
        {isWeighingsLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.neonBlue} />
          </View>
        ) : metrics.contributions.length === 0 ? (
          <Text style={styles.emptyState}>
            Ainda não há pesagens registradas.
          </Text>
        ) : (
          metrics.contributions.map((item, index) => {
            const progress =
              maxContributionKg > 0
                ? Math.max(0.08, item.totalKg / maxContributionKg)
                : 0;
            const accent =
              index === 0
                ? colors.neonGold
                : index === 1
                  ? colors.neonBlue
                  : colors.neonMagenta;
            return (
              <View key={item.materialId} style={styles.materialRow}>
                <View style={styles.materialInfo}>
                  <View
                    style={[
                      styles.materialBadge,
                      { backgroundColor: `${accent}22`, borderColor: `${accent}66` }
                    ]}
                  >
                    <Text style={[styles.materialBadgeText, { color: accent }]}>
                      {index + 1}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.materialName}>{item.materialName}</Text>
                    <Text style={styles.materialSub}>
                      {formatKg(item.totalKg, item.totalKg >= 10 ? 0 : 2)}
                    </Text>
                  </View>
                </View>
                <View style={styles.materialProgressTrack}>
                  <View
                    style={[
                      styles.materialProgressFill,
                      { width: `${progress * 100}%`, backgroundColor: accent }
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </Card>

      <Card variant="glass" style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top 3 coletores da cooperativa</Text>
          {isLeaderboardError ? (
            <Button
              label="Atualizar"
              variant="outline"
              size="md"
              onPress={() => {
                void refetchLeaderboard();
              }}
            />
          ) : null}
        </View>
        {isLeaderboardLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.neonBlue} />
          </View>
        ) : leaderboard && leaderboard.length > 0 ? (
          leaderboard.slice(0, 3).map((collector, index) => {
            const accent =
              index === 0
                ? colors.neonGold
                : index === 1
                  ? colors.neonBlue
                  : colors.neonMagenta;
            return (
              <View key={collector.workerId} style={styles.rankingRow}>
                <View
                  style={[
                    styles.rankingBadge,
                    { borderColor: `${accent}66`, backgroundColor: `${accent}15` }
                  ]}
                >
                  <Text style={[styles.rankingBadgeText, { color: accent }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.rankingInfo}>
                  <Text style={styles.rankingName}>{collector.workerName}</Text>
                  <Text style={styles.rankingMeta}>
                    {collector.totalWeighings.toLocaleString("pt-BR")} pesagens
                  </Text>
                </View>
                <Text style={[styles.rankingWeight, { color: accent }]}>
                  {collector.totalWeightKg.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                  })}{" "}
                  kg
                </Text>
              </View>
            );
          })
        ) : isLeaderboardError ? (
          <Text style={styles.emptyState}>
            Não foi possível carregar o ranking agora.
          </Text>
        ) : (
          <Text style={styles.emptyState}>
            Ainda não há ranking disponível para a cooperativa.
          </Text>
        )}
      </Card>

      <Card variant="glass" style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suas últimas pesagens</Text>
          <TouchableOpacity onPress={() => router.push("/(app)/history")}>
            <Text style={{ color: colors.neonBlue, fontSize: 14 }}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {isWeighingsLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.neonBlue} />
          </View>
        ) : metrics.recentWeighings.length > 0 ? (
          metrics.recentWeighings.map((item) => (
            <View key={item.id} style={styles.weighingRow}>
              <View>
                <Text style={styles.weighingName}>{item.materialName}</Text>
                <Text style={styles.weighingMeta}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
              <View style={styles.weighingStats}>
                <Text style={styles.weighingWeight}>
                  {(item.weightGrams / 1000).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{" "}
                  kg
                </Text>
                <Text style={styles.weighingXp}>
                  +{Math.round((item.weightGrams / 1000) * XP_PER_KG)} XP
                </Text>
              </View>
            </View>
          ))
        ) : isWeighingsError ? (
          <Text style={styles.emptyState}>
            Não conseguimos carregar seus registros agora.
          </Text>
        ) : (
          <Text style={styles.emptyState}>
            Registre sua primeira pesagem para ver o histórico aqui.
          </Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: spacing.xxl
  },
  heroCard: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderColor: `${colors.neonBlue}33`,
    marginBottom: spacing.lg
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  heroGreeting: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary
  },
  heroSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 13
  },
  levelBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.neonBlue,
    backgroundColor: `${colors.neonBlue}22`
  },
  levelBadgeText: {
    color: colors.neonBlue,
    fontWeight: "600"
  },
  heroStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  heroXpLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  heroTier: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginTop: spacing.xs / 2
  },
  progressWrapper: {
    marginTop: spacing.sm
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs
  },
  progressLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  progressValue: {
    color: colors.textPrimary,
    fontWeight: "600"
  },
  progressTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.pill,
    backgroundColor: colors.neonBlue
  },
  progressFooter: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: 12
  },
  ctaButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  quickStatsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1
  },
  statCardPrimary: {
    backgroundColor: `${colors.neonBlue}12`,
    borderColor: `${colors.neonBlue}55`
  },
  statCardNeutral: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border
  },
  statCardAccent: {
    backgroundColor: `${colors.neonMagenta}12`,
    borderColor: `${colors.neonMagenta}55`
  },
  statCardEmerald: {
    backgroundColor: `${colors.neonEmerald}12`,
    borderColor: `${colors.neonEmerald}55`
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    marginTop: spacing.xs
  },
  sectionCard: {
    padding: spacing.xl,
    marginTop: spacing.md,
    borderColor: colors.border
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: 14
  },
  materialRow: {
    marginBottom: spacing.md
  },
  materialInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  materialBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt
  },
  materialBadgeText: {
    fontWeight: "600"
  },
  materialName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500"
  },
  materialSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  materialProgressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    overflow: "hidden"
  },
  materialProgressFill: {
    height: "100%",
    borderRadius: radii.pill
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.md
  },
  rankingBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  rankingBadgeText: {
    fontWeight: "600",
    fontSize: 16
  },
  rankingInfo: {
    flex: 1
  },
  rankingName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "500"
  },
  rankingMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  rankingWeight: {
    fontWeight: "600",
    fontSize: 15
  },
  weighingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  weighingName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "500"
  },
  weighingMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  weighingStats: {
    alignItems: "flex-end"
  },
  weighingWeight: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600"
  },
  weighingXp: {
    color: colors.neonGold,
    fontSize: 12,
    marginTop: 2
  }
});
