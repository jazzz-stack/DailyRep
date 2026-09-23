export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'full_body';

export type Equipment =
  | 'bodyweight'
  | 'dumbbell'
  | 'barbell'
  | 'kettlebell'
  | 'machine'
  | 'cable'
  | 'resistance_band'
  | 'bench'
  | 'other';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'strength' | 'cardio' | 'mobility' | 'stretching';

export type Exercise = {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  type: ExerciseType;
  description: string;
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  defaultSets?: number;
  defaultReps?: string;
  defaultRestSeconds?: number;
};
