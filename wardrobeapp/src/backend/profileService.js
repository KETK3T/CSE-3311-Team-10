import { use } from 'react'
import {supabase} from './supabase-client'

export const getProfile= async(userId) => {
	const{data,error} = await supabase
		.from('profiles')
		.select('*')
		.eq('user_id', userId)
		.single()
	return { profile: data || [], error: error?.message || null}
}

export const updateProfile = async (userId, {username, avatarUrl}) => {
	const {data, error} = await supabase
		.from('profiles')
		.update({username, avatar_url: avatarUrl})
		.eq('id', userId)
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
	FormData.append('file', {uri, name: fileName, type: 'image/jpeg'})

	const {error} = await supabase.storage
		.from('profile_pics')
		.upload(fileName, formData, {contentType: 'multipart/form-data', upsert: true})

	if(error) throw new Error(error.message)
	

	const{data: urlData} = supabase.storage
		.from('profile_pics')
		.getPublicUrl(fileName)
	
	return urlData.publicUrl
}

export const getItemCount = async(userId) => {
	const {count, error} = await supabase
		.from('clothing_items')
		.select('*', {count: 'exact', head: true})
		.eq('user_id', userId)
	return {count: count || 0, error: error?.message || null}
}