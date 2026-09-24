import {describe, it, expect, beforeEach, jest} from '@jest/globals';
import type {WorkoutSession} from '../src/types/workoutSession';
import {
  saveCompletedWorkoutSession,
  getLatestExercisePerformance,
  getWorkoutSessionErrorMessage,
} from '../src/services/workoutSessionService';

// Mock Firestore
jest.mock('@react-native-firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  getFirestore: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(() => new Date().toISOString()),
  setDoc: jest.fn(),
  where: jest.fn(),
}));

describe('workoutSessionService', () => {
  const mockSession: WorkoutSession = {
    id: 'session-1',
    userId: 'user-1',
    planId: 'plan-1',
    workoutId: 'workout-1',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed',
    exercises: [
      {
        exerciseId: 'push-up',
        targetSets: 3,
        targetReps: '10-12',
        restSeconds: 60,
        completedSets: [
          {setNumber: 1, reps: 12, weight: 0, completed: true},
          {setNumber: 2, reps: 11, weight: 0, completed: true},
          {setNumber: 3, reps: 10, weight: 0, completed: true},
        ],
      },
    ],
    durationSeconds: 600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveCompletedWorkoutSession', () => {
    it('should save workout session with completion timestamp', async () => {
      const {setDoc} = require('@react-native-firebase/firestore');
      setDoc.mockResolvedValue(undefined);

      await saveCompletedWorkoutSession('user-1', mockSession);

      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('getLatestExercisePerformance', () => {
    it('should return latest exercise performance', async () => {
      const {getDocs} = require('@react-native-firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [
          {
            data: () => mockSession,
          },
        ],
      });

      const result = await getLatestExercisePerformance('user-1', 'push-up');

      expect(result).not.toBeNull();
      expect(result?.reps).toBe(10);
      expect(result?.weight).toBe(0);
    });

    it('should return null when no sessions found', async () => {
      const {getDocs} = require('@react-native-firebase/firestore');
      getDocs.mockResolvedValue({docs: []});

      const result = await getLatestExercisePerformance('user-1', 'push-up');

      expect(result).toBeNull();
    });

    it('should handle error gracefully', async () => {
      const {getDocs} = require('@react-native-firebase/firestore');
      getDocs.mockRejectedValue(new Error('Firestore error'));

      const result = await getLatestExercisePerformance('user-1', 'push-up');

      expect(result).toBeNull();
    });
  });

  describe('getWorkoutSessionErrorMessage', () => {
    it('should return permission denied message for permission error', () => {
      const error = {code: 'permission-denied'};
      const message = getWorkoutSessionErrorMessage(error, 'fallback');

      expect(message).toContain('permission');
    });

    it('should return unavailable message for firestore unavailable error', () => {
      const error = {code: 'firestore/unavailable'};
      const message = getWorkoutSessionErrorMessage(error, 'fallback');

      expect(message).toContain('temporarily unavailable');
    });

    it('should return fallback message for unknown error', () => {
      const error = {code: 'unknown-error'};
      const fallback = 'custom fallback';
      const message = getWorkoutSessionErrorMessage(error, fallback);

      expect(message).toBe(fallback);
    });

    it('should handle non-error objects', () => {
      const fallback = 'custom fallback';
      const message = getWorkoutSessionErrorMessage('string error', fallback);

      expect(message).toBe(fallback);
    });
  });
});
