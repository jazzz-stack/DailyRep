import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useAuth} from '../../context/AuthContext';

export function HomeScreen() {
  const {profile, user} = useAuth();
  const displayName = profile?.name || user?.displayName;

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>WEDNESDAY, SEPTEMBER 23</Text>
      <Text style={styles.title}>Good morning{displayName ? `, ${displayName}` : ''} 👋</Text>
      <Text style={styles.subtitle}>Ready to make today count?</Text>
      <View style={styles.workoutCard}>
        <Text style={styles.cardLabel}>TODAY'S WORKOUT</Text>
        <Text style={styles.workoutTitle}>Chest & Triceps</Text>
        <Text style={styles.cardDetail}>3 exercises  |  about 45 min</Text>
        <Pressable style={styles.primaryButton}><Text style={styles.primaryText}>Start workout</Text></Pressable>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statValue}>7</Text><Text style={styles.statLabel}>DAY STREAK</Text></View>
        <View style={styles.stat}><Text style={styles.statValue}>4 / 5</Text><Text style={styles.statLabel}>THIS WEEK</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, gap: 10, padding: 24, backgroundColor: '#F4F7F1'},
  eyebrow: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.2, marginTop: 18},
  title: {color: '#10211B', fontSize: 36, fontWeight: '800', marginTop: 8},
  subtitle: {color: '#607069', fontSize: 16},
  workoutCard: {backgroundColor: '#163B2A', borderRadius: 18, marginTop: 26, padding: 22},
  cardLabel: {color: '#B8E986', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  workoutTitle: {color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 18},
  cardDetail: {color: '#C5D7CB', fontSize: 14, marginTop: 8},
  primaryButton: {alignItems: 'center', backgroundColor: '#B8E986', borderRadius: 10, justifyContent: 'center', marginTop: 24, minHeight: 50},
  primaryText: {color: '#10211B', fontSize: 15, fontWeight: '800'},
  statsRow: {flexDirection: 'row', gap: 12, marginTop: 8},
  stat: {backgroundColor: '#FFFFFF', borderRadius: 14, flex: 1, padding: 18},
  statValue: {color: '#10211B', fontSize: 25, fontWeight: '800'},
  statLabel: {color: '#607069', fontSize: 11, fontWeight: '800', marginTop: 5},
});