import {supabase} from './supabase-client'


export const getAllClothingItems = async (userId) => {
	const {data, error} = await supabase
		.from('clothing_items')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
	return {items: data || [], error: error?.message || null}
}

export const getClothingItemByCategory = async (userId, category) => {
	const { data, error } = await supabase
		.from('clothing_items')
		.select('*')
		.eq('user_id', userId)
		.eq('category', category)
		.order('created_at', { ascending: false });
	return { items: data || [], error: error?.message || null }
}

export const addClothingItem = async (itemData) => {
	const {data,error} = await supabase
		.from('clothing_items')
		.insert({
			user_id: itemData.userId,
			image_url: itemData.imageUrl,
			category: itemData.category,
			season: itemData.season || [],
			occasion: itemData.occasion || [],
			color: itemData.color || null,
			is_favorite: false,
		})
		.select()
		.single();
	return { item: data, error: error?.message || null };
}

export const deleteClothingItem = async(itemId) => {
	const { error } = await supabase
		.from('clothing_items')
		.delete()
		.eq('id', itemId);
	return { error: error?.message || null }
}

export const toggleFavorite = async (itemId, currentStatus) => {
	const { data, error } = await supabase
		.from('clothing_items')
		.update({ is_favorite: !currentStatus })
		.eq('id', itemId)
		.select()
		.single();
	return { item: data, error: error?.message || null }
}

export const getAllFavorites = async (userId) => {
	const { data, error } = await supabase
		.from('clothing_items')
		.select('*')
		.eq('user_id', userId)
		.eq('is_favorite', true)
		.order('created_at', { ascending: false });
	return { items: data || [], error: error?.message || null }
}

export const togglePrivate = async (itemId,currentStatus) => {
	const { data, error } = await supabase
		.from('clothing_items')
		.update({ is_private: !currentStatus })
		.eq('id', itemId)
		.select()
		.single()
	return { item: data, error: error?.message || null }
}


