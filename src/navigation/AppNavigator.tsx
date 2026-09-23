import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';
import type {ReactNode} from 'react';
import {LoadingScreen} from '../components/LoadingScreen';
import {useAuth} from '../context/AuthContext';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPasswordScreen';
import {LoginScreen} from '../screens/auth/LoginScreen';
import {RegisterScreen} from '../screens/auth/RegisterScreen';
import {HomeScreen} from '../screens/home/HomeScreen';
import {SectionPlaceholderScreen} from '../screens/main/SectionPlaceholderScreen';
import {ProfileScreen} from '../screens/profile/ProfileScreen';
import {EditProfileScreen} from '../screens/profile/EditProfileScreen';
import {ProfileSetupScreen} from '../screens/profile/ProfileSetupScreen';
import {isProfileComplete} from '../types/profile';
import type {AuthStackParamList, MainStackParamList, MainTabParamList, RootStackParamList} from '../types/navigation';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();

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
      <MainTabs.Screen name="Workouts">
        {() => <SectionPlaceholderScreen title="Workouts" description="Your plans and workout sessions will live here." />}
      </MainTabs.Screen>
      <MainTabs.Screen name="Progress">
        {() => <SectionPlaceholderScreen title="Progress" description="Track strength, volume, streaks, and personal records here." />}
      </MainTabs.Screen>
      <MainTabs.Screen name="Profile" component={ProfileScreen} />
    </MainTabs.Navigator>
  );
}

function MainStackNavigator() {
  return (
    <MainStack.Navigator screenOptions={{headerShown: false}}>
      <MainStack.Screen name="Tabs" component={MainTabNavigator} />
      <MainStack.Screen name="EditProfile" component={EditProfileScreen} />
      <MainStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </MainStack.Navigator>
  );
}

export function AppNavigator() {
  const {isAuthenticated, isInitializing, profile} = useAuth();
  const profileComplete = isProfileComplete(profile);

  return (
    <NavigationContainer>
      {isInitializing ? <LoadingScreen message="Checking your account..." /> : (
        <RootStack.Navigator screenOptions={{headerShown: false}}>
          {isAuthenticated && profileComplete ? (
            <RootStack.Screen name="Main" component={MainStackNavigator} />
          ) : isAuthenticated ? (
            <RootStack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
}