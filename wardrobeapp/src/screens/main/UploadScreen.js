import { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet,Image, Alert,ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '../../theme';
import { uploadClothingItem } from '../../backend/uploadPipeline';

const MOCK_USER_ID = 'user-1'
export default function UploadScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(true); 
  const [isUploading, setIsUploading] = useState(false);
  const [progressMessage,setProgressMessage] = useState('')

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to upload clothes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setCameraVisible(false);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take photos of your clothes.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setCameraVisible(false);
    }
  };

  const handleDiscard = () => {
    setSelectedImage(null);
    setCameraVisible(true);
    setProgressMessage('')
  };

  const handleUpload = async() => {
    if (!selectedImage) return
    setIsUploading(true)
    const {item, error} = await uploadClothingItem(
      selectedImage,
      MOCK_USER_ID,
      (msg) => setProgressMessage(msg)
    )
  
    setIsUploading(false)
    if(error){
      Alert.alert('Upload failed', error)
      return
    }
    Alert.alert(
      'Added to Wardrobe!',
      'Category: PENDING',
      [{text: 'OK', onPress: () => {
        handleDiscard();
        navigation.navigate('Wardrobe')
      }}]
    )
  }

  
  

  if (cameraVisible && !selectedImage) {
    return (
      <View style={styles.cameraScreen}>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.navigate('Wardrobe')}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.cameraBar}>
          <TouchableOpacity style={styles.galleryThumb} onPress={openGallery}>
            <Ionicons name="image-outline" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutter} onPress={openCamera}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <View style={{ width: 56 }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.previewScreen}>
      <View style={styles.imageContainer}>
        <Image source={{uri: selectedImage}} style={styles.previewImage} resizeMode="contain"/>
      </View>

      {isUploading && (
        <View style = {styles.uploadingOverlay}>
          <ActivityIndicator size='large' color='#fff'/>
          <Text style={styles.uploadingText}>{progressMessage}</Text>
        </View>
      )}
      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard} disabled={isUploading}>
          <Text style={styles.discardText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, isUploading && {opacity: 0.6}]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Text style={styles.saveText}>{isUploading ? 'Processing...' : 'Add to Wardrobe'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  cameraBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    paddingTop: spacing.lg,
  },
  galleryThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  previewScreen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  imageContainer: {
    height: 420,
    backgroundColor: colors.inputBg,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  previewImage: {
    width:'100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  uploadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  previewActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.background,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  discardText: { color: colors.textDark, fontSize: 15 },
  saveBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveText: { color: colors.textDark, fontSize: 15, fontWeight: '600' },
});