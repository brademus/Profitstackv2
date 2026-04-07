import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useVentures } from '../hooks/useVentures';
import { useTransactions } from '../hooks/useTransactions';
import { supabase } from '../lib/supabase';
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import { generateId } from '../lib/utils';

export function AddTransactionScreen({ navigation, route }: any) {
  const preselectedVentureId = route.params?.ventureId;
  const { user } = useAuth();
  const { ventures } = useVentures(user?.id);
  const { addTransaction } = useTransactions(user?.id);

  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ventureId, setVentureId] = useState(preselectedVentureId || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const pickReceipt = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });

    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const uploadReceipt = async (uri: string): Promise<string | null> => {
    try {
      const fileName = `${user?.id}/${generateId()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();

      const { error } = await supabase.storage
        .from('receipts')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (error) throw error;

      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const handleSave = async () => {
    if (!amount || !ventureId || !category) {
      Alert.alert('Error', 'Fill in amount, venture, and category.');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Enter a valid amount.');
      return;
    }

    setSaving(true);
    try {
      let receiptUrl: string | null = null;
      if (receiptUri) {
        receiptUrl = await uploadReceipt(receiptUri);
      }

      await addTransaction({
        venture_id: ventureId,
        type,
        amount: parsedAmount,
        category,
        description: description.trim(),
        date,
        receipt_url: receiptUrl || undefined,
      });

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save transaction.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Transaction</Text>

        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.typeBtnIncome]}
            onPress={() => { setType('income'); setCategory(''); }}
          >
            <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
              + Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpense]}
            onPress={() => { setType('expense'); setCategory(''); }}
          >
            <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
              − Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.dollarSign, {
            color: type === 'income' ? theme.colors.income : theme.colors.expense,
          }]}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            autoFocus
          />
        </View>

        {/* Venture Picker */}
        <Text style={styles.label}>Venture</Text>
        <View style={styles.chipRow}>
          {ventures.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.chip, ventureId === v.id && { borderColor: v.color, backgroundColor: v.color + '20' }]}
              onPress={() => setVentureId(v.id)}
            >
              <Text style={styles.chipEmoji}>{v.icon}</Text>
              <Text style={[styles.chipText, ventureId === v.id && { color: theme.colors.textPrimary }]}>
                {v.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="What was this for?"
          placeholderTextColor={theme.colors.textMuted}
          value={description}
          onChangeText={setDescription}
        />

        {/* Date */}
        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textMuted}
          value={date}
          onChangeText={setDate}
        />

        {/* Receipt */}
        <TouchableOpacity style={styles.receiptButton} onPress={pickReceipt}>
          <Text style={styles.receiptButtonText}>
            {receiptUri ? '📸 Receipt attached' : '📷 Snap receipt'}
          </Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Transaction'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.xl, paddingTop: theme.spacing.xxxl },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: theme.spacing.xl,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md - 3,
    alignItems: 'center',
  },
  typeBtnIncome: { backgroundColor: theme.colors.incomeMuted },
  typeBtnExpense: { backgroundColor: theme.colors.expenseMuted },
  typeBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textMuted,
  },
  typeBtnTextActive: { color: theme.colors.textPrimary },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dollarSign: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginRight: theme.spacing.sm,
  },
  amountInput: {
    flex: 1,
    height: 56,
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  chipEmoji: { fontSize: 14, marginRight: 4 },
  chipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  chipTextActive: { color: theme.colors.primaryLight },
  input: {
    height: 48,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  receiptButton: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  receiptButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    height: 52,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxxxl,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
});
