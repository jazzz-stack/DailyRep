import { getApp } from '@react-native-firebase/app';
import {
  getInAppMessaging,
} from '@react-native-firebase/in-app-messaging';
import { getId, getInstallations } from '@react-native-firebase/installations';

export function initializeInAppMessaging() {
  const inAppMessaging = getInAppMessaging();
  return inAppMessaging;
}


export async function getFirebaseInstallationId() {
  const app = getApp();
  const installations = getInstallations(app);

  const id = await getId(installations);

  console.log('Firebase Installation ID:', id);

  return id;
}