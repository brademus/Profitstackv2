import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { VentureScore } from '../types';

interface Props {
  score: VentureScore;
  ventureIcon?: string;
  ventureColor?: string;
}

const RATING_CONFIG = {
  scale: { label: 'SCALE', emoji: '🚀', color: theme.colors.scale, bg: theme.colors.incomeMuted },
  maintain: { label: 'MAINTAIN', emoji: '⚖️', color: theme.colors.maintain, bg: theme.colors.warningMuted },
  kill: { label: 'KILL', emoji: '💀', color: theme.colors.kill, bg: theme.colors.expenseMuted },
};

export function ScoreCardItem({ score, ventureIcon, ventureColor }: Props) {
  const config = RATING_CONFIG[score.rating];

  return (
    <View style={[styles.card, { borderLeftColor: ventureColor || theme.colors.primary }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{ventureIcon || '⚡'}</Text>
          <Text style={styles.name}>{score.venture_name}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={styles.badgeEmoji}>{config.emoji}</Text>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.meters}>
        <MeterBar label="Profit Margin" value={score.profitMarginScore} color={ventureColor} />
        <MeterBar label="$/Hour" value={score.dollarPerHourScore} color={ventureColor} />
        <MeterBar label="Growth" value={score.growthScore} color={ventureColor} />
      </View>

      <Text style={styles.reasoning}>{score.reasoning}</Text>
    </View>
  );
}

function MeterBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const width = `${value * 10}%`;
  return (
    <View style={styles.meterRow}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: width as any, backgroundColor: color || theme.colors.primary }]} />
      </View>
      <Text style={styles.meterValue}>{value}/10</Text>
    </View>
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
    marginBottom: theme.spacing.lg,
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
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    letterSpacing: 0.5,
  },
  meters: {
    marginBottom: theme.spacing.md,
  },
  meterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  meterLabel: {
    width: 85,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  meterTrack: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.bgInput,
    borderRadius: 3,
    marginHorizontal: theme.spacing.sm,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  meterValue: {
    width: 35,
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  reasoning: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
