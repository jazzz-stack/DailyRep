import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { LogoutConfirmationModal } from '../../components/LogoutConfirmationModal';
import { getAuthErrorMessage } from '../../services/authService';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

const goalLabels = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  increase_strength: 'Increase Strength',
  improve_fitness: 'Improve Fitness',
};
const genderLabels = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
  prefer_not_to_say: 'Prefer not to say',
};
const levelLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};
const preferenceLabels = { home: 'Home', gym: 'Gym', both: 'Home & Gym' };
const durationLabels = {
  '15_30': '15-30 minutes',
  '30_45': '30-45 minutes',
  '45_60': '45-60 minutes',
  '60_plus': '60+ minutes',
};

export function ProfileScreen({ navigation }: Props) {
  const { profile, refreshProfile, signOut, user } = useAuth();
  const [isLoading, setIsLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  function confirmLogout() {
    setIsLogoutModalVisible(true);
  }

  useEffect(() => {
    let active = true;
    refreshProfile()
      .catch(authError => {
        if (active)
          setError(
            getAuthErrorMessage(
              authError,
              'Unable to load your profile right now.',
            ),
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshProfile]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#37734F" size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>YOUR PROFILE</Text>
      <Text style={styles.title}>
        {profile?.name || 'Complete your profile'}
      </Text>
      <Text style={styles.email}>
        {profile?.phoneNumber ??
          user?.phoneNumber ??
          'Phone number not available'}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {profile ? (
        <View style={styles.details}>
          <Detail
            label="Fitness goal"
            value={
              profile.fitnessGoal ? goalLabels[profile.fitnessGoal] : 'Not set'
            }
          />
          <Detail
            label="Fitness level"
            value={
              profile.fitnessLevel
                ? levelLabels[profile.fitnessLevel]
                : 'Not set'
            }
          />
          <Detail
            label="Workout preference"
            value={
              profile.workoutPreference
                ? preferenceLabels[profile.workoutPreference]
                : 'Not set'
            }
          />
          <Detail
            label="Workout frequency"
            value={
              profile.workoutFrequency
                ? `${profile.workoutFrequency} days/week`
                : 'Not set'
            }
          />
          <Detail
            label="Workout duration"
            value={
              profile.workoutDuration
                ? durationLabels[profile.workoutDuration]
                : 'Not set'
            }
          />
          <Detail
            label="Age"
            value={profile.age ? `${profile.age}` : 'Not set'}
          />
          <Detail
            label="Gender"
            value={profile.gender ? genderLabels[profile.gender] : 'Not set'}
          />
          <Detail
            label="Height"
            value={profile.height ? `${profile.height} cm` : 'Not set'}
          />
          <Detail
            label="Weight"
            value={profile.weight ? `${profile.weight} kg` : 'Not set'}
          />
        </View>
      ) : (
        <Text style={styles.empty}>
          Add your fitness details to personalize DailyRep.
        </Text>
      )}
      <Pressable
        onPress={() => navigation.getParent()?.navigate('EditProfile')}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryText}>
          {profile ? 'Edit profile' : 'Set up profile'}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.getParent()?.navigate('NotificationSettings')}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryText}>Notification Settings</Text>
      </Pressable>
      <Pressable onPress={confirmLogout} style={styles.logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
      <LogoutConfirmationModal
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={() => {
          setIsLogoutModalVisible(false);
          return signOut();
        }}
        visible={isLogoutModalVisible}
      />
    </ScrollView>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    backgroundColor: '#F4F7F1',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#F4F7F1',
    gap: 12,
    padding: 24,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#4C765F',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 16,
  },
  title: { color: '#10211B', fontSize: 34, fontWeight: '800', marginTop: 4 },
  email: { color: '#607069', fontSize: 15 },
  details: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 18,
    overflow: 'hidden',
  },
  detail: { borderBottomColor: '#EDF1EC', borderBottomWidth: 1, padding: 16 },
  detailLabel: {
    color: '#82908A',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#10211B',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
  },
  empty: { color: '#607069', fontSize: 16, lineHeight: 24, marginTop: 24 },
  error: { color: '#B42318', fontSize: 14 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#B8E986',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 12,
  },
  primaryText: { color: '#10211B', fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#E0E8E3',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 54,
    marginTop: 8,
  },
  secondaryText: { color: '#10211B', fontSize: 16, fontWeight: '700' },
  logout: { alignItems: 'center', padding: 14 },
  logoutText: { color: '#37734F', fontWeight: '700' },
});
