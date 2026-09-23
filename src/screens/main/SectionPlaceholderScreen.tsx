import {StyleSheet, Text, View} from 'react-native';

type Props = {
  title: string;
  description: string;
};

export function SectionPlaceholderScreen({title, description}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>DAILYREP</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {backgroundColor: '#F4F7F1', flex: 1, justifyContent: 'center', padding: 28},
  eyebrow: {color: '#4C765F', fontSize: 12, fontWeight: '800', letterSpacing: 1.2},
  title: {color: '#10211B', fontSize: 32, fontWeight: '800', marginTop: 12},
  description: {color: '#607069', fontSize: 16, lineHeight: 24, marginTop: 10},
});