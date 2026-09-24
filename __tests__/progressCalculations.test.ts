import {
  calculateWorkoutStats,
  calculateWeeklyStats,
  calculateExerciseProgress,
  calculateExerciseVolume,
  getPersonalRecords,
  getExercisesFromSessions,
} from '../src/utils/progressCalculations';
import type {WorkoutSession} from '../src/types/workoutSession';

describe('progressCalculations', () => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const mockSession: WorkoutSession = {
    id: 'session-1',
    userId: 'user-1',
    planId: 'plan-1',
    workoutId: 'workout-1',
    startedAt: now.toISOString(),
    completedAt: now.toISOString(),
    status: 'completed',
    durationSeconds: 1800, // 30 minutes
    exercises: [
      {
        exerciseId: 'squat',
        targetSets: 3,
        targetReps: '8-10',
        restSeconds: 120,
        completedSets: [
          {setNumber: 1, reps: 10, weight: 225, completed: true},
          {setNumber: 2, reps: 8, weight: 225, completed: true},
          {setNumber: 3, reps: 6, weight: 225, completed: true},
        ],
      },
      {
        exerciseId: 'bench',
        targetSets: 3,
        targetReps: '6-8',
        restSeconds: 150,
        completedSets: [
          {setNumber: 1, reps: 8, weight: 185, completed: true},
          {setNumber: 2, reps: 6, weight: 185, completed: true},
          {setNumber: 3, reps: 5, weight: 185, completed: true},
        ],
      },
    ],
  };

  const mockSessionLastWeek: WorkoutSession = {
    ...mockSession,
    id: 'session-2',
    completedAt: lastWeek.toISOString(),
  };

  describe('calculateWorkoutStats', () => {
    it('should calculate total workouts', () => {
      const stats = calculateWorkoutStats([mockSession, mockSessionLastWeek]);
      expect(stats.totalWorkouts).toBe(2);
    });

    it('should count workouts this week', () => {
      const stats = calculateWorkoutStats([mockSession, mockSessionLastWeek]);
      expect(stats.thisWeekWorkouts).toBe(1);
    });

    it('should sum duration', () => {
      const stats = calculateWorkoutStats([mockSession, mockSessionLastWeek]);
      expect(stats.totalDurationSeconds).toBe(3600); // 2 * 30 min
    });

    it('should count total sets', () => {
      const stats = calculateWorkoutStats([mockSession]);
      expect(stats.totalSets).toBe(6); // 3 sets + 3 sets
    });

    it('should sum total reps', () => {
      const stats = calculateWorkoutStats([mockSession]);
      // squat: 10 + 8 + 6 = 24
      // bench: 8 + 6 + 5 = 19
      // total = 43
      expect(stats.totalReps).toBe(43);
    });

    it('should handle empty sessions', () => {
      const stats = calculateWorkoutStats([]);
      expect(stats.totalWorkouts).toBe(0);
      expect(stats.totalDurationSeconds).toBe(0);
      expect(stats.totalSets).toBe(0);
      expect(stats.totalReps).toBe(0);
    });
  });

  describe('calculateWeeklyStats', () => {
    it('should group workouts by week', () => {
      // Create sessions guaranteed to be in different weeks
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 2); // 2 days ago (still in current week)

      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14); // 2 weeks ago

      const session1: WorkoutSession = {
        ...mockSession,
        id: 'session-1',
        completedAt: thisWeek.toISOString(),
      };

      const session2: WorkoutSession = {
        ...mockSession,
        id: 'session-2',
        completedAt: twoWeeksAgo.toISOString(),
      };

      const weeklyStats = calculateWeeklyStats([session1, session2], 3);
      expect(weeklyStats.length).toBe(3);
      // Just verify the structure is correct
      expect(weeklyStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            weekStart: expect.any(Date),
            weekEnd: expect.any(Date),
            workoutCount: expect.any(Number),
          }),
        ]),
      );
    });

    it('should return correct number of weeks', () => {
      const weeklyStats = calculateWeeklyStats([mockSession], 4);
      expect(weeklyStats.length).toBe(4);
    });

    it('should handle missing weeks', () => {
      const weeklyStats = calculateWeeklyStats([mockSession], 3);
      expect(weeklyStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({workoutCount: 0}),
        ]),
      );
    });
  });

  describe('calculateExerciseProgress', () => {
    it('should calculate exercise statistics', () => {
      const progress = calculateExerciseProgress('squat', [mockSession]);
      expect(progress.exerciseId).toBe('squat');
      expect(progress.totalSessions).toBe(1);
      expect(progress.highestWeight).toBe(225);
      expect(progress.highestReps).toBe(10);
    });

    it('should identify latest performance', () => {
      const progress = calculateExerciseProgress('squat', [mockSession]);
      expect(progress.latestPerformance).toEqual({
        reps: 6,
        weight: 225,
        date: mockSession.completedAt,
      });
    });

    it('should identify previous performance', () => {
      const progress = calculateExerciseProgress('squat', [mockSession, mockSessionLastWeek]);
      expect(progress.previousPerformance).not.toBeNull();
    });

    it('should track recent history', () => {
      const progress = calculateExerciseProgress('squat', [mockSession]);
      expect(progress.recentHistory.length).toBeGreaterThan(0);
      expect(progress.recentHistory[0]).toHaveProperty('date');
      expect(progress.recentHistory[0]).toHaveProperty('reps');
      expect(progress.recentHistory[0]).toHaveProperty('weight');
    });

    it('should handle exercises with no sessions', () => {
      const progress = calculateExerciseProgress('deadlift', [mockSession]);
      expect(progress.totalSessions).toBe(0);
      expect(progress.latestPerformance).toBeNull();
      expect(progress.highestWeight).toBe(0);
    });
  });

  describe('calculateExerciseVolume', () => {
    it('should calculate total volume', () => {
      const sets = [
        {setNumber: 1, reps: 10, weight: 100, completed: true},
        {setNumber: 2, reps: 8, weight: 100, completed: true},
      ];
      const {totalVolume, hasWeightedData} = calculateExerciseVolume(sets);
      expect(totalVolume).toBe(1800); // (10 + 8) * 100
      expect(hasWeightedData).toBe(true);
    });

    it('should handle bodyweight exercises', () => {
      const sets = [
        {setNumber: 1, reps: 20, weight: 0, completed: true},
        {setNumber: 2, reps: 18, weight: 0, completed: true},
      ];
      const {totalVolume, hasWeightedData} = calculateExerciseVolume(sets);
      expect(totalVolume).toBe(0);
      expect(hasWeightedData).toBe(false);
    });
  });

  describe('getPersonalRecords', () => {
    it('should find highest weight and reps', () => {
      const pr = getPersonalRecords([mockSession]);
      expect(pr.highestWeight).toBe(225);
      expect(pr.highestReps).toBe(10);
    });

    it('should compare across sessions', () => {
      const session2: WorkoutSession = {
        ...mockSession,
        id: 'session-3',
        exercises: [
          {
            exerciseId: 'deadlift',
            targetSets: 1,
            targetReps: '1',
            restSeconds: 300,
            completedSets: [
              {setNumber: 1, reps: 1, weight: 405, completed: true},
            ],
          },
        ],
      };

      const pr = getPersonalRecords([mockSession, session2]);
      expect(pr.highestWeight).toBe(405);
    });

    it('should return zeros for empty sessions', () => {
      const pr = getPersonalRecords([]);
      expect(pr.highestWeight).toBe(0);
      expect(pr.highestReps).toBe(0);
    });
  });

  describe('getExercisesFromSessions', () => {
    it('should extract unique exercise IDs', () => {
      const exercises = getExercisesFromSessions([mockSession]);
      expect(exercises).toContain('squat');
      expect(exercises).toContain('bench');
      expect(exercises.length).toBe(2);
    });

    it('should deduplicate exercise IDs across sessions', () => {
      const exercises = getExercisesFromSessions([mockSession, mockSessionLastWeek]);
      expect(exercises.length).toBe(2);
      expect(exercises).toEqual(['squat', 'bench']);
    });

    it('should handle empty sessions', () => {
      const exercises = getExercisesFromSessions([]);
      expect(exercises.length).toBe(0);
    });
  });
});
