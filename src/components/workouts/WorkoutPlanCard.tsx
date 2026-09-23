import {memo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {WorkoutPlan} from '../../types/workout';

type Props = {plan: WorkoutPlan; recommended: boolean; onPress: (planId: string) => void};
const labelize = (value: string) => value.replaceAll('_', ' ');

export const WorkoutPlanCard = memo(function WorkoutPlanCardView({plan, recommended, onPress}: Props) {
  return (
    <Pressable accessibilityLabel={`Open ${plan.name}`} accessibilityRole="button" onPress={() => onPress(plan.id)} style={styles.card}>
      {recommended ? <Text style={styles.badge}>RECOMMENDED FOR YOU</Text> : null}
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.description}>{plan.description}</Text>
      <View style={styles.metaGrid}>
        <Meta label="Goal" value={labelize(plan.goal)} />
        <Meta label="Level" value={labelize(plan.level)} />
        <Meta label="Location" value={labelize(plan.location)} />
        <Meta label="Frequency" value={`${plan.daysPerWeek} days/week`} />
      </View>
      <Text style={styles.footer}>{plan.estimatedDurationMinutes} min  |  {plan.workouts.length} workouts</Text>
    </Pressable>
  );
});

function Meta({label, value}: {label: string; value: string}) {
  return <View style={styles.meta}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18},
  badge: {color: '#37734F', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 10},
  name: {color: '#10211B', fontSize: 21, fontWeight: '800'},
  description: {color: '#607069', fontSize: 14, lineHeight: 21, marginTop: 7},
  metaGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16},
  meta: {flexBasis: '46%', flexGrow: 1, minWidth: 0},
  metaLabel: {color: '#82908A', fontSize: 11, fontWeight: '800', textTransform: 'uppercase'},
  metaValue: {color: '#10211B', fontSize: 13, fontWeight: '700', marginTop: 3, textTransform: 'capitalize'},
  footer: {color: '#4C765F', fontSize: 13, fontWeight: '800', marginTop: 17},
});
