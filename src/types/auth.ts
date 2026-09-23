import type {ConfirmationResult, User} from '@react-native-firebase/auth';
import type {UserProfile} from './profile';

export type {ConfirmationResult};

export type AuthUser = User;

export type AuthContextValue = {
  user: AuthUser | null;
  profile: UserProfile | null;
  profileError: string | null;
  phoneConfirmation: ConfirmationResult | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  error: string | null;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  sendPhoneCode: (phoneNumber: string) => Promise<void>;
  verifyPhoneCode: (code: string) => Promise<void>;
  clearPhoneConfirmation: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export type FormErrors = {
  email?: string;
  phoneNumber?: string;
  verificationCode?: string;
  password?: string;
  name?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) {
    return 'Enter your email address.';
  }

  if (!emailPattern.test(email.trim())) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

export function validatePhoneNumber(phoneNumber: string): string | undefined {
  const normalizedPhoneNumber = phoneNumber.trim();

  if (!normalizedPhoneNumber) {
    return 'Enter your phone number.';
  }

  if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
    return 'Use an international number, for example +15551234567.';
  }

  return undefined;
}

export function validateVerificationCode(code: string): string | undefined {
  if (!/^\d{6}$/.test(code.trim())) {
    return 'Enter the 6-digit verification code.';
  }

  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Enter your password.';
  }

  if (password.length < 6) {
    return 'Your password must be at least 6 characters.';
  }

  return undefined;
}

export function validateRegistration(name: string, email: string, password: string): FormErrors {
  return {
    name: name.trim() ? undefined : 'Enter your name.',
    email: validateEmail(email),
    password: validatePassword(password),
  };
}

export function hasFormErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}