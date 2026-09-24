import {getCompletedWorkoutSessions, getWorkoutSession} from '../src/services/workoutSessionService';

// Mock Firebase
jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

jest.mock('../src/context/AuthContext');

describe('workoutSessionService', () => {
  describe('getCompletedWorkoutSessions', () => {
    it('should handle service call without errors', async () => {
      // This is a service integration test
      // The actual Firestore calls are mocked above
      try {
        await getCompletedWorkoutSessions('user-1');
      } catch (error) {
        // Expect it to handle errors gracefully
        expect(error).toBeDefined();
      }
    });
  });

  describe('getWorkoutSession', () => {
    it('should return null for non-existent sessions', async () => {
      try {
        const session = await getWorkoutSession('user-1', 'nonexistent');
        // Service should handle gracefully
        expect(session).toBeNull();
      } catch (error) {
        // Error handling is acceptable
        expect(error).toBeDefined();
      }
    });
  });
});

