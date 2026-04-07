import {supabase} from './supabase-client'

export const getProfile= async(userId) => {
	const{data,error} = await supabase
		.from('profiles')
		.select('*')
		.eq('id', userId)
		.single()
	return { profile: data || [], error: error?.message || null}
}

export const updateProfile = async (userId, updates) => {
	const fields = {}
	if(updates.username !== undefined) fields.username = updates.username
	if(updates.avatar_url !== undefined) fields.avatar_url = updates.avatar_url

	const {data, error} = await supabase
		.from('profiles')
		.update(fields)
		.eq('id', userId)
		.select()
		.single()
		return {profile: data || null, error: error?.message || null}
	}
	
export const updateAvatar = async (userId, avatar_url) => {
	const {data,error} = await supabase
		.from('profiles')
		.update({avatar_url})
		.eq('id',userId)
		.select()
		.single()
		return {profile: data || null, error: error?.message || null}
}


export const checkUsernameAvailable = async (username, currentUserId) => {
	const {data} = await supabase
		.from('profiles')
		.select('id')
		.eq('username', username)
		.neq('id', currentUserId)
		.maybeSingle()
	return !data
}
export const uploadAvatar = async (userId, uri) => {
	const fileName = `${userId}/${Date.now()}.jpg`
	const formData = new FormData()
	formData.append('file', {uri: uri, name: fileName, type: 'image/jpeg'})

	const {error} = await supabase.storage
		.from('profile_pics')
		.upload(fileName, formData, {contentType: 'multipart/form-data', upsert: true})

	if(error) throw new Error(error.message)
	

	const{data: urlData} = supabase.storage
		.from('profile_pics')
		.getPublicUrl(fileName)
	
	return urlData.publicUrl
}

export const getUsername = async(userId) => {
	const {data ,error} = await supabase
		.from('profiles')
		.select('username')
		.eq('id',userId)
		.single()
		return { username: data?.username || null, error: error?.message || null}
}

export const getItemCount = async(userId) => {
	const {count, error} = await supabase
		.from('clothing_items')
		.select('*', {count: 'exact', head: true})
		.eq('user_id', userId)
	return {count: count || 0, error: error?.message || null}
}