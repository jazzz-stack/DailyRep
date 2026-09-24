export interface NotificationPreferences {
  workoutRemindersEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  reminderDays: number[]; // 0=Sunday, 1=Monday, ... 6=Saturday
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  workoutRemindersEnabled: true,
  reminderHour: 18,
  reminderMinute: 0,
  reminderDays: [1, 2, 3, 4, 5, 6], // Monday-Saturday (no Sunday by default)
};

export type NotificationType = 'workout_reminder' | 'workout_completed';

export type WorkoutReminderData = {
  type: 'workout_reminder';
  [key: string]: string | number | object;
};

export type WorkoutCompletionData = {
  type: 'workout_completed';
  sessionId: string;
  [key: string]: string;
};

export type NotificationData = WorkoutReminderData | WorkoutCompletionData;
