export type WorkoutSessionStatus = 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  completedSets: CompletedSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId: string;
  workoutId: string;
  startedAt: string;
  completedAt?: string;
  updatedAt?: string;
  status: WorkoutSessionStatus;
  exercises: WorkoutSessionExercise[];
  durationSeconds?: number;
}
