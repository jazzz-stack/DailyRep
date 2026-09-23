import {ScrollView, StyleSheet, Text, Pressable, View} from 'react-native';

type FilterOption = {label: string; value: string};

type Props = {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value?: string) => void;
};

export function ExerciseFilter({label, options, value, onChange}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.options}>
        {options.map(option => {
          const selected = option.value === (value ?? 'all');
          return (
            <Pressable accessibilityRole="radio" accessibilityState={{selected}} key={option.value} onPress={() => onChange(option.value === 'all' ? undefined : option.value)} style={[styles.option, selected && styles.selected]}>
              <Text style={[styles.optionText, selected && styles.selectedText]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {gap: 7},
  label: {color: '#4C765F', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase'},
  options: {gap: 8, paddingRight: 12},
  option: {backgroundColor: '#FFFFFF', borderColor: '#DCE6DD', borderRadius: 20, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9},
  selected: {backgroundColor: '#163B2A', borderColor: '#163B2A'},
  optionText: {color: '#607069', fontSize: 13, fontWeight: '700', textTransform: 'capitalize'},
  selectedText: {color: '#FFFFFF'},
});
