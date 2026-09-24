import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';
import {
  getAuthErrorMessage,
  confirmPhoneCode,
  requestPhoneCode,
  register,
  signIn,
  signOut,
} from '../services/authService';
import {createUserProfile, getProfileErrorMessage, getUserProfile} from '../services/profileService';
import {getNotificationPreferences} from '../services/notificationPreferencesService';
import {rescheduleWorkoutReminders} from '../services/workoutReminderService';
import type {AuthContextValue, AuthUser, ConfirmationResult} from '../types/auth';
import type {UserProfile, UserProfileInput} from '../types/profile';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// A cold-start Firestore read can fail transiently, so retry before treating it as "no profile".
async function loadProfileWithRetries(
  uid: string,
  attempts = 3,
  delayMs = 400,
): Promise<{profile: UserProfile | null; error: string | null}> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const profile = await getUserProfile(uid);
      return {profile, error: null};
    } catch (fetchError) {
      lastError = fetchError;
      if (attempt < attempts) {
        await new Promise(resolve => setTimeout(() => resolve(undefined), delayMs * attempt));
      }
    }
  }

  return {profile: null, error: getProfileErrorMessage(lastError, 'Unable to load your profile right now.')};
}

export function AuthProvider({children}: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, nextUser => {
      setUser(nextUser);
      setPhoneConfirmation(null);
      setIsAuthenticated(Boolean(nextUser));
      if (!nextUser) {
        setProfile(null);
        setProfileError(null);
        setIsInitializing(false);
        return;
      }

      loadProfileWithRetries(nextUser.uid)
        .then(({profile: nextProfile, error: loadError}) => {
          setProfile(nextProfile);
          setProfileError(loadError);
        })
        .finally(() => setIsInitializing(false));
    });
  }, []);

  // Synchronize notification reminders on app startup
  useEffect(() => {
    if (!user || !profile || isInitializing) {
      return;
    }

    const syncReminders = async () => {
      try {
        const preferences = await getNotificationPreferences(user.uid);
        await rescheduleWorkoutReminders(preferences, profile);
        console.log('Notification reminders synchronized on app startup');
      } catch (error) {
        console.error('Failed to synchronize notification reminders:', error);
        // Don't propagate error - app should continue functioning
      }
    };

    syncReminders();
  }, [user, profile, isInitializing]);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    const {profile: nextProfile, error: loadError} = await loadProfileWithRetries(user.uid);
    setProfile(nextProfile);
    setProfileError(loadError);

    if (loadError && !nextProfile) {
      throw new Error(loadError);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      profileError,
      phoneConfirmation,
      isAuthenticated,
      isInitializing,
      error,
      clearError: () => setError(null),
      refreshProfile,
      sendPhoneCode: async phoneNumber => {
        try {
          setError(null);
          const confirmation = await requestPhoneCode(phoneNumber);
          setPhoneConfirmation(confirmation);
        } catch (authError) {
          setError(getAuthErrorMessage(authError, 'Unable to send a verification code right now.'));
        }
      },
      verifyPhoneCode: async code => {
        if (!phoneConfirmation) {
          setError('Request a verification code first.');
          return;
        }

        try {
          setError(null);
          await confirmPhoneCode(phoneConfirmation, code);
        } catch (authError) {
          setError(getAuthErrorMessage(authError, 'That verification code is not valid.'));
        }
      },
      clearPhoneConfirmation: () => setPhoneConfirmation(null),
      signIn: async (email, password) => {
        try {
          await signIn(email, password);
        } catch (authError) {
          setError(getAuthErrorMessage(authError, 'Unable to sign in right now.'));
        }
      },
      register: async (name, email, password) => {
        try {
          const credential = await register(name, email, password);
          const profileInput: UserProfileInput = {
            name: name.trim(),
            phoneNumber: credential.user.phoneNumber ?? undefined,
          };
          await createUserProfile(credential.user.uid, profileInput);
          setProfile(await getUserProfile(credential.user.uid));
          setProfileError(null);
        } catch (authError) {
          setError(getAuthErrorMessage(authError, 'Unable to create your account right now.'));
        }
      },
      signOut: async () => {
        try {
          await signOut();
        } catch (authError) {
          setError(getAuthErrorMessage(authError, 'Unable to sign out right now.'));
        }
      },
    }),
    [error, isAuthenticated, isInitializing, phoneConfirmation, profile, profileError, refreshProfile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}