import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WorkoutFilter } from '../../components/workouts/WorkoutFilter';
import { WorkoutPlanCard } from '../../components/workouts/WorkoutPlanCard';
import { workoutPlans } from '../../data/workoutPlans';
import {
  filterWorkoutPlans,
  isWorkoutPlanMatch,
  type WorkoutPlanFilters,
} from '../../utils/workoutPlanMatching';
import type { WorkoutPlan } from '../../types/workout';
import type { WorkoutStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutPlans'>;
type Option = { label: string; value: string };

const goalOptions: Option[] = [
  { label: 'All', value: 'all' },
  { label: 'Lose weight', value: 'lose_weight' },
  { label: 'Build muscle', value: 'build_muscle' },
  { label: 'Increase strength', value: 'increase_strength' },
  { label: 'Improve fitness', value: 'improve_fitness' },
];
const levelOptions: Option[] = [
  { label: 'All', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];
const locationOptions: Option[] = [
  { label: 'All', value: 'all' },
  { label: 'Home', value: 'home' },
  { label: 'Gym', value: 'gym' },
  { label: 'Both', value: 'both' },
];

export function WorkoutPlansScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<WorkoutPlanFilters>({});
  const filteredPlans = useMemo(
    () => filterWorkoutPlans(workoutPlans, filters),
    [filters],
  );
  const recommendedPlans = useMemo(
    () => filteredPlans.filter(plan => isWorkoutPlanMatch(plan, profile)),
    [filteredPlans, profile],
  );
  const recommendedIds = useMemo(
    () => new Set(recommendedPlans.map(plan => plan.id)),
    [recommendedPlans],
  );

  function updateFilter<Key extends keyof WorkoutPlanFilters>(
    key: Key,
    value?: WorkoutPlanFilters[Key],
  ) {
    setFilters(current => ({ ...current, [key]: value }));
  }

  function renderPlan({ item }: { item: WorkoutPlan }) {
    return (
      <WorkoutPlanCard
        onPress={planId =>
          navigation.navigate('WorkoutPlanDetails', { planId })
        }
        plan={item}
        recommended={recommendedIds.has(item.id)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        data={filteredPlans}
        ItemSeparatorComponent={PlanSeparator}
        keyExtractor={plan => plan.id}
        ListEmptyComponent={<EmptyState onReset={() => setFilters({})} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>DAILYREP</Text>
            <Text style={styles.title}>Workout Plans</Text>
            <Text style={styles.subtitle}>
              Train 6 days and recover on Day 7 with a structured plan.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('ExerciseLibrary')}
              style={styles.libraryLink}
            >
              <Text style={styles.libraryLinkText}>
                Browse Exercise Library ›
              </Text>
            </Pressable>
            <WorkoutFilter
              label="Goal"
              onChange={value =>
                updateFilter('goal', value as WorkoutPlanFilters['goal'])
              }
              options={goalOptions}
              value={filters.goal}
            />
            <WorkoutFilter
              label="Difficulty"
              onChange={value =>
                updateFilter('level', value as WorkoutPlanFilters['level'])
              }
              options={levelOptions}
              value={filters.level}
            />
            <WorkoutFilter
              label="Location"
              onChange={value =>
                updateFilter(
                  'location',
                  value as WorkoutPlanFilters['location'],
                )
              }
              options={locationOptions}
              value={filters.location}
            />
            <Text style={styles.count}>
              {filteredPlans.length} plans available
            </Text>
          </View>
        }
        renderItem={renderPlan}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function PlanSeparator() {
  return <View style={styles.separator} />;
}
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No workout plans found.</Text>
      <Text style={styles.emptyText}>Try changing your filters.</Text>
      <Pressable onPress={onReset} style={styles.reset}>
        <Text style={styles.resetText}>Reset filters</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F4F7F1', flex: 1 },
  content: { padding: 20, paddingBottom: 36 },
  header: { gap: 12, paddingBottom: 18 },
  eyebrow: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  title: { color: '#10211B', fontSize: 32, fontWeight: '800' },
  subtitle: { color: '#607069', fontSize: 16, lineHeight: 23 },
  libraryLink: {
    alignSelf: 'flex-start',
    backgroundColor: '#E4F6D2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  libraryLinkText: { color: '#163B2A', fontSize: 14, fontWeight: '800' },
  count: { color: '#82908A', fontSize: 13, fontWeight: '700' },
  separator: { height: 10 },
  empty: { alignItems: 'center', padding: 48 },
  emptyTitle: {
    color: '#10211B',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: { color: '#607069', fontSize: 15, marginTop: 8 },
  reset: {
    backgroundColor: '#B8E986',
    borderRadius: 10,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resetText: { color: '#10211B', fontWeight: '800' },
});
