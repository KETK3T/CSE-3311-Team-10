// src/components/SocialPostCard.js
import React,{useState, useEffect,memo} from 'react';
import { View, Image, Text, StyleSheet,TouchableOpacity,Dimensions, FlatList, ActivityIndicator} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../backend/supabase-client';
import { colors, radius,} from '../theme';
import { isFollowing,unfollowUser } from '../backend/socialService';
import { followUser } from '../backend/socialService';

const {width, height}=Dimensions.get('window');

const CATEGORY_COLORS = {
  Tops: '#F9A8D4',
  Bottoms: '#93C5FD',
  Outerwear: '#6EE7B7',
  Accessories: '#FCD34D',
  default: '#C4B5FD',
}

function SocialPostCard({postId,userId,username,avatarUrl,postImage,caption,linkedItemIds=[],currentUserId,navigation}){
    const[liked,setLiked]=useState(false);
    const [likeCount,setLikeCount] = useState(0)
    const [linkedItems, setLinkedItems] = useState([])
    const [loadingItems, setLoadingItems] = useState(false)
    const [following, setFollowing] = useState(false)


    useEffect(() => {
      if(currentUserId && userId && currentUserId !== userId){
        isFollowing(currentUserId,userId).then(setFollowing)
      }
    },[currentUserId,userId])

    const handleFollow = async() => {
      if(following){
        await unfollowUser(currentUserId, userId)
        setFollowing(false)
      }else{
        await followUser(currentUserId,userId)
        setFollowing(true)
      }
    }

    useEffect(() => {
      if (linkedItemIds.length > 0){
        fetchLinkedItems()
      }
    }, [linkedItemIds])

    useEffect(() =>{
      if(postId && currentUserId){
        fetchLikeState()
      }
    }, [postId, currentUserId])
    
    const fetchLinkedItems = async () => {
      setLoadingItems(true)
      const {data, error} = await supabase
        .from('clothing_items')
        .select('id, image_url, category')
        .in('id', linkedItemIds)
      if(!error) setLinkedItems(data || [])
      
      setLoadingItems(false)
    }
    
    const fetchLikeState = async () => {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      setLikeCount(count || 0)

      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle()
      setLiked(!!data)
    }

    const handleLike = async () => {
      if (liked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
        setLiked(false)
        setLikeCount(prev => prev - 1)
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: currentUserId })
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }
    }

    const hasLinkedItems = linkedItems.length > 0

    return (
    <View style={styles.container}>
      {/* background*/}
      <Image 
        source={{ uri: postImage }} 
        style={StyleSheet.absoluteFill} 
        resizeMode="contain" 
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.bottomGradient}
      />

      {hasLinkedItems && (
        <View style={styles.linkedStrip}>
          {loadingItems ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            linkedItems.map(item => (
              <View key={item.id} style={styles.linkedItem}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.linkedItemImg}
                  resizeMode="cover"
                />
                <View style={[
                  styles.linkedItemLabel,
                  { backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.default }
                ]}>
                  <Text style={styles.linkedItemLabelText} numberOfLines={1}>
                    {item.category}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <View style={[styles.bottomInfo, hasLinkedItems && { paddingRight: 90 }]}>
        <View style={styles.userRow}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => navigation.navigate('PublicProfile', { userId })}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={16} color="#fff" />
              </View>
            )}
            <Text style={styles.username}>@{username}</Text>
          </TouchableOpacity>

          {currentUserId !== userId && (
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followingBtn]}
              onPress={handleFollow}
            >
              <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {caption ? (
          <Text style={styles.caption} numberOfLines={2}>{caption}</Text>
        ) : null}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <View style={styles.iconShadow}>
            <Ionicons
              name="heart"
              size={47}
              color="rgba(0,0,0,0.35)"
              style={{position:'absolute'}}
            />
            <Ionicons
              name="heart"
              size={45}
              color={liked ? '#ff4d4d' : '#fff'}
            />
          </View>
          
          {likeCount > 0 && (
            <Text style={styles.actionCount}>{likeCount}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.iconShadow}>
            <Ionicons name="share-social" size={47} color="rgba(0,0,0,0.5)" style={{position:'absolute'}}/>
            <Ionicons name="share-social" size={45} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  container: {
    width,
    height,
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'transparent',
    // Manual gradient simulation
    shadowColor: '#000',
  },
  linkedStrip: {
    position: 'absolute',
    right: 8,
    top: '20%',
    bottom: 400,
    width: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingBottom: 8,
  },
  linkedItem: {
    width: 68,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  linkedItemImg: {
    width: '100%',
    height: '100%',
  },
  linkedItemLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 2,
    alignItems: 'center',
  },
  linkedItemLabelText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 100,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: '#fff',
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  actions: {
    position: 'absolute',
    left: 16,
    bottom: 300,
    alignItems: 'center',
    gap: 20,
    // backgroundColor: 'rgba(0,0,0,0.35)',
    // borderRadius: 30,
    // paddingVertical: 12,
    // paddingHorizontal: 8,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 0},
    elevation: 10,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 0,
  },
  followBtn: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  followingBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
  followBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  followingBtnText: {
    color: 'rgba(255,255,255,0.7)',
  },
});


export default memo(SocialPostCard)