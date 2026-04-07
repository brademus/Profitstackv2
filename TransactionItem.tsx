import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { Transaction } from '../types';
import { formatCurrency, formatDateShort } from '../lib/utils';

interface Props {
  transaction: Transaction;
  ventureName?: string;
  ventureColor?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TransactionItem({
  transaction,
  ventureName,
  ventureColor,
  onPress,
  onLongPress,
}: Props) {
  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.typeDot, {
          backgroundColor: isIncome ? theme.colors.income : theme.colors.expense,
        }]} />
        <View style={styles.info}>
          <Text style={styles.description} numberOfLines={1}>
            {transaction.description || transaction.category}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{transaction.category}</Text>
            {ventureName && (
              <>
                <Text style={styles.separator}>·</Text>
                <View style={[styles.ventureDot, { backgroundColor: ventureColor || theme.colors.primary }]} />
                <Text style={styles.ventureName}>{ventureName}</Text>
              </>
            )}
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, {
          color: isIncome ? theme.colors.income : theme.colors.expense,
        }]}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.date}>{formatDateShort(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  description: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  category: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
  },
  separator: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginHorizontal: 4,
  },
  ventureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  ventureName: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  date: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
