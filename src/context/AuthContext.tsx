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
import {createUserProfile, getUserProfile} from '../services/profileService';
import type {AuthContextValue, AuthUser, ConfirmationResult} from '../types/auth';
import type {UserProfileInput} from '../types/profile';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getUserProfile>>>(null);
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
        setIsInitializing(false);
        return;
      }

      getUserProfile(nextUser.uid)
        .then(nextProfile => setProfile(nextProfile))
        .catch(() => setProfile(null))
        .finally(() => setIsInitializing(false));
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setProfile(await getUserProfile(user.uid));
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
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
    [error, isAuthenticated, isInitializing, phoneConfirmation, profile, refreshProfile, user],
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