import {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormError} from '../../components/FormError';
import {getAuthErrorMessage, sendPasswordReset} from '../../services/authService';
import {validateEmail} from '../../types/auth';
import type {AuthStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSuccess('If an account exists for this email, reset instructions are on the way.');
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'Unable to send reset instructions right now.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password.</Text>
      <Text style={styles.subtitle}>Enter your email and we will send reset instructions.</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" onChangeText={value => { setEmail(value); setError(null); setSuccess(null); }} placeholder="Email address" placeholderTextColor="#82908A" style={styles.input} value={email} />
      <FormError message={error} />
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.primaryButton}>
        {isSubmitting ? <ActivityIndicator color="#10211B" /> : <Text style={styles.primaryText}>Send instructions</Text>}
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.backText}>Back to sign in</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, gap: 18, padding: 28, backgroundColor: '#F4F7F1'},
  title: {color: '#10211B', fontSize: 34, fontWeight: '800', lineHeight: 40, marginTop: 30},
  subtitle: {color: '#607069', fontSize: 16, lineHeight: 24},
  input: {backgroundColor: '#FFFFFF', borderColor: '#DCE6DD', borderRadius: 12, borderWidth: 1, color: '#10211B', fontSize: 16, marginTop: 22, paddingHorizontal: 16, paddingVertical: 15},
  primaryButton: {alignItems: 'center', backgroundColor: '#B8E986', borderRadius: 12, justifyContent: 'center', minHeight: 54},
  primaryText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
  success: {color: '#37734F', fontSize: 14, lineHeight: 20},
  backText: {color: '#37734F', fontSize: 14, fontWeight: '700', textAlign: 'center'},
});