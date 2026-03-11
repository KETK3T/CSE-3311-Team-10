import { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet,Image, Alert,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '../../theme';

export default function UploadScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(true); 

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
  };

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
      <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />

      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
          <Text style={styles.discardText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => {
            // send to backend and store in wardrobe
            Alert.alert('Saved!', 'Item added to your wardrobe.');
            handleDiscard();
          }}
        >
          <Text style={styles.saveText}>Add to Wardrobe</Text>
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
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: '#000',
  },
  discardBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  discardText: { color: '#fff', fontSize: 15 },
  saveBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  saveText: { color: colors.textDark, fontSize: 15, fontWeight: '600' },
});
