import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkoutExerciseCard} from '../../components/workouts/WorkoutExerciseCard';
import {exercises} from '../../data/exercises';
import {workoutPlans} from '../../data/workoutPlans';
import type {WorkoutStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutDetails'>;

export function WorkoutDetailsScreen({navigation, route}: Props) {
  const plan = workoutPlans.find(item => item.id === route.params.planId);
  const workout = plan?.workouts.find(item => item.id === route.params.workoutId);

  if (!plan || !workout)
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>Workout not found</Text>
        <Text style={styles.missingText}>This workout is no longer available.</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>
        {plan.name} · DAY {workout.dayNumber}
      </Text>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.description}>{workout.description}</Text>
      <View style={styles.summary}>
        <Text style={styles.summaryValue}>{workout.estimatedDurationMinutes} min</Text>
        <Text style={styles.summaryLabel}>ESTIMATED DURATION</Text>
        <Text style={styles.summaryValue}>{workout.exercises.length}</Text>
        <Text style={styles.summaryLabel}>EXERCISES</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('WorkoutExecution', {planId: plan.id, workoutId: workout.id})}
        style={styles.startButton}
      >
        <Text style={styles.startButtonText}>▶ Start Workout</Text>
      </Pressable>
      <Text style={styles.section}>EXERCISES</Text>
      <View style={styles.list}>
        {workout.exercises.map(workoutExercise => (
          <WorkoutExerciseCard
            key={workoutExercise.exerciseId}
            exercise={exercises.find(item => item.id === workoutExercise.exerciseId)}
            onPress={exerciseId => navigation.navigate('ExerciseDetails', {exerciseId})}
            workoutExercise={workoutExercise}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F1',
    gap: 12,
    padding: 20,
    paddingBottom: 44,
  },
  eyebrow: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginTop: 8},
  title: {color: '#10211B', fontSize: 31, fontWeight: '800'},
  description: {color: '#607069', fontSize: 16, lineHeight: 24},
  summary: {
    alignItems: 'center',
    backgroundColor: '#163B2A',
    borderRadius: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-around',
    padding: 18,
  },
  summaryValue: {color: '#B8E986', fontSize: 24, fontWeight: '800'},
  summaryLabel: {color: '#C5D7CB', fontSize: 10, fontWeight: '800', letterSpacing: 0.8},
  startButton: {
    backgroundColor: '#B8E986',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {color: '#10211B', fontSize: 18, fontWeight: '800'},
  section: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginTop: 14},
  list: {gap: 10},
  missing: {
    alignItems: 'center',
    backgroundColor: '#F4F7F1',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  missingTitle: {color: '#10211B', fontSize: 24, fontWeight: '800'},
  missingText: {color: '#607069', fontSize: 16, marginTop: 8},
});
