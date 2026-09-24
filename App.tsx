
import { useEffect } from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import notifee, {EventType} from '@notifee/react-native';
import {
  requestNotificationPermission,
  getFCMToken,
  listenForFCMTokenRefresh,
  listenForForegroundMessages,
  createNotificationChannel,
} from './src/services/notificationService';
import { getFirebaseInstallationId, initializeInAppMessaging } from './src/services/inAppMessagingService';
import {AuthProvider} from './src/context/AuthContext';
import {AppNavigator, navigationRef} from './src/navigation/AppNavigator';
import type {NotificationData} from './src/types/notificationPreferences';

/**
 * Handle notification tap/press navigation
 */
function handleNotificationTap(data: NotificationData) {
  if (!navigationRef.ref) {
    console.log('Navigation ref not ready yet');
    return;
  }

  try {
    if (data.type === 'workout_reminder') {
      // For workout reminders, navigate to Workouts tab
      const state = navigationRef.ref.getState();
      if (state) {
        navigationRef.ref.navigate('Main' as any, {
          screen: 'Tabs',
          params: {
            screen: 'Workouts',
          },
        } as any);
      }
      
      console.log('Navigated to Workouts from reminder');
    } else if (data.type === 'workout_completed' && data.sessionId) {
      // For completion notifications, navigate to Workout History Detail
      const state = navigationRef.ref.getState();
      if (state) {
        navigationRef.ref.navigate('Main' as any, {
          screen: 'Tabs',
          params: {
            screen: 'Workouts',
            params: {
              screen: 'WorkoutHistoryDetail',
              params: {
                sessionId: data.sessionId,
              },
            },
          },
        } as any);
      }
      
      console.log('Navigated to Workout History Detail from completion');
    }
  } catch (error) {
    console.error('Failed to handle notification tap:', error);
  }
}

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

  // Handle notification tap/press
  const unsubscribeNotificationPress = notifee.onForegroundEvent(async ({type, detail}) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data as NotificationData | undefined;
      
      if (data) {
        handleNotificationTap(data);
      }
    }
  });

  // Handle notification from quit/background state on app launch
  notifee.getInitialNotification().then(notification => {
    if (notification) {
      const data = notification.notification.data as NotificationData | undefined;
      
      if (data) {
        handleNotificationTap(data);
      }
    }
  });

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeForeground();
    unsubscribeNotificationPress();
  };
}, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
