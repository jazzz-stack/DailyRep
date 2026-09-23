import {StyleSheet, Text} from 'react-native';

type Props = {
  message?: string | null;
};

export function FormError({message}: Props) {
  if (!message) {
    return null;
  }

  return <Text accessibilityRole="alert" style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {color: '#B42318', fontSize: 14, lineHeight: 20},
});