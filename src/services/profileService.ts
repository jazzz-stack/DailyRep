import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from '@react-native-firebase/firestore';
import type {UserProfile, UserProfileInput, UserProfileUpdates} from '../types/profile';

const profilesCollection = 'users';

function withoutUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)) as Partial<T>;
}

function profileReference(uid: string) {
  return doc(getFirestore(), profilesCollection, uid);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(profileReference(uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export async function createUserProfile(uid: string, profile: UserProfileInput): Promise<void> {
  await setDoc(profileReference(uid), withoutUndefined({
    ...profile,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
}

export async function updateUserProfile(uid: string, updates: UserProfileUpdates): Promise<void> {
  await setDoc(profileReference(uid), withoutUndefined({
    ...updates,
    updatedAt: serverTimestamp(),
  }), {merge: true});
}

export function getProfileErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : '';

  switch (code) {
    case 'firestore/permission-denied':
    case 'permission-denied':
      return 'You do not have permission to save this profile. Check your Firestore rules.';
    case 'firestore/unavailable':
    case 'unavailable':
      return 'Firestore is temporarily unavailable. Check your connection and try again.';
    case 'firestore/failed-precondition':
    case 'failed-precondition':
      return 'Firestore is not ready for this project yet. Enable the database and try again.';
    case 'firestore/not-found':
    case 'not-found':
      return 'Your profile could not be found. Try saving again to create it.';
    default:
      return fallback;
  }
}