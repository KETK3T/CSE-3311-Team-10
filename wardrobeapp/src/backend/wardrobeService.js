import { mockDB } from "./mockdatabase";

export const getAllClothingItems = async (userId) => {
	try {
		const items = mockDB.clothing_items.filter(
			item => item.user_id === user_id
		)
		return { items, error: null}
	}catch(e){
		return {items: [], error: e.message}
	}
}

export const getClothingItemByCategory = async (userId, category) => {
	try{
		const items = mockDB.clothing_items.filter(
			item => item.user_id === user_id &&
			item.category.toLowerCase() === category.toLowerCase()
		)
		return {items,error:null}
	}catch(e){
		return {items: [], error: e.message}
	}
}

export const addClothingItem = async (itemData) => {
	try{
		const newItem = {
			id: `item-${Date.now()}`,
			user_id: itemData.userId,
			image_url: itemData.image_url || null,
			category: itemData.category,
			season: itemData.season || [],
			occasion: itemData.occasion || [],
			color: itemData.color || null,
			is_favorite: false,
			created_at: new Date().toISOString(),
		}
		mockDB.clothing_items.push(newItem)
		return {item: newItem, error:null}
	}catch(e){
		return {item: [], error: e.message}
	}
}

export const deletClothingItem = async(itemId) => {
	try{
		const index = mockDB.clothing_items.findIndex(i => i.id === itemId)
		if (index === -1) return {error: 'Item not found'}
		mockDB.clothing_items.splice(index,1)
		return {error: null}
	}catch(e){
		return {error: e.message}
	}
}

export const toggleFavorite = async (itemId) => {
	try{
		const item = mockDB.clothing_items.find(i => i.id === itemId)
		if (!item) return {item: null, error: 'Item not found'}
		item.is_favorite = !item.is_favorite
	}catch(e){
		return {item: [], error: e.message}
	}
}

export const getAllFavorites = async (userId) => {
	try{
		const items = mockDB.clothing_items.filter(
			item => item.user_id === userId && item.is_favorite
		)
		return {items, error: null}
	}catch(e){
		return {item: [], error: e.message}
	}
}
