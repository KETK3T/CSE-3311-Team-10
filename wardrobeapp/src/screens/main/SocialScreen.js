// import { useState } from 'react';
// import {View, FlatList, TouchableOpacity, Image,StyleSheet, Share, useWindowDimensions,} from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { colors, spacing } from '../../theme';

// const MOCK_POSTS = [
//   { id: '1', imageUri: null, liked: false, avatarUri: null },
//   { id: '2', imageUri: null, liked: true,  avatarUri: null },
//   { id: '3', imageUri: null, liked: false, avatarUri: null },
// ];

// function PostCard({ post, onToggleLike, onShare, height }) {
//   return (
//     <View style={{ width: '100%', height, backgroundColor: colors.white }}>
//       {post.imageUri ? (
//         <Image source={{ uri: post.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
//       ) : (
//         <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.inputBg }]}>
//           <Ionicons name="image-outline" size={64} color={colors.placeholder} />
//         </View>
//       )}

//       <View style={{ position: 'absolute', right: spacing.md, bottom: 120, alignItems: 'center', gap: spacing.xl }}>
//         <TouchableOpacity>
//           <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.inputBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.labelBg }}>
//             <Ionicons name="person" size={20} color={colors.textDark} />
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity onPress={onToggleLike}>
//           <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={36} color={post.liked ? '#ff3b5c' : colors.textDark} />
//         </TouchableOpacity>

//         <TouchableOpacity onPress={onShare}>
//           <Ionicons name="share-social-outline" size={36} color={colors.textDark} />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// export default function SocialScreen() {
//   const { height } = useWindowDimensions();
//   const [posts, setPosts] = useState(MOCK_POSTS);

//   const toggleLike = (id) => {
//     setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked } : p));
//   };

//   const sharePost = async () => {
//     try {
//       await Share.share({ message: 'Check out this outfit! 👗✨' });
//     } catch (e) { console.log(e); }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: '#000' }}>
//       <FlatList
//         data={posts}
//         keyExtractor={item => item.id}
//         renderItem={({ item }) => (
//           <PostCard
//             post={item}
//             height={height}
//             onToggleLike={() => toggleLike(item.id)}
//             onShare={sharePost}
//           />
//         )}
//         showsVerticalScrollIndicator={false}
//         pagingEnabled
//         snapToInterval={height}
//         decelerationRate="fast"
//       />
//     </View>
//   );
// }
