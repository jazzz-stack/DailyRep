import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Pressable, FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useWorkoutHistory} from '../../hooks/useWorkoutHistory';
import {workoutPlans} from '../../data/workoutPlans';
import {formatRelativeDate} from '../../utils/dateUtils';
import type {WorkoutSession} from '../../types/workoutSession';
import type {ExerciseStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<ExerciseStackParamList, 'WorkoutHistory'>;

interface GroupedSession {
  date: string;
  sessions: WorkoutSession[];
}

export function WorkoutHistoryScreen({navigation}: Props) {
  const {sessions, isLoading, error, isEmpty, refresh} = useWorkoutHistory();

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups = new Map<string, WorkoutSession[]>();

    for (const session of sessions) {
      if (!session.completedAt) continue;

      const dateLabel = formatRelativeDate(session.completedAt);
      if (!groups.has(dateLabel)) {
        groups.set(dateLabel, []);
      }
      groups.get(dateLabel)!.push(session);
    }

    // Convert to array in order
    const dateOrder = ['Today', 'Yesterday'];
    const otherDates: string[] = [];

    groups.forEach((_, key) => {
      if (!dateOrder.includes(key)) {
        otherDates.push(key);
      }
    });

    const sortedDates = [...dateOrder.filter(d => groups.has(d)), ...otherDates.sort().reverse()];

    return sortedDates.map(date => ({
      date,
      sessions: groups.get(date) || [],
    }));
  }, [sessions]);

  const renderSession = ({item: group}: {item: GroupedSession}) => {
    return (
      <View style={styles.dateGroup}>
        <Text style={styles.dateLabel}>{group.date}</Text>
        {group.sessions.map(session => {
          const plan = workoutPlans.find(p => p.id === session.planId);
          const workout = plan?.workouts.find(w => w.id === session.workoutId);

          const totalSets = session.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
          const totalExercises = session.exercises.length;
          const durationStr = formatDuration(session.durationSeconds || 0);

          return (
            <Pressable
              key={session.id}
              onPress={() => navigation.navigate('WorkoutHistoryDetail', {sessionId: session.id})}
              style={({pressed}) => [styles.sessionCard, pressed && styles.sessionCardPressed]}
            >
              <View style={styles.sessionContent}>
                <Text style={styles.workoutName}>{workout?.name || 'Unknown Workout'}</Text>
                <Text style={styles.planName}>{plan?.name || 'Unknown Plan'} • Day {workout?.dayNumber || '?'}</Text>
                <View style={styles.sessionStats}>
                  <Text style={styles.statBadge}>{durationStr}</Text>
                  <Text style={styles.statBadge}>•</Text>
                  <Text style={styles.statBadge}>{totalExercises} exercises</Text>
                  <Text style={styles.statBadge}>•</Text>
                  <Text style={styles.statBadge}>{totalSets} sets</Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#163B2A" />
          <Text style={styles.loadingText}>Loading your history...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorTitle}>Unable to load history</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptyMessage}>Complete your first workout to start tracking your progress.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout History</Text>
      <FlatList
        data={groupedSessions}
        renderItem={renderSession}
        keyExtractor={(item, idx) => `${item.date}-${idx}`}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor="#163B2A" />}
        contentContainerStyle={styles.listContent}
      />
    </View>
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F7F1',
    flex: 1,
  },
  header: {
    color: '#10211B',
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    padding: 20,
    gap: 20,
    paddingBottom: 40,
  },
  dateGroup: {
    gap: 10,
  },
  dateLabel: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCardPressed: {
    opacity: 0.7,
  },
  sessionContent: {
    flex: 1,
    gap: 4,
  },
  workoutName: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '800',
  },
  planName: {
    color: '#607069',
    fontSize: 13,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  statBadge: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '600',
  },
  chevron: {
    color: '#82908A',
    fontSize: 24,
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
