import {useCallback, useEffect, useMemo, useState} from 'react';
import type {WorkoutSession} from '../types/workoutSession';
import {getCompletedWorkoutSessions} from '../services/workoutSessionService';
import {useAuth} from '../context/AuthContext';
import {
  calculateWorkoutStats,
  calculateWeeklyStats,
  getExercisesFromSessions,
  type WorkoutStats,
  type WeeklyStats,
} from '../utils/progressCalculations';

export interface UseProgressState {
  sessions: WorkoutSession[];
  stats: WorkoutStats | null;
  weeklyStats: WeeklyStats[];
  exerciseIds: string[];
  isLoading: boolean;
  error: string | null;
}

export interface UseProgressActions {
  refresh: () => Promise<void>;
}

export function useProgress(): UseProgressState & UseProgressActions {
  const {user} = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const loadedSessions = await getCompletedWorkoutSessions(user.uid);
      setSessions(loadedSessions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load progress data';
      setError(errorMessage);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Calculate stats from sessions (memoized to avoid recalculations)
  const stats = useMemo(() => {
    if (sessions.length === 0) return null;
    return calculateWorkoutStats(sessions);
  }, [sessions]);

  const weeklyStats = useMemo(() => {
    if (sessions.length === 0) return [];
    return calculateWeeklyStats(sessions, 4);
  }, [sessions]);

  const exerciseIds = useMemo(() => {
    return getExercisesFromSessions(sessions);
  }, [sessions]);

  const refresh = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    stats,
    weeklyStats,
    exerciseIds,
    isLoading,
    error,
    refresh,
  };
}
