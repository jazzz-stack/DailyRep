import {exercises} from '../data/exercises';
import type {WorkoutPlan} from '../types/workout';

export type WorkoutValidationIssue = {planId: string; message: string};

export function validateWorkoutPlans(plans: WorkoutPlan[]): WorkoutValidationIssue[] {
  const issues: WorkoutValidationIssue[] = [];
  const planIds = new Set<string>();
  const workoutIds = new Set<string>();
  const exerciseIds = new Set(exercises.map(exercise => exercise.id));

  for (const plan of plans) {
    if (planIds.has(plan.id)) issues.push({planId: plan.id, message: 'Duplicate workout plan id.'});
    planIds.add(plan.id);
    if (plan.daysPerWeek !== 6) issues.push({planId: plan.id, message: 'Workout plans must have six days per week.'});
    if (plan.workouts.length !== 6) issues.push({planId: plan.id, message: 'Workout plans must contain six workouts.'});

    for (const workout of plan.workouts) {
      if (workoutIds.has(workout.id)) issues.push({planId: plan.id, message: `Duplicate workout id: ${workout.id}.`});
      workoutIds.add(workout.id);
      if (workout.dayNumber < 1 || workout.dayNumber > 6) issues.push({planId: plan.id, message: `Invalid workout day: ${workout.dayNumber}.`});
      for (const workoutExercise of workout.exercises) {
        if (!exerciseIds.has(workoutExercise.exerciseId)) issues.push({planId: plan.id, message: `Unknown exercise id: ${workoutExercise.exerciseId}.`});
      }
    }
  }

  return issues;
}

export function hasValidWorkoutPlans(plans: WorkoutPlan[]): boolean {
  return validateWorkoutPlans(plans).length === 0;
}