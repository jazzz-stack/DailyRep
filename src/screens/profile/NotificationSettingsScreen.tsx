import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useAuth} from '../../context/AuthContext';
import {useNotificationPreferences} from '../../hooks/useNotificationPreferences';
import type {MainStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<MainStackParamList, 'NotificationSettings'>;

const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function NotificationSettingsScreen({}: Props) {
  const {user, profile} = useAuth();
  const {
    preferences,
    isLoading,
    error,
    isSaving,
    toggleReminders,
    updateTime,
    toggleDay,
  } = useNotificationPreferences(user?.uid ?? null, profile ?? null);

  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showMinutePicker, setShowMinutePicker] = useState(false);

  useEffect(() => {
    if (preferences) {
      setHour(preferences.reminderHour);
      setMinute(preferences.reminderMinute);
    }
  }, [preferences]);

  const handleTimeChange = async () => {
    await updateTime(hour, minute);
  };

  const handleToggleDay = async (day: number) => {
    try {
      await toggleDay(day);
    } catch (err) {
      Alert.alert('Error', 'Failed to update reminder days.');
    }
  };

  const handleToggleReminders = async () => {
    try {
      await toggleReminders();
    } catch (err) {
      // Error is already shown via error state
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#37734F" size="large" />
      </View>
    );
  }

  if (!preferences) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Unable to load notification settings.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Reminders Toggle Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workout Reminders</Text>
          <Switch
            value={preferences.workoutRemindersEnabled}
            onValueChange={handleToggleReminders}
            disabled={isSaving}
            trackColor={{false: '#C5D7CB', true: '#B8E986'}}
            thumbColor="#10211B"
            accessibilityRole="switch"
            accessibilityLabel="Toggle workout reminders"
            accessibilityState={{checked: preferences.workoutRemindersEnabled}}
          />
        </View>
        <Text style={styles.sectionDescription}>
          {preferences.workoutRemindersEnabled
            ? 'You will receive workout reminders on selected days.'
            : 'Reminders are disabled. Enable to receive workout notifications.'}
        </Text>
      </View>

      {/* Time Section */}
      {preferences.workoutRemindersEnabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Time</Text>
            <View style={styles.timeContainer}>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowHourPicker(true)}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={`Reminder hour: ${String(hour).padStart(2, '0')}`}
              >
                <Text style={styles.timeValue}>{String(hour).padStart(2, '0')}</Text>
              </Pressable>
              <Text style={styles.timeSeparator}>:</Text>
              <Pressable
                style={styles.timeButton}
                onPress={() => setShowMinutePicker(true)}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel={`Reminder minute: ${String(minute).padStart(2, '0')}`}
              >
                <Text style={styles.timeValue}>{String(minute).padStart(2, '0')}</Text>
              </Pressable>
            </View>
            <Text style={styles.timeHelp}>Tap to change reminder time</Text>
          </View>

          {/* Days Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reminder Days</Text>
            <View style={styles.daysContainer}>
              {dayLabels.map((day, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.dayButton,
                    preferences.reminderDays.includes(index) && styles.dayButtonSelected,
                  ]}
                  onPress={() => handleToggleDay(index)}
                  disabled={isSaving}
                  accessibilityRole="checkbox"
                  accessibilityLabel={day}
                  accessibilityState={{checked: preferences.reminderDays.includes(index)}}
                >
                  <View
                    style={[
                      styles.dayCheckbox,
                      preferences.reminderDays.includes(index) && styles.dayCheckboxSelected,
                    ]}
                  >
                    {preferences.reminderDays.includes(index) && (
                      <Text style={styles.dayCheckmark}>✓</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      preferences.reminderDays.includes(index) && styles.dayLabelSelected,
                    ]}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </View>
            {preferences.reminderDays.length === 0 && (
              <Text style={styles.validationError}>
                Select at least one day to enable reminders.
              </Text>
            )}
          </View>
        </>
      )}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>ℹ️ About Reminders</Text>
        <Text style={styles.infoText}>
          • Reminders are scheduled for your selected days and time.{'\n'}
          • The app uses your device's local timezone.{'\n'}
          • Sunday is typically a rest day. Reminders are not scheduled for Sunday by default.{'\n'}
          • Reminders work even when the app is closed.
        </Text>
      </View>

      {/* Hour Picker Modal */}
      <Modal
        transparent
        visible={showHourPicker}
        animationType="slide"
        onRequestClose={() => setShowHourPicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setShowHourPicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.pickerTitle}>Select Hour</Text>
            <View style={styles.pickerOptions}>
              {Array.from({length: 24}, (_, i) => (
                <Pressable
                  key={i}
                  style={[styles.pickerOption, hour === i && styles.pickerOptionSelected]}
                  onPress={async () => {
                    setHour(i);
                    await updateTime(i, minute);
                    setShowHourPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      hour === i && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {String(i).padStart(2, '0')}:00
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Minute Picker Modal */}
      <Modal
        transparent
        visible={showMinutePicker}
        animationType="slide"
        onRequestClose={() => setShowMinutePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={() => setShowMinutePicker(false)}>
                <Text style={styles.pickerDone}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.pickerTitle}>Select Minute</Text>
            <View style={styles.pickerOptions}>
              {Array.from({length: 60}, (_, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.pickerOption,
                    minute === i && styles.pickerOptionSelected,
                  ]}
                  onPress={async () => {
                    setMinute(i);
                    await updateTime(hour, i);
                    setShowMinutePicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      minute === i && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {String(i).padStart(2, '0')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Saving Indicator */}
      {isSaving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator color="#163B2A" size="large" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F1',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F7F1',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#B42318',
  },
  errorBannerText: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  errorText: {
    color: '#10211B',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#10211B',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionDescription: {
    color: '#607069',
    fontSize: 14,
    lineHeight: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 8,
  },
  timeButton: {
    backgroundColor: '#F4F7F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E8E3',
  },
  timeValue: {
    color: '#10211B',
    fontSize: 32,
    fontWeight: '800',
  },
  timeSeparator: {
    color: '#10211B',
    fontSize: 28,
    fontWeight: '800',
  },
  timeHelp: {
    color: '#82908A',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  daysContainer: {
    gap: 12,
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F4F7F1',
    borderRadius: 12,
    gap: 12,
  },
  dayButtonSelected: {
    backgroundColor: '#E8F5E0',
  },
  dayCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#82908A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCheckboxSelected: {
    backgroundColor: '#37734F',
    borderColor: '#37734F',
  },
  dayCheckmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dayLabel: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dayLabelSelected: {
    fontWeight: '800',
  },
  validationError: {
    color: '#B42318',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#E8F5E0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#37734F',
  },
  infoTitle: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '800',
  },
  infoText: {
    color: '#37734F',
    fontSize: 14,
    lineHeight: 22,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: '80%',
  },
  pickerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'flex-end',
  },
  pickerDone: {
    color: '#37734F',
    fontSize: 16,
    fontWeight: '800',
  },
  pickerTitle: {
    color: '#10211B',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingBottom: 16,
    textAlign: 'center',
  },
  pickerOptions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#B8E986',
  },
  pickerOptionText: {
    color: '#607069',
    fontSize: 16,
    textAlign: 'center',
  },
  pickerOptionTextSelected: {
    color: '#10211B',
    fontWeight: '800',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
