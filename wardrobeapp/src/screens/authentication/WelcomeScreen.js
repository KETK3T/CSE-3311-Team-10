import { View, Text, TouchableOpacity, StyleSheet, ImageBackground} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import { colors, spacing, radius } from '../../theme'
import welcomscreenBG from '../../../assets/background-image.png';
import WDlogo from '../../../assets/wardrobe-logo.png';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      
      <View>
        <ImageBackground source={welcomscreenBG} style={styles.image}>

          <View style={styles.containerText}>
              <Text style={styles.title}> Virtual Wardrobe {'\n'}
                <Text style={styles.subtitle}> Welcome to your virtual wardrobe!!{'\n'}</Text>
              </Text>
          </View>

          <View style={styles.container}>

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
        </ImageBackground>
      </View>
      
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    offsetTop: spacing.xl * 1.5,
    alignItems: 'center',
  },
  containerText: {
      flex: 2,
      marginTop: 440,
      paddingTop: spacing.xl,
      alignItems: 'left',
    },
  title: {
      fontSize: 36,
      fontWeight: '300',
      color: colors.textDark,
      marginHorizontal: spacing.xl,
      fontFamily: 'PatrickHand_400Regular',
    },
    subtitle: {
      fontSize: 24,
      fontWeight: '200',
      fontFamily: 'PatrickHand_400Regular',
      color: colors.textDark,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      opacity: 0.6,
    },
  spacer: {
    flex: 1,
  },
  button: {
      width: '100%',
      height: 70,
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
  image: {
    width: '100%',
    height: '90%',
    resizeMode: 'stretch',
  },
  logo: {
    flex: 1,
    width: 150,
    height: 150,
    marginTop: 400,
    resizeMode: 'cover',
  },
})
