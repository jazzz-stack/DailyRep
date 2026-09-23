import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  Accessibility,
  Activity,
  Bike,
  BicepsFlexed,
  Cable,
  Dumbbell,
  Footprints,
  Goal,
  HeartPulse,
  Landmark,
  MoveUp,
  PersonStanding,
  StretchHorizontal,
  Trophy,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {exercises} from '../../data/exercises';
import type {ExerciseStackParamList} from '../../types/navigation';

 type Props = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseDetails'>;
const labelize = (value: string) => value.replaceAll('_', ' ');
const exerciseIcons: Record<string, LucideIcon> = {
  'push-up': Accessibility,
  'bench-press': Dumbbell,
  'incline-dumbbell-press': MoveUp,
  'dumbbell-fly': StretchHorizontal,
  'chest-press-machine': Landmark,
  'pull-up': PersonStanding,
  'lat-pulldown': Cable,
  'barbell-row': Activity,
  'seated-cable-row': Cable,
  'dumbbell-row': Dumbbell,
  'overhead-press': Trophy,
  'dumbbell-shoulder-press': MoveUp,
  'lateral-raise': Accessibility,
  'front-raise': MoveUp,
  'face-pull': Cable,
  'dumbbell-curl': BicepsFlexed,
  'barbell-curl': BicepsFlexed,
  'hammer-curl': BicepsFlexed,
  'preacher-curl': BicepsFlexed,
  'tricep-pushdown': Cable,
  'overhead-tricep-extension': MoveUp,
  'close-grip-push-up': Accessibility,
  'bench-dip': Landmark,
  'bodyweight-squat': PersonStanding,
  'barbell-squat': Trophy,
  'goblet-squat': Dumbbell,
  'romanian-deadlift': Footprints,
  'reverse-lunge': Footprints,
  'bulgarian-split-squat': Footprints,
  'leg-press': Landmark,
  'leg-curl': Activity,
  'hip-thrust': Goal,
  plank: Accessibility,
  crunch: HeartPulse,
  'bicycle-crunch': Bike,
  'leg-raise': MoveUp,
  'russian-twist': Activity,
};

export function ExerciseDetailsScreen({route}: Props) {
  const exercise = exercises.find(item => item.id === route.params.exerciseId);

  if (!exercise) {
    return <View style={styles.empty}><Text style={styles.emptyTitle}>Exercise not found</Text><Text style={styles.emptyText}>This exercise is no longer available.</Text></View>;
  }

  const ExerciseIcon = exerciseIcons[exercise.id] ?? Activity;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View accessibilityLabel={`${exercise.name} activity illustration`} style={styles.hero}>
        <ExerciseIcon color="#37734F" size={82} strokeWidth={1.7} />
      </View>
      <Text style={styles.title}>{exercise.name}</Text>
      <View style={styles.infoGrid}>
        <Info label="Primary muscle" value={labelize(exercise.primaryMuscle)} />
        <Info label="Equipment" value={labelize(exercise.equipment)} />
        <Info label="Difficulty" value={labelize(exercise.difficulty)} />
        <Info label="Type" value={labelize(exercise.type)} />
      </View>
      <Text style={styles.section}>SECONDARY MUSCLES</Text>
      <Text style={styles.body}>{exercise.secondaryMuscles.length ? exercise.secondaryMuscles.map(labelize).join(', ') : 'None listed'}</Text>
      <Text style={styles.section}>ABOUT THIS EXERCISE</Text>
      <Text style={styles.body}>{exercise.description}</Text>
      <Text style={styles.section}>HOW TO DO IT</Text>
      <View style={styles.instructions}>{exercise.instructions.map((instruction, index) => <View key={`${exercise.id}-step-${index}`} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{instruction}</Text></View>)}</View>
      {exercise.defaultSets || exercise.defaultReps || exercise.defaultRestSeconds ? <><Text style={styles.section}>RECOMMENDED WORKOUT</Text><View style={styles.recommendation}><View style={styles.recommendationItem}><Info compact label="Sets" value={exercise.defaultSets?.toString() ?? '-'} /></View><View style={styles.recommendationItem}><Info compact label="Reps" value={exercise.defaultReps ?? '-'} /></View><View style={styles.recommendationItem}><Info compact label="Rest" value={exercise.defaultRestSeconds ? `${exercise.defaultRestSeconds} sec` : '-'} /></View></View></> : null}
    </ScrollView>
  );
}

function Info({label, value, compact = false}: {label: string; value: string; compact?: boolean}) {
  return <View style={compact ? styles.compactInfo : styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#F4F7F1', gap: 12, padding: 16, paddingBottom: 44},
  hero: {alignItems: 'center', backgroundColor: '#E4F6D2', borderRadius: 18, height: 150, justifyContent: 'center'},
  title: {color: '#10211B', fontSize: 32, fontWeight: '800', marginTop: 8},
  infoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  info: {backgroundColor: '#FFFFFF', borderRadius: 12, flexBasis: '46%', flexGrow: 1, minWidth: 0, padding: 14},
  compactInfo: {flex: 1, minWidth: 0, padding: 4},
  infoLabel: {color: '#82908A', fontSize: 11, fontWeight: '800', textTransform: 'uppercase'},
  infoValue: {color: '#10211B', fontSize: 15, fontWeight: '700', marginTop: 5, textTransform: 'capitalize'},
  section: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.1, marginTop: 14},
  body: {color: '#607069', fontSize: 16, lineHeight: 24},
  instructions: {gap: 12},
  step: {alignItems: 'flex-start', flexDirection: 'row', gap: 12},
  stepNumber: {backgroundColor: '#B8E986', borderRadius: 15, color: '#10211B', fontSize: 14, fontWeight: '800', minWidth: 30, paddingVertical: 6, textAlign: 'center'},
  stepText: {color: '#607069', flex: 1, fontSize: 16, lineHeight: 24},
  recommendation: {backgroundColor: '#FFFFFF', borderRadius: 14, flexDirection: 'row', gap: 6, padding: 10},
  recommendationItem: {flex: 1, minWidth: 0},
  empty: {alignItems: 'center', backgroundColor: '#F4F7F1', flex: 1, justifyContent: 'center', padding: 28},
  emptyTitle: {color: '#10211B', fontSize: 24, fontWeight: '800'},
  emptyText: {color: '#607069', fontSize: 16, marginTop: 8},
});
