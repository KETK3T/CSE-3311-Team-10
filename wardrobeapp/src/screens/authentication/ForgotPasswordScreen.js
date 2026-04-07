import{ useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,Alert
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius } from '../../theme'
import { resetPassword } from '../../backend/auth'

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('')
  
  const isValidEmail = (email) =>{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())
  }

  const handleReset = async () => {
    if(!email){
      Alert.alert('MISSING INFO', "Please enter your email.")
      return
    }

    if(!isValidEmail(email)){
      Alert.alert('Invalid Email', 'please enter a valid email address.')
      return
    }

    const {error} = await resetPassword(email)
    if(error){
      Alert.alert('Error', error)
      return
    }
    Alert.alert('Email sent', "Please check your email for a password reset link.")
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Forgot password</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Value"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.resetBtn, loading && {opacity: 0.6}]} onPress={handleReset} activeOpacity={0.85} disabled={loading}>
              <Text style={styles.resetText}>{loading ? 'Sending...': 'Reset Password'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  backBtn: { marginTop: spacing.md },
  title: {
    fontSize: 30,
    fontWeight: '300',
    color: colors.textDark,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontFamily: 'PatrickHand_400Regular',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textDark,
  },
  resetBtn: {
    backgroundColor: colors.textDark,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
  },
  resetText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
