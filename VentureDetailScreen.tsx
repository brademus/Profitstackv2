import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useVentures } from '../hooks/useVentures';
import { useTransactions } from '../hooks/useTransactions';
import { useTimeLog } from '../hooks/useTimeLog';
import { TransactionItem } from '../components/TransactionItem';
import { StatCard } from '../components/StatCard';
import { formatCurrency, formatPercent, formatHours } from '../lib/utils';

export function VentureDetailScreen({ navigation, route }: any) {
  const { ventureId } = route.params;
  const { user } = useAuth();
  const { ventures, venturePnLs, archiveVenture } = useVentures(user?.id);
  const { transactions, fetchTransactions, deleteTransaction } = useTransactions(user?.id);
  const { activeLog, elapsedSeconds, startTimer, stopTimer } = useTimeLog(user?.id);
  const [tab, setTab] = useState<'transactions' | 'time'>('transactions');

  const venture = ventures.find((v) => v.id === ventureId);
  const pnl = venturePnLs.find((p) => p.venture.id === ventureId);

  useEffect(() => {
    fetchTransactions(ventureId);
  }, [ventureId, fetchTransactions]);

  const isTimerRunning = activeLog?.venture_id === ventureId;

  const handleToggleTimer = async () => {
    try {
      if (isTimerRunning) {
        await stopTimer();
      } else if (activeLog) {
        Alert.alert('Timer Active', 'Stop the current timer first.');
      } else {
        await startTimer(ventureId);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteTransaction(id),
      },
    ]);
  };

  const handleArchive = () => {
    Alert.alert('Archive Venture', 'This will hide it from your dashboard.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive', style: 'destructive',
        onPress: async () => {
          await archiveVenture(ventureId);
          navigation.goBack();
        },
      },
    ]);
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!venture) return null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleArchive}>
            <Text style={styles.archiveBtn}>Archive</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.icon}>{venture.icon}</Text>
          <View>
            <Text style={styles.name}>{venture.name}</Text>
            <Text style={styles.type}>{venture.type}</Text>
          </View>
        </View>

        {/* P&L Summary */}
        {pnl && (
          <>
            <View style={styles.statRow}>
              <StatCard
                label="Net Profit"
                value={formatCurrency(pnl.netProfit)}
                color={pnl.netProfit >= 0 ? theme.colors.income : theme.colors.expense}
              />
              <View style={{ width: theme.spacing.md }} />
              <StatCard
                label="$/Hour"
                value={pnl.dollarPerHour ? `$${pnl.dollarPerHour.toFixed(0)}` : '—'}
              />
            </View>
            <View style={styles.statRow}>
              <StatCard label="Revenue" value={formatCurrency(pnl.totalIncome)} compact />
              <View style={{ width: theme.spacing.sm }} />
              <StatCard label="Expenses" value={formatCurrency(pnl.totalExpenses)} compact />
              <View style={{ width: theme.spacing.sm }} />
              <StatCard label="Margin" value={formatPercent(pnl.profitMargin)} compact />
            </View>
          </>
        )}

        {/* Timer */}
        <View style={styles.timerSection}>
          <TouchableOpacity
            style={[styles.timerButton, isTimerRunning && styles.timerButtonActive]}
            onPress={handleToggleTimer}
          >
            <Text style={styles.timerButtonEmoji}>{isTimerRunning ? '⏹' : '▶️'}</Text>
            <Text style={styles.timerButtonText}>
              {isTimerRunning ? formatTimer(elapsedSeconds) : 'Start Timer'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualTimeBtn}
            onPress={() => navigation.navigate('TimeLog', { ventureId })}
          >
            <Text style={styles.manualTimeBtnText}>+ Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Add Transaction */}
        <TouchableOpacity
          style={styles.addTxButton}
          onPress={() => navigation.navigate('AddTransaction', { ventureId })}
        >
          <Text style={styles.addTxButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>

        {/* Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet. Add one above.</Text>
        ) : (
          transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onLongPress={() => handleDelete(tx.id)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.xxxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  backBtn: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  archiveBtn: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.expense,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  icon: { fontSize: 36, marginRight: theme.spacing.md },
  name: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
  },
  type: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  timerSection: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  timerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timerButtonActive: {
    borderColor: theme.colors.income,
    backgroundColor: theme.colors.incomeMuted,
  },
  timerButtonEmoji: { fontSize: 18, marginRight: theme.spacing.sm },
  timerButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  manualTimeBtn: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  manualTimeBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
  addTxButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  addTxButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },
});
