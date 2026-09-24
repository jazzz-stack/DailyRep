import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, Modal, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import notifee from '@notifee/react-native';
import {useAuth} from '../../context/AuthContext';
import {saveCompletedWorkoutSession, getWorkoutSessionErrorMessage} from '../../services/workoutSessionService';
import {workoutPlans} from '../../data/workoutPlans';
import {exercises} from '../../data/exercises';
import {formatDuration} from '../../utils/workoutSessionUtils';
import type {WorkoutStackParamList} from '../../types/navigation';
import type {WorkoutSession} from '../../types/workoutSession';
import type {WorkoutCompletionData} from '../../types/notificationPreferences';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutComplete'>;

interface WorkoutStats {
  totalDuration: string;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  completionTime: string;
}

export function WorkoutCompleteScreen({navigation, route}: Props) {
  const {user} = useAuth();
  const sessionId = route.params.sessionId;
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [isSaving, setIsSaving] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  // For now, we'll receive session data through navigation state
  // In a real app, you might store this in a global state or retrieve from Firestore
  useEffect(() => {
    if (route.params && 'session' in route.params) {
      const workoutSession = (route.params as any).session as WorkoutSession;
      setSession(workoutSession);
      calculateStats(workoutSession);
      saveWorkout(workoutSession);
    }
  }, []);

  const calculateStats = (workoutSession: WorkoutSession) => {
    const totalSets = workoutSession.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
    const totalReps = workoutSession.exercises.reduce(
      (sum, ex) => sum + ex.completedSets.reduce((setSum, set) => setSum + set.reps, 0),
      0,
    );
    const completedAt = workoutSession.completedAt
      ? new Date(workoutSession.completedAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
      : new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    setStats({
      totalDuration: formatDuration(workoutSession.durationSeconds || 0),
      totalExercises: workoutSession.exercises.length,
      totalSets,
      totalReps,
      completionTime: completedAt,
    });
  };

  const saveWorkout = async (workoutSession: WorkoutSession) => {
    console.log('[WorkoutComplete] Attempting to save workout:', workoutSession.id);
    if (!user) {
      console.error('[WorkoutComplete] Not authenticated, no user UID');
      setSaveError('Not authenticated');
      setIsSaving(false);
      setShowRetry(true);
      return;
    }

    console.log('[WorkoutComplete] User authenticated:', user.uid);
    try {
      setIsSaving(true);
      setSaveError(null);
      console.log('[WorkoutComplete] Calling saveCompletedWorkoutSession...');
      await saveCompletedWorkoutSession(user.uid, workoutSession);
      console.log('[WorkoutComplete] Save successful!');
      setIsSaving(false);

      // Show completion notification
      try {
        const plan = workoutPlans.find(p => p.id === workoutSession.planId);
        const workout = plan ? plan.workouts.find(w => w.id === workoutSession.workoutId) : null;

        const notificationData: WorkoutCompletionData = {
          type: 'workout_completed',
          sessionId: workoutSession.id,
        };

        const title = workout ? `${workout.name} Complete 🎉` : 'Workout Complete 🎉';
        const body = workout
          ? `Great job! You completed today's ${workout.name}.`
          : 'Great job! You completed today\'s workout.';

        await notifee.displayNotification({
          title,
          body,
          android: {
            channelId: 'default',
            pressAction: {
              id: 'default',
            },
          },
          data: notificationData,
        });
      } catch (notificationError) {
        // Notification failure should not crash the app
        console.error('Failed to display completion notification:', notificationError);
      }
    } catch (error) {
      console.error('[WorkoutComplete] Save failed:', error);
      const errorMessage = getWorkoutSessionErrorMessage(error, 'Failed to save your workout.');
      setSaveError(errorMessage);
      setIsSaving(false);
      setShowRetry(true);
    }
  };

  const handleRetry = () => {
    if (session && user) {
      saveWorkout(session);
      setShowRetry(false);
    }
  };

  const handleDone = () => {
    navigation.navigate('WorkoutPlans');
  };

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const plan = session ? workoutPlans.find(p => p.id === session.planId) : null;
  const workout = plan ? plan.workouts.find(w => w.id === session!.workoutId) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Celebration */}
      <View style={styles.celebration}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.celebrationText}>Workout Complete!</Text>
      </View>

      {/* Workout Info */}
      {workout && (
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.completedTime}>Completed at {stats.completionTime}</Text>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>{stats.totalDuration}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Exercises</Text>
          <Text style={styles.statValue}>{stats.totalExercises}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Sets</Text>
          <Text style={styles.statValue}>{stats.totalSets}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Reps</Text>
          <Text style={styles.statValue}>{stats.totalReps}</Text>
        </View>
      </View>

      {/* Exercise Breakdown */}
      {session && (
        <View style={styles.exerciseBreakdown}>
          <Text style={styles.breakdownTitle}>Exercise Summary</Text>
          {session.exercises.map((ex, idx) => {
            const exerciseData = exercises.find(e => e.id === ex.exerciseId);
            const totalSetReps = ex.completedSets.reduce((sum, set) => sum + set.reps, 0);
            const totalSetWeight = ex.completedSets.reduce((sum, set) => sum + set.weight, 0);

            return (
              <View key={ex.exerciseId} style={styles.exerciseItem}>
                <Text style={styles.exerciseName}>{exerciseData?.name || ex.exerciseId}</Text>
                <Text style={styles.exerciseStats}>
                  {ex.completedSets.length} sets • {totalSetReps} reps • {totalSetWeight.toFixed(1)} kg
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Error Message */}
      {saveError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Save Issue</Text>
          <Text style={styles.errorText}>{saveError}</Text>
          {showRetry && (
            <Pressable onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry Save</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Action Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Done"
        onPress={handleDone}
        style={styles.doneButton}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>

      {/* Saving Modal */}
      <Modal transparent visible={isSaving} animationType="fade">
        <View style={styles.savingOverlay}>
          <View style={styles.savingContent}>
            <ActivityIndicator size="large" color="#163B2A" />
            <Text style={styles.savingText}>Saving your workout...</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F7F1'},
  contentContainer: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  title: {color: '#10211B', fontSize: 18, fontWeight: '800'},
  celebration: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  celebrationEmoji: {fontSize: 64},
  celebrationText: {
    color: '#10211B',
    fontSize: 28,
    fontWeight: '800',
  },
  workoutInfo: {
    alignItems: 'center',
    gap: 4,
  },
  workoutName: {
    color: '#10211B',
    fontSize: 22,
    fontWeight: '800',
  },
  completedTime: {
    color: '#607069',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#163B2A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    color: '#C5D7CB',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#B8E986',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  exerciseBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  breakdownTitle: {
    color: '#4C765F',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  exerciseItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBE8',
  },
  exerciseName: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '800',
  },
  exerciseStats: {
    color: '#607069',
    fontSize: 13,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEE8E8',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  errorTitle: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#B42318',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  doneButton: {
    backgroundColor: '#B8E986',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '800',
  },
  savingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    alignItems: 'center',
  },
  savingText: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '600',
  },
});
