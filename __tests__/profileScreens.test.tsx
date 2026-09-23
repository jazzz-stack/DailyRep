import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {MainTabParamList, MainStackParamList} from '../src/types/navigation';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ProfileScreen} from '../src/screens/profile/ProfileScreen';
import {ProfileSetupScreen} from '../src/screens/profile/ProfileSetupScreen';
import {useAuth} from '../src/context/AuthContext';

jest.mock('../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.Mock;
const profileNavigation = {
  getParent: jest.fn(),
  goBack: jest.fn(),
} as unknown as BottomTabScreenProps<MainTabParamList, 'Profile'>['navigation'];
const profileRoute = {key: 'Profile', name: 'Profile', params: undefined} as BottomTabScreenProps<MainTabParamList, 'Profile'>['route'];
const setupNavigation = {goBack: jest.fn()} as unknown as NativeStackScreenProps<MainStackParamList, 'ProfileSetup'>['navigation'];
const setupRoute = {key: 'ProfileSetup', name: 'ProfileSetup', params: undefined} as NativeStackScreenProps<MainStackParamList, 'ProfileSetup'>['route'];

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAuth.mockReturnValue({
    profile: null,
    user: {uid: 'user-1', phoneNumber: '+15551234567'},
    refreshProfile: jest.fn(async () => undefined),
    signOut: jest.fn(async () => undefined),
  });
});

test('renders profile setup fields for a first-time user', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <ProfileSetupScreen navigation={setupNavigation} route={setupRoute} />,
    );
  });

  expect(renderer?.root.findAllByType(Text).some(node => node.props.children === 'Your fitness profile')).toBe(true);
  expect(renderer?.root.findAllByType(Text).some(node => node.props.children === 'FITNESS GOAL')).toBe(true);
});

test('renders authenticated phone number on profile screen', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<ProfileScreen navigation={profileNavigation} route={profileRoute} />);
  });

  expect(renderer?.root.findAllByType(Text).some(node => node.props.children === '+15551234567')).toBe(true);
});
