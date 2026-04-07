import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { theme } from '../theme';
import { getOfferings, purchasePackage } from '../lib/revenue-cat';
import { usePro } from '../hooks/usePro';

const PRO_FEATURES = [
  { emoji: '♾️', title: 'Unlimited Ventures', desc: 'Track every income stream' },
  { emoji: '🤖', title: 'AI Kill/Scale Scorecard', desc: 'Know where to double down' },
  { emoji: '🧾', title: 'Tax Center', desc: 'Quarterly estimates, all 50 states' },
  { emoji: '📤', title: 'CSV Export', desc: 'Send to your accountant in one tap' },
  { emoji: '📸', title: 'Receipt Storage', desc: 'Cloud-backed receipt photos' },
];

export function PaywallScreen({ navigation }: any) {
  const { refresh } = usePro();
  const [offering, setOffering] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<'monthly' | 'annual'>('annual');

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    const off = await getOfferings();
    setOffering(off);
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!offering) return;
    const pkg = selectedPkg === 'annual'
      ? offering.annual || offering.availablePackages?.[0]
      : offering.monthly || offering.availablePackages?.[1];

    if (!pkg) {
      Alert.alert('Error', 'Package not available.');
      return;
    }

    setPurchasing(true);
    const success = await purchasePackage(pkg);
    setPurchasing(false);

    if (success) {
      await refresh();
      Alert.alert('Welcome to Pro! 🎉', 'All features are now unlocked.', [
        { text: 'Let\'s Go', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Close */}
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.title}>Go Pro</Text>
      <Text style={styles.subtitle}>Unlock the full VentureStack experience</Text>

      {/* Features */}
      <View style={styles.features}>
        {PRO_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureEmoji}>{f.emoji}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pricing Toggle */}
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.pricingSection}>
          <View style={styles.pricingRow}>
            <TouchableOpacity
              style={[styles.priceCard, selectedPkg === 'annual' && styles.priceCardActive]}
              onPress={() => setSelectedPkg('annual')}
            >
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE 50%</Text>
              </View>
              <Text style={styles.priceAmount}>$59.99</Text>
              <Text style={styles.pricePeriod}>per year</Text>
              <Text style={styles.priceMonthly}>$5.00/mo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.priceCard, selectedPkg === 'monthly' && styles.priceCardActive]}
              onPress={() => setSelectedPkg('monthly')}
            >
              <Text style={styles.priceAmount}>$7.99</Text>
              <Text style={styles.pricePeriod}>per month</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.purchaseBtn, purchasing && { opacity: 0.6 }]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.purchaseBtnText}>Start Pro</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.legal}>
            Payment charged to your Apple ID. Auto-renews unless canceled 24 hours before the end of the current period.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxxxl + theme.spacing.xl,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.xl,
    zIndex: 10,
  },
  closeBtnText: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textMuted,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  features: {
    marginBottom: theme.spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  featureEmoji: {
    fontSize: 24,
    width: 40,
  },
  featureContent: { flex: 1 },
  featureTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  featureDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  pricingSection: {},
  pricingRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  priceCard: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  priceCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  saveBadge: {
    backgroundColor: theme.colors.income,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.sm,
  },
  saveBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textInverse,
  },
  priceAmount: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
  },
  pricePeriod: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  priceMonthly: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.income,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.sm,
  },
  purchaseBtn: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchaseBtnText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  legal: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    lineHeight: 14,
  },
});
