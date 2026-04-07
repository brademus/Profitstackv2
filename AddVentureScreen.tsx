import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useVentures } from '../hooks/useVentures';
import { usePro } from '../hooks/usePro';
import { VentureType, VENTURE_ICONS, VENTURE_COLORS } from '../types';

const VENTURE_TYPES: { type: VentureType; label: string }[] = [
  { type: 'trading', label: 'Trading' },
  { type: 'reselling', label: 'Reselling' },
  { type: 'freelance', label: 'Freelance' },
  { type: 'rental', label: 'Rental' },
  { type: 'saas', label: 'SaaS' },
  { type: 'ecommerce', label: 'E-Commerce' },
  { type: 'consulting', label: 'Consulting' },
  { type: 'other', label: 'Other' },
];

export function AddVentureScreen({ navigation }: any) {
  const { user } = useAuth();
  const { ventures, addVenture } = useVentures(user?.id);
  const { limits, isPro } = usePro();
  const [name, setName] = useState('');
  const [type, setType] = useState<VentureType>('other');
  const [color, setColor] = useState(VENTURE_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Give your venture a name.');
      return;
    }

    if (ventures.length >= limits.maxVentures) {
      navigation.navigate('Paywall');
      return;
    }

    setSaving(true);
    try {
      await addVenture(name.trim(), type, color, VENTURE_ICONS[type]);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create venture.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Venture</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Sports Card Flips"
        placeholderTextColor={theme.colors.textMuted}
        value={name}
        onChangeText={setName}
        autoFocus
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.typeGrid}>
        {VENTURE_TYPES.map((vt) => (
          <TouchableOpacity
            key={vt.type}
            style={[styles.typeChip, type === vt.type && styles.typeChipActive]}
            onPress={() => setType(vt.type)}
          >
            <Text style={styles.typeEmoji}>{VENTURE_ICONS[vt.type]}</Text>
            <Text style={[styles.typeLabel, type === vt.type && styles.typeLabelActive]}>
              {vt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorRow}>
        {VENTURE_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
            onPress={() => setColor(c)}
          />
        ))}
      </View>

      {!isPro && ventures.length >= 1 && (
        <View style={styles.proHint}>
          <Text style={styles.proHintText}>
            Free plan: {limits.maxVentures} ventures. Upgrade for unlimited.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>{saving ? 'Creating...' : 'Create Venture'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.xl, paddingTop: theme.spacing.xxxl },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xxl,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 52,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.lg,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  typeEmoji: { fontSize: 16, marginRight: 6 },
  typeLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  typeLabelActive: { color: theme.colors.primaryLight },
  colorRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorDotActive: {
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  proHint: {
    backgroundColor: theme.colors.warningMuted,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  proHintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    textAlign: 'center',
  },
  saveButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
});
