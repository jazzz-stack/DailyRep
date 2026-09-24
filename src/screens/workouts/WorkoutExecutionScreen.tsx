import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, TextInput, ScrollView, Modal, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {useWorkoutSession} from '../../hooks/useWorkoutSession';
import {exercises} from '../../data/exercises';
import {workoutPlans} from '../../data/workoutPlans';
import {saveCompletedWorkoutSession, getWorkoutSessionErrorMessage, getInProgressWorkoutSession} from '../../services/workoutSessionService';
import {validateReps, validateWeight, formatRest, formatDuration} from '../../utils/workoutSessionUtils';
import type {WorkoutStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutExecution'>;

export function WorkoutExecutionScreen({navigation, route}: Props) {
  const {user} = useAuth();
  const {state, actions} = useWorkoutSession();
  const [repsError, setRepsError] = useState<string>();
  const [weightError, setWeightError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [showPauseMenu, setShowPauseMenu] = useState(false);

  const plan = workoutPlans.find(p => p.id === route.params.planId);
  const workout = plan?.workouts.find(w => w.id === route.params.workoutId);

  // Initialize workout session
  useEffect(() => {
    if (!state.session && workout && user) {
      // Check if there's an in-progress workout for this plan/workout
      const checkAndLoadSavedWorkout = async () => {
        try {
          const savedSession = await getInProgressWorkoutSession(user.uid);
          
          if (savedSession && savedSession.planId === route.params.planId && savedSession.workoutId === route.params.workoutId) {
            // Resume the saved workout
            console.log('[WorkoutExecution] Found saved workout, resuming:', savedSession.id);
            actions.resumeSession(savedSession, user.uid);
          } else {
            // Start a new workout
            console.log('[WorkoutExecution] No saved workout found, creating new');
            actions.initializeSession(workout, user.uid, route.params.planId, route.params.workoutId);
          }
        } catch (error) {
          console.error('[WorkoutExecution] Error checking for saved workout:', error);
          // Fallback to new session
          actions.initializeSession(workout, user.uid, route.params.planId, route.params.workoutId);
        }
      };

      checkAndLoadSavedWorkout();
    }
  }, [user?.uid, workout, state.session, actions, route.params]);

  // Handle completion
  useEffect(() => {
    if (state.status === 'completed' && state.session && user) {
      // Navigate to completion screen after a brief delay
      const timer = setTimeout(() => {
        navigation.navigate('WorkoutComplete', {
          sessionId: state.session!.id,
          session: state.session,
        } as any);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.session, user, navigation]);

  if (!plan || !workout || !state.session || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading workout...</Text>
      </View>
    );
  }

  const currentExercise = state.session.exercises[state.currentExerciseIndex];
  const exerciseData = exercises.find(e => e.id === currentExercise.exerciseId);
  const totalExercises = state.session.exercises.length;
  const totalSets = state.session.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);
  const completedSets = state.session.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleCompleteSet = async () => {
    setRepsError(undefined);
    setWeightError(undefined);

    const repsValidation = validateReps(state.currentReps);
    if (!repsValidation.isValid) {
      setRepsError(repsValidation.error);
      return;
    }

    const weightValidation = validateWeight(state.currentWeight);
    if (!weightValidation.isValid) {
      setWeightError(weightValidation.error);
      return;
    }

    const reps = parseInt(state.currentReps, 10);
    const weight = parseFloat(state.currentWeight);

    actions.completeSet(reps, weight);
  };

  const handleExit = () => {
    setShowPauseMenu(false);
    // Show confirmation
    navigation.navigate('WorkoutDetails', {planId: route.params.planId, workoutId: route.params.workoutId});
    actions.cancel();
  };

  const handlePause = () => {
    actions.pause();
    setShowPauseMenu(true);
  };

  const handleResume = () => {
    actions.resume();
    setShowPauseMenu(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{workout.name}</Text>
            <Text style={styles.headerSubtitle}>Day {workout.dayNumber}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pause workout"
            onPress={handlePause}
            disabled={state.status === 'paused'}
            style={[styles.pauseButton, state.status === 'paused' && styles.pauseButtonDisabled]}
          >
            <Text style={styles.pauseButtonText}>{state.status === 'paused' ? '⏸' : '⏸'}</Text>
          </Pressable>
        </View>

        {/* Progress */}
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Exercise {state.currentExerciseIndex + 1} of {totalExercises} • Set {state.currentSetNumber} of{' '}
            {currentExercise.targetSets}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${progress}%`}]} />
          </View>
          <Text style={styles.progressPercent}>{progress}% Complete</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Current Exercise */}
        {exerciseData && (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exerciseData.name}</Text>
            <Text style={styles.exerciseMeta}>
              {exerciseData.primaryMuscle} • {exerciseData.equipment}
            </Text>
            <Text style={styles.exerciseDescription}>{exerciseData.description}</Text>
          </View>
        )}

        {/* Rest Timer */}
        {state.isRestActive && (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>Rest</Text>
            <Text style={styles.restTimer}>{formatRest(state.restTimeRemaining)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip rest"
              onPress={() => actions.skipRest()}
              style={styles.skipRestButton}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </Pressable>
          </View>
        )}

        {/* Set Input */}
        {!state.isRestActive && (
          <View style={styles.setContainer}>
            <Text style={styles.setTitle}>
              Set {state.currentSetNumber} of {currentExercise.targetSets}
            </Text>
            <Text style={styles.setTarget}>Target: {currentExercise.targetReps} reps</Text>

            {/* Completed Sets */}
            {currentExercise.completedSets.length > 0 && (
              <View style={styles.completedSetsContainer}>
                <Text style={styles.completedSetsTitle}>Completed Sets</Text>
                {currentExercise.completedSets.map(set => (
                  <View key={set.setNumber} style={styles.completedSet}>
                    <Text style={styles.completedSetText}>
                      ✓ Set {set.setNumber}: {set.reps} reps × {set.weight} kg
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Input Fields */}
            <View style={styles.inputContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={[styles.input, repsError && styles.inputError]}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={state.currentReps}
                  onChangeText={actions.updateCurrentReps}
                  editable={state.status === 'in_progress'}
                />
                {repsError && <Text style={styles.errorText}>{repsError}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={[styles.input, weightError && styles.inputError]}
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={state.currentWeight}
                  onChangeText={actions.updateCurrentWeight}
                  editable={state.status === 'in_progress'}
                />
                {weightError && <Text style={styles.errorText}>{weightError}</Text>}
              </View>
            </View>

            {/* Complete Set Button */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Complete set"
              onPress={handleCompleteSet}
              disabled={state.status !== 'in_progress'}
              style={[styles.completeButton, state.status !== 'in_progress' && styles.completeButtonDisabled]}
            >
              <Text style={styles.completeButtonText}>Complete Set</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Pause Menu Modal */}
      <Modal transparent visible={showPauseMenu} animationType="fade">
        <View style={styles.pauseMenuOverlay}>
          <View style={styles.pauseMenuContent}>
            <Text style={styles.pauseMenuTitle}>Workout Paused</Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleResume}
              style={styles.pauseMenuButton}
            >
              <Text style={styles.pauseMenuButtonText}>Resume Workout</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={handleExit}
              style={[styles.pauseMenuButton, styles.pauseMenuButtonSecondary]}
            >
              <Text style={styles.pauseMenuButtonSecondaryText}>Exit Workout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Saving Modal */}
      <Modal transparent visible={isSaving} animationType="fade">
        <View style={styles.savingOverlay}>
          <View style={styles.savingContent}>
            <ActivityIndicator size="large" color="#163B2A" />
            <Text style={styles.savingText}>Saving your workout...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F7F1'},
  title: {color: '#10211B', fontSize: 18, fontWeight: '800'},
  header: {
    backgroundColor: '#163B2A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {color: '#B8E986', fontSize: 24, fontWeight: '800'},
  headerSubtitle: {color: '#C5D7CB', fontSize: 14, marginTop: 4},
  pauseButton: {
    padding: 8,
    backgroundColor: '#37734F',
    borderRadius: 8,
  },
  pauseButtonDisabled: {opacity: 0.5},
  pauseButtonText: {fontSize: 20, color: '#B8E986'},
  progress: {gap: 8},
  progressText: {color: '#C5D7CB', fontSize: 14, fontWeight: '600'},
  progressBar: {
    height: 6,
    backgroundColor: '#37734F',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {height: '100%', backgroundColor: '#B8E986'},
  progressPercent: {color: '#C5D7CB', fontSize: 12},
  content: {flex: 1},
  contentContainer: {padding: 20, gap: 16, paddingBottom: 40},
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  exerciseName: {color: '#10211B', fontSize: 18, fontWeight: '800'},
  exerciseMeta: {color: '#607069', fontSize: 14, textTransform: 'capitalize'},
  exerciseDescription: {color: '#607069', fontSize: 13, lineHeight: 18},
  restContainer: {
    backgroundColor: '#163B2A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  restTitle: {color: '#C5D7CB', fontSize: 14, fontWeight: '600'},
  restTimer: {color: '#B8E986', fontSize: 48, fontWeight: '800', fontVariant: ['tabular-nums']},
  skipRestButton: {
    backgroundColor: '#37734F',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipRestText: {color: '#B8E986', fontSize: 14, fontWeight: '800'},
  setContainer: {gap: 16},
  setTitle: {color: '#10211B', fontSize: 18, fontWeight: '800'},
  setTarget: {color: '#607069', fontSize: 14},
  completedSetsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  completedSetsTitle: {color: '#4C765F', fontSize: 12, fontWeight: '800', textTransform: 'uppercase'},
  completedSet: {paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8EBE8'},
  completedSetText: {color: '#37734F', fontSize: 14, fontWeight: '600'},
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {flex: 1, gap: 6},
  inputLabel: {color: '#4C765F', fontSize: 12, fontWeight: '800', textTransform: 'uppercase'},
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#10211B',
    borderWidth: 1,
    borderColor: '#DCE6DD',
  },
  inputError: {borderColor: '#B42318'},
  errorText: {color: '#B42318', fontSize: 12, fontWeight: '600'},
  completeButton: {
    backgroundColor: '#B8E986',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButtonDisabled: {opacity: 0.5},
  completeButtonText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
  pauseMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseMenuContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 12,
    width: '80%',
  },
  pauseMenuTitle: {color: '#10211B', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 12},
  pauseMenuButton: {
    backgroundColor: '#B8E986',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pauseMenuButtonText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
  pauseMenuButtonSecondary: {backgroundColor: '#DCE6DD'},
  pauseMenuButtonSecondaryText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
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
  savingText: {color: '#10211B', fontSize: 16, fontWeight: '600'},
});
