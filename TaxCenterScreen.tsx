import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useVentures } from '../hooks/useVentures';
import { usePro } from '../hooks/usePro';
import { supabase } from '../lib/supabase';
import { calculateTaxEstimate, QUARTERLY_DEADLINES_2026 } from '../lib/tax-engine';
import { TaxEstimate, TaxProfile } from '../types';
import { StatCard } from '../components/StatCard';
import { formatCurrency, formatPercent, getDaysUntil } from '../lib/utils';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const FILING_STATUSES = [
  { key: 'single', label: 'Single' },
  { key: 'married_joint', label: 'Married Filing Jointly' },
  { key: 'married_separate', label: 'Married Filing Separately' },
  { key: 'head_of_household', label: 'Head of Household' },
];

export function TaxCenterScreen({ navigation }: any) {
  const { user } = useAuth();
  const { totalIncome, totalExpenses } = useVentures(user?.id);
  const { isPro } = usePro();

  const [filingStatus, setFilingStatus] = useState('single');
  const [state, setState] = useState('TX');
  const [w2Income, setW2Income] = useState('0');
  const [deductions, setDeductions] = useState('0');
  const [estimate, setEstimate] = useState<TaxEstimate | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    recalculate();
  }, [totalIncome, totalExpenses, filingStatus, state, w2Income, deductions]);

  const loadProfile = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('tax_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setFilingStatus(data.filing_status);
      setState(data.state);
      setW2Income(data.w2_income.toString());
      setDeductions(data.estimated_deductions.toString());
    } else {
      setShowSetup(true);
    }
  };

  const recalculate = () => {
    const seIncome = totalIncome - totalExpenses;
    const est = calculateTaxEstimate(
      Math.max(0, seIncome),
      parseFloat(w2Income) || 0,
      filingStatus,
      state,
      parseFloat(deductions) || 0
    );
    setEstimate(est);
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    const { error } = await supabase.from('tax_profiles').upsert({
      user_id: user.id,
      filing_status: filingStatus,
      state,
      w2_income: parseFloat(w2Income) || 0,
      estimated_deductions: parseFloat(deductions) || 0,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      Alert.alert('Error', 'Failed to save tax profile.');
    } else {
      setShowSetup(false);
    }
  };

  if (!isPro) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedEmoji}>🔒</Text>
        <Text style={styles.lockedTitle}>Tax Center</Text>
        <Text style={styles.lockedSubtitle}>Upgrade to Pro to see quarterly tax estimates across all your ventures.</Text>
        <TouchableOpacity style={styles.upgradeBtn} onPress={() => navigation.navigate('Paywall')}>
          <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tax Center</Text>
      <Text style={styles.subtitle}>2026 Estimated Quarterly Taxes</Text>

      {estimate && (
        <>
          {/* Big Number */}
          <View style={styles.bigCard}>
            <Text style={styles.bigLabel}>QUARTERLY PAYMENT DUE</Text>
            <Text style={styles.bigValue}>{formatCurrency(estimate.quarterlyPayment)}</Text>
            <Text style={styles.bigSub}>
              Next deadline: {estimate.nextDeadline} ({getDaysUntil(estimate.nextDeadline)} days)
            </Text>
          </View>

          {/* Breakdown */}
          <View style={styles.statRow}>
            <StatCard label="Total Tax" value={formatCurrency(estimate.totalTaxOwed)} compact />
            <View style={{ width: theme.spacing.sm }} />
            <StatCard label="Effective Rate" value={formatPercent(estimate.effectiveRate)} compact />
          </View>
          <View style={styles.statRow}>
            <StatCard label="SE Tax" value={formatCurrency(estimate.seTax)} compact />
            <View style={{ width: theme.spacing.sm }} />
            <StatCard label="Federal" value={formatCurrency(estimate.federalIncomeTax)} compact />
            <View style={{ width: theme.spacing.sm }} />
            <StatCard label="State" value={formatCurrency(estimate.stateTax)} compact />
          </View>

          {/* Quarterly Schedule */}
          <Text style={styles.sectionTitle}>2026 Schedule</Text>
          {QUARTERLY_DEADLINES_2026.map((q) => {
            const days = getDaysUntil(q.deadline);
            const isPast = days < 0;
            return (
              <View key={q.quarter} style={[styles.scheduleRow, isPast && styles.scheduleRowPast]}>
                <View>
                  <Text style={styles.scheduleQ}>{q.quarter}</Text>
                  <Text style={styles.schedulePeriod}>{q.period}</Text>
                </View>
                <View style={styles.scheduleRight}>
                  <Text style={styles.scheduleAmount}>{formatCurrency(estimate.quarterlyPayment)}</Text>
                  <Text style={[styles.scheduleDays, isPast && { color: theme.colors.textMuted }]}>
                    {isPast ? 'Past' : `${days} days`}
                  </Text>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Tax Profile Setup */}
      <TouchableOpacity
        style={styles.setupToggle}
        onPress={() => setShowSetup(!showSetup)}
      >
        <Text style={styles.setupToggleText}>
          {showSetup ? '▼ Tax Profile' : '▶ Edit Tax Profile'}
        </Text>
      </TouchableOpacity>

      {showSetup && (
        <View style={styles.setupCard}>
          <Text style={styles.label}>Filing Status</Text>
          <View style={styles.chipRow}>
            {FILING_STATUSES.map((fs) => (
              <TouchableOpacity
                key={fs.key}
                style={[styles.chip, filingStatus === fs.key && styles.chipActive]}
                onPress={() => setFilingStatus(fs.key)}
              >
                <Text style={[styles.chipText, filingStatus === fs.key && styles.chipTextActive]}>
                  {fs.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>State</Text>
          <View style={styles.chipRow}>
            {US_STATES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.stateChip, state === s && styles.chipActive]}
                onPress={() => setState(s)}
              >
                <Text style={[styles.stateChipText, state === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>W-2 Income (annual)</Text>
          <TextInput
            style={styles.input}
            value={w2Income}
            onChangeText={setW2Income}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Estimated Deductions (annual)</Text>
          <TextInput
            style={styles.input}
            value={deductions}
            onChangeText={setDeductions}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.saveBtnText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: theme.spacing.xl,
  },
  bigCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bigLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  bigValue: {
    fontSize: theme.fontSize.hero,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.warning,
  },
  bigSub: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  statRow: { flexDirection: 'row', marginBottom: theme.spacing.sm },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  scheduleRowPast: { opacity: 0.5 },
  scheduleQ: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary },
  schedulePeriod: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  scheduleRight: { alignItems: 'flex-end' },
  scheduleAmount: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.warning },
  scheduleDays: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary },
  setupToggle: { marginTop: theme.spacing.xl, paddingVertical: theme.spacing.md },
  setupToggleText: { fontSize: theme.fontSize.md, color: theme.colors.primary, fontWeight: theme.fontWeight.semibold },
  setupCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: {
    backgroundColor: theme.colors.bgInput,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryMuted },
  chipText: { fontSize: theme.fontSize.sm, color: theme.colors.textMuted },
  chipTextActive: { color: theme.colors.primaryLight },
  stateChip: {
    backgroundColor: theme.colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateChipText: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted },
  input: {
    height: 44,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  saveBtnText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
  lockedContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
  },
  lockedEmoji: { fontSize: 48, marginBottom: theme.spacing.lg },
  lockedTitle: { fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.heavy, color: theme.colors.textPrimary },
  lockedSubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl },
  upgradeBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.xxl, paddingVertical: theme.spacing.md },
  upgradeBtnText: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.white },
});
