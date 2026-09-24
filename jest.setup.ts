jest.mock('react-native-permissions', () => ({
  RESULTS: {GRANTED: 'granted', LIMITED: 'limited'},
  requestNotifications: jest.fn(async () => ({status: 'granted'})),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(async () => 'test-token'),
  onMessage: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn(async () => 'default'),
    displayNotification: jest.fn(async () => undefined),
    createTriggerNotification: jest.fn(async () => undefined),
    cancelNotification: jest.fn(async () => undefined),
    onForegroundEvent: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(async () => null),
    requestPermission: jest.fn(async () => 1),
  },
  AndroidImportance: {HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0},
  AndroidStyle: {BIGPICTURE: 1},
  TriggerType: {TIMESTAMP: 0},
  RepeatFrequency: {WEEKLY: 604800000},
  EventType: {PRESS: 1, ACTION_PRESS: 2, DISMISSED: 3},
}));

jest.mock('@react-native-firebase/app', () => ({getApp: jest.fn(() => ({}))}));
jest.mock('@react-native-firebase/in-app-messaging', () => ({getInAppMessaging: jest.fn(() => ({}))}));
jest.mock('@react-native-firebase/installations', () => ({
  getId: jest.fn(async () => 'test-installation-id'),
  getInstallations: jest.fn(() => ({})),
}));

jest.mock('@react-native-firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(async () => ({user: {updateProfile: jest.fn()}})),
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(async () => undefined),
  signInWithPhoneNumber: jest.fn(async () => ({confirm: jest.fn(async () => undefined)})),
  sendPasswordResetEmail: jest.fn(async () => undefined),
  signOut: jest.fn(async () => undefined),
  updateProfile: jest.fn(async () => undefined),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(async () => ({exists: () => false, data: () => undefined})),
  getFirestore: jest.fn(() => ({})),
  serverTimestamp: jest.fn(() => ({__type: 'serverTimestamp'})),
  setDoc: jest.fn(async () => undefined),
  updateDoc: jest.fn(async () => undefined),
}));

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const {View} = require('react-native');
  const Icon = () => React.createElement(View);

  return {
    Accessibility: Icon,
    Activity: Icon,
    Bike: Icon,
    BicepsFlexed: Icon,
    Cable: Icon,
    Dumbbell: Icon,
    Footprints: Icon,
    Goal: Icon,
    HeartPulse: Icon,
    Landmark: Icon,
    MoveUp: Icon,
    PersonStanding: Icon,
    StretchHorizontal: Icon,
    Trophy: Icon,
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: {children: React.ReactNode}) => children,
    Screen: () => null,
  }),
}));