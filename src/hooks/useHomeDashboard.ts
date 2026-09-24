import {useEffect, useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {workoutPlans} from '../data/workoutPlans';
import {getCompletedWorkoutSessions, getInProgressWorkoutSession} from '../services/workoutSessionService';
import {isWorkoutPlanMatch} from '../utils/workoutPlanMatching';
import {calculateWorkoutStreak} from '../utils/progressCalculations';
import {getWeekStart, getWeekEnd, formatHomeDate} from '../utils/dateUtils';
import type {WorkoutPlan, Workout} from '../types/workout';
import type {WorkoutSession} from '../types/workoutSession';

export interface HomeDashboardData {
  displayName?: string;
  greeting: string;
  formattedDate: string;

  todayWorkout?: Workout;
  todayPlan?: WorkoutPlan;

  isRestDay: boolean;
  isTodayCompleted: boolean;
  completedTodaySessionId?: string;

  // In-progress workout data
  inProgressWorkout?: WorkoutSession;
  inProgressWorkoutName?: string;

  weeklyWorkoutCount: number;
  weeklyWorkoutTarget: number;

  currentStreak: number;

  recentSessions: Array<{
    sessionId: string;
    planId: string;
    workoutId: string;
    workoutName: string;
    completedAt: string;
    durationSeconds: number;
  }>;

  loading: boolean;
  refreshing: boolean;
  error?: string;

  refresh: () => Promise<void>;
}

/**
 * Hook to provide all home dashboard data
 * Combines user profile, workout plans, session history, and calculations
 */
export function useHomeDashboard(): HomeDashboardData {
  const {user, profile} = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [inProgressSession, setInProgressSession] = useState<WorkoutSession | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  // Load completed and in-progress sessions
  const loadSessions = async () => {
    if (!user?.uid) {
      console.log('[HomeScreen] No user UID, skipping session load');
      setLoading(false);
      return;
    }

    try {
      setError(undefined);
      console.log('[HomeScreen] Loading sessions for user:', user.uid);
      
      // Fetch completed sessions
      const completedSessions = await getCompletedWorkoutSessions(user.uid);
      console.log('[HomeScreen] Loaded completed sessions:', completedSessions.length);
      setSessions(completedSessions);

      // Fetch in-progress workout
      const inProgress = await getInProgressWorkoutSession(user.uid);
      if (inProgress) {
        console.log('[HomeScreen] Found in-progress workout:', inProgress.id);
        setInProgressSession(inProgress);
      } else {
        console.log('[HomeScreen] No in-progress workout found');
        setInProgressSession(undefined);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Unable to load your workout data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load when user is authenticated and hook is mounted
    if (user?.uid) {
      loadSessions();
    } else {
      // Clear loading state if no user
      setLoading(false);
    }
  }, [user?.uid]);

  const refresh = async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    try {
      setError(undefined);
      const completedSessions = await getCompletedWorkoutSessions(user.uid);
      setSessions(completedSessions);
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
      setError('Unable to refresh your workout data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate displayName
  const displayName = profile?.name || user?.displayName || undefined;

  // Calculate greeting based on current time
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour >= 5 && hour < 12) greeting = 'Good morning';
  else if (hour >= 12 && hour < 18) greeting = 'Good afternoon';

  // Format date
  const formattedDate = formatHomeDate(now);

  // Get current weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const todayWeekday = now.getDay();
  const isRestDay = todayWeekday === 0; // Sunday

  // Find matching workout plan for the user
  let todayPlan: WorkoutPlan | undefined;
  let todayWorkout: Workout | undefined;

  if (!isRestDay && profile) {
    // Find best matching plan
    const matchingPlans = workoutPlans.filter(plan => isWorkoutPlanMatch(plan, profile));
    todayPlan = matchingPlans[0]; // Use the first (best) match

    if (todayPlan) {
      // Get workout for today's day number
      // Monday = day 1, Tuesday = day 2, etc.
      const dayNumber = todayWeekday === 0 ? 7 : todayWeekday; // 0 (Sun) becomes 7, but we already checked for Sunday above
      todayWorkout = todayPlan.workouts.find(w => w.dayNumber === dayNumber);
    }
  }

  // Check if today's workout is already completed
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let isTodayCompleted = false;
  let completedTodaySessionId: string | undefined;

  for (const session of sessions) {
    if (session.completedAt && session.planId === todayPlan?.id) {
      const sessionDate = new Date(session.completedAt);
      const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());

      if (sessionDateOnly.getTime() === todayDate.getTime()) {
        isTodayCompleted = true;
        completedTodaySessionId = session.id;
        break;
      }
    }
  }

  // Calculate weekly workout count
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  let weeklyWorkoutCount = 0;

  for (const session of sessions) {
    if (session.completedAt) {
      const sessionDate = new Date(session.completedAt);
      if (sessionDate >= weekStart && sessionDate <= weekEnd) {
        weeklyWorkoutCount++;
      }
    }
  }

  const weeklyWorkoutTarget = 6; // DailyRep plans are 6 days/week

  // Calculate current streak
  const currentStreak = calculateWorkoutStreak(sessions);

  // Get recent sessions (most recent 3)
  const recentSessions = sessions.slice(0, 3).map(session => {
    // Find the workout name from the plan
    let workoutName = 'Completed Workout';
    const plan = workoutPlans.find(p => p.id === session.planId);
    if (plan) {
      const workout = plan.workouts.find(w => w.id === session.workoutId);
      if (workout) {
        workoutName = workout.name;
      }
    }

    return {
      sessionId: session.id,
      planId: session.planId,
      workoutId: session.workoutId,
      workoutName,
      completedAt: session.completedAt || '',
      durationSeconds: session.durationSeconds || 0,
    };
  });

  // Determine subtitle
  let subtitle = 'Ready to make today count?';
  if (isRestDay) {
    subtitle = 'Recovery is part of the progress.';
  } else if (isTodayCompleted) {
    subtitle = "Nice work! You've completed today's workout.";
  }

  // Get in-progress workout name
  let inProgressWorkoutName: string | undefined = undefined;
  if (inProgressSession) {
    const inProgressPlan = workoutPlans.find(p => p.id === inProgressSession.planId);
    if (inProgressPlan) {
      const inProgressWorkout = inProgressPlan.workouts.find(w => w.id === inProgressSession.workoutId);
      if (inProgressWorkout) {
        inProgressWorkoutName = inProgressWorkout.name;
      }
    }
  }

  return {
    displayName,
    greeting,
    formattedDate,
    todayWorkout,
    todayPlan,
    isRestDay,
    isTodayCompleted,
    completedTodaySessionId,
    inProgressWorkout: inProgressSession,
    inProgressWorkoutName,
    weeklyWorkoutCount,
    weeklyWorkoutTarget,
    currentStreak,
    recentSessions,
    loading,
    refreshing,
    error,
    refresh,
  };
}
