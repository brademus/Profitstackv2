import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import { useTimeLog } from '../hooks/useTimeLog';
import { formatHours, formatDate } from '../lib/utils';

export function TimeLogScreen({ navigation, route }: any) {
  const { ventureId } = route.params;
  const { user } = useAuth();
  const { timeLogs, fetchTimeLogs, addManualEntry, deleteTimeLog } = useTimeLog(user?.id);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTimeLogs(ventureId);
  }, [ventureId, fetchTimeLogs]);

  const handleAdd = async () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const totalMinutes = h * 60 + m;
    if (totalMinutes <= 0) {
      Alert.alert('Error', 'Enter a valid duration.');
      return;
    }
    try {
      await addManualEntry(ventureId, totalMinutes, date, note.trim());
      setHours('');
      setMinutes('');
      setNote('');
      fetchTimeLogs(ventureId);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const totalMinutes = timeLogs.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Time Log</Text>
      <Text style={styles.totalTime}>Total: {formatHours(totalMinutes)}</Text>

      {/* Manual Entry */}
      <View style={styles.entryCard}>
        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationRow}>
          <TextInput
            style={styles.durationInput}
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
            value={hours}
            onChangeText={setHours}
            keyboardType="number-pad"
          />
          <Text style={styles.durationLabel}>h</Text>
          <TextInput
            style={styles.durationInput}
            placeholder="0"
            placeholderTextColor={theme.colors.textMuted}
            value={minutes}
            onChangeText={setMinutes}
            keyboardType="number-pad"
          />
          <Text style={styles.durationLabel}>m</Text>
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.textMuted}
        />

        <Text style={styles.label}>Note (optional)</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="What did you work on?"
          placeholderTextColor={theme.colors.textMuted}
        />

        <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>+ Add Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Log List */}
      <Text style={styles.sectionTitle}>History</Text>
      {timeLogs.map((log) => (
        <TouchableOpacity
          key={log.id}
          style={styles.logItem}
          onLongPress={() => {
            Alert.alert('Delete', 'Remove this entry?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteTimeLog(log.id) },
            ]);
          }}
        >
          <View>
            <Text style={styles.logDuration}>
              {formatHours(log.duration_minutes || 0)}
            </Text>
            {log.note ? <Text style={styles.logNote}>{log.note}</Text> : null}
          </View>
          <Text style={styles.logDate}>{formatDate(log.start_time)}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing.lg, paddingTop: theme.spacing.xxxxl + theme.spacing.xl },
  backBtn: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.heavy,
    color: theme.colors.textPrimary,
  },
  totalTime: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  entryCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
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
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  durationInput: {
    width: 60,
    height: 48,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.sm,
    textAlign: 'center',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  durationLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
  },
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
  addBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  addBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logDuration: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  logNote: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  logDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
});
