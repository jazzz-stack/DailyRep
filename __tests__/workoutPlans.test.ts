import {exercises} from '../src/data/exercises';
import {workoutPlans} from '../src/data/workoutPlans';
import {filterWorkoutPlans, getInvalidWorkoutExerciseIds, getWorkoutPlanMatchScore, isWorkoutPlanMatch} from '../src/utils/workoutPlanMatching';

const exerciseIds = new Set(exercises.map(exercise => exercise.id));

test('workout plans and workouts have unique ids', () => {
  const planIds = workoutPlans.map(plan => plan.id);
  const workoutIds = workoutPlans.flatMap(plan => plan.workouts.map(workout => workout.id));

  expect(new Set(planIds).size).toBe(planIds.length);
  expect(new Set(workoutIds).size).toBe(workoutIds.length);
  expect(workoutPlans.length).toBeGreaterThanOrEqual(5);
});

test('all workout exercise references exist in the exercise catalog', () => {
  expect(getInvalidWorkoutExerciseIds(workoutPlans, exerciseIds)).toEqual([]);
});

test('filters plans by goal, level, location, and combinations', () => {
  expect(filterWorkoutPlans(workoutPlans, {goal: 'build_muscle'}).every(plan => plan.goal === 'build_muscle')).toBe(true);
  expect(filterWorkoutPlans(workoutPlans, {level: 'beginner', location: 'home'}).map(plan => plan.id)).toEqual(['home-fitness-three-day']);
  expect(filterWorkoutPlans(workoutPlans, {}).length).toBe(workoutPlans.length);
});

test('matches plans against available profile fields', () => {
  const profile = {uid: 'user-1', name: 'Jasvant', fitnessGoal: 'build_muscle' as const, fitnessLevel: 'intermediate' as const, workoutPreference: 'gym' as const, workoutFrequency: 4 as const} as Parameters<typeof getWorkoutPlanMatchScore>[1];
  const plan = workoutPlans.find(item => item.id === 'muscle-building-four-day');
  const otherPlan = workoutPlans.find(item => item.id === 'beginner-full-body');

  expect(plan && getWorkoutPlanMatchScore(plan, profile)).toBe(4);
  expect(plan && isWorkoutPlanMatch(plan, profile)).toBe(true);
  expect(otherPlan && isWorkoutPlanMatch(otherPlan, profile)).toBe(false);
});