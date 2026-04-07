import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useVentures } from '../hooks/useVentures';
import { useTimeLog } from '../hooks/useTimeLog';
import { VentureCard } from '../components/VentureCard';
import { StatCard } from '../components/StatCard';
import { formatCurrency, formatHours, getDaysUntil } from '../lib/utils';
import { getNextQuarterlyDeadline } from '../lib/tax-engine';

export function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const {
    ventures, venturePnLs, loading, totalNetProfit, totalIncome, totalExpenses,
    refreshVentures, refreshPnLs,
  } = useVentures(user?.id);
  const { activeLog, elapsedSeconds } = useTimeLog(user?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshVentures();
    await refreshPnLs(period);
    setRefreshing(false);
  };

  const totalHours = venturePnLs.reduce((sum, v) => sum + v.totalHours, 0);
  const overallDollarPerHour = totalHours > 0 ? totalNetProfit / totalHours : null;
  const deadline = getNextQuarterlyDeadline();
  const daysUntilTax = getDaysUntil(deadline.deadline);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Stack</Text>
            <Text style={styles.periodLabel}>
              {period === 'month' ? 'This Month' : 'Year to Date'}
            </Text>
          </View>
          <View style={styles.periodToggle}>
            <TouchableOpacity
              style={[styles.periodBtn, period === 'month' && styles.periodBtnActive]}
              onPress={() => { setPeriod('month'); refreshPnLs('month'); }}
            >
              <Text style={[styles.periodBtnText, period === 'month' && styles.periodBtnTextActive]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodBtn, period === 'year' && styles.periodBtnActive]}
              onPress={() => { setPeriod('year'); refreshPnLs('year'); }}
            >
              <Text style={[styles.periodBtnText, period === 'year' && styles.periodBtnTextActive]}>Year</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Timer Banner */}
        {activeLog && (
          <TouchableOpacity
            style={styles.timerBanner}
            onPress={() => navigation.navigate('TimeLog', { ventureId: activeLog.venture_id })}
          >
            <View style={styles.timerDot} />
            <Text style={styles.timerText}>Timer running</Text>
            <Text style={styles.timerClock}>{formatTimer(elapsedSeconds)}</Text>
          </TouchableOpacity>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <StatCard
            label="Net Profit"
            value={formatCurrency(totalNetProfit)}
            color={totalNetProfit >= 0 ? theme.colors.income : theme.colors.expense}
          />
          <View style={{ width: theme.spacing.md }} />
          <StatCard
            label="$/Hour"
            value={overallDollarPerHour ? `$${overallDollarPerHour.toFixed(0)}` : '—'}
            subtitle={totalHours > 0 ? formatHours(Math.round(totalHours * 60)) + ' logged' : 'Log time to see'}
          />
        </View>

        <View style={styles.summaryRow}>
          <StatCard label="Revenue" value={formatCurrency(totalIncome)} compact />
          <View style={{ width: theme.spacing.sm }} />
          <StatCard label="Expenses" value={formatCurrency(totalExpenses)} compact />
          <View style={{ width: theme.spacing.sm }} />
          <StatCard
            label={`Tax ${deadline.quarter}`}
            value={`${daysUntilTax}d`}
            color={daysUntilTax <= 14 ? theme.colors.expense : theme.colors.textSecondary}
            compact
          />
        </View>

        {/* Venture Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ventures</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddVenture')}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {venturePnLs.length === 0 && !loading ? (
          <TouchableOpacity
            style={styles.emptyState}
            onPress={() => navigation.navigate('AddVenture')}
          >
            <Text style={styles.emptyEmoji}>🚀</Text>
            <Text style={styles.emptyTitle}>Add your first venture</Text>
            <Text style={styles.emptySubtitle}>
              Track P&L, time, and profitability for each income stream.
            </Text>
          </TouchableOpacity>
        ) : (
          venturePnLs.map((pnl) => (
            <VentureCard
              key={pnl.venture.id}
              pnl={pnl}
              onPress={() => navigation.navigate('VentureDetail', { ventureId: pnl.venture.id })}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.xxxxl,
  },
  greeting: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  periodLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.sm,
    padding: 2,
  },
  periodBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.sm - 2,
  },
  periodBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  periodBtnText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
  },
  periodBtnTextActive: {
    color: theme.colors.white,
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.income,
    marginRight: theme.spacing.sm,
  },
  timerText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primaryLight,
    fontWeight: theme.fontWeight.medium,
  },
  timerClock: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    fontVariant: ['tabular-nums'],
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  addButton: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyState: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
