import {
  scheduleWorkoutReminders,
  cancelWorkoutReminders,
  rescheduleWorkoutReminders,
  generateReminderId,
} from '../src/services/workoutReminderService';
import type {NotificationPreferences} from '../src/types/notificationPreferences';

// Mock notifee module
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createTriggerNotification: jest.fn(),
    cancelNotification: jest.fn(),
    requestPermission: jest.fn(),
  },
  TriggerType: {
    TIMESTAMP: 0,
  },
  RepeatFrequency: {
    WEEKLY: 604800000,
  },
}));

import notifee from '@notifee/react-native';

describe('workoutReminderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks for each test
    const mockNotifee = notifee as jest.Mocked<typeof notifee>;
    mockNotifee.createTriggerNotification.mockResolvedValue('notification-id');
    mockNotifee.cancelNotification.mockResolvedValue(undefined);
  });

  describe('generateReminderId', () => {
    it('should generate deterministic reminder IDs', () => {
      const id0 = generateReminderId(0);
      const id1 = generateReminderId(1);
      const id6 = generateReminderId(6);

      expect(id0).toBe('dailyrep-workout-reminder-0');
      expect(id1).toBe('dailyrep-workout-reminder-1');
      expect(id6).toBe('dailyrep-workout-reminder-6');
    });

    it('should generate same ID for same weekday', () => {
      const id1 = generateReminderId(1);
      const id1Again = generateReminderId(1);

      expect(id1).toBe(id1Again);
    });
  });

  describe('scheduleWorkoutReminders', () => {
    it('should not schedule if reminders are disabled', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: false,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2, 3, 4, 5, 6],
      };

      await scheduleWorkoutReminders(preferences);

      expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
    });

    it('should not schedule if no days selected', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [],
      };

      await scheduleWorkoutReminders(preferences);

      expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
    });

    it('should cancel existing reminders before scheduling', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2],
      };

      await scheduleWorkoutReminders(preferences);

      // Should cancel all 7 days
      expect(mockNotifee.cancelNotification).toHaveBeenCalledTimes(7);
      expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('dailyrep-workout-reminder-0');
      expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('dailyrep-workout-reminder-6');
    });

    it('should schedule reminders for selected days', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2, 3],
      };

      await scheduleWorkoutReminders(preferences);

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledTimes(3);

      // Check Monday (1)
      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'dailyrep-workout-reminder-1',
        }),
        expect.objectContaining({
          type: expect.any(Number),
        }),
      );
    });

    it('should include generic notification data if no profile', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1],
      };

      await scheduleWorkoutReminders(preferences, null);

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            type: 'workout_reminder',
          },
        }),
        expect.anything(),
      );
    });

    it('should throw error on notification failure', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      mockNotifee.createTriggerNotification.mockRejectedValueOnce(
        new Error('Notifee error'),
      );

      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1],
      };

      await expect(scheduleWorkoutReminders(preferences)).rejects.toThrow();
    });
  });

  describe('cancelWorkoutReminders', () => {
    it('should cancel reminders for all 7 days', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      await cancelWorkoutReminders();

      expect(mockNotifee.cancelNotification).toHaveBeenCalledTimes(7);
      for (let day = 0; day < 7; day++) {
        expect(mockNotifee.cancelNotification).toHaveBeenCalledWith(
          `dailyrep-workout-reminder-${day}`,
        );
      }
    });

    it('should continue cancelling even if some fail', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      mockNotifee.cancelNotification
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValue(undefined);

      await cancelWorkoutReminders();

      // Should attempt all 7 cancellations even though one failed
      expect(mockNotifee.cancelNotification).toHaveBeenCalledTimes(7);
    });
  });

  describe('rescheduleWorkoutReminders', () => {
    it('should cancel old reminders and schedule new ones', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2],
      };

      await rescheduleWorkoutReminders(preferences);

      // Verify reschedule called cancel (7 times for all days)
      expect(mockNotifee.cancelNotification).toHaveBeenCalled();
      const cancelCalls = (mockNotifee.cancelNotification as jest.Mock).mock.calls.length;
      expect(cancelCalls).toBeGreaterThanOrEqual(7);

      // Verify schedule was called for new reminders
      expect(mockNotifee.createTriggerNotification).toHaveBeenCalled();
      const createCalls = (mockNotifee.createTriggerNotification as jest.Mock).mock.calls.length;
      expect(createCalls).toBeGreaterThanOrEqual(2);
    });

    it('should cancel reminders if disabling', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: false,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1, 2],
      };

      await rescheduleWorkoutReminders(preferences);

      // Should cancel all 7
      expect(mockNotifee.cancelNotification).toHaveBeenCalled();

      // Should not schedule any new ones
      const createCalls = (mockNotifee.createTriggerNotification as jest.Mock).mock.calls.length;
      expect(createCalls).toBe(0);
    });
  });

  describe('Notification content', () => {
    it('should format reminder notifications correctly', async () => {
      const mockNotifee = notifee as jest.Mocked<typeof notifee>;
      const preferences: NotificationPreferences = {
        workoutRemindersEnabled: true,
        reminderHour: 18,
        reminderMinute: 0,
        reminderDays: [1],
      };

      await scheduleWorkoutReminders(preferences);

      expect(mockNotifee.createTriggerNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.any(String),
          body: expect.any(String),
          android: expect.objectContaining({
            channelId: 'default',
            pressAction: expect.objectContaining({
              id: 'default',
            }),
          }),
        }),
        expect.anything(),
      );
    });
  });
});
