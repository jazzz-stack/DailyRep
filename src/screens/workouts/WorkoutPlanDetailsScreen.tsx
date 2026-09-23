import {ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkoutCard} from '../../components/workouts/WorkoutCard';
import {workoutPlans} from '../../data/workoutPlans';
import type {WorkoutStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'WorkoutPlanDetails'>;
const labelize = (value: string) => value.replaceAll('_', ' ');

export function WorkoutPlanDetailsScreen({navigation, route}: Props) {
  const plan = workoutPlans.find(item => item.id === route.params.planId);

  if (!plan) return <Missing title="Workout plan not found" message="This plan is no longer available." />;

  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.eyebrow}>WORKOUT PLAN</Text><Text style={styles.title}>{plan.name}</Text><Text style={styles.description}>{plan.description}</Text><View style={styles.infoGrid}><Info label="Goal" value={labelize(plan.goal)} /><Info label="Level" value={labelize(plan.level)} /><Info label="Location" value={labelize(plan.location)} /><Info label="Frequency" value={`${plan.daysPerWeek} days/week`} /><Info label="Duration" value={`${plan.estimatedDurationMinutes} min`} /></View><Text style={styles.section}>WORKOUT SCHEDULE</Text><View style={styles.list}>{plan.workouts.map((workout, index) => <WorkoutCard key={workout.id} dayNumber={index + 1} onPress={workoutId => navigation.navigate('WorkoutDetails', {planId: plan.id, workoutId})} workout={workout} />)}</View></ScrollView>;
}

function Info({label, value}: {label: string; value: string}) { return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>; }
function Missing({title, message}: {title: string; message: string}) { return <View style={styles.missing}><Text style={styles.missingTitle}>{title}</Text><Text style={styles.missingText}>{message}</Text></View>; }

const styles = StyleSheet.create({container: {backgroundColor: '#F4F7F1', gap: 12, padding: 20, paddingBottom: 44}, eyebrow: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginTop: 8}, title: {color: '#10211B', fontSize: 31, fontWeight: '800'}, description: {color: '#607069', fontSize: 16, lineHeight: 24}, infoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8}, info: {backgroundColor: '#FFFFFF', borderRadius: 12, flexBasis: '46%', flexGrow: 1, minWidth: 0, padding: 14}, infoLabel: {color: '#82908A', fontSize: 11, fontWeight: '800', textTransform: 'uppercase'}, infoValue: {color: '#10211B', fontSize: 15, fontWeight: '700', marginTop: 5, textTransform: 'capitalize'}, section: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginTop: 16}, list: {gap: 10}, missing: {alignItems: 'center', backgroundColor: '#F4F7F1', flex: 1, justifyContent: 'center', padding: 28}, missingTitle: {color: '#10211B', fontSize: 24, fontWeight: '800'}, missingText: {color: '#607069', fontSize: 16, marginTop: 8}});
