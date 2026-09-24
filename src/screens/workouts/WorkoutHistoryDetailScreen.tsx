import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {getWorkoutSession} from '../../services/workoutSessionService';
import {useAuth} from '../../context/AuthContext';
import {formatDateTime} from '../../utils/dateUtils';
import {workoutPlans} from '../../data/workoutPlans';
import {exercises} from '../../data/exercises';
import type {WorkoutSession} from '../../types/workoutSession';
import type {ExerciseStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'WorkoutHistoryDetail'>;

export function WorkoutHistoryDetailScreen({navigation, route}: Props) {
  const {user} = useAuth();
  const {sessionId} = route.params;
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadSession = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const loadedSession = await getWorkoutSession(user.uid, sessionId);
      if (!loadedSession) {
        setNotFound(true);
        setSession(null);
      } else {
        setSession(loadedSession);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workout session';
      setError(errorMessage);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

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
          <Text style={styles.errorTitle}>Unable to load workout</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={loadSession} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Workout not found</Text>
          <Text style={styles.errorMessage}>This workout session could not be found or has been deleted.</Text>
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>No data available</Text>
        </View>
      </View>
    );
  }

  const plan = workoutPlans.find(p => p.id === session.planId);
  const workout = plan?.workouts.find(w => w.id === session.workoutId);
  const durationStr = formatDuration(session.durationSeconds || 0);
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Summary Header */}
      <View style={styles.summaryCard}>
        <Text style={styles.workoutName}>{workout?.name || 'Unknown Workout'}</Text>
        <Text style={styles.planName}>{plan?.name || 'Unknown Plan'}</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{formatDateTime(session.completedAt || '')}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{durationStr}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Exercises</Text>
            <Text style={styles.summaryValue}>{session.exercises.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Sets</Text>
            <Text style={styles.summaryValue}>{totalSets}</Text>
          </View>
        </View>
      </View>

      {/* Exercises */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercises</Text>
        {session.exercises.map((exercise, idx) => {
          const exerciseData = exercises.find(e => e.id === exercise.exerciseId);
          const totalReps = exercise.completedSets.reduce((sum, set) => sum + set.reps, 0);
          const totalVolume = exercise.completedSets.reduce((sum, set) => sum + set.reps * set.weight, 0);

          return (
            <View key={idx} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exerciseData?.name || 'Unknown Exercise'}</Text>
                  <Text style={styles.exerciseCategory}>{exerciseData?.primaryMuscle || ''}</Text>
                </View>
              </View>

              {/* Sets Table */}
              <View style={styles.setsTable}>
                <View style={styles.setsTableHeader}>
                  <Text style={[styles.setsTableCell, styles.setsTableHeaderCell, {flex: 0.8}]}>Set</Text>
                  <Text style={[styles.setsTableCell, styles.setsTableHeaderCell, {flex: 1}]}>Reps</Text>
                  <Text style={[styles.setsTableCell, styles.setsTableHeaderCell, {flex: 1}]}>Weight</Text>
                </View>

                {exercise.completedSets.map((set, setIdx) => (
                  <View key={setIdx} style={styles.setsTableRow}>
                    <Text style={[styles.setsTableCell, {flex: 0.8}]}>{set.setNumber}</Text>
                    <Text style={[styles.setsTableCell, {flex: 1}]}>{set.reps}</Text>
                    <Text style={[styles.setsTableCell, {flex: 1}]}>
                      {set.weight > 0 ? `${set.weight} lbs` : '—'}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Volume Summary */}
              {totalVolume > 0 && (
                <Text style={styles.volumeText}>Total Volume: {totalVolume} lbs</Text>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  workoutName: {
    color: '#10211B',
    fontSize: 20,
    fontWeight: '800',
  },
  planName: {
    color: '#607069',
    fontSize: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F4F7F1',
    borderRadius: 8,
    padding: 12,
  },
  summaryLabel: {
    color: '#607069',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#163B2A',
    fontSize: 16,
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
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '800',
  },
  exerciseCategory: {
    color: '#607069',
    fontSize: 12,
    marginTop: 2,
  },
  setsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  setsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F7F1',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  setsTableHeaderCell: {
    fontWeight: '800',
    color: '#4C765F',
    fontSize: 12,
  },
  setsTableCell: {
    color: '#10211B',
    fontSize: 13,
    padding: 8,
    textAlign: 'center',
  },
  setsTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  volumeText: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
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
