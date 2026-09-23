import {StyleSheet, TextInput} from 'react-native';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
};

export function ExerciseSearchBar({value, onChangeText}: Props) {
  return (
    <TextInput
      accessibilityLabel="Search exercises"
      autoCapitalize="none"
      clearButtonMode="while-editing"
      onChangeText={onChangeText}
      placeholder="Search exercises"
      placeholderTextColor="#82908A"
      returnKeyType="search"
      style={styles.input}
      value={value}
    />
  );
}

const styles = StyleSheet.create({
  input: {backgroundColor: '#FFFFFF', borderColor: '#DCE6DD', borderRadius: 12, borderWidth: 1, color: '#10211B', fontSize: 16, minHeight: 52, paddingHorizontal: 16},
});
