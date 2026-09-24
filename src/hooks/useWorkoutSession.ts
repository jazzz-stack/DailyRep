import {useCallback, useEffect, useRef, useState} from 'react';
import type {Workout, WorkoutExercise} from '../types/workout';
import type {CompletedSet, WorkoutSession, WorkoutSessionExercise, WorkoutSessionStatus} from '../types/workoutSession';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface WorkoutSessionState {
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  currentSetNumber: number;
  currentReps: string;
  currentWeight: string;
  restTimeRemaining: number;
  isRestActive: boolean;
  status: WorkoutSessionStatus;
  workoutStartTime: number | null;
  workoutPauseTime: number | null;
  totalElapsedPausedTime: number;
}

export interface WorkoutSessionActions {
  initializeSession: (workout: Workout, userId: string, planId: string, workoutId: string) => void;
  startRest: () => void;
  skipRest: () => void;
  completeSet: (reps: number, weight: number) => void;
  updateCurrentReps: (reps: string) => void;
  updateCurrentWeight: (weight: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
}

export function useWorkoutSession(): {state: WorkoutSessionState; actions: WorkoutSessionActions} {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [status, setStatus] = useState<WorkoutSessionStatus>('in_progress');
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [workoutPauseTime, setWorkoutPauseTime] = useState<number | null>(null);
  const [totalElapsedPausedTime, setTotalElapsedPausedTime] = useState(0);

  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (restTimerRef.current) {
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Rest timer effect
  useEffect(() => {
    if (!isRestActive || restTimeRemaining <= 0) {
      return;
    }

    restTimerRef.current = setInterval(() => {
      setRestTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRestActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [isRestActive, restTimeRemaining]);

  const initializeSession = useCallback(
    (workout: Workout, userId: string, planId: string, workoutId: string) => {
      const newSession: WorkoutSession = {
        id: generateUUID(),
        userId,
        planId,
        workoutId,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        exercises: workout.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          targetSets: ex.sets,
          targetReps: ex.reps,
          restSeconds: ex.restSeconds,
          completedSets: [],
        })),
      };
      setSession(newSession);
      setCurrentExerciseIndex(0);
      setCurrentSetNumber(1);
      setCurrentReps('');
      setCurrentWeight('');
      setRestTimeRemaining(0);
      setIsRestActive(false);
      setStatus('in_progress');
      setWorkoutStartTime(Date.now());
      setWorkoutPauseTime(null);
      setTotalElapsedPausedTime(0);
    },
    [],
  );

  const completeSet = useCallback(
    (reps: number, weight: number) => {
      if (!session) return;

      const updatedSession = {...session};
      const currentExercise = updatedSession.exercises[currentExerciseIndex];

      if (!currentExercise) return;

      const completedSet: CompletedSet = {
        setNumber: currentSetNumber,
        reps,
        weight,
        completed: true,
      };

      currentExercise.completedSets.push(completedSet);
      setSession(updatedSession);
      setCurrentReps('');
      setCurrentWeight('');

      // Check if exercise is complete
      if (currentExercise.completedSets.length < currentExercise.targetSets) {
        // Start rest timer for next set
        setRestTimeRemaining(currentExercise.restSeconds);
        setIsRestActive(true);
        setCurrentSetNumber(currentSetNumber + 1);
      } else {
        // Move to next exercise
        if (currentExerciseIndex < updatedSession.exercises.length - 1) {
          setCurrentExerciseIndex(currentExerciseIndex + 1);
          setCurrentSetNumber(1);
          setIsRestActive(false);
        } else {
          // Workout complete
          const now = Date.now();
          const durationSeconds = workoutStartTime
            ? Math.floor((now - workoutStartTime - totalElapsedPausedTime) / 1000)
            : 0;
          updatedSession.completedAt = new Date().toISOString();
          updatedSession.durationSeconds = durationSeconds;
          updatedSession.status = 'completed';
          setSession(updatedSession);
          setStatus('completed');
          clearTimers();
        }
      }
    },
    [session, currentExerciseIndex, currentSetNumber, workoutStartTime, totalElapsedPausedTime, clearTimers],
  );

  const startRest = useCallback(() => {
    if (!session || currentExerciseIndex >= session.exercises.length) return;
    const currentExercise = session.exercises[currentExerciseIndex];
    setRestTimeRemaining(currentExercise.restSeconds);
    setIsRestActive(true);
  }, [session, currentExerciseIndex]);

  const skipRest = useCallback(() => {
    setIsRestActive(false);
    setRestTimeRemaining(0);
  }, []);

  const pause = useCallback(() => {
    setStatus('paused');
    clearTimers();
    setWorkoutPauseTime(Date.now());
  }, [clearTimers]);

  const resume = useCallback(() => {
    if (workoutPauseTime) {
      const pauseDuration = Date.now() - workoutPauseTime;
      setTotalElapsedPausedTime(prev => prev + pauseDuration);
    }
    setStatus('in_progress');
    setWorkoutPauseTime(null);
  }, [workoutPauseTime]);

  const cancel = useCallback(() => {
    setStatus('cancelled');
    setSession(null);
    clearTimers();
    setCurrentExerciseIndex(0);
    setCurrentSetNumber(1);
    setCurrentReps('');
    setCurrentWeight('');
  }, [clearTimers]);

  const updateCurrentReps = useCallback((reps: string) => {
    setCurrentReps(reps);
  }, []);

  const updateCurrentWeight = useCallback((weight: string) => {
    setCurrentWeight(weight);
  }, []);

  return {
    state: {
      session,
      currentExerciseIndex,
      currentSetNumber,
      currentReps,
      currentWeight,
      restTimeRemaining,
      isRestActive,
      status,
      workoutStartTime,
      workoutPauseTime,
      totalElapsedPausedTime,
    },
    actions: {
      initializeSession,
      startRest,
      skipRest,
      completeSet,
      updateCurrentReps,
      updateCurrentWeight,
      pause,
      resume,
      cancel,
    },
  };
}
