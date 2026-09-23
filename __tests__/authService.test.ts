import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut,
} from '@react-native-firebase/auth';
import {
  register,
  sendPasswordReset,
  requestPhoneCode,
  confirmPhoneCode,
  signIn,
  signOut as authSignOut,
} from '../src/services/authService';

const mockedSignIn = signInWithEmailAndPassword as jest.Mock;
const mockedRegister = createUserWithEmailAndPassword as jest.Mock;
const mockedPasswordReset = sendPasswordResetEmail as jest.Mock;
const mockedSignOut = signOut as jest.Mock;
const mockedPhoneSignIn = signInWithPhoneNumber as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('signs in with trimmed email', async () => {
  await signIn(' athlete@example.com ', 'secret123');

  expect(mockedSignIn).toHaveBeenCalledWith({}, 'athlete@example.com', 'secret123');
});

test('registers an account with a trimmed name and email', async () => {
  mockedRegister.mockResolvedValueOnce({user: {uid: 'user-1'}});

  await register(' Alex ', ' alex@example.com ', 'secret123');

  expect(mockedRegister).toHaveBeenCalledWith({}, 'alex@example.com', 'secret123');
});

test('sends a password reset email', async () => {
  await sendPasswordReset(' athlete@example.com ');

  expect(mockedPasswordReset).toHaveBeenCalledWith({}, 'athlete@example.com');
});

test('requests a phone verification code with a trimmed number', async () => {
  await requestPhoneCode(' +15551234567 ');

  expect(mockedPhoneSignIn).toHaveBeenCalledWith({}, '+15551234567');
});

test('confirms a phone verification code', async () => {
  const confirm = jest.fn(async () => undefined);

  await confirmPhoneCode({confirm} as never, ' 123456 ');

  expect(confirm).toHaveBeenCalledWith('123456');
});

test('signs out through Firebase Auth', async () => {
  await authSignOut();

  expect(mockedSignOut).toHaveBeenCalledWith({});
});