import type {NavigatorScreenParams} from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Workouts: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type ExerciseStackParamList = {
  WorkoutPlans: undefined;
  WorkoutPlanDetails: {planId: string};
  WorkoutDetails: {planId: string; workoutId: string};
  WorkoutExecution: {planId: string; workoutId: string};
  WorkoutComplete: {sessionId: string};
  ExerciseDetails: {exerciseId: string};
  ExerciseLibrary: undefined;
};

export type WorkoutStackParamList = ExerciseStackParamList;

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList> | undefined;
  EditProfile: undefined;
  ProfileSetup: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};