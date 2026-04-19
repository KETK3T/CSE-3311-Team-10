import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SocialPostCard from '../../components/SocialPostCard';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../backend/supabase-client'; // Import your client
import { useAuth } from '../../backend/useAuth'

const {height} = Dimensions.get('window')

// const MemoizedPostCard = memo(({item, user, navigation}) => (
//   <SocialPostCard
//     postId={item.id}
//     userId={item.user_id}
//     username={item.profiles?.username || `user_${item.user_id.slice(0, 5)}`}
//     avatarUrl={item.profiles?.avatar_url}
//     postImage={item.image_url}
//     caption={item.caption}
//     linkedItemIds={item.linked_item_ids || []}
//     currentUserId={user?.id}
//     navigation={navigation}
//   />
// ))


export default function SocialScreenFeed({ navigation }){
  const {user} = useAuth(); 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
    fetchPosts()
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (loading) return
      syncPosts()
    }, [loading])
  )

  // 1. Function to pull the real data just uploaded
  const fetchPosts = async ()=>{
    setLoading(true)
    try {
      const{data,error}=await supabase
        .from('social_posts')
        .select('*,profiles(username, avatar_url)')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.log("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncPosts = async() => {
    try{
      const {data, error} = await supabase
        .from('social_posts')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: false })
        if (error) return
        setPosts(prev => {
          const prevIds = prev.map(p => p.id).join()
          const nextIds = (data || []).map(p => p.id).join()
          return prevIds !== nextIds ? data : prev
        })
    } catch (err) {
        console.log('Sync error:', err.message)
    }
  }

  const renderItem = useCallback(({item}) => (
    <SocialPostCard
      postId={item.id}
      userId={item.user_id}
      username={item.profiles?.username || `user_${item.user_id.slice(0, 5)}`}
      avatarUrl={item.profiles?.avatar_url}
      postImage={item.image_url}
      caption={item.caption}
      linkedItemIds={item.linked_item_ids || []}
      currentUserId={user?.id}
      navigation={navigation}
    />
  ), [user,navigation])
  
  const keyExtractor = useCallback((item) => item.id,[])
  
  const getItemLayout = useCallback((_, index) => ({
    length: height,
    offset: height * index,
  }),[])

  if (loading){
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="White" size="large"/>
      </View>
    )
  }

  if (posts.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubText}>Be the first to share your fit!</Text>
        <TouchableOpacity
          style={styles.uploadTrigger}
          onPress={() => navigation.navigate('UploadPost')}
        >
          <Ionicons name="add" size={35} color="black" />
        </TouchableOpacity>
      </View>
    )
  }

  

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate={0.999}
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        getItemLayout={getItemLayout}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        removeClippedSubviews={true}
        snapToOffsets={posts.map((_,i) => i * height)}
      />

      <TouchableOpacity
        style={styles.uploadTrigger}
        onPress={() => navigation.navigate('UploadPost')}
      >
        <Ionicons name="add" size={35} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText:{color:'#fff', fontSize: 18, fontWeight:'600'},
  emptySubText: {color:'#666', fontSize: 14, marginTop: 8},  
  uploadTrigger: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    backgroundColor: '#fff',
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
