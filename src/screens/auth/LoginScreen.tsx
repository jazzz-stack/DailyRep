import {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormError} from '../../components/FormError';
import {useAuth} from '../../context/AuthContext';
import {hasFormErrors, validatePhoneNumber, validateVerificationCode, type FormErrors} from '../../types/auth';
import type {AuthStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const {clearError, clearPhoneConfirmation, error, phoneConfirmation, sendPhoneCode, verifyPhoneCode} = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const nextErrors: FormErrors = phoneConfirmation
      ? {verificationCode: validateVerificationCode(verificationCode)}
      : {phoneNumber: validatePhoneNumber(phoneNumber)};
    setFormErrors(nextErrors);
    if (hasFormErrors(nextErrors)) {
      return;
    }

    clearError();
    setIsSubmitting(true);
    try {
      if (phoneConfirmation) {
        await verifyPhoneCode(verificationCode);
      } else {
        await sendPhoneCode(phoneNumber);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>DAILYREP</Text>
        <Text style={styles.title}>Build your strongest routine.</Text>
        <Text style={styles.subtitle}>Sign in to keep your training moving.</Text>
      </View>
      <View style={styles.form}>
        <TextInput autoCapitalize="none" keyboardType="phone-pad" onChangeText={value => { setPhoneNumber(value); setFormErrors({}); clearError(); }} placeholder="Phone number (+15551234567)" placeholderTextColor="#82908A" style={styles.input} textContentType="telephoneNumber" value={phoneNumber} />
        {phoneConfirmation ? <TextInput autoCapitalize="none" keyboardType="number-pad" maxLength={6} onChangeText={value => { setVerificationCode(value); setFormErrors({}); clearError(); }} placeholder="6-digit verification code" placeholderTextColor="#82908A" style={styles.input} value={verificationCode} /> : null}
        <FormError message={formErrors.phoneNumber ?? formErrors.verificationCode ?? error} />
        <Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.primaryButton}>
          {isSubmitting ? <ActivityIndicator color="#10211B" /> : <Text style={styles.primaryText}>{phoneConfirmation ? 'Verify and sign in' : 'Send code'}</Text>}
        </Pressable>
        {phoneConfirmation ? <Pressable onPress={() => { clearPhoneConfirmation(); setVerificationCode(''); setFormErrors({}); }}><Text style={styles.link}>Use a different number</Text></Pressable> : null}
      </View>
      <Pressable onPress={() => navigation.navigate('Register')} style={styles.secondaryAction}>
        <Text style={styles.secondaryText}>New to DailyRep? <Text style={styles.link}>Create an account</Text></Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'space-between', padding: 28, backgroundColor: '#F4F7F1'},
  eyebrow: {color: '#4C765F', fontSize: 13, fontWeight: '800', letterSpacing: 2},
  title: {color: '#10211B', fontSize: 38, fontWeight: '800', lineHeight: 44, marginTop: 18},
  subtitle: {color: '#607069', fontSize: 16, lineHeight: 24, marginTop: 12},
  form: {gap: 14},
  input: {backgroundColor: '#FFFFFF', borderColor: '#DCE6DD', borderRadius: 12, borderWidth: 1, color: '#10211B', fontSize: 16, paddingHorizontal: 16, paddingVertical: 15},
  link: {color: '#37734F', fontWeight: '700', textAlign: 'center'},
  primaryButton: {alignItems: 'center', backgroundColor: '#B8E986', borderRadius: 12, justifyContent: 'center', minHeight: 54, marginTop: 6},
  primaryText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
  secondaryAction: {alignItems: 'center', paddingVertical: 14},
  secondaryText: {color: '#607069', fontSize: 14},
});