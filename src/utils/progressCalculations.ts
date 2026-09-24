import type {WorkoutSession, WorkoutSessionExercise, CompletedSet} from '../types/workoutSession';
import type {Workout} from '../types/workout';
import {getWeekStart, getWeekEnd, getWeekStartByOffset} from './dateUtils';

export interface WorkoutStats {
  totalWorkouts: number;
  thisWeekWorkouts: number;
  totalDurationSeconds: number;
  totalSets: number;
  totalReps: number;
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  workoutCount: number;
  totalDurationSeconds: number;
}

export interface ExerciseStats {
  exerciseId: string;
  totalSessions: number;
  latestPerformance: {reps: number; weight: number; date: string} | null;
  previousPerformance: {reps: number; weight: number; date: string} | null;
  highestWeight: number;
  highestReps: number;
  recentHistory: Array<{date: string; reps: number; weight: number}>;
}

export interface PersonalRecords {
  highestWeight: number;
  highestReps: number;
}

/**
 * Calculate overall workout statistics from completed sessions
 */
export function calculateWorkoutStats(sessions: WorkoutSession[]): WorkoutStats {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);

  let totalDurationSeconds = 0;
  let thisWeekWorkouts = 0;
  let totalSets = 0;
  let totalReps = 0;

  for (const session of sessions) {
    // Duration
    if (session.durationSeconds) {
      totalDurationSeconds += session.durationSeconds;
    }

    // This week workouts
    if (session.completedAt) {
      const completedDate = new Date(session.completedAt);
      if (completedDate >= weekStart && completedDate <= weekEnd) {
        thisWeekWorkouts += 1;
      }
    }

    // Sets and reps
    for (const exercise of session.exercises) {
      totalSets += exercise.completedSets.length;
      for (const set of exercise.completedSets) {
        totalReps += set.reps;
      }
    }
  }

  return {
    totalWorkouts: sessions.length,
    thisWeekWorkouts,
    totalDurationSeconds,
    totalSets,
    totalReps,
  };
}

/**
 * Group sessions by week and calculate stats for each week
 */
export function calculateWeeklyStats(sessions: WorkoutSession[], weeksBack: number = 4): WeeklyStats[] {
  const weeklyMap = new Map<number, {workouts: number; duration: number}>();

  for (const session of sessions) {
    if (!session.completedAt) continue;

    const completedDate = new Date(session.completedAt);
    const weekStart = getWeekStart(completedDate);
    const weekKey = weekStart.getTime();

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {workouts: 0, duration: 0});
    }

    const current = weeklyMap.get(weekKey)!;
    current.workouts += 1;
    if (session.durationSeconds) {
      current.duration += session.durationSeconds;
    }
  }

  // Create array of last N weeks
  const result: WeeklyStats[] = [];
  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = getWeekStartByOffset(-i);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekKey = weekStart.getTime();

    const stats = weeklyMap.get(weekKey);
    result.push({
      weekStart,
      weekEnd,
      workoutCount: stats?.workouts ?? 0,
      totalDurationSeconds: stats?.duration ?? 0,
    });
  }

  return result;
}

/**
 * Calculate statistics for a specific exercise from completed sessions
 */
export function calculateExerciseProgress(
  exerciseId: string,
  sessions: WorkoutSession[],
  maxHistory: number = 10,
): ExerciseStats {
  const exerciseSessions: Array<{date: string; sets: CompletedSet[]}> = [];

  for (const session of sessions) {
    if (!session.completedAt) continue;

    const exercise = session.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise && exercise.completedSets.length > 0) {
      exerciseSessions.push({
        date: session.completedAt,
        sets: exercise.completedSets,
      });
    }
  }

  let latestPerformance: {reps: number; weight: number; date: string} | null = null;
  let previousPerformance: {reps: number; weight: number; date: string} | null = null;
  let highestWeight = 0;
  let highestReps = 0;
  const recentHistory: Array<{date: string; reps: number; weight: number}> = [];

  for (let i = 0; i < exerciseSessions.length; i++) {
    const {date, sets} = exerciseSessions[i];
    if (sets.length === 0) continue;

    // Get the last set as representative performance
    const lastSet = sets[sets.length - 1];

    // Track highest weight and reps
    for (const set of sets) {
      highestWeight = Math.max(highestWeight, set.weight);
      highestReps = Math.max(highestReps, set.reps);
    }

    // Latest and previous
    if (i === 0) {
      latestPerformance = {reps: lastSet.reps, weight: lastSet.weight, date};
    } else if (i === 1) {
      previousPerformance = {reps: lastSet.reps, weight: lastSet.weight, date};
    }

    // Recent history (most recent first)
    if (recentHistory.length < maxHistory) {
      recentHistory.push({date, reps: lastSet.reps, weight: lastSet.weight});
    }
  }

  return {
    exerciseId,
    totalSessions: exerciseSessions.length,
    latestPerformance,
    previousPerformance,
    highestWeight,
    highestReps,
    recentHistory,
  };
}

/**
 * Calculate volume for a specific exercise session
 * Volume = reps × weight (only for weighted exercises)
 */
export function calculateExerciseVolume(
  sets: CompletedSet[],
): {totalVolume: number; hasWeightedData: boolean} {
  let totalVolume = 0;
  let hasWeightedData = false;

  for (const set of sets) {
    if (set.weight > 0) {
      hasWeightedData = true;
      totalVolume += set.reps * set.weight;
    }
  }

  return {totalVolume, hasWeightedData};
}

/**
 * Get personal records from a collection of sessions
 */
export function getPersonalRecords(sessions: WorkoutSession[]): PersonalRecords {
  let highestWeight = 0;
  let highestReps = 0;

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.completedSets) {
        highestWeight = Math.max(highestWeight, set.weight);
        highestReps = Math.max(highestReps, set.reps);
      }
    }
  }

  return {highestWeight, highestReps};
}

/**
 * Get unique exercises that appear in completed sessions
 */
export function getExercisesFromSessions(sessions: WorkoutSession[]): string[] {
  const exerciseSet = new Set<string>();

  for (const session of sessions) {
    for (const exercise of session.exercises) {
      exerciseSet.add(exercise.exerciseId);
    }
  }

  return Array.from(exerciseSet);
}

/**
 * Calculate consecutive workout days streak
 * A "day" in the streak is a calendar date with at least one completed workout.
 * Returns 0 if no workouts or last workout was more than 1 day ago.
 */
export function calculateWorkoutStreak(sessions: WorkoutSession[]): number {
  if (sessions.length === 0) return 0;

  // Get unique dates with completed workouts, sorted by date descending (newest first)
  const datesWithWorkouts = new Set<number>();
  for (const session of sessions) {
    if (session.completedAt) {
      const date = new Date(session.completedAt);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      datesWithWorkouts.add(dateOnly.getTime());
    }
  }

  if (datesWithWorkouts.size === 0) return 0;

  // Sort dates descending (newest first)
  const sortedDates = Array.from(datesWithWorkouts).sort((a, b) => b - a);

  // Check if latest workout is today or yesterday
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const latestDate = new Date(sortedDates[0]);

  // If latest workout is more than 1 day ago, streak is broken
  const daysSinceLatest = Math.floor((todayOnly.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceLatest > 1) return 0;

  // Count consecutive days from latest date
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1]);
    const previousDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      streak++;
    } else {
      break; // Streak broken
    }
  }

  return streak;
}
