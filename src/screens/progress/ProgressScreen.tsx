import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import {useProgress} from '../../hooks/useProgress';
import {getExercisesFromSessions, calculateExerciseProgress} from '../../utils/progressCalculations';
import {exercises} from '../../data/exercises';
import type {ExerciseStackParamList, MainTabParamList} from '../../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Progress'>,
  NativeStackScreenProps<ExerciseStackParamList>
>;

export function ProgressScreen({navigation}: Props) {
  const {sessions, stats, weeklyStats, isLoading, error, refresh} = useProgress();

  const topExercises = useMemo(() => {
    if (!sessions.length) return [];

    const exerciseIds = getExercisesFromSessions(sessions);
    return exerciseIds
      .map(id => {
        const progress = calculateExerciseProgress(id, sessions, 3);
        return {id, ...progress};
      })
      .filter(ex => ex.totalSessions > 0)
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, 5);
  }, [sessions]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#163B2A" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Unable to load progress</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isEmpty = !stats || stats.totalWorkouts === 0;

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>No progress yet</Text>
          <Text style={styles.emptyMessage}>Complete your first workout to start tracking your progress.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>Your Progress</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Workouts</Text>
          <Text style={styles.statValue}>{stats?.totalWorkouts || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>{stats?.thisWeekWorkouts || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Duration</Text>
          <Text style={styles.statValue}>{formatDuration(stats?.totalDurationSeconds || 0)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Sets</Text>
          <Text style={styles.statValue}>{stats?.totalSets || 0}</Text>
        </View>
      </View>

      {/* Weekly Chart */}
      {weeklyStats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.weeklyChart}>
            {weeklyStats.map((week, idx) => {
              const maxWorkouts = Math.max(...weeklyStats.map(w => w.workoutCount), 6);
              const height = (week.workoutCount / maxWorkouts) * 120;

              return (
                <View key={idx} style={styles.weekColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {height: height || 8, backgroundColor: week.workoutCount > 0 ? '#163B2A' : '#E8E8E8'},
                      ]}
                    />
                  </View>
                  <Text style={styles.weekLabel}>{getWeekDay(week.weekStart)}</Text>
                  <Text style={styles.weekCount}>{week.workoutCount}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Top Exercises */}
      {topExercises.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Exercises</Text>
          {topExercises.map((ex, idx) => {
            const exerciseData = exercises.find(e => e.id === ex.id);
            return (
              <Pressable
                key={idx}
                onPress={() => navigation.navigate('ExerciseProgress', {exerciseId: ex.id})}
                style={({pressed}) => [styles.exerciseItem, pressed && styles.exerciseItemPressed]}
              >
                <View style={styles.exerciseItemContent}>
                  <Text style={styles.exerciseName}>{exerciseData?.name || 'Unknown'}</Text>
                  <Text style={styles.exerciseStats}>
                    {ex.totalSessions} {ex.totalSessions === 1 ? 'session' : 'sessions'}
                  </Text>
                </View>
                {ex.latestPerformance && (
                  <View style={styles.exercisePerformance}>
                    <Text style={styles.performanceValue}>
                      {ex.latestPerformance.weight > 0 ? `${ex.latestPerformance.weight} lbs` : '—'}
                    </Text>
                    <Text style={styles.performanceReps}>{ex.latestPerformance.reps} reps</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Workout History Link */}
      <View style={styles.section}>
        <Pressable
          onPress={() => navigation.navigate('WorkoutHistory')}
          style={({pressed}) => [styles.historyButton, pressed && styles.historyButtonPressed]}
        >
          <View style={styles.historyButtonContent}>
            <Text style={styles.historyButtonText}>View Full Workout History</Text>
            <Text style={styles.historyChevron}>›</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getWeekDay(date: Date): string {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days[date.getDay()];
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F1',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  header: {
    color: '#10211B',
    fontSize: 28,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  statLabel: {
    color: '#607069',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#163B2A',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: '#10211B',
    fontSize: 18,
    fontWeight: '800',
  },
  weeklyChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
  },
  weekColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 4,
  },
  barContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 8,
  },
  weekLabel: {
    color: '#607069',
    fontSize: 12,
    fontWeight: '600',
  },
  weekCount: {
    color: '#10211B',
    fontSize: 11,
    fontWeight: '800',
  },
  exerciseItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseItemPressed: {
    opacity: 0.7,
  },
  exerciseItemContent: {
    flex: 1,
  },
  exerciseName: {
    color: '#10211B',
    fontSize: 14,
    fontWeight: '800',
  },
  exerciseStats: {
    color: '#607069',
    fontSize: 12,
    marginTop: 2,
  },
  exercisePerformance: {
    alignItems: 'flex-end',
  },
  performanceValue: {
    color: '#163B2A',
    fontSize: 14,
    fontWeight: '800',
  },
  performanceReps: {
    color: '#607069',
    fontSize: 12,
    marginTop: 2,
  },
  historyButton: {
    backgroundColor: '#163B2A',
    borderRadius: 12,
    padding: 14,
  },
  historyButtonPressed: {
    opacity: 0.8,
  },
  historyButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#B8E986',
    fontSize: 14,
    fontWeight: '800',
  },
  historyChevron: {
    color: '#B8E986',
    fontSize: 18,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  loadingText: {
    color: '#607069',
    fontSize: 16,
    marginTop: 12,
  },
  errorTitle: {
    color: '#10211B',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorMessage: {
    color: '#607069',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#163B2A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#B8E986',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyTitle: {
    color: '#10211B',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyMessage: {
    color: '#607069',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
