import {calculateWorkoutStreak} from '../src/utils/progressCalculations';
import type {WorkoutSession} from '../src/types/workoutSession';

describe('calculateWorkoutStreak', () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const mockSession = (completedDate: Date): WorkoutSession => ({
    id: `session-${completedDate.getTime()}`,
    userId: 'user-1',
    planId: 'plan-1',
    workoutId: 'workout-1',
    startedAt: completedDate.toISOString(),
    completedAt: completedDate.toISOString(),
    status: 'completed',
    durationSeconds: 1800,
    exercises: [
      {
        exerciseId: 'exercise-1',
        targetSets: 3,
        targetReps: '8-10',
        restSeconds: 120,
        completedSets: [
          {setNumber: 1, reps: 10, weight: 100, completed: true},
          {setNumber: 2, reps: 9, weight: 100, completed: true},
          {setNumber: 3, reps: 8, weight: 100, completed: true},
        ],
      },
    ],
  });

  it('should return 0 for empty sessions', () => {
    expect(calculateWorkoutStreak([])).toBe(0);
  });

  it('should return 1 if only today has a workout', () => {
    const sessions = [mockSession(today)];
    expect(calculateWorkoutStreak(sessions)).toBe(1);
  });

  it('should return 1 if only yesterday has a workout', () => {
    const sessions = [mockSession(yesterday)];
    expect(calculateWorkoutStreak(sessions)).toBe(1);
  });

  it('should return 0 if latest workout is 2+ days ago', () => {
    const sessions = [mockSession(twoDaysAgo)];
    expect(calculateWorkoutStreak(sessions)).toBe(0);
  });

  it('should return 2 for consecutive workouts today and yesterday', () => {
    const sessions = [mockSession(today), mockSession(yesterday)];
    expect(calculateWorkoutStreak(sessions)).toBe(2);
  });

  it('should return 3 for three consecutive days', () => {
    const sessions = [mockSession(today), mockSession(yesterday), mockSession(twoDaysAgo)];
    expect(calculateWorkoutStreak(sessions)).toBe(3);
  });

  it('should break streak at first gap', () => {
    // Today, yesterday, skip 2 days ago, then 3 days ago
    const sessions = [mockSession(today), mockSession(yesterday), mockSession(threeDaysAgo)];
    expect(calculateWorkoutStreak(sessions)).toBe(2);
  });

  it('should group multiple same-day workouts as single day', () => {
    const sessions = [
      mockSession(today),
      mockSession(today), // Duplicate
      mockSession(yesterday),
      mockSession(twoDaysAgo),
    ];
    expect(calculateWorkoutStreak(sessions)).toBe(3);
  });

  it('should return 0 if all workouts are old and latest is 2+ days ago', () => {
    const sessions = [mockSession(weekAgo), mockSession(twoDaysAgo)];
    expect(calculateWorkoutStreak(sessions)).toBe(0);
  });
});
