import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {EditProfileScreen} from './EditProfileScreen';
import type {MainStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<MainStackParamList, 'ProfileSetup'>;

export function ProfileSetupScreen({navigation, route}: Props) {
  return <EditProfileScreen navigation={navigation} route={route} />;
}