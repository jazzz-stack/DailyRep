import {useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ExerciseCard} from '../../components/exercises/ExerciseCard';
import {ExerciseFilter} from '../../components/exercises/ExerciseFilter';
import {ExerciseSearchBar} from '../../components/exercises/ExerciseSearchBar';
import {exercises} from '../../data/exercises';
import {getFilteredExercises, type ExerciseFilters} from '../../utils/exerciseFilters';
import type {Equipment, Difficulty, ExerciseType, MuscleGroup} from '../../types/exercise';
import type {ExerciseStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseLibrary'>;

type Option = {label: string; value: string};

function ExerciseSeparator() {
  return <View style={styles.separator} />;
}

const muscleOptions: Option[] = [
  {label: 'All', value: 'all'}, {label: 'Chest', value: 'chest'}, {label: 'Back', value: 'back'}, {label: 'Shoulders', value: 'shoulders'}, {label: 'Biceps', value: 'biceps'}, {label: 'Triceps', value: 'triceps'}, {label: 'Legs', value: 'legs'}, {label: 'Glutes', value: 'glutes'}, {label: 'Core', value: 'core'}, {label: 'Full body', value: 'full_body'},
];
const equipmentOptions: Option[] = [
  {label: 'All', value: 'all'}, {label: 'Bodyweight', value: 'bodyweight'}, {label: 'Dumbbell', value: 'dumbbell'}, {label: 'Barbell', value: 'barbell'}, {label: 'Kettlebell', value: 'kettlebell'}, {label: 'Machine', value: 'machine'}, {label: 'Cable', value: 'cable'}, {label: 'Resistance band', value: 'resistance_band'}, {label: 'Bench', value: 'bench'},
];
const difficultyOptions: Option[] = [
  {label: 'All', value: 'all'}, {label: 'Beginner', value: 'beginner'}, {label: 'Intermediate', value: 'intermediate'}, {label: 'Advanced', value: 'advanced'},
];
const typeOptions: Option[] = [
  {label: 'All', value: 'all'}, {label: 'Strength', value: 'strength'}, {label: 'Cardio', value: 'cardio'}, {label: 'Mobility', value: 'mobility'}, {label: 'Stretching', value: 'stretching'},
];

export function ExerciseLibraryScreen({navigation}: Props) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ExerciseFilters>({});
  const filteredExercises = useMemo(() => getFilteredExercises(exercises, query, filters), [filters, query]);

  function updateFilter<Key extends keyof ExerciseFilters>(key: Key, value?: ExerciseFilters[Key]) {
    setFilters(current => ({...current, [key]: value}));
  }

  function resetFilters() {
    setQuery('');
    setFilters({});
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredExercises}
        initialNumToRender={10}
        keyboardShouldPersistTaps="handled"
        keyExtractor={exercise => exercise.id}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>No exercises found</Text><Text style={styles.emptyText}>Try changing your search or filters.</Text><Pressable onPress={resetFilters} style={styles.reset}><Text style={styles.resetText}>Reset search and filters</Text></Pressable></View>}
        ListHeaderComponent={<View style={styles.header}>
          <Text style={styles.eyebrow}>DAILYREP</Text>
          <Text style={styles.title}>Exercise Library</Text>
          <Text style={styles.subtitle}>Find the right exercise for your workout</Text>
          <ExerciseSearchBar onChangeText={setQuery} value={query} />
          <ExerciseFilter label="Muscle group" onChange={value => updateFilter('muscleGroup', value as MuscleGroup | undefined)} options={muscleOptions} value={filters.muscleGroup} />
          <ExerciseFilter label="Equipment" onChange={value => updateFilter('equipment', value as Equipment | undefined)} options={equipmentOptions} value={filters.equipment} />
          <ExerciseFilter label="Difficulty" onChange={value => updateFilter('difficulty', value as Difficulty | undefined)} options={difficultyOptions} value={filters.difficulty} />
          <ExerciseFilter label="Exercise type" onChange={value => updateFilter('type', value as ExerciseType | undefined)} options={typeOptions} value={filters.type} />
          <Text style={styles.resultCount}>{filteredExercises.length} exercises</Text>
        </View>}
        renderItem={({item}) => <ExerciseCard exercise={item} onPress={exerciseId => navigation.navigate('ExerciseDetails', {exerciseId})} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ExerciseSeparator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#F4F7F1', flex: 1},
  listContent: {padding: 20, paddingBottom: 32},
  header: {gap: 12, paddingBottom: 18},
  eyebrow: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 8},
  title: {color: '#10211B', fontSize: 32, fontWeight: '800'},
  subtitle: {color: '#607069', fontSize: 16, lineHeight: 23, marginBottom: 5},
  resultCount: {color: '#82908A', fontSize: 13, fontWeight: '700', marginTop: 2},
  separator: {height: 10},
  empty: {alignItems: 'center', paddingHorizontal: 16, paddingVertical: 64},
  emptyTitle: {color: '#10211B', fontSize: 22, fontWeight: '800'},
  emptyText: {color: '#607069', fontSize: 15, marginTop: 8, textAlign: 'center'},
  reset: {backgroundColor: '#B8E986', borderRadius: 10, marginTop: 20, paddingHorizontal: 16, paddingVertical: 12},
  resetText: {color: '#10211B', fontWeight: '800'},
});
