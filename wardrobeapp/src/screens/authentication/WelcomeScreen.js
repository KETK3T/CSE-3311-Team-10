import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <Text style={styles.title}>Welcome</Text>

        
        <View style={styles.spacer} />


        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: spacing.md }]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 1.5,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: colors.textDark,
    marginTop: spacing.lg,
    fontFamily: 'PatrickHand_400Regular',
  },
  spacer: {
    flex: 1,
  },
  button: {
    width: '85%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(124,92,191,0.3)',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '400',
    color: colors.textDark,
    fontFamily: 'PatrickHand_400Regular',
  },
});
