import {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {Exercise} from '../../types/exercise';

const labelize = (value: string) => value.replaceAll('_', ' ');

type Props = {
  exercise: Exercise;
  onPress: (exerciseId: string) => void;
};

export const ExerciseCard = memo(function ExerciseCardView({exercise, onPress}: Props) {
  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(exercise.id)} style={styles.card}>
      <View style={styles.placeholder}><Text style={styles.placeholderText}>{exercise.name.slice(0, 1)}</Text></View>
      <View style={styles.content}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>{labelize(exercise.primaryMuscle)}  |  {labelize(exercise.equipment)}</Text>
        <Text style={styles.difficulty}>{labelize(exercise.difficulty)}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, flexDirection: 'row', gap: 12, minHeight: 88, padding: 12},
  placeholder: {alignItems: 'center', backgroundColor: '#E4F6D2', borderRadius: 12, height: 62, justifyContent: 'center', width: 62},
  placeholderText: {color: '#37734F', fontSize: 24, fontWeight: '800'},
  content: {flex: 1, gap: 4},
  name: {color: '#10211B', fontSize: 16, fontWeight: '800'},
  meta: {color: '#607069', fontSize: 13, textTransform: 'capitalize'},
  difficulty: {color: '#4C765F', fontSize: 12, fontWeight: '700', textTransform: 'capitalize'},
  arrow: {color: '#82908A', fontSize: 28, paddingHorizontal: 4},
});
