import { useState,useRef,useEffect, useCallback, } from 'react'
import {View, Text, TouchableOpacity, StyleSheet,Image, Alert,ActivityIndicator, ScrollView, TextInput} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'
import { colors, spacing, radius } from '../../theme'
import { uploadClothingItem } from '../../backend/uploadPipeline'
import { useAuth } from '../../backend/useAuth'
import {CameraView, useCameraPermissions} from 'expo-camera'
import { useFocusEffect } from '@react-navigation/native'
import { Platform } from 'react-native'


// const MOCK_USER_ID = '34f19f18-0889-4773-b27c-6bada8f795c4'
const CATEGORIES = ['Tops', 'Bottoms', 'Outerwear', 'Accessories']
const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter', 'All']
const OCCASIONS = ['Casual', 'Formal', 'Sport', 'Outdoor', 'Work']

export default function UploadScreen({ navigation }) {
	const {user} = useAuth()
	const [selectedImage, setSelectedImage] = useState(null)
	const [isUploading, setIsUploading] = useState(false)
	const [progressMessage,setProgressMessage] = useState('')
	const [selectedCategory, setSelectedCategory] = useState(null)
	const [selectedSeasons, setSelectedSeasons] = useState([])
	const [selectedOccasions, setSelectedOccasions] = useState([])
	const [facing, setFacing] = useState('back')
	const [lastPhoto, setLastPhoto] = useState(null)
	const[permission, requestPermission] = useCameraPermissions()
	const cameraRef = useRef(null)
	const [brand, setBrand] = useState('')
	const [isFocused, setIsFocused] = useState(false)

	useFocusEffect(
		useCallback(() => {
			setIsFocused(true)
			return () => setIsFocused(false)
		}, [])
	)

	useEffect(() => {
		if (Platform.OS === 'web') return
		const fetchLastPhoto = async () => {
			const {status} = await MediaLibrary.requestPermissionsAsync()
			if (status !== 'granted') return

			const {assets} = await MediaLibrary.getAssetsAsync({
				mediaType: 'photo',
				sortBy: [MediaLibrary.SortBy.creationTime],
				first: 1,
			})

			if(assets.length > 0){
				const assetInfo = await MediaLibrary.getAssetInfoAsync(assets[0].id)
				setLastPhoto(assetInfo.localUri)
			}
		}
		fetchLastPhoto()
	},[])

	const openGallery = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (status !== 'granted') {
			Alert.alert('Permission needed', 'Allow access to your photo library to upload clothes.')
			return
		}
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ['images'],
			allowsEditing: true,
			aspect: [4, 5],
			quality: 0.9,
		})
		if (!result.canceled) {
			setSelectedImage(result.assets[0].uri)
		}
	}

	const takePicture = async () => {
		if(!cameraRef.current) return
		const photo = await cameraRef.current.takePictureAsync({
			quality: 0.9,
			skipProcessing: false,
		})
		setSelectedImage(photo.uri)
	}

	const handleDiscard = () => {
		setSelectedImage(null)
		setProgressMessage('')
		setSelectedCategory(null)
		setSelectedSeasons([])
		setSelectedOccasions([])
		setBrand('')
	}

	const toggleSeason = (season)=> {
		setSelectedSeasons(prev =>
			prev.includes(season) ? prev.filter(s => s !== season) : [...prev, season]
		)
	}

	const toggleOccasion = (occasion) => {
		setSelectedOccasions(prev => 
			prev.includes(occasion) ? prev.filter(o => o !== occasion) : [...prev, occasion]
		)
	}

	const handleUpload = async() => {
		if (!selectedImage) return
		if(!selectedCategory){
			Alert.alert('Missing Info', 'Please select a category.')
			return
		}
		setIsUploading(true)
		const {item, error} = await uploadClothingItem(
			selectedImage,
			user?.id,
			(msg) => setProgressMessage(msg),
			{
				category: selectedCategory,
				season: selectedSeasons.length > 0 ? selectedSeasons : ['All'],
				occasion: selectedOccasions.length > 0 ? selectedOccasions: ['Casual'],
				color: null,
				brand: brand.trim() || null,
			}
		)
	
		setIsUploading(false)
		if(error){
			Alert.alert('Upload failed', error)
			return
		}
		Alert.alert(
			'Added to Wardrobe!',
			`Category: ${selectedCategory}\nSeason: ${selectedSeasons.join(', ') || 'All'}\nOccasion: ${selectedOccasions.join(', ') || 'Casual'}`,
			[{text: 'OK', onPress: () => {
				handleDiscard()
				navigation.navigate('Wardrobe')
			}}]
		)
	}

	if(!permission){
		return <View style = {styles.cameraScreen} />
	}

	if(!permission.granted){
		return(
			<View style={styles.permissionScreen}>
				<Text style={styles.permissionText}>Camera Access is needed to take photos of your clothes</Text>
				<TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
					<Text style={styles.permissionBtnText}>Grant Permission</Text>
				</TouchableOpacity>
			</View>
		)
	}

	if (!selectedImage) {
		if (Platform.OS === 'web') {
			return (
			<View style={[styles.cameraScreen, { alignItems: 'center', justifyContent: 'center' }]}>
				<Ionicons name="camera-off-outline" size={48} color="rgba(255,255,255,0.4)" />
				<Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 14 }}>
				Camera not available on web
				</Text>
				<TouchableOpacity
				style={{ marginTop: 24, backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 }}
				onPress={openGallery}
				>
				<Text style={{ color: '#000', fontWeight: '600' }}>Choose from Gallery</Text>
				</TouchableOpacity>
			</View>
			)
		}
		return (
			<View style={styles.cameraScreen}>
				{isFocused && (
					<CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />
				)}
			
				<View style={styles.topBar}>
					<TouchableOpacity onPress={() => navigation.navigate('Wardrobe')}>
						<Ionicons name="close" size={28} color="#fff"/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}>
						<Ionicons name="camera-reverse-outline" size={28} color="#fff"/>
					</TouchableOpacity>
				</View>
			
				<View style={styles.cameraBar}>
					<TouchableOpacity style={styles.galleryThumb} onPress={openGallery}>
						{lastPhoto ? (
							<Image source={{uri: lastPhoto}} style={styles.galleryThumbImage} />
						): (
							<Ionicons name="image-outline" size={28} color="#fff"/>
						)}
					</TouchableOpacity>

					<TouchableOpacity style={styles.shutter} onPress={takePicture}>
						<View style={styles.shutterInner}/>
					</TouchableOpacity>

					<View style={{width:56}}/>
				</View>

			</View>
		)
	}

	return (
		<View style={{flex: 1}}>
			<TouchableOpacity style={styles.previewCloseBtn} onPress={handleDiscard} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
				<Ionicons name="close" size={28} color={colors.textDark} />
			</TouchableOpacity>
			<ScrollView style={styles.previewScreen} showsVerticalScrollIndicator={false}>
				<View style={styles.imageContainer}>
					<Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
				</View>

				<View style={styles.brandContainer}>
					<Text style={styles.sectionLabel}>Brand <Text style={styles.optional}>(optional)</Text></Text>
					<TextInput
						style={styles.brandInput}
						placeholder="e.g. Nike, Zara, H&M..."
						placeholderTextColor={colors.textLight}
						value={brand}
						onChangeText={setBrand}
						autoCapitalize="words"
						autoCorrect={false}
					/>
				</View>

				<View style={styles.tagsContainer}>
					<Text style={styles.sectionLabel}>Category <Text style={styles.required}>*</Text></Text>
					<View style={styles.chipRow}>
						{CATEGORIES.map(cat => (
							<TouchableOpacity
								key={cat}
								style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
								onPress={() => setSelectedCategory(cat)}
							>
								<Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>
									{cat}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					<Text style={styles.sectionLabel}>Season</Text>
					<View style={styles.chipRow}>
						{SEASONS.map(season => (
							<TouchableOpacity
								key={season}
								style={[styles.chip, selectedSeasons.includes(season) && styles.chipSelected]}
								onPress={() => toggleSeason(season)}
							>
								<Text style={[styles.chipText, selectedSeasons.includes(season) && styles.chipTextSelected]}>
									{season}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					<Text style={styles.sectionLabel}>Occasion</Text>
					<View style={styles.chipRow}>
						{OCCASIONS.map(occasion => (
							<TouchableOpacity
								key={occasion}
								style={[styles.chip, selectedOccasions.includes(occasion) && styles.chipSelected]}
								onPress={() => toggleOccasion(occasion)}
							>
								<Text style={[styles.chipText, selectedOccasions.includes(occasion) && styles.chipTextSelected]}>
									{occasion}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{isUploading && (
					<View style={styles.uploadingOverlay}>
						<ActivityIndicator size="large" color="#fff" />
						<Text style={styles.uploadingText}>{progressMessage}</Text>
					</View>
				)}

				<View style={styles.previewActions}>
					<TouchableOpacity style={styles.discardBtn} onPress={handleDiscard} disabled={isUploading}>
						<Text style={styles.discardText}>Retake</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.saveBtn, isUploading && { opacity: 0.6 }]}
						onPress={handleUpload}
						disabled={isUploading}
					>
						<Text style={styles.saveText}>{isUploading ? 'Processing...' : 'Add to Wardrobe'}</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>	
		
	)
}

const styles = StyleSheet.create({
  cameraScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  topBar: {
	position: 'absolute',
	top: 56,
	left: 20,
	right: 20,
	flexDirection: 'row',
	justifyContent: 'space-between',
	zIndex: 10,
  },
  permissionScreen: {
	flex: 1,
	background: '#000',
	alignItems: 'center',
	justifyContent: 'center',
	padding: '32',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 15,
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
  galleryThumbImage:{
	width: '100%',
	height: '100%',
	borderRadius: radius.sm,
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
    width: '100%',
    height: '100%',
  },
  tagsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  required: {
    color: 'red',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMid,
  },
  chipTextSelected: {
    color: colors.white,
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
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  discardBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
  brandContainer: {
	paddingHorizontal: spacing.lg,
	paddingTop: spacing.lg,
	},
	brandInput: {
	borderWidth: 1,
	borderColor: colors.border,
	borderRadius: radius.sm,
	paddingHorizontal: spacing.md,
	paddingVertical: spacing.md,
	fontSize: 15,
	color: colors.textDark,
	backgroundColor: colors.inputBg,
	},
	optional: {
	color: colors.textLight,
	fontWeight: '400',
	},
	previewCloseBtn: {
	position: 'absolute',
	top: 56,
	left: 20,
	zIndex: 10,
	backgroundColor: colors.white,
	borderRadius: 20,
	width: 40,
	height: 40,
	alignItems: 'center',
	justifyContent: 'center',
	shadowColor: '#000',
	shadowOpacity: 0.1,
	shadowRadius: 4,
	shadowOffset: { width: 0, height: 2 },
	elevation: 3,
	},
})