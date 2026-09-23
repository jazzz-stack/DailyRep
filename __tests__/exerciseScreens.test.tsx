import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Text} from 'react-native';
import {ExerciseDetailsScreen} from '../src/screens/exercises/ExerciseDetailsScreen';
import {ExerciseLibraryScreen} from '../src/screens/exercises/ExerciseLibraryScreen';
import type {ExerciseStackParamList} from '../src/types/navigation';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

type LibraryProps = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseLibrary'>;
type DetailsProps = NativeStackScreenProps<ExerciseStackParamList, 'ExerciseDetails'>;

const navigation = {navigate: jest.fn(), goBack: jest.fn()} as unknown as LibraryProps['navigation'];
const libraryRoute = {key: 'ExerciseLibrary', name: 'ExerciseLibrary'} as LibraryProps['route'];

function detailsRoute(exerciseId: string): DetailsProps['route'] {
  return {key: 'ExerciseDetails', name: 'ExerciseDetails', params: {exerciseId}};
}

test('renders the exercise library', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<ExerciseLibraryScreen navigation={navigation} route={libraryRoute} />);
  });

  expect(renderer?.root.findAllByType(Text).some(node => node.props.children === 'Exercise Library')).toBe(true);
});

test('navigates to details with only the exercise id', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<ExerciseLibraryScreen navigation={navigation} route={libraryRoute} />);
  });
  const cards = renderer?.root.findAllByProps({accessibilityRole: 'button'}) ?? [];

  await ReactTestRenderer.act(async () => {
    cards[0].props.onPress();
  });
  expect(navigation.navigate).toHaveBeenCalledWith('ExerciseDetails', {exerciseId: expect.any(String)});
});

test('renders exercise details and handles an invalid id', async () => {
  let renderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  let missingRenderer: ReturnType<typeof ReactTestRenderer.create> | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<ExerciseDetailsScreen navigation={navigation as unknown as DetailsProps['navigation']} route={detailsRoute('push-up')} />);
    missingRenderer = ReactTestRenderer.create(<ExerciseDetailsScreen navigation={navigation as unknown as DetailsProps['navigation']} route={detailsRoute('missing')} />);
  });
  expect(renderer?.root.findAllByType(Text).some(node => node.props.children === 'Push-Up')).toBe(true);

  expect(missingRenderer?.root.findAllByType(Text).some(node => node.props.children === 'Exercise not found')).toBe(true);
});
