import type {UserProfile} from '../types/profile';
import type {WorkoutPlan} from '../types/workout';

export type WorkoutPlanFilters = {
  goal?: WorkoutPlan['goal'];
  level?: WorkoutPlan['level'];
  location?: WorkoutPlan['location'];
};

export function filterWorkoutPlans(plans: WorkoutPlan[], filters: WorkoutPlanFilters): WorkoutPlan[] {
  return plans.filter(plan =>
    (!filters.goal || plan.goal === filters.goal) &&
    (!filters.level || plan.level === filters.level) &&
    (!filters.location || plan.location === filters.location),
  );
}

export function getWorkoutPlanMatchScore(plan: WorkoutPlan, profile: UserProfile | null): number {
  if (!profile) return 0;

  return [
    profile.fitnessGoal && plan.goal === profile.fitnessGoal,
    profile.fitnessLevel && plan.level === profile.fitnessLevel,
    profile.workoutPreference && plan.location === profile.workoutPreference,
    profile.workoutFrequency && plan.daysPerWeek === profile.workoutFrequency,
  ].filter(Boolean).length;
}

export function isWorkoutPlanMatch(plan: WorkoutPlan, profile: UserProfile | null): boolean {
  if (!profile) return false;

  const profileCriteria = [profile.fitnessGoal, profile.fitnessLevel, profile.workoutPreference, profile.workoutFrequency].filter(value => value !== undefined).length;
  return profileCriteria > 0 && getWorkoutPlanMatchScore(plan, profile) === profileCriteria;
}

export function getInvalidWorkoutExerciseIds(plans: WorkoutPlan[], exerciseIds: Set<string>): string[] {
  return plans.flatMap(plan => plan.workouts.flatMap(workout => workout.exercises.map(item => item.exerciseId)))
    .filter((exerciseId, index, allIds) => !exerciseIds.has(exerciseId) && allIds.indexOf(exerciseId) === index);
}
