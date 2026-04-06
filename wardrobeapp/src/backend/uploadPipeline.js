import { addClothingItem } from "./wardrobeService"
import { supabase } from "./supabase-client"


const uploadImageToStorage = async(imageUri, userId) => {
	const fileName = `${userId}/${Date.now()}.jpg`

		
	const formData = new FormData()
	formData.append('file', {
		uri: imageUri,
		name: fileName,
		type: 'image/jpeg',
	})
	
	const {data, error} = await supabase.storage
		.from('clothing')
		.upload(fileName, formData, {
			contentType: 'multipart/form-data',
			upsert: false,
		})
	
	if (error) throw new Error(error.message)
	
	const {data: urlData} = supabase.storage
		.from('clothing')
		.getPublicUrl(fileName)

	return urlData.publicUrl
}

export const uploadClothingItem = async(imageUri, userId, onProgress, manualTags) => {
	try{
		onProgress?.('Uploading image...')
		const imageUrl = await uploadImageToStorage(imageUri,userId)

		const tags = manualTags || {
			category: 'Tops',
			season: ['All'],
			occasion: ['Casual'],
			color: null,
		}

		onProgress?.('Saving to wardrobe...')
		const {item, error} = await addClothingItem({
			userId, imageUrl,
			category: tags.category,
			season: tags.season,
			occasion: tags.occasion,
			color: tags.color,
		})

		if (error) return {item: null,tags:null, error}

		onProgress?.('Done!!!')
		return {item,tags, error: null}
	}catch(e){
		return {item: null, tags: null, error: e.message}
	}
}