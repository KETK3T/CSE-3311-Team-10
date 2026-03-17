import  { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,Alert,Image,} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ClothingCard from '../../components/ClothingCard'
import { colors, spacing, radius } from '../../theme'
import { useAuth } from '../../backend/useAuth'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../../backend/supabase-client'
import { getAllFavorites } from '../../backend/wardrobeService'
import { logout } from '../../backend/auth'

export default function ProfileScreen() {
  const {user} = useAuth()
  const [profile,setProfile] = useState(null)
  const [loading,setLoading] = useState(false)
  const [itemCount,setItemCount] = useState(0)
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if(user?.id) loadProfile()
    },[user])
  )

  const loadProfile = async() => {
    setLoading(true)
    try{
      const {data: profileData} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      const {items} = await getAllFavorites(user.id)
      setFavorites(items)

      const {count} = await supabase
        .from('clothing_items')
        .select('*', {count: 'exact', head: true})
        .eq('user_id',user.id)
      setItemCount(count || 0)

    }catch(e){
      Alert.alert('PROFILE ERROR', e.message)
    }
    setLoading(false)
  }

  const handleLogOut = async () => {
    Alert.alert(
      'LOG OUT',
      'Are you sure you want to log out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Log Out', style: 'destructive', onPress: async () => 
          {
            await logout()
          },
        },
      ]
    )
  }

  if(loading){
    return(
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primaryDark}/>
        </View>
      </SafeAreaView>
    )
  }



  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f)
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>


        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut}>
          <Ionicons name='log-out-outline' size={24} color={colors.textMid}/>
        </TouchableOpacity>


        <View style={styles.avatarWrapper}>
          {profile?.avatar_url ? (
            <Image source={{uri: profile.avatar_url}} style={styles.avatarImg}/>
          ): (
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={56} color={colors.textMid} />
            </View>
          )}
        </View>

        

        <Text style={styles.username}>{profile?.username?.toLowerCase() || 'USERNAME'}</Text>


        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{itemCount}</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        <View style={styles.editRow}>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}/>
        <Text style={styles.sectionTitle}>Favorites</Text>

        {favorites.length===0? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites yet!!! </Text>
            <Text style={styles.emptySubText}>Hit the star in in wardrobe to add an item</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {favorites.map(item => (
              <View key={item.id} style={styles.cardWrapper}>
                <ClothingCard 
                  imageUri={item.image_url}
                  category={item.category}
                  isFavorite={item.is_favorite}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  loadingContainer: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  logoutBtn:{
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  avatarWrapper: { alignItems: 'center', marginTop: spacing.xl },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textDark,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  editRow: { alignItems: 'center', marginTop: spacing.md },
  editBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  editText: { fontSize: 14, fontWeight: '500', color: colors.textDark },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    paddingVertical: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    width: '47%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  emptyText: {fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    fontFamily: 'PatrickHand_400Regular',
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
})
