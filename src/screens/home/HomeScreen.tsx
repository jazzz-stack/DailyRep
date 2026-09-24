import {Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useHomeDashboard} from '../../hooks/useHomeDashboard';
import {formatRelativeDate} from '../../utils/dateUtils';
import type {MainTabParamList} from '../../types/navigation';

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    displayName,
    greeting,
    formattedDate,
    todayWorkout,
    todayPlan,
    isRestDay,
    isTodayCompleted,
    completedTodaySessionId,
    inProgressWorkout,
    inProgressWorkoutName,
    weeklyWorkoutCount,
    weeklyWorkoutTarget,
    currentStreak,
    recentSessions,
    loading,
    error,
  } = useHomeDashboard();

  const handleStartWorkout = () => {
    if (todayPlan && todayWorkout) {
      (navigation as any).navigate('Workouts', {
        screen: 'WorkoutExecution',
        params: {
          planId: todayPlan.id,
          workoutId: todayWorkout.id,
        },
      });
    }
  };

  const handleContinueWorkout = () => {
    if (inProgressWorkout) {
      (navigation as any).navigate('Workouts', {
        screen: 'WorkoutExecution',
        params: {
          planId: inProgressWorkout.planId,
          workoutId: inProgressWorkout.workoutId,
        },
      });
    }
  };

  const handleViewCompletedWorkout = () => {
    if (completedTodaySessionId) {
      (navigation as any).navigate('Workouts', {
        screen: 'WorkoutHistoryDetail',
        params: {sessionId: completedTodaySessionId},
      });
    }
  };

  const handleViewProgress = () => {
    navigation.navigate('Progress');
  };

  const handleViewWorkouts = () => {
    (navigation as any).navigate('Workouts', {
      screen: 'WorkoutPlans',
    });
  };

  const handleViewHistory = () => {
    (navigation as any).navigate('Workouts', {
      screen: 'WorkoutHistory',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#37734F" />
        <Text style={styles.loadingText}>Loading your workout...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>{formattedDate}</Text>
      <Text style={styles.title}>
        {greeting}
        {displayName ? `, ${displayName}` : ''} 👋
      </Text>

      {/* Workout card or rest day or error */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Unable to load workout</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable style={styles.errorButton} onPress={handleViewWorkouts}>
            <Text style={styles.errorButtonText}>View Workouts</Text>
          </Pressable>
        </View>
      ) : inProgressWorkout ? (
        <View style={styles.workoutCard}>
          <Text style={styles.cardLabel}>IN PROGRESS</Text>
          <Text style={styles.workoutTitle}>{inProgressWorkoutName || 'Continue Workout'}</Text>
          <Text style={styles.cardDetail}>You have an unfinished workout. Resume and complete it!</Text>
          <Pressable style={styles.primaryButton} onPress={handleContinueWorkout}>
            <Text style={styles.primaryText}>Continue Workout</Text>
          </Pressable>
        </View>
      ) : isRestDay ? (
        <View style={styles.workoutCard}>
          <Text style={styles.cardLabel}>REST & RECOVERY</Text>
          <Text style={styles.workoutTitle}>You've completed your scheduled workouts for the week.</Text>
          <Text style={styles.cardDetail}>Take today to recover and come back stronger.</Text>
          <Pressable style={styles.primaryButton} onPress={handleViewProgress}>
            <Text style={styles.primaryText}>View Progress</Text>
          </Pressable>
        </View>
      ) : !todayPlan || !todayWorkout ? (
        <View style={styles.workoutCard}>
          <Text style={styles.cardLabel}>TODAY'S WORKOUT</Text>
          <Text style={styles.workoutTitle}>Your workout plan isn't set up yet.</Text>
          <Text style={styles.cardDetail}>Choose a workout and get started with your fitness journey.</Text>
          <Pressable style={styles.primaryButton} onPress={handleViewWorkouts}>
            <Text style={styles.primaryText}>View Workouts</Text>
          </Pressable>
        </View>
      ) : isTodayCompleted ? (
        <View style={styles.workoutCard}>
          <Text style={styles.cardLabel}>TODAY'S WORKOUT</Text>
          <Text style={styles.workoutTitle}>{todayWorkout.name}</Text>
          <Text style={styles.cardDetail}>{todayWorkout.exercises.length} exercises · about {todayWorkout.estimatedDurationMinutes} min</Text>
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Completed today ✓</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={handleViewCompletedWorkout}>
            <Text style={styles.primaryText}>View workout</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.workoutCard}>
          <Text style={styles.cardLabel}>TODAY'S WORKOUT</Text>
          <Text style={styles.workoutTitle}>{todayWorkout.name}</Text>
          <Text style={styles.cardDetail}>{todayWorkout.exercises.length} exercises · about {todayWorkout.estimatedDurationMinutes} min</Text>
          <Pressable style={styles.primaryButton} onPress={handleStartWorkout}>
            <Text style={styles.primaryText}>Start workout</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.subtitle}>{/* Dynamic subtitle from hook */}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {weeklyWorkoutCount} / {weeklyWorkoutTarget}
          </Text>
          <Text style={styles.statLabel}>THIS WEEK</Text>
        </View>
      </View>

      {/* Recent activity */}
      {recentSessions.length > 0 && (
        <View style={styles.recentActivityContainer}>
          <Text style={styles.recentActivityTitle}>RECENT ACTIVITY</Text>

          {recentSessions.map(session => (
            <View key={session.sessionId} style={styles.recentActivityItem}>
              <View style={styles.recentActivityContent}>
                <Text style={styles.recentActivityWorkoutName}>{session.workoutName}</Text>
                <Text style={styles.recentActivityMeta}>
                  {formatRelativeDate(session.completedAt)} · {Math.round(session.durationSeconds / 60)} min
                </Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.viewHistoryButton} onPress={handleViewHistory}>
            <Text style={styles.viewHistoryText}>View History →</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F4F7F1',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#607069',
    fontSize: 16,
    marginTop: 12,
  },
  eyebrow: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 18,
  },
  title: {
    color: '#10211B',
    fontSize: 36,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#607069',
    fontSize: 16,
    marginTop: 16,
  },
  workoutCard: {
    backgroundColor: '#163B2A',
    borderRadius: 18,
    marginTop: 26,
    padding: 22,
  },
  errorCard: {
    backgroundColor: '#FEE4E4',
    borderRadius: 18,
    marginTop: 26,
    padding: 22,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorTitle: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '800',
  },
  errorMessage: {
    color: '#991B1B',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    marginTop: 16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  cardLabel: {
    color: '#B8E986',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 18,
  },
  cardDetail: {
    color: '#C5D7CB',
    fontSize: 14,
    marginTop: 8,
  },
  completedBadge: {
    backgroundColor: 'rgba(184, 233, 134, 0.2)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  completedText: {
    color: '#B8E986',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#B8E986',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 50,
  },
  primaryText: {
    color: '#10211B',
    fontSize: 15,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  stat: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flex: 1,
    padding: 18,
  },
  statValue: {
    color: '#10211B',
    fontSize: 25,
    fontWeight: '800',
  },
  statLabel: {
    color: '#607069',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },
  recentActivityContainer: {
    marginTop: 28,
  },
  recentActivityTitle: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  recentActivityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  recentActivityContent: {
    flex: 1,
  },
  recentActivityWorkoutName: {
    color: '#10211B',
    fontSize: 15,
    fontWeight: '700',
  },
  recentActivityMeta: {
    color: '#607069',
    fontSize: 13,
    marginTop: 4,
  },
  viewHistoryButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  viewHistoryText: {
    color: '#37734F',
    fontSize: 14,
    fontWeight: '700',
  },
});