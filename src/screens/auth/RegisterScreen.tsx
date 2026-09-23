import {useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FormError} from '../../components/FormError';
import {useAuth} from '../../context/AuthContext';
import {hasFormErrors, validateRegistration, type FormErrors} from '../../types/auth';
import type {AuthStackParamList} from '../../types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const {clearError, error, register} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  async function handleSubmit() {
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateRegistration(name, email, password);
    setFormErrors(nextErrors);
    if (hasFormErrors(nextErrors)) {
      return;
    }

    clearError();
    setIsSubmitting(true);
    try {
      await register(name, email, password);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start your DailyRep.</Text>
      <Text style={styles.subtitle}>A few details, then your training space is ready.</Text>
      <View style={styles.form}>
        <TextInput placeholder="Your name" placeholderTextColor="#82908A" style={styles.input} value={name} onChangeText={setName} />
        <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email address" placeholderTextColor="#82908A" style={styles.input} value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" placeholderTextColor="#82908A" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
        <FormError message={formErrors.name ?? formErrors.email ?? formErrors.password ?? error} />
        <Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.primaryButton}>
          {isSubmitting ? <ActivityIndicator color="#10211B" /> : <Text style={styles.primaryText}>Create account</Text>}
        </Pressable>
      </View>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.secondaryText}>Already have an account? <Text style={styles.link}>Sign in</Text></Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, gap: 18, padding: 28, backgroundColor: '#F4F7F1'},
  title: {color: '#10211B', fontSize: 34, fontWeight: '800', lineHeight: 40, marginTop: 30},
  subtitle: {color: '#607069', fontSize: 16, lineHeight: 24},
  form: {gap: 14, marginTop: 22},
  input: {backgroundColor: '#FFFFFF', borderColor: '#DCE6DD', borderRadius: 12, borderWidth: 1, color: '#10211B', fontSize: 16, paddingHorizontal: 16, paddingVertical: 15},
  primaryButton: {alignItems: 'center', backgroundColor: '#B8E986', borderRadius: 12, justifyContent: 'center', minHeight: 54, marginTop: 6},
  primaryText: {color: '#10211B', fontSize: 16, fontWeight: '800'},
  secondaryText: {color: '#607069', fontSize: 14, textAlign: 'center'},
  link: {color: '#37734F', fontWeight: '700'},
});