import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, 
  StyleSheet, ActivityIndicator, Alert, Keyboard 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../backend/supabase-client'; // Using our synced supabase client

export default function UploadPost({ navigation }) {
  const [outfitPhoto, setOutfitPhoto] = useState(null);
  const [base64Code, setBase64Code] = useState(null);
  const [captionText, setCaptionText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleCreatePost = async () => {
    if (!outfitPhoto) {
      Alert.alert("Missing Photo", "Gotta select an outfit photo before you post!");
      return;
    }

    try {
      setIsUploading(true);

      //Check for the current user session
      const { data:{user}}=await supabase.auth.getUser();
      if (!user) throw new Error("Log in again to share your fit.");

      //Set up the path for the post-images bucket
      const imagePath = `${user.id}/${Date.now()}.jpg`;

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
          user_id: user.id,
          image_url: publicUrl,
          caption: captionText,
        });

      if (dbErr) throw dbErr;

      Alert.alert("Success!", "Your post is now on the community feed.");
      
      // Reset the screen and head back to the feed view
      setOutfitPhoto(null);
      setCaptionText('');
      navigation.navigate('SocialScreenFeed'); 

    } catch (err) {
      console.log("Something went wrong with the upload:", err.message);
      Alert.alert("Upload Error", err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.screenBody}>
      <Text style={styles.topHeading}>New Community Post</Text>

      <TouchableOpacity style={styles.photoContainer} onPress={handlePickPhoto}>
        {outfitPhoto ? (
          <Image source={{ uri: outfitPhoto }} style={styles.selectedImg} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={{ color: '#666', fontSize: 16 }}>+ Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.captionInput}
        placeholder="Drop a caption for the fit..."
        placeholderTextColor="#444"
        value={captionText}
        onChangeText={setCaptionText}
        multiline
        onSubmitEditing={()=>Keyboard.dismiss()}
      />

      <TouchableOpacity 
        style={[styles.postBtn, isUploading && { opacity: 0.6 }]} 
        onPress={handleCreatePost}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="black" />
        ) : (
          <Text style={styles.postBtnText}>Share Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
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
  postBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});