import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SocialPostCard from '../../components/SocialPostCard';
import { supabase } from '../../backend/supabase-client'; // Import your client
import { getUsername } from '../../backend/profileService';

import { useAuth } from '../../backend/useAuth'

export default function SocialScreenFeed({ navigation }){
  const {user} = useAuth(); 
  const [realPosts, setRealPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Function to pull the real data just uploaded
  const fetchRealPosts = async ()=>{
    try {
      const{data,error}=await supabase
        .from('social_posts')
        .select('*,profiles(username)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRealPosts(data || []);
    } catch (err) {
      console.log("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Run it when the screen opens
  useEffect(() => {
    fetchRealPosts();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
        <Text style={{ color: 'white', fontSize: 50, marginTop: 100 }}>
          SOCIAL SECTION
        </Text>

        {/* --- TEST POSTS --- */}
        <SocialPostCard 
          username="smarty_antha" 
          postImage="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" 
        />
        
        <SocialPostCard 
          username="uta_student" 
          postImage="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800" 
        />

        {/* --- LIVE POSTS FROM SUPABASE --- */}
        <Text style={styles.sectionHeader}>Live Community Postss</Text>
        
        {loading? (
          <ActivityIndicator color="white" style={{marginTop:20}} />
        ) : (
          realPosts.map((post) => (
            <SocialPostCard 
              key={post.id}
              username={post.profiles?.username ||`User_${post.user_id.slice(0, 5)}`}
              postImage={post.image_url} 
              caption={post.caption}
            />
          ))
        )}

        <View style={{ height: 100 }} /> 
      </ScrollView>

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
  sectionHeader: {
    color: '#7C5CBF', // Using your UTA Smart Closet theme color
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginTop: 30,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
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
  }
});
