import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useState, type ReactNode} from 'react';
import {LoadingScreen} from '../components/LoadingScreen';
import {useAuth} from '../context/AuthContext';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {ExerciseDetailsScreen} from '../screens/exercises/ExerciseDetailsScreen';
import {ExerciseLibraryScreen} from '../screens/exercises/ExerciseLibraryScreen';
import {WorkoutDetailsScreen} from '../screens/workouts/WorkoutDetailsScreen';
import {WorkoutPlanDetailsScreen} from '../screens/workouts/WorkoutPlanDetailsScreen';
import {WorkoutPlansScreen} from '../screens/workouts/WorkoutPlansScreen';
import {SectionPlaceholderScreen} from '../screens/main/SectionPlaceholderScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {ProfileSetupScreen} from '../screens/profile/ProfileSetupScreen';
import type {AuthStackParamList, ExerciseStackParamList, MainStackParamList, MainTabParamList, RootStackParamList} from '../types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const ExerciseStack = createNativeStackNavigator<ExerciseStackParamList>();

const tabIcons: Record<keyof MainTabParamList, string> = {
  Home: '⌂',
  Workouts: '⚡',
  Progress: '◔',
  Profile: '●',
};

function renderTabIcon(route: keyof MainTabParamList, color: string, size: number): ReactNode {
  return (
    <Text accessibilityLabel={`${route} tab`} style={{color, fontSize: size, lineHeight: size + 2}}>
      {tabIcons[route]}
    </Text>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <MainTabs.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#37734F',
        tabBarInactiveTintColor: '#82908A',
        tabBarIcon: ({color, size}) => renderTabIcon(route.name, color, size),
      })}
    >
      <MainTabs.Screen name="Home" component={HomeScreen} />
      <MainTabs.Screen name="Workouts" component={ExerciseNavigator} />
      <MainTabs.Screen name="Progress">
        {() => <SectionPlaceholderScreen title="Progress" description="Track strength, volume, streaks, and personal records here." />}
      </MainTabs.Screen>
      <MainTabs.Screen name="Profile" component={ProfileScreen} />
    </MainTabs.Navigator>
  );
}

function ExerciseNavigator() {
  return (
    <ExerciseStack.Navigator screenOptions={{headerShown: true, headerTintColor: '#163B2A', headerStyle: {backgroundColor: '#F4F7F1'}, headerShadowVisible: false}}>
      <ExerciseStack.Screen name="WorkoutPlans" component={WorkoutPlansScreen} options={{headerShown: false}} />
      <ExerciseStack.Screen name="WorkoutPlanDetails" component={WorkoutPlanDetailsScreen} options={{title: 'Workout Plan'}} />
      <ExerciseStack.Screen name="WorkoutDetails" component={WorkoutDetailsScreen} options={{title: 'Workout Details'}} />
      <ExerciseStack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} options={{title: 'Exercise Details'}} />
      <ExerciseStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} options={{title: 'Exercise Library'}} />
    </ExerciseStack.Navigator>
  );
}

function MainStackNavigator() {
  const {profile} = useAuth();

  return (
    // "First login" means no profile document exists yet; any existing record skips setup.
    <MainStack.Navigator initialRouteName={profile ? 'Tabs' : 'ProfileSetup'} screenOptions={{headerShown: false}}>
      <MainStack.Screen name="Tabs" component={MainTabNavigator} />
      <MainStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: true,
          title: 'Edit Profile',
          headerTintColor: '#163B2A',
          headerStyle: {backgroundColor: '#F4F7F1'},
          headerShadowVisible: false,
        }}
      />
      <MainStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const {isAuthenticated, isInitializing, profile, profileError, refreshProfile} = useAuth();
  const hasProfileLoadError = isAuthenticated && Boolean(profileError) && !profile;

  return (
    <NavigationContainer>
      {isInitializing ? (
        <LoadingScreen message="Checking your account..." />
      ) : hasProfileLoadError ? (
        <ProfileLoadErrorScreen message={profileError} onRetry={refreshProfile} />
      ) : (
        <RootStack.Navigator screenOptions={{headerShown: false}}>
          {isAuthenticated ? (
            <RootStack.Screen name="Main" component={MainStackNavigator} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
}

function ProfileLoadErrorScreen({message, onRetry}: {message: string | null; onRetry: () => Promise<void>}) {
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    setIsRetrying(true);
    try {
      await onRetry();
    } catch {
      // profileError is surfaced via context state; nothing further to do here.
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <View style={profileErrorStyles.container}>
      <Text style={profileErrorStyles.title}>Unable to load your profile</Text>
      <Text style={profileErrorStyles.message}>{message ?? 'Check your connection and try again.'}</Text>
      <Pressable disabled={isRetrying} onPress={handleRetry} style={profileErrorStyles.button}>
        {isRetrying ? <ActivityIndicator color="#10211B" /> : <Text style={profileErrorStyles.buttonText}>Retry</Text>}
      </Pressable>
    </View>
  );
}

const profileErrorStyles = StyleSheet.create({
  container: {alignItems: 'center', backgroundColor: '#F4F7F1', flex: 1, justifyContent: 'center', padding: 28},
  title: {color: '#10211B', fontSize: 22, fontWeight: '800', textAlign: 'center'},
  message: {color: '#607069', fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center'},
  button: {alignItems: 'center', backgroundColor: '#B8E986', borderRadius: 12, justifyContent: 'center', marginTop: 22, minHeight: 52, paddingHorizontal: 32},
  buttonText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
});
