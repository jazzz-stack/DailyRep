import {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {Workout} from '../../types/workout';

type Props = {workout: Workout; dayNumber: number; onPress: (workoutId: string) => void};

export const WorkoutCard = memo(function WorkoutCardView({workout, dayNumber, onPress}: Props) {
  return <Pressable accessibilityLabel={`Open Day ${dayNumber}, ${workout.name}`} accessibilityRole="button" onPress={() => onPress(workout.id)} style={styles.card}><View style={styles.day}><Text style={styles.dayLabel}>DAY</Text><Text style={styles.dayNumber}>{dayNumber}</Text></View><View style={styles.content}><Text style={styles.name}>{workout.name}</Text><Text style={styles.description}>{workout.description}</Text><Text style={styles.meta}>{workout.exercises.length} exercises  |  {workout.estimatedDurationMinutes} min</Text></View><Text style={styles.arrow}>›</Text></Pressable>;
});

const styles = StyleSheet.create({card: {alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, flexDirection: 'row', gap: 14, minHeight: 94, padding: 14}, day: {alignItems: 'center', backgroundColor: '#E4F6D2', borderRadius: 12, justifyContent: 'center', minHeight: 62, width: 62}, dayLabel: {color: '#4C765F', fontSize: 10, fontWeight: '800', letterSpacing: 1}, dayNumber: {color: '#163B2A', fontSize: 25, fontWeight: '800', marginTop: 2}, content: {flex: 1, gap: 4}, name: {color: '#10211B', fontSize: 16, fontWeight: '800'}, description: {color: '#607069', fontSize: 13, lineHeight: 18}, meta: {color: '#37734F', fontSize: 12, fontWeight: '700'}, arrow: {color: '#82908A', fontSize: 28}});
