import type {Timestamp} from '@react-native-firebase/firestore';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'increase_strength' | 'improve_fitness';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutPreference = 'home' | 'gym' | 'both';
export type WorkoutFrequency = 2 | 3 | 4 | 5 | 6 | 7;
export type WorkoutDuration = '15_30' | '30_45' | '45_60' | '60_plus';

export type UserProfile = {
  uid: string;
  phoneNumber?: string;
  name: string;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  fitnessGoal?: FitnessGoal;
  fitnessLevel?: FitnessLevel;
  workoutPreference?: WorkoutPreference;
  workoutFrequency?: WorkoutFrequency;
  workoutDuration?: WorkoutDuration;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type UserProfileInput = Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>;
export type UserProfileUpdates = Partial<UserProfileInput>;

export type ProfileFormValues = {
  name: string;
  age: string;
  gender?: Gender;
  height: string;
  weight: string;
  fitnessGoal?: FitnessGoal;
  fitnessLevel?: FitnessLevel;
  workoutPreference?: WorkoutPreference;
  workoutFrequency?: WorkoutFrequency;
  workoutDuration?: WorkoutDuration;
};

export function validateProfile(values: ProfileFormValues): string | undefined {
  if (!values.name.trim()) {
    return 'Enter your name.';
  }

  const numericFields: Array<[string, string]> = [
    ['age', values.age],
    ['height', values.height],
    ['weight', values.weight],
  ];

  for (const [label, value] of numericFields) {
    if (value && (!Number.isFinite(Number(value)) || Number(value) <= 0)) {
      return `Enter a valid ${label}.`;
    }
  }

  return undefined;
}

export function profileFormToUpdates(values: ProfileFormValues): UserProfileUpdates {
  return {
    name: values.name.trim(),
    age: values.age ? Number(values.age) : undefined,
    gender: values.gender,
    height: values.height ? Number(values.height) : undefined,
    weight: values.weight ? Number(values.weight) : undefined,
    fitnessGoal: values.fitnessGoal,
    fitnessLevel: values.fitnessLevel,
    workoutPreference: values.workoutPreference,
    workoutFrequency: values.workoutFrequency,
    workoutDuration: values.workoutDuration,
  };
}

export function isProfileComplete(profile: UserProfile | null): boolean {
  return Boolean(
    profile?.uid &&
    profile.name.trim() &&
    profile.fitnessGoal &&
    profile.fitnessLevel &&
    profile.workoutPreference &&
    profile.workoutFrequency &&
    profile.workoutDuration,
  );
}