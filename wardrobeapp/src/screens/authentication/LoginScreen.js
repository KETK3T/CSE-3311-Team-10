import{ useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,Alert,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radius } from '../../theme'
import { login } from '../../backend/auth'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading,setLoading] = useState(false)


  const isValidEmail = (email) =>{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase())
  }

  const handleSignIn = async () => {
    if(!email || !password){
      Alert.alert("MISSING INFO", "Please enter your email and password.")
      return
    }

    if(!isValidEmail(email)){
      Alert.alert('Invalid Email', 'please enter a valid email address.')
      return
    }

    setLoading(true)
    const {user,error} = await login(email,password)
    setLoading(false)

    if(error){
      Alert.alert('Failed To Login', error)
      return
    }
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

        <Text style={styles.title}>Login</Text>

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
          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Value"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={[styles.signInBtn, loading && {opacity: 0.6}]} onPress={handleSignIn} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.signInText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  backBtn: { marginTop: spacing.md },
  title: {
    fontSize: 34,
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
  },
  signInBtn: {
    backgroundColor: colors.textDark,
    borderRadius: radius.sm,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  signInText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotText: {
    fontSize: 13,
    color: colors.textDark,
    textDecorationLine: 'underline',
  },
})
