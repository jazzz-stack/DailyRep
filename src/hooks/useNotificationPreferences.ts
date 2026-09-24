import {useCallback, useEffect, useState} from 'react';
import {requestNotificationPermission} from '../services/notificationService';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  getNotificationPreferencesErrorMessage,
} from '../services/notificationPreferencesService';
import {rescheduleWorkoutReminders} from '../services/workoutReminderService';
import type {NotificationPreferences} from '../types/notificationPreferences';
import {DEFAULT_NOTIFICATION_PREFERENCES} from '../types/notificationPreferences';
import type {UserProfile} from '../types/profile';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  updatePreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
  toggleReminders: () => Promise<void>;
  updateTime: (hour: number, minute: number) => Promise<void>;
  toggleDay: (day: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useNotificationPreferences(
  userId: string | null,
  userProfile: UserProfile | null,
): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences on mount and when userId changes
  useEffect(() => {
    if (!userId) {
      setPreferences(null);
      setIsLoading(false);
      return;
    }

    loadPreferences(userId);
  }, [userId]);

  const loadPreferences = async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const loaded = await getNotificationPreferences(uid);
      setPreferences(loaded);
    } catch (err) {
      const message = getNotificationPreferencesErrorMessage(
        err,
        'Failed to load notification preferences.',
      );
      setError(message);
      setPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      if (!userId || !preferences) {
        setError('User not authenticated or preferences not loaded.');
        return;
      }

      const newPreferences: NotificationPreferences = {
        ...preferences,
        ...updates,
      };

      // Validate: at least one day if reminders enabled
      if (newPreferences.workoutRemindersEnabled && newPreferences.reminderDays.length === 0) {
        setError('Select at least one workout reminder day.');
        return;
      }

      try {
        setIsSaving(true);
        setError(null);

        // Save to Firestore
        await saveNotificationPreferences(userId, newPreferences);

        // Update local state
        setPreferences(newPreferences);

        // Reschedule reminders
        await rescheduleWorkoutReminders(newPreferences, userProfile);

        console.log('Notification preferences updated and reminders rescheduled');
      } catch (err) {
        const message = getNotificationPreferencesErrorMessage(
          err,
          'Failed to save notification preferences.',
        );
        setError(message);
        // Revert to previous state on error
        setPreferences(preferences);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, preferences, userProfile],
  );

  const toggleReminders = useCallback(async () => {
    if (!preferences) return;

    const newEnabled = !preferences.workoutRemindersEnabled;

    // If enabling, request permission first
    if (newEnabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setError('Notifications are disabled. Enable notifications in your device settings to receive workout reminders.');
        return;
      }
    }

    await updatePreferences({
      workoutRemindersEnabled: newEnabled,
    });
  }, [preferences, updatePreferences]);

  const updateTime = useCallback(
    async (hour: number, minute: number) => {
      await updatePreferences({
        reminderHour: hour,
        reminderMinute: minute,
      });
    },
    [updatePreferences],
  );

  const toggleDay = useCallback(
    async (day: number) => {
      if (!preferences) return;

      const currentDays = preferences.reminderDays;
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort((a, b) => a - b);

      await updatePreferences({
        reminderDays: newDays,
      });
    },
    [preferences, updatePreferences],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    await loadPreferences(userId);
  }, [userId]);

  return {
    preferences,
    isLoading,
    error,
    isSaving,
    updatePreferences,
    toggleReminders,
    updateTime,
    toggleDay,
    refresh,
  };
}
