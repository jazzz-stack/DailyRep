export type WorkoutGoal = 'lose_weight' | 'build_muscle' | 'increase_strength' | 'improve_fitness';
export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutLocation = 'home' | 'gym' | 'both';

export type WorkoutExercise = {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  dayNumber: number;
  estimatedDurationMinutes: number;
  exercises: WorkoutExercise[];
};

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  location: WorkoutLocation;
  daysPerWeek: 6;
  estimatedDurationMinutes: number;
  workouts: Workout[];
};
