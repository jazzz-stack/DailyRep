import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {WorkoutPlansScreen} from '../src/screens/workouts/WorkoutPlansScreen';
import {WorkoutPlanDetailsScreen} from '../src/screens/workouts/WorkoutPlanDetailsScreen';
import {WorkoutDetailsScreen} from '../src/screens/workouts/WorkoutDetailsScreen';
import type {WorkoutStackParamList} from '../src/types/navigation';
import {useAuth} from '../src/context/AuthContext';

jest.mock('../src/context/AuthContext', () => ({useAuth: jest.fn()}));
const mockedUseAuth = useAuth as jest.Mock;
const navigation = {navigate: jest.fn(), goBack: jest.fn()} as unknown as NativeStackScreenProps<WorkoutStackParamList, 'WorkoutPlans'>['navigation'];

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseAuth.mockReturnValue({profile: null});
});

test('renders plans and navigates with a plan id', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => { renderer = ReactTestRenderer.create(<WorkoutPlansScreen navigation={navigation} route={{key: 'WorkoutPlans', name: 'WorkoutPlans'}} />); });
  expect(renderer?.root.findAllByType(Text).some(node => node.props.children === 'Workout Plans')).toBe(true);
  const cards = renderer?.root.findAll(node => typeof node.props.accessibilityLabel === 'string' && node.props.accessibilityLabel.startsWith('Open ')) ?? [];
  await ReactTestRenderer.act(async () => { cards[0].props.onPress(); });
  expect(navigation.navigate).toHaveBeenCalledWith('WorkoutPlanDetails', {planId: expect.any(String)});
});

test('renders plan and workout details, including missing IDs gracefully', async () => {
  const planNavigation = navigation as unknown as NativeStackScreenProps<WorkoutStackParamList, 'WorkoutPlanDetails'>['navigation'];
  const workoutNavigation = navigation as unknown as NativeStackScreenProps<WorkoutStackParamList, 'WorkoutDetails'>['navigation'];
  let planRenderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  let workoutRenderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => {
    planRenderer = ReactTestRenderer.create(<WorkoutPlanDetailsScreen navigation={planNavigation} route={{key: 'plan', name: 'WorkoutPlanDetails', params: {planId: 'beginner-full-body'}}} />);
    workoutRenderer = ReactTestRenderer.create(<WorkoutDetailsScreen navigation={workoutNavigation} route={{key: 'workout', name: 'WorkoutDetails', params: {planId: 'beginner-full-body', workoutId: 'beginner-full-body-a-1'}}} />);
  });
  expect(planRenderer?.root.findAllByType(Text).some(node => node.props.children === 'Beginner Full Body')).toBe(true);
  expect(planRenderer?.root.findAllByType(Text).some(node => node.props.children === 'Rest & Recovery')).toBe(true);
  expect(workoutRenderer?.root.findAllByType(Text).some(node => node.props.children === 'Full Body A')).toBe(true);
  const dayOne = planRenderer?.root.find(node => node.props.accessibilityLabel === 'Open Day 1, Full Body A');
  await ReactTestRenderer.act(async () => { dayOne?.props.onPress(); });
  expect(navigation.navigate).toHaveBeenCalledWith('WorkoutDetails', {planId: 'beginner-full-body', workoutId: 'beginner-full-body-a-1'});
  const exercise = workoutRenderer?.root.find(node => node.props.accessibilityLabel === 'Open Bodyweight Squat');
  await ReactTestRenderer.act(async () => { exercise?.props.onPress(); });
  expect(navigation.navigate).toHaveBeenCalledWith('ExerciseDetails', {exerciseId: 'bodyweight-squat'});
  let missing: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => {
    missing = ReactTestRenderer.create(<WorkoutPlanDetailsScreen navigation={planNavigation} route={{key: 'missing', name: 'WorkoutPlanDetails', params: {planId: 'missing'}}} />);
  });
  expect(missing?.root.findAllByType(Text).some(node => node.props.children === 'Workout plan not found')).toBe(true);
});