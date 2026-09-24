import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import type {NotificationPreferences} from '../types/notificationPreferences';
import {DEFAULT_NOTIFICATION_PREFERENCES} from '../types/notificationPreferences';

const usersCollection = 'users';

function userReference(uid: string) {
  return doc(getFirestore(), usersCollection, uid);
}

/**
 * Get notification preferences for a user.
 * Returns default preferences if none exist in Firestore.
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const snapshot = await getDoc(userReference(userId));

    if (!snapshot.exists()) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    const data = snapshot.data();
    const preferences = data?.notificationPreferences;

    if (!preferences) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    // Validate the preferences structure
    return {
      workoutRemindersEnabled:
        typeof preferences.workoutRemindersEnabled === 'boolean'
          ? preferences.workoutRemindersEnabled
          : DEFAULT_NOTIFICATION_PREFERENCES.workoutRemindersEnabled,
      reminderHour:
        typeof preferences.reminderHour === 'number'
          ? preferences.reminderHour
          : DEFAULT_NOTIFICATION_PREFERENCES.reminderHour,
      reminderMinute:
        typeof preferences.reminderMinute === 'number'
          ? preferences.reminderMinute
          : DEFAULT_NOTIFICATION_PREFERENCES.reminderMinute,
      reminderDays: Array.isArray(preferences.reminderDays)
        ? preferences.reminderDays
        : DEFAULT_NOTIFICATION_PREFERENCES.reminderDays,
    };
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

/**
 * Save notification preferences for a user.
 * Uses merge: true to preserve other user profile fields.
 */
export async function saveNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
): Promise<void> {
  try {
    await setDoc(
      userReference(userId),
      {
        notificationPreferences: {
          workoutRemindersEnabled: preferences.workoutRemindersEnabled,
          reminderHour: preferences.reminderHour,
          reminderMinute: preferences.reminderMinute,
          reminderDays: preferences.reminderDays,
        },
        updatedAt: serverTimestamp(),
      },
      {merge: true},
    );
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
    throw error;
  }
}

/**
 * Format error message for notification preferences operations
 */
export function getNotificationPreferencesErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'firestore/permission-denied':
    case 'permission-denied':
      return 'You do not have permission to save notification preferences.';
    case 'firestore/unavailable':
    case 'unavailable':
      return 'Firestore is temporarily unavailable. Check your connection and try again.';
    case 'firestore/failed-precondition':
    case 'failed-precondition':
      return 'Firestore is not ready yet. Please try again.';
    default:
      return fallback;
  }
}
