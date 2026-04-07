import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { usePro } from '../hooks/usePro';
import { restorePurchases } from '../lib/revenue-cat';

export function SettingsScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { isPro, refresh } = usePro();

  const handleRestore = async () => {
    const restored = await restorePurchases();
    if (restored) {
      await refresh();
      Alert.alert('Restored', 'Pro access restored successfully!');
    } else {
      Alert.alert('No Purchases', 'No previous purchases found.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Account */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={styles.rowValue}>{user?.email || 'Apple ID'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Plan</Text>
          <Text style={[styles.rowValue, isPro && { color: theme.colors.primary }]}>
            {isPro ? 'Pro ✨' : 'Free'}
          </Text>
        </View>
      </View>

      {!isPro && (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={styles.upgradeEmoji}>🚀</Text>
          <View style={styles.upgradeContent}>
            <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
            <Text style={styles.upgradeSubtitle}>
              Unlimited ventures, tax center, AI scorecard, CSV export
            </Text>
          </View>
          <Text style={styles.upgradeArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Pro Features */}
      <Text style={styles.sectionLabel}>PRO FEATURES</Text>
      <View style={styles.card}>
        <MenuItem label="📊 AI Scorecard" onPress={() => navigation.navigate('Scorecard')} />
        <MenuItem label="🧾 Tax Center" onPress={() => navigation.navigate('TaxCenter')} />
      </View>

      {/* Support */}
      <Text style={styles.sectionLabel}>SUPPORT</Text>
      <View style={styles.card}>
        <MenuItem label="Restore Purchases" onPress={handleRestore} />
        <MenuItem label="Privacy Policy" onPress={() => Linking.openURL('https://venturestack.app/privacy')} />
        <MenuItem label="Terms of Service" onPress={() => Linking.openURL('https://venturestack.app/terms')} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>VentureStack v1.0.0</Text>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

function MenuItem({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.xxxxl + theme.spacing.xxxl },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: { fontSize: theme.fontSize.md, color: theme.colors.textPrimary },
  rowValue: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary },
  menuLabel: { fontSize: theme.fontSize.md, color: theme.colors.textPrimary },
  menuArrow: { fontSize: theme.fontSize.xl, color: theme.colors.textMuted },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  upgradeEmoji: { fontSize: 28, marginRight: theme.spacing.md },
  upgradeContent: { flex: 1 },
  upgradeTitle: { fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.bold, color: theme.colors.textPrimary },
  upgradeSubtitle: { fontSize: theme.fontSize.xs, color: theme.colors.textSecondary, marginTop: 2 },
  upgradeArrow: { fontSize: theme.fontSize.xl, color: theme.colors.primary },
  signOutBtn: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  signOutText: { fontSize: theme.fontSize.md, color: theme.colors.expense },
  version: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
});
