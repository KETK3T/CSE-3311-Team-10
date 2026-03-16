import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import {useFonts, PatrickHand_400Regular} from '@expo-google-fonts/patrick-hand';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';

// Auth Screens
import WelcomeScreen from './src/screens/authentication/WelcomeScreen';
import LoginScreen from './src/screens/authentication/LoginScreen';
import RegisterScreen from './src/screens/authentication/RegisterScreen';
import ForgotPasswordScreen from './src/screens/authentication/ForgotPasswordScreen';

// Main App Screens
import WardrobeScreen from './src/screens/main/WardrobeScreen';
import MixerScreen from './src/screens/main/MixerScreen';
import UploadScreen from './src/screens/main/UploadScreen';
import SocialScreenFeed from './src/screens/main/SocialScreenFeed';
import ProfileScreen from './src/screens/main/ProfileScreen';

// Icons (text-based fallback — swap for vector icons if you install @expo/vector-icons)
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Bottom Tab Navigator (shown after login) ────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: '#7C5CBF',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Wardrobe: 'grid-outline',
            Mixer: 'shuffle-outline',
            Upload: 'add-circle-outline',
            Social: 'people-outline',
            Profile: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tab.Screen name="Mixer" component={MixerScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Social" component={SocialScreenFeed} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({PatrickHand_400Regular});

  useEffect(() =>{
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Main app (tabs) */}
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    height: 70,
    paddingBottom: 10,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
