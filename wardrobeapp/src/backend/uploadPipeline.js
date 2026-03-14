import { addClothingItem } from "./wardrobeService"

const uploadImageToStorage = async(imageUri, userId) => {
	console.log("Uploading image to storage")
	return imageUri
}

export const uploadClothingItem = async(imageUri, userId, onProgress) => {
	try{
		onProgress?.('Uploading image...')
		const imageUrl = await uploadImageToStorage(imageUri,userId)

		onProgress?.('Saving to wardrobe...')
		const {item, error} = await addClothingItem({
			userId,
			imageUrl,
			category: 'Top',
		})

		if (error) return {item: null, error}

		onProgress?.('Done!!!')
		return {item, error: null}
	}catch(e){
		return {item: [], error: e.message}
	}
}