import {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {Exercise} from '../../types/exercise';
import type {WorkoutExercise} from '../../types/workout';

type Props = {exercise: Exercise | undefined; workoutExercise: WorkoutExercise; onPress: (exerciseId: string) => void};

export const WorkoutExerciseCard = memo(function WorkoutExerciseCardView({exercise, workoutExercise, onPress}: Props) {
  if (!exercise) return <View style={styles.card}><Text style={styles.missing}>Exercise unavailable</Text></View>;
  return <Pressable accessibilityLabel={`Open ${exercise.name}`} accessibilityRole="button" onPress={() => onPress(exercise.id)} style={styles.card}><View style={styles.content}><Text style={styles.name}>{exercise.name}</Text><Text style={styles.meta}>{exercise.primaryMuscle}  |  {exercise.equipment}</Text><Text style={styles.prescription}>{workoutExercise.sets} sets x {workoutExercise.reps} reps</Text><Text style={styles.rest}>Rest: {workoutExercise.restSeconds} sec</Text>{workoutExercise.notes ? <Text style={styles.notes}>{workoutExercise.notes}</Text> : null}</View><Text style={styles.arrow}>›</Text></Pressable>;
});

const styles = StyleSheet.create({card: {backgroundColor: '#FFFFFF', borderRadius: 14, minHeight: 104, padding: 16}, content: {gap: 5}, name: {color: '#10211B', fontSize: 17, fontWeight: '800'}, meta: {color: '#607069', fontSize: 13, textTransform: 'capitalize'}, prescription: {color: '#163B2A', fontSize: 15, fontWeight: '800', marginTop: 5}, rest: {color: '#4C765F', fontSize: 13, fontWeight: '700'}, notes: {color: '#607069', fontSize: 13, fontStyle: 'italic', lineHeight: 18}, arrow: {color: '#82908A', fontSize: 28, position: 'absolute', right: 14, top: 35}, missing: {color: '#B42318', fontSize: 15, fontWeight: '700'}});
