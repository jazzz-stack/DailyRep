import {useCallback, useEffect, useState} from 'react';
import type {WorkoutSession} from '../types/workoutSession';
import {getCompletedWorkoutSessions} from '../services/workoutSessionService';
import {useAuth} from '../context/AuthContext';

export interface UseWorkoutHistoryState {
  sessions: WorkoutSession[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export interface UseWorkoutHistoryActions {
  refresh: () => Promise<void>;
}

export function useWorkoutHistory(): UseWorkoutHistoryState & UseWorkoutHistoryActions {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workout history';
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

  const refresh = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    isLoading,
    error,
    isEmpty: sessions.length === 0 && !isLoading,
    refresh,
  };
}
