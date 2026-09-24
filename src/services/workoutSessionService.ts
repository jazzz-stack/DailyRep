import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@react-native-firebase/firestore';
import type {WorkoutSession} from '../types/workoutSession';

function workoutSessionsCollection(uid: string) {
  return collection(getFirestore(), 'users', uid, 'workoutSessions');
}

function workoutSessionReference(uid: string, sessionId: string) {
  return doc(getFirestore(), 'users', uid, 'workoutSessions', sessionId);
}

export async function saveCompletedWorkoutSession(uid: string, session: WorkoutSession): Promise<void> {
  const sessionRef = workoutSessionReference(uid, session.id);
  await setDoc(sessionRef, {
    ...session,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getWorkoutSessions(uid: string): Promise<WorkoutSession[]> {
  try {
    const q = query(workoutSessionsCollection(uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as WorkoutSession);
  } catch (error) {
    console.error('Failed to fetch workout sessions:', error);
    return [];
  }
}

export async function getLatestExercisePerformance(
  uid: string,
  exerciseId: string,
): Promise<{reps: number; weight: number} | null> {
  try {
    const q = query(workoutSessionsCollection(uid), where('status', '==', 'completed'));
    const snapshot = await getDocs(q);

    let latestPerformance: {reps: number; weight: number} | null = null;

    for (const sessionDoc of snapshot.docs) {
      const session = sessionDoc.data() as WorkoutSession;
      const exerciseData = session.exercises.find(ex => ex.exerciseId === exerciseId);

      if (exerciseData && exerciseData.completedSets.length > 0) {
        const lastSet = exerciseData.completedSets[exerciseData.completedSets.length - 1];
        if (!latestPerformance || new Date(session.completedAt || '') > new Date(latestPerformance.reps.toString())) {
          latestPerformance = {
            reps: lastSet.reps,
            weight: lastSet.weight,
          };
        }
      }
    }

    return latestPerformance;
  } catch (error) {
    console.error('Failed to fetch exercise performance:', error);
    return null;
  }
}

export function getWorkoutSessionErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

  switch (code) {
    case 'firestore/permission-denied':
    case 'permission-denied':
      return 'You do not have permission to save this workout. Check your Firestore rules.';
    case 'firestore/unavailable':
    case 'unavailable':
      return 'Firestore is temporarily unavailable. Check your connection and try again.';
    default:
      return fallback;
  }
}
