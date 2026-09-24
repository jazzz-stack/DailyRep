import notifee, {
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import type {NotificationPreferences, WorkoutReminderData} from '../types/notificationPreferences';
import {workoutPlans} from '../data/workoutPlans';
import type {UserProfile} from '../types/profile';

const REMINDER_CHANNEL_ID = 'default';
const REMINDER_ID_PREFIX = 'dailyrep-workout-reminder';

/**
 * Generate deterministic reminder ID for a specific weekday
 */
export function generateReminderId(weekday: number): string {
  return `${REMINDER_ID_PREFIX}-${weekday}`;
}

/**
 * Get the notification title and data for a workout reminder
 */
function getWorkoutReminderContent(
  profile: UserProfile | null,
): {title: string; body: string; data: WorkoutReminderData} {
  // Try to determine today's workout
  if (profile) {
    const dayOfWeek = new Date().getDay(); // 0=Sunday, 1=Monday, etc.

    // Check if there's a workout for today
    const matchedPlans = workoutPlans.filter(
      plan =>
        plan.goal === profile.fitnessGoal &&
        plan.level === profile.fitnessLevel &&
        plan.location === profile.workoutPreference,
    );

    if (matchedPlans.length > 0) {
      const plan = matchedPlans[0];
      // Find workout for today (1-6 for Mon-Sat, 0 means no workout on Sunday)
      const todayWorkout = plan.workouts.find(w => w.dayNumber === dayOfWeek);

      if (todayWorkout) {
        return {
          title: `${todayWorkout.name} 💪`,
          body: `Your ${todayWorkout.name} workout is scheduled for today.`,
          data: {
            type: 'workout_reminder',
            planId: plan.id,
            workoutId: todayWorkout.id,
          },
        };
      }
    }
  }

  // Fallback to generic message
  return {
    title: 'DailyRep Workout 💪',
    body: "It's time for your workout!",
    data: {
      type: 'workout_reminder',
    },
  };
}

/**
 * Schedule workout reminders based on preferences
 */
export async function scheduleWorkoutReminders(
  preferences: NotificationPreferences,
  profile: UserProfile | null = null,
): Promise<void> {
  if (!preferences.workoutRemindersEnabled || preferences.reminderDays.length === 0) {
    // Don't schedule if disabled or no days selected
    return;
  }

  try {
    // Cancel existing reminders first
    await cancelWorkoutReminders();

    const {title, body, data} = getWorkoutReminderContent(profile);

    // Schedule reminder for each selected day
    for (const dayOfWeek of preferences.reminderDays) {
      const reminderId = generateReminderId(dayOfWeek);

      // Calculate next occurrence of this day
      const nextDate = getNextOccurrenceOfDay(dayOfWeek, preferences.reminderHour, preferences.reminderMinute);

      // Create trigger for this reminder (weekly repeat)
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: nextDate.getTime(),
        repeatFrequency: RepeatFrequency.WEEKLY,
      };

      await notifee.createTriggerNotification(
        {
          id: reminderId,
          title,
          body,
          android: {
            channelId: REMINDER_CHANNEL_ID,
            pressAction: {
              id: 'default',
            },
          },
          data,
        },
        trigger,
      );

      console.log(`Scheduled workout reminder for ${getDayName(dayOfWeek)} at ${preferences.reminderHour}:${String(preferences.reminderMinute).padStart(2, '0')}`);
    }
  } catch (error) {
    console.error('Failed to schedule workout reminders:', error);
    throw error;
  }
}

/**
 * Cancel all scheduled workout reminders
 */
export async function cancelWorkoutReminders(): Promise<void> {
  try {
    // Cancel reminders for all 7 days
    for (let day = 0; day < 7; day++) {
      const reminderId = generateReminderId(day);
      try {
        await notifee.cancelNotification(reminderId);
      } catch {
        // Notification might not exist, that's fine
      }
    }
    console.log('Cancelled all workout reminders');
  } catch (error) {
    console.error('Failed to cancel workout reminders:', error);
    throw error;
  }
}

/**
 * Reschedule reminders after preference changes
 */
export async function rescheduleWorkoutReminders(
  preferences: NotificationPreferences,
  profile: UserProfile | null = null,
): Promise<void> {
  // Cancel old schedule
  await cancelWorkoutReminders();

  // Schedule new reminders
  if (preferences.workoutRemindersEnabled && preferences.reminderDays.length > 0) {
    await scheduleWorkoutReminders(preferences, profile);
  }
}

/**
 * Get the next occurrence of a specific day of week at a specific time
 */
function getNextOccurrenceOfDay(dayOfWeek: number, hour: number, minute: number): Date {
  const now = new Date();
  const today = now.getDay();

  let daysUntil = dayOfWeek - today;

  // If the day has already passed this week, schedule for next week
  if (daysUntil < 0 || (daysUntil === 0 && (now.getHours() > hour || (now.getHours() === hour && now.getMinutes() >= minute)))) {
    daysUntil += 7;
  }

  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + daysUntil);
  nextDate.setHours(hour, minute, 0, 0);

  return nextDate;
}

/**
 * Get the name of a day from its number
 */
function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
}
