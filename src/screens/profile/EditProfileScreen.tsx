import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormError } from '../../components/FormError';
import { SelectionCard } from '../../components/SelectionCard';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage } from '../../services/authService';
import {
  createUserProfile,
  getProfileErrorMessage,
  updateUserProfile,
} from '../../services/profileService';
import {
  profileFormToUpdates,
  validateProfile,
  type ProfileFormValues,
} from '../../types/profile';
import type { MainStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<
  MainStackParamList,
  'EditProfile' | 'ProfileSetup'
>;

const goals = [
  ['lose_weight', 'Lose Weight'],
  ['build_muscle', 'Build Muscle'],
  ['increase_strength', 'Increase Strength'],
  ['improve_fitness', 'Improve Fitness'],
] as const;
const genders = [
  ['male', 'Male'],
  ['female', 'Female'],
  ['other', 'Other'],
  ['prefer_not_to_say', 'Prefer not to say'],
] as const;
const levels = [
  ['beginner', 'Beginner'],
  ['intermediate', 'Intermediate'],
  ['advanced', 'Advanced'],
] as const;
const preferences = [
  ['home', 'Home'],
  ['gym', 'Gym'],
  ['both', 'Both'],
] as const;
const durations = [
  ['15_30', '15-30 minutes'],
  ['30_45', '30-45 minutes'],
  ['45_60', '45-60 minutes'],
  ['60_plus', '60+ minutes'],
] as const;
const frequencies = [2, 3, 4, 5, 6, 7] as const;

export function EditProfileScreen({ navigation }: Props) {
  const { profile, user, refreshProfile } = useAuth();
  const [values, setValues] = useState<ProfileFormValues>({
    name: profile?.name ?? user?.displayName ?? '',
    age: profile?.age?.toString() ?? '',
    gender: profile?.gender,
    height: profile?.height?.toString() ?? '',
    weight: profile?.weight?.toString() ?? '',
    fitnessGoal: profile?.fitnessGoal,
    fitnessLevel: profile?.fitnessLevel,
    workoutPreference: profile?.workoutPreference,
    workoutFrequency: profile?.workoutFrequency,
    workoutDuration: profile?.workoutDuration,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateValue<Key extends keyof ProfileFormValues>(
    key: Key,
    value: ProfileFormValues[Key],
  ) {
    setValues(current => ({ ...current, [key]: value }));
    setError(null);
    setSuccess(null);
  }

  async function handleSave() {
    if (!user || isSaving) return;
    const validationError = validateProfile(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updates = {
        ...profileFormToUpdates(values),
        phoneNumber: user.phoneNumber ?? profile?.phoneNumber,
      };
      if (profile) await updateUserProfile(user.uid, updates);
      else {
        const { name: profileName, ...optionalUpdates } = updates;
        await createUserProfile(user.uid, {
          name: profileName ?? values.name.trim(),
          ...optionalUpdates,
        });
      }
      await refreshProfile();
      setSuccess('Profile saved successfully.');
      setTimeout(() => navigation.goBack(), 600);
    } catch (saveError) {
      setError(
        getProfileErrorMessage(
          saveError,
          getAuthErrorMessage(
            saveError,
            'Unable to save your profile right now.',
          ),
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Your fitness profile</Text>
        <Text style={styles.subtitle}>
          Tell us what will make your training feel personal.
        </Text>
        <Text style={styles.section}>PERSONAL INFORMATION</Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#82908A"
          style={styles.input}
          value={values.name}
          onChangeText={value => updateValue('name', value)}
        />
        <TextInput
          keyboardType="number-pad"
          placeholder="Age"
          placeholderTextColor="#82908A"
          style={styles.input}
          value={values.age}
          onChangeText={value => updateValue('age', value)}
        />
        <Text style={styles.section}>GENDER</Text>
        <View style={styles.grid}>
          {genders.map(([value, label]) => (
            <SelectionCard
              key={value}
              label={label}
              selected={values.gender === value}
              onPress={() => updateValue('gender', value)}
            />
          ))}
        </View>
        <TextInput
          keyboardType="number-pad"
          placeholder="Height (cm)"
          placeholderTextColor="#82908A"
          style={styles.input}
          value={values.height}
          onChangeText={value => updateValue('height', value)}
        />
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Weight (kg)"
          placeholderTextColor="#82908A"
          style={styles.input}
          value={values.weight}
          onChangeText={value => updateValue('weight', value)}
        />
        <Text style={styles.section}>FITNESS GOAL</Text>
        <View style={styles.grid}>
          {goals.map(([value, label]) => (
            <SelectionCard
              key={value}
              label={label}
              selected={values.fitnessGoal === value}
              onPress={() => updateValue('fitnessGoal', value)}
            />
          ))}
        </View>
        <Text style={styles.section}>FITNESS LEVEL</Text>
        <View style={styles.grid}>
          {levels.map(([value, label]) => (
            <SelectionCard
              key={value}
              label={label}
              selected={values.fitnessLevel === value}
              onPress={() => updateValue('fitnessLevel', value)}
            />
          ))}
        </View>
        <Text style={styles.section}>WORKOUT PREFERENCE</Text>
        <View style={styles.grid}>
          {preferences.map(([value, label]) => (
            <SelectionCard
              key={value}
              label={label}
              selected={values.workoutPreference === value}
              onPress={() => updateValue('workoutPreference', value)}
            />
          ))}
        </View>
        <Text style={styles.section}>DAYS PER WEEK</Text>
        <View style={styles.grid}>
          {frequencies.map(value => (
            <SelectionCard
              key={value}
              label={`${value} days`}
              selected={values.workoutFrequency === value}
              onPress={() => updateValue('workoutFrequency', value)}
            />
          ))}
        </View>
        <Text style={styles.section}>WORKOUT DURATION</Text>
        <View style={styles.grid}>
          {durations.map(([value, label]) => (
            <SelectionCard
              key={value}
              label={label}
              selected={values.workoutDuration === value}
              onPress={() => updateValue('workoutDuration', value)}
            />
          ))}
        </View>
        <FormError message={error} />
        {success ? <Text style={styles.success}>{success}</Text> : null}
        <Pressable
          disabled={isSaving}
          onPress={handleSave}
          style={styles.primaryButton}
        >
          {isSaving ? (
            <ActivityIndicator color="#10211B" />
          ) : (
            <Text style={styles.primaryText}>Save profile</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { backgroundColor: '#F4F7F1', flex: 1 },
  container: { gap: 12, padding: 24, paddingBottom: 48 },
  title: { color: '#10211B', fontSize: 32, fontWeight: '800', marginTop: 18 },
  subtitle: { color: '#607069', fontSize: 16, lineHeight: 24, marginBottom: 8 },
  section: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6DD',
    borderRadius: 12,
    borderWidth: 1,
    color: '#10211B',
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  grid: { gap: 10, flexDirection: 'row', flexWrap: 'wrap' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#B8E986',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 12,
  },
  primaryText: { color: '#10211B', fontSize: 16, fontWeight: '800' },
  success: { color: '#37734F', fontSize: 14, lineHeight: 20 },
});
