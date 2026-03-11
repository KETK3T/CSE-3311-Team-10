import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateAccount = () => {
    // registration logic
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Register</Text>

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

          <Text style={[styles.label, { marginTop: spacing.md }]}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Value"
            placeholderTextColor={colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreateAccount}
            activeOpacity={0.85}
          >
            <Text style={styles.createText}>Create Account</Text>
          </TouchableOpacity>
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
  createBtn: {
    backgroundColor: colors.textDark,
    borderRadius: radius.sm,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
