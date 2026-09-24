import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getCompletedWorkoutSessions} from '../../services/workoutSessionService';
import {useAuth} from '../../context/AuthContext';
import {calculateExerciseProgress, calculateExerciseVolume} from '../../utils/progressCalculations';
import {formatDate} from '../../utils/dateUtils';
import {exercises} from '../../data/exercises';
import type {WorkoutSession} from '../../types/workoutSession';
import type {ExerciseStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseProgress'>;

export function ExerciseProgressScreen({navigation, route}: Props) {
  const {user} = useAuth();
  const {exerciseId} = route.params;
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const loadedSessions = await getCompletedWorkoutSessions(user.uid);
      setSessions(loadedSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load exercise progress';
      setError(errorMessage);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#163B2A" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Unable to load progress</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={loadSessions} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const exerciseData = exercises.find(e => e.id === exerciseId);
  const progress = calculateExerciseProgress(exerciseId, sessions, 20);

  if (progress.totalSessions === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>No history found</Text>
          <Text style={styles.errorMessage}>
            You haven't completed {exerciseData?.name || 'this exercise'} yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Exercise Header */}
      <View style={styles.headerCard}>
        <Text style={styles.exerciseName}>{exerciseData?.name || 'Unknown Exercise'}</Text>
        <Text style={styles.exerciseCategory}>{exerciseData?.primaryMuscle || ''}</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sessions</Text>
          <Text style={styles.statValue}>{progress.totalSessions}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Highest Weight</Text>
          <Text style={styles.statValue}>{progress.highestWeight > 0 ? `${progress.highestWeight} lbs` : '—'}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Highest Reps</Text>
          <Text style={styles.statValue}>{progress.highestReps || '—'}</Text>
        </View>
      </View>

      {/* Latest and Previous Performance */}
      <View style={styles.section}>
        {progress.latestPerformance && (
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Latest Performance</Text>
            <View style={styles.performanceContent}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceItemLabel}>Date</Text>
                <Text style={styles.performanceItemValue}>{formatDate(progress.latestPerformance.date)}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceItemLabel}>Weight</Text>
                <Text style={styles.performanceItemValue}>
                  {progress.latestPerformance.weight > 0 ? `${progress.latestPerformance.weight} lbs` : '—'}
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceItemLabel}>Reps</Text>
                <Text style={styles.performanceItemValue}>{progress.latestPerformance.reps}</Text>
              </View>
            </View>
          </View>
        )}

        {progress.previousPerformance && (
          <View style={styles.performanceCard}>
            <Text style={styles.performanceLabel}>Previous Performance</Text>
            <View style={styles.performanceContent}>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceItemLabel}>Date</Text>
                <Text style={styles.performanceItemValue}>{formatDate(progress.previousPerformance.date)}</Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceItemLabel}>Weight</Text>
                <Text style={styles.performanceItemValue}>
                  {progress.previousPerformance.weight > 0 ? `${progress.previousPerformance.weight} lbs` : '—'}
                </Text>
              </View>
              <View style={styles.performanceItem}>
                <Text style={styles.performanceItemLabel}>Reps</Text>
                <Text style={styles.performanceItemValue}>{progress.previousPerformance.reps}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Recent History */}
      {progress.recentHistory.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent History</Text>
          <View style={styles.historyTable}>
            <View style={styles.historyTableHeader}>
              <Text style={[styles.historyTableCell, styles.historyTableHeaderCell, {flex: 1.5}]}>Date</Text>
              <Text style={[styles.historyTableCell, styles.historyTableHeaderCell, {flex: 1}]}>Weight</Text>
              <Text style={[styles.historyTableCell, styles.historyTableHeaderCell, {flex: 1}]}>Reps</Text>
            </View>

            {progress.recentHistory.map((history, idx) => (
              <View key={idx} style={styles.historyTableRow}>
                <Text style={[styles.historyTableCell, {flex: 1.5}]}>{formatDate(history.date)}</Text>
                <Text style={[styles.historyTableCell, {flex: 1}]}>
                  {history.weight > 0 ? `${history.weight} lbs` : '—'}
                </Text>
                <Text style={[styles.historyTableCell, {flex: 1}]}>{history.reps}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F1',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  exerciseName: {
    color: '#10211B',
    fontSize: 20,
    fontWeight: '800',
  },
  exerciseCategory: {
    color: '#607069',
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#607069',
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    color: '#163B2A',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#10211B',
    fontSize: 18,
    fontWeight: '800',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  performanceLabel: {
    color: '#10211B',
    fontSize: 14,
    fontWeight: '800',
  },
  performanceContent: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceItem: {
    flex: 1,
    backgroundColor: '#F4F7F1',
    borderRadius: 8,
    padding: 8,
  },
  performanceItemLabel: {
    color: '#607069',
    fontSize: 11,
    fontWeight: '600',
  },
  performanceItemValue: {
    color: '#163B2A',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  historyTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  historyTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F1',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  historyTableHeaderCell: {
    fontWeight: '800',
    color: '#4C765F',
    fontSize: 12,
  },
  historyTableCell: {
    color: '#10211B',
    fontSize: 13,
    padding: 8,
  },
  historyTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  errorTitle: {
    color: '#10211B',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#607069',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#163B2A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#B8E986',
    fontSize: 14,
    fontWeight: '800',
  },
});
