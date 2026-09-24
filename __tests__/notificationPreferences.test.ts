import {getNotificationPreferences, saveNotificationPreferences} from '../src/services/notificationPreferencesService';
import {DEFAULT_NOTIFICATION_PREFERENCES} from '../src/types/notificationPreferences';
import * as firestore from '@react-native-firebase/firestore';

jest.mock('@react-native-firebase/firestore');

describe('notificationPreferencesService', () => {
  const mockUserId = 'test-user-123';
  const mockFirestore = {
    collection: jest.fn(),
    doc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mocks for Firestore
    (firestore.getFirestore as jest.Mock).mockReturnValue(mockFirestore);
    (firestore.doc as jest.Mock).mockImplementation((db, ...path) => ({
      path: path.join('/'),
    }));
    (firestore.setDoc as jest.Mock).mockResolvedValue(undefined);
    (firestore.getDoc as jest.Mock).mockResolvedValue({
      exists: () => false,
    });
  });

  describe('getNotificationPreferences', () => {
    it('should return default preferences if document does not exist', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const preferences = await getNotificationPreferences(mockUserId);

      expect(preferences).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
    });

    it('should return stored preferences if they exist', async () => {
      const storedPreferences = {
        workoutRemindersEnabled: false,
        reminderHour: 19,
        reminderMinute: 30,
        reminderDays: [1, 3, 5],
      };

      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          notificationPreferences: storedPreferences,
        }),
      });

      const preferences = await getNotificationPreferences(mockUserId);

      expect(preferences).toEqual(storedPreferences);
    });

    it('should validate and return defaults for invalid fields', async () => {
      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          notificationPreferences: {
            workoutRemindersEnabled: 'invalid',
            reminderHour: 'not-a-number',
            reminderMinute: null,
            reminderDays: 'not-an-array',
          },
        }),
      });

      const preferences = await getNotificationPreferences(mockUserId);

      expect(preferences.workoutRemindersEnabled).toBe(DEFAULT_NOTIFICATION_PREFERENCES.workoutRemindersEnabled);
      expect(preferences.reminderHour).toBe(DEFAULT_NOTIFICATION_PREFERENCES.reminderHour);
    });

    it('should return default preferences if retrieval fails', async () => {
      (firestore.getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

      const preferences = await getNotificationPreferences(mockUserId);

      expect(preferences).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
    });
  });

  describe('saveNotificationPreferences', () => {
    it('should save preferences to Firestore with merge:true', async () => {
      const preferencesToSave = {
        workoutRemindersEnabled: true,
        reminderHour: 20,
        reminderMinute: 15,
        reminderDays: [2, 4, 6],
      };

      await saveNotificationPreferences(mockUserId, preferencesToSave);

      expect(firestore.setDoc).toHaveBeenCalled();
      
      // Check that it was called with merge:true
      const calls = (firestore.setDoc as jest.Mock).mock.calls;
      expect(calls[0][2]).toEqual({merge: true});
      
      // Check that the data includes notificationPreferences
      const dataArg = calls[0][1];
      expect(dataArg.notificationPreferences).toEqual(preferencesToSave);
    });

    it('should throw error if save fails', async () => {
      (firestore.setDoc as jest.Mock).mockRejectedValue(new Error('Permission denied'));

      const preferencesToSave = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2, 3],
      };

      await expect(saveNotificationPreferences(mockUserId, preferencesToSave)).rejects.toThrow();
    });

    it('should preserve other user fields with merge operation', async () => {
      const newPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2, 3, 4, 5, 6],
      };

      await saveNotificationPreferences(mockUserId, newPreferences);

      // Verify merge:true is used
      const calls = (firestore.setDoc as jest.Mock).mock.calls;
      expect(calls[0][2]).toEqual({merge: true});
    });
  });

  describe('Preferences validation', () => {
    it('should handle preferences with all 7 days selected', async () => {
      const allDaysPrefs = {
        workoutRemindersEnabled: true,
        reminderHour: 6,
        reminderMinute: 0,
        reminderDays: [0, 1, 2, 3, 4, 5, 6],
      };

      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({notificationPreferences: allDaysPrefs}),
      });

      const preferences = await getNotificationPreferences(mockUserId);

      expect(preferences.reminderDays).toHaveLength(7);
      expect(preferences.reminderDays).toContain(0);
      expect(preferences.reminderDays).toContain(6);
    });

    it('should handle preferences with no days selected', async () => {
      const noDaysPrefs = {
        workoutRemindersEnabled: false,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [],
      };

      (firestore.getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({notificationPreferences: noDaysPrefs}),
      });

      const preferences = await getNotificationPreferences(mockUserId);

      expect(preferences.reminderDays).toHaveLength(0);
    });
  });
});
