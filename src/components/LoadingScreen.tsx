import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

type Props = {
  message?: string;
};

export function LoadingScreen({message = 'Loading DailyRep...'}: Props) {
  return (
    <View accessibilityLabel={message} style={styles.container}>
      <ActivityIndicator color="#37734F" size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {alignItems: 'center', backgroundColor: '#F4F7F1', flex: 1, justifyContent: 'center', padding: 28},
  message: {color: '#607069', fontSize: 15, marginTop: 14},
});