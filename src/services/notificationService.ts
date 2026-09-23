import {
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

import {
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidStyle,
} from '@notifee/react-native';

export async function requestNotificationPermission() {
  try {
    const {status} = await requestNotifications([
      'alert',
      'sound',
      'badge',
    ]);

    const granted =
      status === RESULTS.GRANTED ||
      status === RESULTS.LIMITED;

    console.log('Notification permission:', status);

    return granted;
  } catch (error) {
    console.error(
      'Notification permission error:',
      error,
    );

    return false;
  }
}

export async function getFCMToken() {
  try {
    const messagingInstance = getMessaging();

    const token = await getToken(messagingInstance);

    console.log('FCM TOKEN:', token);

    return token;
  } catch (error) {
    console.error(
      'FCM token error:',
      error,
    );

    return null;
  }
}


export function listenForFCMTokenRefresh(
  onRefresh: (token: string) => void,
) {
  const messagingInstance = getMessaging();

  return onTokenRefresh(messagingInstance, token => {
    console.log('FCM TOKEN REFRESHED:', token);
    onRefresh(token);
  });
}

export function listenForForegroundMessages(
  onMessageReceived: (message: any) => void,
) {
  const messagingInstance = getMessaging();

  console.log('Registering FCM foreground listener');

  return onMessage(messagingInstance, async message => {
    console.log('FCM FOREGROUND MESSAGE:', message);

await notifee.displayNotification({
  title: message.notification?.title ?? 'New Notification',
  body: message.notification?.body ?? '',
  android: {
    channelId: 'default',
    importance: AndroidImportance.HIGH,
    largeIcon: message.notification?.android?.imageUrl,
    style: {
      type: AndroidStyle.BIGPICTURE,
      picture: message.notification?.android?.imageUrl ?? '',
    },
    pressAction: {
      id: 'default',
    },
  },
});

    onMessageReceived(message);
  });
}


export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: AndroidImportance.HIGH,
  });

  console.log('Notification channel created');
}