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
  console.log('[WorkoutSession] Saving completed workout:', session.id, 'for user:', uid);
  try {
    await setDoc(sessionRef, {
      ...session,
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('[WorkoutSession] Successfully saved workout:', session.id);
  } catch (error) {
    console.error('[WorkoutSession] Failed to save workout:', error);
    throw error;
  }
}

export async function getWorkoutSessions(uid: string): Promise<WorkoutSession[]> {
  try {
    const q = query(workoutSessionsCollection(uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(sessionDoc => sessionDoc.data() as WorkoutSession);
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

export async function getCompletedWorkoutSessions(uid: string): Promise<WorkoutSession[]> {
  try {
    const q = query(
      workoutSessionsCollection(uid),
      where('status', '==', 'completed'),
    );
    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(sessionDoc => sessionDoc.data() as WorkoutSession);
    // Sort by completedAt in descending order
    return sessions.sort((a, b) => {
      const dateA = new Date(a.completedAt || 0).getTime();
      const dateB = new Date(b.completedAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Failed to fetch completed workout sessions:', error);
    return [];
  }
}

export async function saveWorkoutSessionProgress(uid: string, session: WorkoutSession): Promise<void> {
  const sessionRef = workoutSessionReference(uid, session.id);
  console.log('[WorkoutSession] Saving in-progress workout:', session.id, 'for user:', uid);
  try {
    await setDoc(sessionRef, {
      ...session,
      updatedAt: serverTimestamp(),
      // Don't set completedAt for in-progress sessions
    });
    console.log('[WorkoutSession] Progress saved for workout:', session.id);
  } catch (error) {
    console.error('[WorkoutSession] Failed to save progress:', error);
    throw error;
  }
}

export async function getInProgressWorkoutSession(uid: string): Promise<WorkoutSession | null> {
  try {
    const q = query(workoutSessionsCollection(uid), where('status', '==', 'in_progress'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Get the most recently updated in-progress session
    const sessions = snapshot.docs.map(sessionDoc => sessionDoc.data() as WorkoutSession);
    const latest = sessions.sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    })[0];

    console.log('[WorkoutSession] Found in-progress workout:', latest?.id);
    return latest || null;
  } catch (error) {
    console.error('[WorkoutSession] Failed to fetch in-progress workout:', error);
    return null;
  }
}

export async function getWorkoutSession(uid: string, sessionId: string): Promise<WorkoutSession | null> {
  try {
    const sessionRef = workoutSessionReference(uid, sessionId);
    const sessionDocSnapshot = await getDoc(sessionRef);

    if (!sessionDocSnapshot.exists()) {
      console.warn(`Workout session ${sessionId} not found`);
      return null;
    }

    const session = sessionDocSnapshot.data() as WorkoutSession;
    if (session.status !== 'completed') {
      console.warn(`Workout session ${sessionId} is not completed (status: ${session.status})`);
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to fetch workout session:', error);
    return null;
  }
}
