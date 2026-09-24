import type {UserProfile} from '../types/profile';
import type {WorkoutPlan} from '../types/workout';

export type WorkoutPlanFilters = {
  goal?: WorkoutPlan['goal'];
  level?: WorkoutPlan['level'];
  location?: WorkoutPlan['location'];
};

function isDurationCompatible(plan: WorkoutPlan, duration: UserProfile['workoutDuration']): boolean {
  if (!duration) return false;
  if (duration === '15_30') return plan.estimatedDurationMinutes <= 30;
  if (duration === '30_45') return plan.estimatedDurationMinutes >= 30 && plan.estimatedDurationMinutes <= 45;
  if (duration === '45_60') return plan.estimatedDurationMinutes >= 45 && plan.estimatedDurationMinutes <= 60;
  return plan.estimatedDurationMinutes >= 60;
}

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
    profile.workoutDuration && isDurationCompatible(plan, profile.workoutDuration),
    profile.workoutFrequency === 6 && plan.daysPerWeek === 6,
  ].filter(Boolean).length;
}

export function isWorkoutPlanMatch(plan: WorkoutPlan, profile: UserProfile | null): boolean {
  if (!profile) return false;

  const criteria = [profile.fitnessGoal, profile.fitnessLevel, profile.workoutPreference, profile.workoutDuration].filter(value => value !== undefined).length;
  const matchingCriteria = getWorkoutPlanMatchScore(plan, profile);
  return criteria > 0 && matchingCriteria >= Math.min(3, criteria);
}

export function getInvalidWorkoutExerciseIds(plans: WorkoutPlan[], exerciseIds: Set<string>): string[] {
  return plans.flatMap(plan => plan.workouts.flatMap(workout => workout.exercises.map(item => item.exerciseId)))
    .filter((exerciseId, index, allIds) => !exerciseIds.has(exerciseId) && allIds.indexOf(exerciseId) === index);
}
