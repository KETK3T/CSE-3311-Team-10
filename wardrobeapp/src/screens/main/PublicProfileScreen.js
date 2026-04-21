import { useState, useEffect } from 'react'
import {View, Text, Image, StyleSheet, ScrollView,TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ClothingCard from '../../components/ClothingCard'
import { colors, spacing, radius } from '../../theme'
import { useAuth } from '../../backend/useAuth'
import {getPublicFavorites, getPublicProfile, getPublicWardrobe, getUserPosts,getFollowerCount, getFollowingCount, followUser,unfollowUser, isFollowing as checkIsFollowing
} from '../../backend/socialService'

export default function PublicProfileScreen({ route, navigation }) {
	const { userId } = route.params
	const { user } = useAuth()
	const [profile, setProfile] = useState(null)
	const [wardrobe, setWardrobe] = useState([])
	const [posts, setPosts] = useState([])
	const [followerCount, setFollowerCount] = useState(0)
	const [followingCount, setFollowingCount] = useState(0)
	const [following, setFollowing] = useState(false)
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState('wardrobe')
	const [favorites, setFavorites] = useState([])
	useEffect(() => {
		loadAll()
	}, [userId, user?.id])

	const loadAll = async () => {
	if (!user?.id) return
	setLoading(true)
	try {
		const [
			{ profile: profileData },
			{ items },
			{ posts: postsData },
			{items: favoritesData},
			followers,
			followings,
			isFollowingUser,
		] = await Promise.all([
			getPublicProfile(userId),
			getPublicWardrobe(userId),
			getUserPosts(userId),
			getPublicFavorites(userId),
			getFollowerCount(userId),
			getFollowingCount(userId),
			checkIsFollowing(user.id, userId),
		])
		setProfile(profileData)
		setWardrobe(items)
		setPosts(postsData)
		setFavorites(favoritesData)
		setFollowerCount(followers)
		setFollowingCount(followings)
		setFollowing(isFollowingUser)
	} catch (e) {
		Alert.alert('Error', e.message)
	}
		setLoading(false)
	}

	const handleFollow = async () => {
		if(following){
			await unfollowUser(user.id,userId)
			setFollowing(false)
			setFollowerCount(prev => prev-1)
		}else{
			await followUser(user.id, userId)
			setFollowing(true)
			setFollowerCount(prev => prev+1)
		}
	}

	if(loading){
		return(
			<SafeAreaView style={styles.safe}>
				<View style={styles.centered}>
					<ActivityIndicator size='large' color={colors.primaryDark}/>
				</View>
			</SafeAreaView>
		)
	}


	return (
		<SafeAreaView style={styles.safe}>
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

				{/* Back button */}
				<TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
				<Ionicons name="chevron-back" size={24} color={colors.textDark} />
				</TouchableOpacity>

				{/* Avatar */}
				<View style={styles.avatarWrapper}>
				{profile?.avatar_url ? (
					<Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
				) : (
					<View style={styles.avatarCircle}>
					<Ionicons name="person" size={56} color={colors.textMid} />
					</View>
				)}
				</View>

				<Text style={styles.username}>@{profile?.username || 'unknown'}</Text>

				{/* Stats */}
				<View style={styles.statsRow}>
				<View style={styles.stat}>
					<Text style={styles.statValue}>{wardrobe.length}</Text>
					<Text style={styles.statLabel}>Items</Text>
				</View>
				<View style={styles.stat}>
					<Text style={styles.statValue}>{followerCount}</Text>
					<Text style={styles.statLabel}>Followers</Text>
				</View>
				<View style={styles.stat}>
					<Text style={styles.statValue}>{followingCount}</Text>
					<Text style={styles.statLabel}>Following</Text>
				</View>
				</View>

				{/* Follow button — only if not your own profile */}
				{user?.id !== userId && (
				<View style={styles.followRow}>
					<TouchableOpacity
					style={[styles.followBtn, following && styles.followingBtn]}
					onPress={handleFollow}
					>
					<Text style={[styles.followBtnText, following && styles.followingBtnText]}>
						{following ? 'Following' : 'Follow'}
					</Text>
					</TouchableOpacity>
				</View>
				)}

				{/* Tabs */}
				<View style={styles.tabRow}>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'wardrobe' && styles.tabActive]}
					onPress={() => setActiveTab('wardrobe')}
				>
					<Ionicons
					name="grid-outline"
					size={22}
					color={activeTab === 'wardrobe' ? colors.textDark : colors.textMid}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
					onPress={() => setActiveTab('favorites')}
				>
					<Ionicons
					name="star-outline"
					size={22}
					color={activeTab === 'favorites' ? colors.textDark : colors.textMid}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
					onPress={() => setActiveTab('posts')}
				>
					<Ionicons
					name="albums-outline"
					size={22}
					color={activeTab === 'posts' ? colors.textDark : colors.textMid}
					/>
				</TouchableOpacity>
				</View>

				<View style={styles.divider} />

				{/* Wardrobe tab */}
				{activeTab === 'wardrobe' && (
				wardrobe.length === 0 ? (
					<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No items yet</Text>
					</View>
				) : (
					<View style={styles.grid}>
					{wardrobe.map(item => (
						<View key={item.id} style={styles.cardWrapper}>
						<ClothingCard
							imageUri={item.image_url}
							category={item.category}
							isFavorite={item.is_favorite}
							isOwner={false}
						/>
						</View>
					))}
					</View>
				)
				)}
				{activeTab === 'favorites' && (
				favorites.length === 0 ? (
					<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No favorites yet</Text>
					</View>
				) : (
					<View style={styles.grid}>
					{favorites.map(item => (
						<View key={item.id} style={styles.cardWrapper}>
						<ClothingCard
							imageUri={item.image_url}
							category={item.category}
							isFavorite={item.is_favorite}
							isOwner={false}
						/>
						</View>
					))}
					</View>
				)
				)}
				{/* Posts tab */}
				{activeTab === 'posts' && (
				posts.length === 0 ? (
					<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No posts yet</Text>
					</View>
				) : (
					<View style={styles.grid}>
					{posts.map(post => (
						<TouchableOpacity key={post.id} style={styles.cardWrapper}>
						<Image
							source={{ uri: post.image_url }}
							style={styles.postThumb}
							resizeMode="cover"
						/>
						</TouchableOpacity>
					))}
					</View>
				)
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: colors.white },
	centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	backBtn: { marginTop: spacing.md, marginLeft: spacing.md },
	avatarWrapper: { alignItems: 'center', marginTop: spacing.lg },
	avatarCircle: {
		width: 100, height: 100, borderRadius: 50,
		backgroundColor: colors.inputBg, alignItems: 'center',
		justifyContent: 'center', borderWidth: 1, borderColor: colors.border,
	},
	avatarImg: { width: 100, height: 100, borderRadius: 50 },
	username: {
		textAlign: 'center', fontSize: 16, fontWeight: '700',
		letterSpacing: 1.5, color: colors.textDark, marginTop: spacing.md,
	},
	statsRow: {
		flexDirection: 'row', justifyContent: 'center',
		gap: spacing.xl, marginTop: spacing.md,
	},
	stat: { alignItems: 'center' },
	statValue: { fontSize: 18, fontWeight: '700', color: colors.textDark },
	statLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
	followRow: { alignItems: 'center', marginTop: spacing.md },
	followBtn: {
		paddingVertical: spacing.sm, paddingHorizontal: spacing.xl,
		borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.textDark,
	},
	followingBtn: {
		backgroundColor: colors.inputBg, borderColor: colors.border,
	},
	followBtnText: { fontSize: 14, fontWeight: '600', color: colors.textDark },
	followingBtnText: { color: colors.textMid },
	tabRow: { flexDirection: 'row', marginTop: spacing.lg },
	tab: {
		flex: 1, alignItems: 'center', paddingVertical: spacing.md,
		borderBottomWidth: 2, borderBottomColor: 'transparent',
	},
	tabActive: { borderBottomColor: colors.textDark },
	divider: { height: 1, backgroundColor: colors.border },
	grid: {
		flexDirection: 'row', flexWrap: 'wrap',
		paddingHorizontal: spacing.md, gap: spacing.md,
		paddingTop: spacing.md, paddingBottom: spacing.xl,
	},
	cardWrapper: { width: '47%' },
	postThumb: {
		width: '100%', height: 200, borderRadius: radius.md,
	},
	emptyContainer: { alignItems: 'center', paddingTop: spacing.xl * 3 },
	emptyText: { fontSize: 16, color: colors.textMid },
})