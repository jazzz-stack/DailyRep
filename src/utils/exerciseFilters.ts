import type {Difficulty, Equipment, Exercise, ExerciseType, MuscleGroup} from '../types/exercise';

export type ExerciseFilters = {
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  difficulty?: Difficulty;
  type?: ExerciseType;
};

export function searchExercises(exercises: Exercise[], query: string): Exercise[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return exercises;
  }

  return exercises.filter(exercise =>
    [exercise.name, exercise.primaryMuscle, exercise.equipment, exercise.type].some(value =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  );
}

export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  return exercises.filter(exercise =>
    (!filters.muscleGroup || exercise.primaryMuscle === filters.muscleGroup) &&
    (!filters.equipment || exercise.equipment === filters.equipment) &&
    (!filters.difficulty || exercise.difficulty === filters.difficulty) &&
    (!filters.type || exercise.type === filters.type),
  );
}

export function getFilteredExercises(
  exercises: Exercise[],
  query: string,
  filters: ExerciseFilters,
): Exercise[] {
  return filterExercises(searchExercises(exercises, query), filters);
}
