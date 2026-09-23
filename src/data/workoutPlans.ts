import type {WorkoutPlan} from '../types/workout';

const workout = (id: string, name: string, description: string, estimatedDurationMinutes: number, exercises: WorkoutPlan['workouts'][number]['exercises']): WorkoutPlan['workouts'][number] => ({id, name, description, estimatedDurationMinutes, exercises});
const item = (exerciseId: string, sets: number, reps: string, restSeconds: number, notes?: string) => ({exerciseId, sets, reps, restSeconds, notes});

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'beginner-full-body', name: 'Beginner Full Body', description: 'Build consistency with balanced full-body sessions.', goal: 'improve_fitness', level: 'beginner', location: 'both', daysPerWeek: 3, estimatedDurationMinutes: 35,
    workouts: [
      workout('beginner-full-body-a', 'Full Body A', 'A simple first session covering every major movement.', 35, [item('bodyweight-squat', 3, '12-15', 60), item('push-up', 3, '8-12', 60), item('dumbbell-row', 3, '10-12', 75), item('plank', 3, '30-45 sec', 45)]),
      workout('beginner-full-body-b', 'Full Body B', 'Practice lower-body control and steady pressing.', 35, [item('goblet-squat', 3, '10-12', 75), item('dumbbell-shoulder-press', 3, '8-12', 75), item('lat-pulldown', 3, '10-12', 75), item('reverse-lunge', 3, '8 each side', 60)]),
      workout('beginner-full-body-c', 'Full Body C', 'Finish the week with a controlled full-body circuit.', 35, [item('leg-press', 3, '10-15', 90), item('chest-press-machine', 3, '8-12', 90), item('seated-cable-row', 3, '10-12', 75), item('crunch', 3, '12-20', 45)]),
    ],
  },
  {
    id: 'muscle-building-four-day', name: 'Muscle Building - 4 Day', description: 'Build muscle with a structured four-day gym program.', goal: 'build_muscle', level: 'intermediate', location: 'gym', daysPerWeek: 4, estimatedDurationMinutes: 50,
    workouts: [
      workout('muscle-building-chest-triceps', 'Chest & Triceps', 'Pressing volume for chest and arms.', 50, [item('bench-press', 4, '6-10', 120), item('incline-dumbbell-press', 3, '8-12', 90), item('dumbbell-fly', 3, '10-15', 60), item('tricep-pushdown', 3, '10-15', 60)]),
      workout('muscle-building-back-biceps', 'Back & Biceps', 'Pulling volume for a stronger back and arms.', 50, [item('lat-pulldown', 4, '8-12', 90), item('barbell-row', 4, '6-10', 120), item('seated-cable-row', 3, '10-12', 90), item('dumbbell-curl', 3, '10-12', 60)]),
      workout('muscle-building-legs', 'Legs', 'A complete lower-body strength and hypertrophy session.', 55, [item('barbell-squat', 4, '5-8', 150), item('romanian-deadlift', 3, '8-12', 120), item('leg-press', 3, '10-15', 90), item('leg-curl', 3, '10-15', 60)]),
      workout('muscle-building-shoulders-core', 'Shoulders & Core', 'Shoulder volume paired with trunk stability.', 45, [item('overhead-press', 4, '6-10', 120), item('lateral-raise', 3, '12-15', 60), item('face-pull', 3, '12-15', 60), item('russian-twist', 3, '12 each side', 45)]),
    ],
  },
  {
    id: 'strength-three-day', name: 'Strength - 3 Day', description: 'Focus on progressive compound lifts and strong fundamentals.', goal: 'increase_strength', level: 'intermediate', location: 'gym', daysPerWeek: 3, estimatedDurationMinutes: 55,
    workouts: [
      workout('strength-upper', 'Upper Strength', 'Heavy upper-body pressing and pulling.', 55, [item('bench-press', 5, '3-5', 180), item('barbell-row', 5, '3-5', 180), item('overhead-press', 3, '5-8', 120), item('pull-up', 3, '5-8', 120)]),
      workout('strength-lower', 'Lower Strength', 'A focused lower-body strength session.', 55, [item('barbell-squat', 5, '3-5', 180), item('romanian-deadlift', 4, '5-8', 150), item('bulgarian-split-squat', 3, '6-8 each side', 120)]),
      workout('strength-full-body', 'Full Body Strength', 'Reinforce full-body strength with controlled compounds.', 50, [item('barbell-squat', 3, '5', 150), item('bench-press', 3, '5', 150), item('dumbbell-row', 3, '8-10', 90), item('hip-thrust', 3, '8-10', 90)]),
    ],
  },
  {
    id: 'fat-loss-five-day', name: 'Fat Loss - 5 Day', description: 'Keep moving with accessible resistance work and conditioning.', goal: 'lose_weight', level: 'intermediate', location: 'both', daysPerWeek: 5, estimatedDurationMinutes: 35,
    workouts: [
      workout('fat-loss-upper', 'Upper Circuit', 'A brisk upper-body circuit.', 35, [item('push-up', 3, '10-15', 45), item('dumbbell-row', 3, '10-12', 45), item('lateral-raise', 3, '12-15', 45), item('close-grip-push-up', 3, '8-12', 45)]),
      workout('fat-loss-lower', 'Lower Circuit', 'A steady lower-body conditioning session.', 35, [item('bodyweight-squat', 4, '15-20', 45), item('reverse-lunge', 3, '10 each side', 45), item('hip-thrust', 3, '12-15', 45), item('goblet-squat', 3, '12-15', 45)]),
      workout('fat-loss-core', 'Core & Conditioning', 'Core work with simple conditioning intervals.', 30, [item('plank', 3, '30-45 sec', 30), item('bicycle-crunch', 3, '15 each side', 30), item('russian-twist', 3, '15 each side', 30), item('leg-raise', 3, '8-15', 45)]),
      workout('fat-loss-full-body', 'Full Body Burn', 'A full-body session built around continuous movement.', 35, [item('goblet-squat', 3, '12-15', 45), item('dumbbell-shoulder-press', 3, '10-12', 45), item('dumbbell-curl', 3, '12-15', 45), item('close-grip-push-up', 3, '8-12', 45)]),
      workout('fat-loss-mobility', 'Active Recovery', 'A lighter session to keep the week moving.', 25, [item('reverse-lunge', 3, '10 each side', 30), item('plank', 3, '30 sec', 30), item('bodyweight-squat', 3, '12-15', 30)]),
    ],
  },
  {
    id: 'home-fitness-three-day', name: 'Home Fitness - 3 Day', description: 'Train at home with bodyweight and simple equipment.', goal: 'improve_fitness', level: 'beginner', location: 'home', daysPerWeek: 3, estimatedDurationMinutes: 30,
    workouts: [
      workout('home-fitness-a', 'Home Strength A', 'A practical bodyweight foundation.', 30, [item('bodyweight-squat', 3, '12-20', 45), item('push-up', 3, '8-15', 45), item('plank', 3, '30-45 sec', 30)]),
      workout('home-fitness-b', 'Home Strength B', 'Single-leg work and core control.', 30, [item('reverse-lunge', 3, '10 each side', 45), item('close-grip-push-up', 3, '8-12', 45), item('crunch', 3, '15-20', 30)]),
      workout('home-fitness-c', 'Home Conditioning', 'A balanced home session with easy transitions.', 30, [item('goblet-squat', 3, '10-15', 60), item('hip-thrust', 3, '12-15', 45), item('bicycle-crunch', 3, '12 each side', 30)]),
    ],
  },
];
