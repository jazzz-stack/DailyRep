
import { useEffect } from 'react';
import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  requestNotificationPermission,
  getFCMToken,
  listenForFCMTokenRefresh,
  listenForForegroundMessages,
  createNotificationChannel,
} from './src/services/notificationService';
import { getFirebaseInstallationId, initializeInAppMessaging } from './src/services/inAppMessagingService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

useEffect(() => {

  // In-App Messaging 
  initializeInAppMessaging();
  getFirebaseInstallationId();

  // Push Notification
  const setupNotifications = async () => {
  await createNotificationChannel();

    const permissionGranted =
      await requestNotificationPermission();

    if (!permissionGranted) {
      console.log(
        'Notification permission not granted',
      );

      return;
    }

    const token = await getFCMToken();

    console.log('FCM TOKEN:', token);
  };

  setupNotifications();

  const unsubscribeTokenRefresh =
    listenForFCMTokenRefresh(token => {
      console.log('New FCM token:', token);
    });

  const unsubscribeForeground =
    listenForForegroundMessages(message => {
      console.log(
        'Received foreground message:',
        message,
      );
    });

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeForeground();
  };
}, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
