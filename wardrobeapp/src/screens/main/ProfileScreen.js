import  { useCallback, useState, useEffect,} from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,Alert,Image,Modal,Pressable, TextInput,} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import ClothingCard from '../../components/ClothingCard'
import { colors, spacing, radius } from '../../theme'
import { useAuth } from '../../backend/useAuth'
import { useFocusEffect } from '@react-navigation/native'
import { getAllFavorites, toggleFavorite, deleteClothingItem } from '../../backend/wardrobeService'
import { logout } from '../../backend/auth'
import { checkUsernameAvailable, getItemCount, getProfile, updateProfile, uploadAvatar } from '../../backend/profileService'


export default function ProfileScreen() {
  const {user} = useAuth()
  const [profile,setProfile] = useState(null)
  const [loading,setLoading] = useState(false)
  const [itemCount,setItemCount] = useState(0)
  const [favorites, setFavorites] = useState([])

  const [editVisible, setEditVisible] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editAvatar, setEditAvatar] = useState(null)
  const [isSaving, setIsSaving] = useState(false)


  useEffect(() => {
    if(!user?.id) return
    loadProfile()
  }, [user?.id])

  const loadProfile = async() => {
    setLoading(true)
    try{
      const{profile: profileData} = await getProfile(user.id)
      const{items} = await getAllFavorites(user.id)
      const {count} = await getItemCount(user.id)

      setProfile(profileData)
      setFavorites(items)
      setItemCount(count)
    }catch(e){
      Alert.alert('PROFILE ERROR', e.message)
    }
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      if(!user?.id || loading) return
      const syncProfile = async () => {
        try{
          const{profile: profileData} = await getProfile(user.id)
          const{items} = await getAllFavorites(user.id)
          const {count} = await getItemCount(user.id)

          setProfile(prev => 
            JSON.stringify(prev) !== JSON.stringify(profileData) ? profileData : prev
          )
          setFavorites(prev => {
            const prevIds = prev.map(f => f.id).join()
            const nextIds = items.map(f => f.id).join()
            return prevIds !== nextIds ? items : prev
          })
          setItemCount(prev => prev !== count ? count : prev)
        }catch(e){
          console.log('sync Error', e.message)
        }
      }
      syncProfile()
    }, [user?.id, loading])
  )

  const handleSaveProfile = async () => {
    const trimmed = editUsername.trim().toLowerCase()

    if(!trimmed) {
      Alert.alert('Invalid', 'Username cannot be empty.') 
      return
    }

    if(!/^[a-z0-9._]+$/.test(trimmed)){
      Alert.alert('Invalid', 'Only letters, numbers, dots and underscore allowed')
      return
    }

    setIsSaving(true)
    try{
      const updates = {}

      if(trimmed !== profile?.username?.toLowerCase()){
        const available = await checkUsernameAvailable(trimmed, user.id)
        if(!available){
          Alert.alert('Taken', 'That username has already been taken')
          setIsSaving(false)
          return
        }
        updates.username = trimmed
      }

      if(editAvatar){
        updates.avatar_url = await uploadAvatar(user.id,editAvatar)
        console.log('avatar_url: ', updates.avatar_url)
      }

      if(Object.keys(updates).length == 0){
        setEditVisible(false)
        setIsSaving(false)
        return
      }

      const {profile: updated, error} = await updateProfile(user.id, updates)
      if(error) throw new Error(error)

      setProfile(updated)
      setEditVisible(false)
    }catch(e){
      Alert.alert('Error', e.message)
    }
    setIsSaving(false)
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

  const openEditModal = () => {
    setEditUsername(profile?.username || '')
    setEditAvatar(null)
    setEditVisible(true)
  }

  const pickAvatar = async () => {
    const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted'){
      Alert.alert('Permission Needed', 'Please Allow access to your photo library')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1,1],
      quality: 0.8,
    })
    if(!result.canceled){
      setEditAvatar(result.assets[0].uri)
    }
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
  
  const handleToggleFavorite = async (id, currentStatus) => {
    const {item ,error} =  await toggleFavorite(id, currentStatus)
    if(!error){
      setFavorites(prev => 
        prev.filter(f => f.id !== id)
      )
    }
  }

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your wardrobe?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteClothingItem(id)
            if (!error) {
              setFavorites(prev => prev.filter(i => i.id !== id))
              setItemCount(prev => prev - 1)
            }
          },
        },
      ]
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

        

        <Text style={styles.username}>{profile?.username?.toLowerCase() || 'A'}</Text>


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
          <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
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
                  onFavorite={() => handleToggleFavorite(item.id, item.is_favorite)}
                  onDelete={() => handleDelete(item.id)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal visible={editVisible} transparent animationType='slide' onRequestClose={() => setEditVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>

            <TouchableOpacity style={styles.modalAvatarWrapper} onPress={pickAvatar}>
              {editAvatar || profile?.avatar_url ? (
                <Image source={{ uri: editAvatar || profile.avatar_url }} style={styles.modalAvatarImg} />
              ) : (
                <View style={styles.modalAvatarCircle}>
                  <Ionicons name='person' size={40} color={colors.textMid} />
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Ionicons name='camera' size={14} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={editUsername}
              onChangeText={setEditUsername}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder='your_username'
              placeholderTextColor={colors.textLight}
            />

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.saveBtnText}>Save</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.backgroundColor },
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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xl, paddingBottom: 48, alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700', color: colors.textDark, marginBottom: spacing.lg,
  },
  modalAvatarWrapper: { position: 'relative', marginBottom: spacing.lg },
  modalAvatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  modalAvatarImg: { width: 88, height: 88, borderRadius: 44 },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.textDark,
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  inputLabel: {
    alignSelf: 'flex-start', fontSize: 13,
    fontWeight: '600', color: colors.textDark, marginBottom: spacing.sm,
  },
  input: {
    width: '100%', borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 15, color: colors.textDark, backgroundColor: colors.inputBg, marginBottom: spacing.lg,
  },
  saveBtn: {
    width: '100%', backgroundColor: colors.textDark,
    paddingVertical: spacing.md, borderRadius: radius.sm,
    alignItems: 'center', marginBottom: spacing.sm,
  },
  saveBtnText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  cancelBtn: { paddingVertical: spacing.sm },
  cancelText: { fontSize: 14, color: colors.textMid },
})
