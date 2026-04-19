import 'react-native-url-polyfill/auto'
import {useState, useEffect} from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import {useFonts, PatrickHand_400Regular} from '@expo-google-fonts/patrick-hand'
import * as SplashScreen from 'expo-splash-screen'

import WelcomeScreen from './src/screens/authentication/WelcomeScreen'
import LoginScreen from './src/screens/authentication/LoginScreen'
import RegisterScreen from './src/screens/authentication/RegisterScreen'
import ForgotPasswordScreen from './src/screens/authentication/ForgotPasswordScreen'

import WardrobeScreen from './src/screens/main/WardrobeScreen'
import MixerScreen from './src/screens/main/MixerScreen'
import UploadScreen from './src/screens/main/UploadScreen'
import SocialScreenFeed from './src/screens/main/SocialScreenFeed'
import ProfileScreen from './src/screens/main/ProfileScreen'

import UploadPost from './src/screens/Social/UploadPost';

import { Ionicons } from '@expo/vector-icons'
import { supabase } from './src/backend/supabase-client'
import PublicProfileScreen from './src/screens/main/PublicProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

SplashScreen.preventAutoHideAsync()
const SocialStack = createNativeStackNavigator()
function SocialNavigator(){
  return(
    <SocialStack.Navigator screenOptions={{headerShown:false}}>
      <SocialStack.Screen name='SocialScreenFeed' component={SocialScreenFeed}/>
      <SocialStack.Screen name='UploadPost' component={UploadPost} options={{headerShown:true, title:'Post Anything !',headerStyle:{backgroundColor:'#000'},headerTintColor:'#fff'}}
      />
      <SocialStack.Screen name='PublicProfile' component={PublicProfileScreen}/>
      </SocialStack.Navigator>
  );
}
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
          }
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Wardrobe" component={WardrobeScreen} />
      <Tab.Screen name="Mixer" component={MixerScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Social" component={SocialNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({PatrickHand_400Regular})
  const [authLoading,setAuthLoading] = useState(true)
  const [session,setSession] = useState(null)

  useEffect(() => {

    const timeout = setTimeout(() => {
      console.log('Auth time out hit')
      setAuthLoading(false)
    },3000)
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session)
      setAuthLoading(false)
      clearTimeout(timeout)
    })

    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event,newSession) => {
      setSession(newSession ?? null)
    })
    return () => {
      subscription.unsubscribe() 
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() =>{


    console.log('fontsLoaded: ', fontsLoaded)
    console.log('AuthLoading: ', authLoading)

    if (fontsLoaded && !authLoading) SplashScreen.hideAsync()
  }, [fontsLoaded, authLoading])

  if (!fontsLoaded || authLoading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size='large'/>
      </View>
    )
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Main" component={MainTabs}/>
        ) : (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
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
})
