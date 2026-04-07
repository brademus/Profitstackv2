import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { VenturePnL } from '../types';
import { formatCurrency, formatPercent } from '../lib/utils';

interface Props {
  pnl: VenturePnL;
  onPress: () => void;
}

export function VentureCard({ pnl, onPress }: Props) {
  const { venture, netProfit, totalIncome, dollarPerHour, profitMargin, trend } = pnl;
  const isPositive = netProfit >= 0;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: venture.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{venture.icon}</Text>
          <Text style={styles.name} numberOfLines={1}>{venture.name}</Text>
        </View>
        <View style={[styles.trendBadge, {
          backgroundColor: trend >= 0
            ? theme.colors.incomeMuted
            : theme.colors.expenseMuted,
        }]}>
          <Text style={[styles.trendText, {
            color: trend >= 0 ? theme.colors.income : theme.colors.expense,
          }]}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(0)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.profit, {
        color: isPositive ? theme.colors.income : theme.colors.expense,
      }]}>
        {isPositive ? '+' : ''}{formatCurrency(netProfit)}
      </Text>
      <Text style={styles.label}>Net Profit</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatPercent(profitMargin)}</Text>
          <Text style={styles.statLabel}>Margin</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {dollarPerHour ? `$${dollarPerHour.toFixed(0)}/hr` : '—'}
          </Text>
          <Text style={styles.statLabel}>$/Hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  trendBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  trendText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  profit: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
});
