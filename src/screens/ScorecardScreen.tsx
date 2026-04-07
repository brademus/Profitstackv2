import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useVentures } from '../hooks/useVentures';
import { usePro } from '../hooks/usePro';
import { generateScorecard } from '../lib/ai-scorecard';
import { VentureScore } from '../types';
import { ScoreCardItem } from '../components/ScoreCardItem';

export function ScorecardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { venturePnLs, ventures } = useVentures(user?.id);
  const { isPro } = usePro();
  const [scores, setScores] = useState<VentureScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateScorecard(venturePnLs);
      setScores(result);
      setGenerated(true);
    } catch {
      // fallback handled in ai-scorecard.ts
    } finally {
      setLoading(false);
    }
  };

  if (!isPro) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedEmoji}>🔒</Text>
        <Text style={styles.lockedTitle}>AI Scorecard</Text>
        <Text style={styles.lockedSubtitle}>
          Upgrade to Pro to get AI-powered Kill/Scale recommendations for each venture.
        </Text>
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Kill / Scale Scorecard</Text>
      <Text style={styles.subtitle}>
        AI analyzes your ventures and recommends where to double down or cut losses.
      </Text>

      {!generated ? (
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGenerate}
          disabled={loading || venturePnLs.length === 0}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Text style={styles.generateEmoji}>🤖</Text>
              <Text style={styles.generateText}>
                {venturePnLs.length === 0
                  ? 'Add ventures with data first'
                  : 'Generate Scorecard'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.regenBtn} onPress={handleGenerate} disabled={loading}>
            <Text style={styles.regenBtnText}>
              {loading ? 'Regenerating...' : '🔄 Regenerate'}
            </Text>
          </TouchableOpacity>

          {scores.map((score) => {
            const venture = ventures.find((v) => v.id === score.venture_id);
            return (
              <ScoreCardItem
                key={score.venture_id || score.venture_name}
                score={score}
                ventureIcon={venture?.icon}
                ventureColor={venture?.color}
              />
            );
          })}
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.xxxxl + theme.spacing.xxxl },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
    lineHeight: 20,
  },
  generateBtn: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateEmoji: { fontSize: 24, marginRight: theme.spacing.md },
  generateText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  regenBtn: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  regenBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  lockedEmoji: { fontSize: 48, marginBottom: theme.spacing.lg },
  lockedTitle: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.heavy, color: theme.colors.textPrimary },
  lockedSubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl, lineHeight: 22 },
  upgradeBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.xxl, paddingVertical: theme.spacing.md },
  upgradeBtnText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
});
