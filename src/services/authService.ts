import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from '@react-native-firebase/auth';

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(getAuth(), email.trim(), password);
}

export function requestPhoneCode(phoneNumber: string) {
  return signInWithPhoneNumber(getAuth(), phoneNumber.trim());
}

export function confirmPhoneCode(confirmation: import('@react-native-firebase/auth').ConfirmationResult, code: string) {
  return confirmation.confirm(code.trim());
}

export async function register(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(getAuth(), email.trim(), password);
  await updateProfile(credential.user, {displayName: name.trim()});
  return credential;
}

export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(getAuth(), email.trim());
}

export function signOut() {
  return firebaseSignOut(getAuth());
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Check your internet connection and try again.';
    default:
      return fallback;
  }
}