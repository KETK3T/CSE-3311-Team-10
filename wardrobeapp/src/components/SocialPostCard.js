import React,{useState,memo} from 'react';
import {View,Image,Text,StyleSheet,TouchableOpacity,Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

const {width}=Dimensions.get('window');

const SocialPostCard=({ 
  username, 
  postImage,
  avatarUrl, 
  likeCount=0, 
  commentCount=0,
  isLiked,
  hasWardrobeLink=true,       
  onLikePress,
  onCommentPress,
  onWardrobePress
})=>{
  const [isFollowing,setIsFollowing]=useState(false);

  return (
    <View style={styles.postContainer}>
      <Image 
        source={{uri:postImage}} 
        style={styles.mainImage} 
        resizeMode="cover" 
      />

      <View style={styles.leftActions}>
        <View style={styles.profileIcon}>
          {avatarUrl?(
            <Image source={{uri:avatarUrl}} style={styles.avatarImage}/>
          ):(
            <Ionicons name="person" size={20} color="white"/>
          )}
        </View>

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onLikePress}
        >
          <Ionicons 
            name={isLiked?"heart":"heart-outline"} 
            size={32} 
            color={isLiked?"#ff4d4d":"white"} 
          />
          <Text style={styles.actionText}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onCommentPress}
        >
          <Ionicons name="chatbubble-outline" size={30} color="white"/>
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>

        {hasWardrobeLink&&(
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onWardrobePress}
          >
            <Ionicons name="pricetag-outline" size={28} color="white"/>
            <Text style={styles.actionText}>Fit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.textContainer}>
        <View style={styles.userRow}>
          <Text style={styles.userHandle}>@{username}</Text>
          <TouchableOpacity 
            style={[styles.followBtn,isFollowing&&styles.followingBtn]}
            onPress={()=>setIsFollowing(!isFollowing)}
          >
            <Text style={styles.followBtnText}>{isFollowing?'Following':'Follow'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default memo(SocialPostCard);

const styles=StyleSheet.create({
  postContainer:{
    width:width*0.90,
    alignSelf:'center',
    height:550,
    backgroundColor:'#000',
    marginBottom:45,
    borderRadius:25, 
    overflow:'hidden',
    borderWidth:1,
    borderColor:'#222',
  },
  mainImage:{
    width:'100%',
    height:'100%',
    borderRadius:25,
  },
  leftActions:{
    position:'absolute',
    left:15,
    bottom:80,
    alignItems:'center',
    zIndex:10,
  },
  actionButton:{
    marginTop:20,
    alignItems:'center',
  },
  actionText:{
    color:'white',
    fontSize:14,
    fontWeight:'bold',
    marginTop:4,
    textShadowColor:'rgba(0,0,0,0.8)',
    textShadowOffset:{width:1,height:1},
    textShadowRadius:3,
  },
  profileIcon:{
    width:40,
    height:40,
    borderRadius:20,
    backgroundColor:'rgba(255,255,255,0.3)',
    justifyContent:'center',
    alignItems:'center',
    borderWidth:1,
    borderColor:'white',
    overflow:'hidden',
  },
  avatarImage:{
    width:'100%',
    height:'100%',
    resizeMode:'cover',
  },
  textContainer:{
    position:'absolute',
    left:15,
    bottom:30,
  },
  userRow:{
    flexDirection:'row',
    alignItems:'center',
    gap:10,
  },
  userHandle:{
    color:'yellow',
    fontSize:18,
    fontWeight:'bold',
    textShadowColor:'rgba(0,0,0,0.8)',
    textShadowOffset:{width:1,height:1},
    textShadowRadius:5,
  },
  followBtn:{
    borderWidth:1,
    borderColor:'#7C5CBF',
    paddingHorizontal:10,
    paddingVertical:4,
    borderRadius:12,
    backgroundColor:'rgba(0,0,0,0.5)',
  },
  followingBtn:{
    backgroundColor:'#7C5CBF',
  },
  followBtnText:{
    color:'white',
    fontSize:14,
    fontWeight:'bold',
  }
});