import React, { useState, useEffect, memo } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../backend/supabase-client';
import {LinearGradient} from 'expo-linear-gradient'


const { width } = Dimensions.get('window');

const SocialPostCard = ({
  username,
  postImage,
  avatarUrl,
  likeCount = 0,
  commentCount = 0,
  isLiked,
  isFollowing,
  isOwner,
  onDelete,
  linkedItemIds = [],
  onLikePress,
  onCommentPress,
  onFollowPress,
  onWardrobePress,
}) => {
  const [linkedItems, setLinkedItems] = useState([])

  useEffect(() => {
    if (linkedItemIds?.length > 0) {
      supabase
        .from('clothing_items')
        .select('id, image_url, category')
        .in('id', linkedItemIds)
        .then(({ data }) => { if (data) setLinkedItems(data) })
    }
  }, [linkedItemIds])

  return (
    <View style={styles.postContainer}>
      <Image source={{ uri: postImage }} style={styles.mainImage} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.bottomGradient}
      />
      {/* Left action buttons */}
      <View style={styles.leftActions}>
        {/* Tappable profile picture */}
        <TouchableOpacity style={styles.profileIcon} onPress={onWardrobePress}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={20} color="white" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onLikePress}>
          <View style={styles.iconShadow}>
            <Ionicons name="heart" size={34} color="rgba(0,0,0,0.4)" style={{ position: 'absolute' }} />
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={32} color={isLiked ? "#ff4d4d" : "white"} />
          </View>
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onCommentPress}>
          <View style={styles.iconShadow}>
            <Ionicons name="chatbubble" size={32} color="rgba(0,0,0,0.4)" style={{ position: 'absolute' }} />
            <Ionicons name="chatbubble-outline" size={30} color="white" />
          </View>
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>
        
        {isOwner && (
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <View style={styles.iconShadow}>
              <Ionicons name="trash" size={28} color="rgba(0,0,0,0.4)" style={{ position: 'absolute' }} />
              <Ionicons name="trash-outline" size={26} color="#ff4d4d" />
            </View>
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {linkedItems.length > 0 && (
        <View style={styles.linkedStrip}>
          {linkedItems.map(item => (
            <View key={item.id} style={styles.linkedItem}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.linkedItemImg}
                resizeMode="cover"
              />
              <Text style={styles.linkedItemLabel} numberOfLines={1}>
                {item.category}
              </Text>
            </View>
          ))}
        </View>
      )}


      {/* Bottom — username and follow only, no avatar here */}
      <View style={styles.textContainer}>
        <View style={styles.userRow}>
          <TouchableOpacity onPress={onWardrobePress}>
            <Text style={styles.userHandle}>@{username}</Text>
          </TouchableOpacity>
          {!isOwner && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={onFollowPress}
            >
              <Text style={styles.followBtnText}>{isFollowing ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

export default memo(SocialPostCard)

const styles = StyleSheet.create({
  postContainer: {
    width: width * 0.90,
    alignSelf: 'center',
    height: 550,
    backgroundColor: '#000',
    marginBottom: 45,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  leftActions: {
    position: 'absolute',
    left: 15,
    bottom: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  actionButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    position: 'absolute',
    left: 15,
    bottom: 30,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userHandle: {
    color: 'yellow',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: '#7C5CBF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  followingBtn: {
    backgroundColor: '#7C5CBF',
  },
  followBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  linkedStrip: {
    position: 'absolute',
    right: 10,
    top: '15%',
    bottom: 100,
    width: 85,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  linkedItem: {
    width: 80,
    height: 95,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 3,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  iconShadow: {
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
})