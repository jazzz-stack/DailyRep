import type {WorkoutPlan} from '../types/workout';

const workout = (dayNumber: number, id: string, name: string, description: string, estimatedDurationMinutes: number, exercises: WorkoutPlan['workouts'][number]['exercises']): WorkoutPlan['workouts'][number] => ({dayNumber, id, name, description, estimatedDurationMinutes, exercises});
const item = (exerciseId: string, sets: number, reps: string, restSeconds: number, notes?: string) => ({exerciseId, sets, reps, restSeconds, ...(notes ? {notes} : {})});

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'beginner-full-body', name: 'Beginner Full Body', description: 'Build consistency with balanced full-body sessions, then recover on Day 7.', goal: 'improve_fitness', level: 'beginner', location: 'both', daysPerWeek: 6, estimatedDurationMinutes: 35,
    workouts: [
      workout(1, 'beginner-full-body-a-1', 'Full Body A', 'A simple first session covering every major movement.', 35, [item('bodyweight-squat', 3, '12-15', 60), item('push-up', 3, '8-12', 60), item('dumbbell-row', 3, '10-12', 75), item('plank', 3, '30-45 sec', 45)]),
      workout(2, 'beginner-full-body-b-1', 'Full Body B', 'Practice lower-body control and steady pressing.', 35, [item('goblet-squat', 3, '10-12', 75), item('dumbbell-shoulder-press', 3, '8-12', 75), item('lat-pulldown', 3, '10-12', 75), item('reverse-lunge', 3, '8 each side', 60)]),
      workout(3, 'beginner-full-body-c-1', 'Full Body C', 'Finish the week with a controlled full-body circuit.', 35, [item('leg-press', 3, '10-15', 90), item('chest-press-machine', 3, '8-12', 90), item('seated-cable-row', 3, '10-12', 75), item('crunch', 3, '12-20', 45)]),
      workout(4, 'beginner-full-body-a-2', 'Full Body A', 'Repeat the foundational pattern with calm, controlled reps.', 35, [item('bodyweight-squat', 3, '12-15', 60), item('push-up', 3, '8-12', 60), item('dumbbell-row', 3, '10-12', 75), item('plank', 3, '30-45 sec', 45)]),
      workout(5, 'beginner-full-body-b-2', 'Full Body B', 'Reinforce balance, pressing, and pulling fundamentals.', 35, [item('goblet-squat', 3, '10-12', 75), item('dumbbell-shoulder-press', 3, '8-12', 75), item('lat-pulldown', 3, '10-12', 75), item('reverse-lunge', 3, '8 each side', 60)]),
      workout(6, 'beginner-full-body-c-2', 'Full Body C', 'Close the training week with a steady full-body session.', 35, [item('leg-press', 3, '10-15', 90), item('chest-press-machine', 3, '8-12', 90), item('seated-cable-row', 3, '10-12', 75), item('crunch', 3, '12-20', 45)]),
    ],
  },
  {
    id: 'muscle-building-six-day', name: 'Muscle Building - 6 Day', description: 'Build muscle with a structured Push, Pull, Legs split.', goal: 'build_muscle', level: 'intermediate', location: 'gym', daysPerWeek: 6, estimatedDurationMinutes: 60,
    workouts: [
      workout(1, 'muscle-building-push-1', 'Push', 'Pressing volume for chest, shoulders, and triceps.', 60, [item('bench-press', 4, '6-10', 120), item('incline-dumbbell-press', 3, '8-12', 90), item('lateral-raise', 3, '12-15', 60), item('tricep-pushdown', 3, '10-15', 60)]),
      workout(2, 'muscle-building-pull-1', 'Pull', 'Pulling volume for a stronger back and arms.', 60, [item('lat-pulldown', 4, '8-12', 90), item('barbell-row', 4, '6-10', 120), item('face-pull', 3, '12-15', 60), item('dumbbell-curl', 3, '10-12', 60)]),
      workout(3, 'muscle-building-legs-1', 'Legs', 'A complete lower-body strength and hypertrophy session.', 60, [item('barbell-squat', 4, '5-8', 150), item('romanian-deadlift', 3, '8-12', 120), item('leg-press', 3, '10-15', 90), item('leg-curl', 3, '10-15', 60)]),
      workout(4, 'muscle-building-push-2', 'Push', 'A second pressing day with a shoulder and triceps emphasis.', 55, [item('overhead-press', 4, '6-10', 120), item('dumbbell-fly', 3, '10-15', 60), item('dumbbell-shoulder-press', 3, '8-12', 90), item('overhead-tricep-extension', 3, '10-12', 60)]),
      workout(5, 'muscle-building-pull-2', 'Pull', 'A second pulling day for back thickness and biceps.', 55, [item('pull-up', 4, '5-8', 120), item('seated-cable-row', 4, '8-12', 90), item('dumbbell-row', 3, '8-12', 75), item('hammer-curl', 3, '10-12', 60)]),
      workout(6, 'muscle-building-legs-2', 'Legs', 'A second lower-body day focused on unilateral work and glutes.', 55, [item('bulgarian-split-squat', 3, '8-10 each side', 90), item('hip-thrust', 4, '8-12', 90), item('leg-curl', 3, '10-15', 60), item('goblet-squat', 3, '12-15', 75)]),
    ],
  },
  
  {
    id: 'strength-six-day', name: 'Strength - 6 Day', description: 'Build compound strength across upper, lower, and full-body sessions.', goal: 'increase_strength', level: 'intermediate', location: 'gym', daysPerWeek: 6, estimatedDurationMinutes: 60,
    workouts: [
      workout(1, 'strength-upper', 'Upper Strength', 'Heavy upper-body pressing and pulling.', 60, [item('bench-press', 5, '3-5', 180), item('barbell-row', 5, '3-5', 180), item('overhead-press', 3, '5-8', 120), item('pull-up', 3, '5-8', 120)]),
      workout(2, 'strength-lower', 'Lower Strength', 'A focused lower-body strength session.', 60, [item('barbell-squat', 5, '3-5', 180), item('romanian-deadlift', 4, '5-8', 150), item('bulgarian-split-squat', 3, '6-8 each side', 120)]),
      workout(3, 'strength-push', 'Push Strength', 'Build pressing power with supporting shoulder work.', 55, [item('overhead-press', 5, '3-5', 150), item('bench-press', 4, '5-8', 150), item('close-grip-push-up', 3, '8-12', 75)]),
      workout(4, 'strength-pull', 'Pull Strength', 'Train strong vertical and horizontal pulling patterns.', 55, [item('pull-up', 5, '3-6', 150), item('barbell-row', 4, '5-8', 150), item('dumbbell-curl', 3, '8-12', 75)]),
      workout(5, 'strength-lower-2', 'Lower Strength II', 'Reinforce the hinge, squat, and single-leg patterns.', 55, [item('romanian-deadlift', 5, '4-6', 150), item('goblet-squat', 4, '8-10', 90), item('hip-thrust', 4, '6-10', 120)]),
      workout(6, 'strength-full-body', 'Full Body Strength', 'Reinforce full-body strength with controlled compounds.', 60, [item('barbell-squat', 3, '5', 150), item('bench-press', 3, '5', 150), item('dumbbell-row', 3, '8-10', 90), item('hip-thrust', 3, '8-10', 90)]),
    ],
  },
  {
    id: 'fat-loss-six-day', name: 'Fat Loss - 6 Day', description: 'Combine resistance work and conditioning for an energetic training week.', goal: 'lose_weight', level: 'intermediate', location: 'both', daysPerWeek: 6, estimatedDurationMinutes: 35,
    workouts: [
      workout(1, 'fat-loss-upper', 'Upper Circuit', 'A brisk upper-body circuit.', 35, [item('push-up', 3, '10-15', 45), item('dumbbell-row', 3, '10-12', 45), item('lateral-raise', 3, '12-15', 45), item('close-grip-push-up', 3, '8-12', 45)]),
      workout(2, 'fat-loss-lower', 'Lower Circuit', 'A steady lower-body conditioning session.', 35, [item('bodyweight-squat', 4, '15-20', 45), item('reverse-lunge', 3, '10 each side', 45), item('hip-thrust', 3, '12-15', 45), item('goblet-squat', 3, '12-15', 45)]),
      workout(3, 'fat-loss-core', 'Core & Conditioning', 'Core work with simple conditioning intervals.', 30, [item('plank', 3, '30-45 sec', 30), item('bicycle-crunch', 3, '15 each side', 30), item('russian-twist', 3, '15 each side', 30), item('leg-raise', 3, '8-15', 45)]),
      workout(4, 'fat-loss-full-body', 'Full Body Burn', 'A full-body session built around continuous movement.', 35, [item('goblet-squat', 3, '12-15', 45), item('dumbbell-shoulder-press', 3, '10-12', 45), item('dumbbell-curl', 3, '12-15', 45), item('close-grip-push-up', 3, '8-12', 45)]),
      workout(5, 'fat-loss-lower-2', 'Lower Conditioning', 'A second lower-body circuit with a steady pace.', 30, [item('reverse-lunge', 3, '10 each side', 30), item('bodyweight-squat', 3, '15-20', 30), item('hip-thrust', 3, '12-15', 30), item('plank', 3, '30 sec', 30)]),
      workout(6, 'fat-loss-mobility', 'Active Recovery', 'A lighter session to keep the week moving.', 25, [item('reverse-lunge', 3, '10 each side', 30), item('plank', 3, '30 sec', 30), item('bodyweight-squat', 3, '12-15', 30)]),
    ],
  },
  {
    id: 'home-fitness-six-day', name: 'Home Fitness - 6 Day', description: 'Train at home with bodyweight and simple equipment, then rest on Day 7.', goal: 'improve_fitness', level: 'beginner', location: 'home', daysPerWeek: 6, estimatedDurationMinutes: 30,
    workouts: [
      workout(1, 'home-fitness-a', 'Home Strength A', 'A practical bodyweight foundation.', 30, [item('bodyweight-squat', 3, '12-20', 45), item('push-up', 3, '8-15', 45), item('plank', 3, '30-45 sec', 30)]),
      workout(2, 'home-fitness-b', 'Home Strength B', 'Single-leg work and core control.', 30, [item('reverse-lunge', 3, '10 each side', 45), item('close-grip-push-up', 3, '8-12', 45), item('crunch', 3, '15-20', 30)]),
      workout(3, 'home-fitness-c', 'Home Conditioning', 'A balanced home session with easy transitions.', 30, [item('goblet-squat', 3, '10-15', 60), item('hip-thrust', 3, '12-15', 45), item('bicycle-crunch', 3, '12 each side', 30)]),
      workout(4, 'home-fitness-d', 'Home Strength C', 'A second upper-body and core session with no machines.', 30, [item('push-up', 3, '8-15', 45), item('reverse-lunge', 3, '10 each side', 45), item('russian-twist', 3, '12 each side', 30)]),
      workout(5, 'home-fitness-e', 'Home Lower Body', 'Build lower-body endurance with simple patterns.', 30, [item('bodyweight-squat', 4, '12-20', 45), item('hip-thrust', 3, '12-15', 45), item('plank', 3, '30-45 sec', 30)]),
      workout(6, 'home-fitness-f', 'Home Conditioning', 'Finish the week with a balanced home circuit.', 30, [item('goblet-squat', 3, '10-15', 60), item('close-grip-push-up', 3, '8-12', 45), item('bicycle-crunch', 3, '12 each side', 30)]),
    ],
  },
];
