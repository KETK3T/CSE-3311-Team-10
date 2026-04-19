import { supabase } from "./supabase-client"

export const followUser = async(followerId, followingId) => {
	const {error} = await supabase
		.from('follows')
		.insert({follower_id: followerId, following_id: followingId})
	return {error: error?.message || null}
}

export const unfollowUser = async (followerId, followingId) => {
	const { error } = await supabase
		.from('follows')
		.delete()
		.eq('follower_id', followerId)
		.eq('following_id', followingId)
	return { error: error?.message || null }
}

export const isFollowing = async (followerId, followingId) => {
	const { data } = await supabase
		.from('follows')
		.select('id')
		.eq('follower_id', followerId)
		.eq('following_id', followingId)
		.maybeSingle()
	return !!data
}

export const getFollowerCount = async (userId) => {
	const {count} = await supabase
		.from('follows')
		.select('*', {count: 'exact', head: true})
		.eq('following_id', userId)
	return count || 0
}

export const getFollowingCount = async (userId) => {
	const { count } = await supabase
		.from('follows')
		.select('*', { count: 'exact', head: true })
		.eq('follower_id', userId)
	return count || 0
}

export const getPublicWardrobe = async (userId) => {
	const { data, error } = await supabase
		.from('clothing_items')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
	return { items: data || [], error: error?.message || null }
}

export const getUserPosts = async (userId) => {
	const { data, error } = await supabase
		.from('social_posts')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
	return { posts: data || [], error: error?.message || null }
}

export const getPublicProfile = async (userId) => {
	const { data, error } = await supabase
		.from('profiles')
		.select('id, username, avatar_url')
		.eq('id', userId)
		.single()
	return { profile: data || null, error: error?.message || null }
}

export const deletePost = async(postId) => {
	const {error} = await supabase
		.from('social_posts')
		.delete()
		.eq('id', postId)
	return { error: error?.message || null}
}