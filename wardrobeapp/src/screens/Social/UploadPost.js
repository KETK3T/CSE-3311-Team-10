import React, { useEffect, useState } from 'react'
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ActivityIndicator, Alert, Keyboard,
  ScrollView, FlatList, 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import { Ionicons } from '@expo/vector-icons' 
import { supabase } from '../../backend/supabase-client' // Using our synced supabase client
import { getAllClothingItems } from '../../backend/wardrobeService'
import { useAuth } from '../../backend/useAuth'
import {colors, spacing, radius} from '../../theme'



export default function UploadPost({ navigation }) {
  const {user} = useAuth()
  const [outfitPhoto, setOutfitPhoto] = useState(null)
  const [base64Code, setBase64Code] = useState(null)
  const [captionText, setCaptionText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState(false)
  const [linkedItems, setLinkedItems] = useState([])
  const [showWardrobe, setShowWardrobe] = useState(false)
  

  useEffect(() => {
    const fetchWardrobe = async () => {
      if(!user?.id) return
      const {items} = await getAllClothingItems(user.id)
      setWardrobeItems(items)
    }
    fetchWardrobe()
  }, [user?.id])


  // Function to let us pick a photo from the gallery
  const handlePickPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:'Images',
      allowsEditing: true,
      aspect: [4, 5], 
      quality: 0.6, // Slight compression to keep the DB fast
      base64: true, 
    });

    if (!result.canceled) {
      setOutfitPhoto(result.assets[0].uri);
      setBase64Code(result.assets[0].base64);
    }
  };

  const toggleLinkedItem = (itemId) => {
    setLinkedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : prev.length >= 5
        ? prev
        : [...prev, itemId]
    )
  }

  const handleCreatePost = async () => {
    if (!outfitPhoto) {
      Alert.alert("Missing Photo", "Gotta select an outfit photo before you post!");
      return;
    }

    try {
      setIsUploading(true);

      //Check for the current user session
      const { data:{user: authUser }}=await supabase.auth.getUser();
      if (!authUser) throw new Error("Log in again to share your fit.");

      //Set up the path for the post-images bucket
      const imagePath = `${authUser.id}/${Date.now()}.jpg`;

      //taking the image into the supabase bucket 
      const { error: storageErr } = await supabase.storage
        .from('post-images') // Updated bucket name per your request
        .upload(imagePath, decode(base64Code), { contentType: 'image/jpeg' });

      if (storageErr) throw storageErr;

      // 2. Grab the public URL for the image we just uploaded
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(imagePath);

      // 3. Save the actual post data to our SQL table
      const { error: dbErr } = await supabase
        .from('social_posts')
        .insert({
          user_id: authUser.id,
          image_url: publicUrl,
          caption: captionText,
          linked_item_ids: linkedItems,
        })

      if (dbErr) throw dbErr;

      Alert.alert("Success!", "Your post is now on the community feed.");
      
      // Reset the screen and head back to the feed view
      setOutfitPhoto(null);
      setCaptionText('');
      setLinkedItems([])
      navigation.navigate('SocialScreenFeed'); 
    } catch (err) {
      console.log("Something went wrong with the upload:", err.message);
      Alert.alert("Upload Error", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.screenBody} keyboardShouldPersistTaps="handled">
      <Text style={styles.topHeading}>New Post</Text>

      <TouchableOpacity style={styles.photoContainer} onPress={handlePickPhoto}>
        {outfitPhoto ? (
          <Image source={{ uri: outfitPhoto }} style={styles.selectedImg} />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={{ color: '#666', fontSize: 16, marginTop: 8 }}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    
      <TextInput style={styles.captionInput} placeholder='Drop a caption for the fit...' placeholderTextColor="#444" value={captionText} onChangeText={setCaptionText} multiline onSubmitEditing={() => Keyboard.dismiss()}/>

      <TouchableOpacity
        style={styles.linkBtn}
        onPress={() => setShowWardrobe(!showWardrobe)}
      >
        <Ionicons name="shirt-outline" size={18} color="#fff" />
        <Text style={styles.linkBtnText}>
          {linkedItems.length > 0
            ? `${linkedItems.length} item${linkedItems.length > 1 ? 's' : ''} linked`
            : 'Link wardrobe items'}
        </Text>
        <Ionicons
          name={showWardrobe ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#fff"
        />
      </TouchableOpacity>

      {showWardrobe && (
        <View style={styles.wardrobeGrid}>
          {wardrobeItems.length === 0 ? (
            <Text style={styles.emptyWardrobeText}>No items in wardrobe yet</Text>
          ) : (
            <View style={styles.gridRow}>
              {wardrobeItems.map(item => {
                const isSelected = linkedItems.includes(item.id)
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.wardrobeThumb, isSelected && styles.wardrobeThumbSelected]}
                    onPress={() => toggleLinkedItem(item.id)}
                  >
                    <Image
                      source={{ uri: item.image_url }}
                      style={styles.wardrobeThumbImg}
                    />
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                    <Text style={styles.wardrobeThumbLabel} numberOfLines={1}>
                      {item.category}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      )}
      <TouchableOpacity
        style={[styles.postBtn, isUploading && { opacity: 0.6 }]}
        onPress={handleCreatePost}
        disabled={isUploading}
      >
        {isUploading
          ? <ActivityIndicator color="black" />
          : <Text style={styles.postBtnText}>Share Post</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    backgroundColor: '#000', // UTA Smart Closet dark theme 
    padding: 20,
  },
  topHeading: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 45,
    marginBottom: 25,
    textAlign: 'center',
  },
  photoContainer: {
    width: '100%',
    height: 380,
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedImg: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
  },
  captionInput: {
    backgroundColor: '#0a0a0a',
    color: 'white',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    minHeight: 90,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#222',
    textAlignVertical: 'top',
  },
  postBtn: {
    backgroundColor: '#fff',
    marginTop: 25,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  postBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  linkBtnText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  wardrobeGrid: {
    marginTop: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wardrobeThumb: {
    width: '30%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  wardrobeThumbSelected: {
    borderColor: '#fff',
  },
  wardrobeThumbImg: {
    width: '100%',
    height: 90,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#000',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wardrobeThumbLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
  },
  emptyWardrobeText: {
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});