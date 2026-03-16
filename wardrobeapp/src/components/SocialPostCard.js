// src/components/SocialPostCard.js
import React,{useState} from 'react';
import { View, Image, Text, StyleSheet,TouchableOpacity,Dimensions} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius,} from '../theme';
    const {width}=Dimensions.get('window');
export default function SocialPostCard({username,postImage}){
    const[liked,setLiked]=useState(false);
    //'liked' is the value and set liked is the function
    return (
    <View style={styles.postContainer}>
      
      {/* background*/}
      <Image 
        source={{ uri: postImage }} 
        style={styles.mainImage} 
        resizeMode="cover" 
      />

      <View style={styles.leftActions}>
        
        {/* Profile Circle */}
        <View style={styles.profileIcon}>
           <Ionicons name="person" size={20} color="white" />
        </View>

        {/* like buttonn */}
        <TouchableOpacity 
          style={styles.iconSpacing} 
          onPress={() => setLiked(!liked)} //for toggling the like button
        >
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={32} 
            color={liked ? "#ff4d4d" : "white"} 
          />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity style={styles.iconSpacing}>
          <Ionicons name="share-social-outline" size={30} color="white" />
        </TouchableOpacity>

      </View>

      <View style={styles.textContainer}>
        <Text style={styles.userHandle}>@{username}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  postContainer: {
    width: width,   // Sets width to the phone's screen width
    height:550,    
    backgroundColor: '#000',
    marginBottom: 25, 
    borderBottomWidth:1,
    borderBottomColor:'#222',
    paddingBottom:15, 
  },
  mainImage: {
    width:'100%',
    height:'100%',
  },
  leftActions: {
    position: 'absolute', 
    left:15,            
    bottom:80,          
    alignItems: 'center',
  },
  iconSpacing: {
    marginTop:20,       
  },
  profileIcon: {
    width:40,
    height:40,
    borderRadius:20,  
    backgroundColor:'rgba(255,255,255,0.3)', 
    justifyContent:'center',
    alignItems:'center',
    borderWidth:1,
    borderColor:'white',
  },
  textContainer: {
    position:'absolute',
    left:15,
    bottom:30,
  },
  userHandle: {
    color:'yellow',
    fontSize:18,
    fontWeight:'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  }
});