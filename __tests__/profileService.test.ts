import {getDoc, setDoc} from '@react-native-firebase/firestore';
import {createUserProfile, getUserProfile, updateUserProfile} from '../src/services/profileService';
import {validateProfile} from '../src/types/profile';

const mockedGetDoc = getDoc as jest.Mock;
const mockedSetDoc = setDoc as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('returns null when a profile does not exist', async () => {
  await expect(getUserProfile('user-1')).resolves.toBeNull();
});

test('loads a typed profile document', async () => {
  const profile = {uid: 'user-1', name: 'Jasvant', phoneNumber: '+15551234567'};
  mockedGetDoc.mockResolvedValueOnce({exists: () => true, data: () => profile});

  await expect(getUserProfile('user-1')).resolves.toEqual(profile);
});

test('creates and updates a profile document by uid', async () => {
  await createUserProfile('user-1', {name: 'Jasvant', phoneNumber: '+15551234567'});
  await updateUserProfile('user-1', {fitnessGoal: 'build_muscle'});

  expect(mockedSetDoc).toHaveBeenCalledWith({}, expect.objectContaining({uid: 'user-1', name: 'Jasvant', phoneNumber: '+15551234567'}));
  expect(mockedSetDoc.mock.calls[0][1]).not.toHaveProperty('age');
  expect(mockedSetDoc).toHaveBeenCalledWith({}, expect.objectContaining({fitnessGoal: 'build_muscle'}), {merge: true});
});

test('validates profile form values', () => {
  expect(validateProfile({name: '', age: '', height: '', weight: ''})).toBe('Enter your name.');
  expect(validateProfile({name: 'Jasvant', age: 'not-a-number', height: '', weight: ''})).toBe('Enter a valid age.');
  expect(validateProfile({name: 'Jasvant', age: '30', height: '180', weight: '80'})).toBeUndefined();
});