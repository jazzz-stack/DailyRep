import {exercises} from '../src/data/exercises';
import {filterExercises, getFilteredExercises, searchExercises} from '../src/utils/exerciseFilters';

test('exercise catalog has unique ids and required fields', () => {
  const ids = exercises.map(exercise => exercise.id);

  expect(exercises.length).toBeGreaterThanOrEqual(30);
  expect(new Set(ids).size).toBe(ids.length);
  exercises.forEach(exercise => {
    expect(exercise.name).toBeTruthy();
    expect(exercise.description).toBeTruthy();
    expect(exercise.instructions.length).toBeGreaterThan(0);
  });
});

test('searches exercise name case-insensitively', () => {
  expect(searchExercises(exercises, 'PRESS').map(exercise => exercise.id)).toContain('bench-press');
});

test('searches primary muscle and equipment', () => {
  expect(searchExercises(exercises, 'chest').every(exercise => exercise.primaryMuscle === 'chest' || exercise.name.toLowerCase().includes('chest'))).toBe(true);
  expect(searchExercises(exercises, 'dumbbell').every(exercise => exercise.equipment === 'dumbbell' || exercise.name.toLowerCase().includes('dumbbell'))).toBe(true);
});

test('filters by muscle, equipment, difficulty, and type', () => {
  expect(filterExercises(exercises, {muscleGroup: 'chest'}).every(exercise => exercise.primaryMuscle === 'chest')).toBe(true);
  expect(filterExercises(exercises, {equipment: 'barbell'}).every(exercise => exercise.equipment === 'barbell')).toBe(true);
  expect(filterExercises(exercises, {difficulty: 'beginner'}).every(exercise => exercise.difficulty === 'beginner')).toBe(true);
  expect(filterExercises(exercises, {type: 'strength'}).every(exercise => exercise.type === 'strength')).toBe(true);
});

test('combines search and filters', () => {
  const result = getFilteredExercises(exercises, 'press', {muscleGroup: 'chest', equipment: 'dumbbell', difficulty: 'intermediate'});

  expect(result.map(exercise => exercise.id)).toEqual(['incline-dumbbell-press']);
});
