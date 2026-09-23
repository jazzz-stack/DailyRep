import {Pressable, StyleSheet, Text} from 'react-native';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectionCard({label, selected, onPress}: Props) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{selected}} onPress={onPress} style={[styles.card, selected && styles.selectedCard]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DCE6DD', borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 48, paddingHorizontal: 14, paddingVertical: 10},
  selectedCard: {backgroundColor: '#E4F6D2', borderColor: '#37734F'},
  label: {color: '#607069', fontSize: 14, fontWeight: '700', textAlign: 'center'},
  selectedLabel: {color: '#163B2A'},
});