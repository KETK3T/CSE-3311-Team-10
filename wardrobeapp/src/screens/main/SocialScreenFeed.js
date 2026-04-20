import React,{useState,useEffect} from 'react';
import {ScrollView,StyleSheet,View,Text,TouchableOpacity,ActivityIndicator} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import SocialPostCard from '../../components/SocialPostCard';
import {supabase} from '../../backend/supabase-client'; 
import {useAuth} from '../../backend/useAuth';

export default function SocialScreenFeed({navigation}){
  const {user}=useAuth(); 
  const [realPosts,setRealPosts]=useState([]);
  const [loading,setLoading]=useState(true);

  const fetchRealPosts=async()=>{
    try{
      setLoading(true);
      const {data,error}=await supabase
        .from('social_posts')
        .select(`
          *,
          profiles(username),
          post_likes(user_id),
          post_comments(id)
        `)
        .order('created_at',{ascending:false});

      if(error) throw error;

      const formattedPosts=data.map(post=>{
        const likes=post.post_likes||[];
        const comments=post.post_comments||[];
        const hasLiked=user?likes.some(l=>l.user_id===user.id):false;
        
        return {
          ...post,
          likeCount:likes.length,
          commentCount:comments.length,
          isLikedByMe:hasLiked
        };
      });
      setRealPosts(formattedPosts||[]);
    }catch(err){
      console.log("Fetch Error:",err.message);
    }finally{
      setLoading(false);
    }
  };

  const toggleLike=async(postId,currentlyLiked)=>{
    if(!user) return;
    setRealPosts(curr=>curr.map(p=>{
      if(p.id===postId){
        return {...p,isLikedByMe:!currentlyLiked,likeCount:currentlyLiked?Math.max(0,p.likeCount-1):p.likeCount+1};
      }
      return p;
    }));

    try{
      if(currentlyLiked){
        const {error}=await supabase.from('post_likes').delete().match({post_id:postId,user_id:user.id});
        if(error) throw error;
      }else{
        const {error}=await supabase.from('post_likes').insert([{post_id:postId,user_id:user.id}]);
        if(error) throw error;
      }
    }catch(err){
      console.log("Like error:",err.message);
      fetchRealPosts();
    }
  };

  useEffect(()=>{fetchRealPosts();},[]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{flex:1}} 
        contentContainerStyle={{paddingBottom:120}}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mainTitle}>THE STYLE FILES</Text>

        <View style={styles.headerRow}>
          <Text style={styles.sectionHeader}>Live Community</Text>
          <TouchableOpacity onPress={fetchRealPosts}>
            <Ionicons name="refresh" size={20} color="#7C5CBF"/>
          </TouchableOpacity>
        </View>
        
        {loading?(
          <ActivityIndicator color="#7C5CBF" size="large" style={{marginTop:50}}/>
        ):(
          realPosts.map((post)=>(
            <SocialPostCard 
              key={post.id}
              username={post.profiles?.username||`User_${post.user_id.slice(0,5)}`}
              postImage={post.image_url} 
              caption={post.caption}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              isLiked={post.isLikedByMe}
              onLikePress={()=>toggleLike(post.id,post.isLikedByMe)}
              onCommentPress={()=>navigation.navigate('Comments',{postId:post.id})}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.uploadTrigger}
        onPress={()=>navigation.navigate('UploadPost')}
      >
        <Ionicons name="camera" size={30} color="black"/>
      </TouchableOpacity>
    </View>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#000',
  },
  mainTitle:{
    color:'white',
    fontSize:42,
    fontWeight:'900',
    marginTop:80,
    marginLeft:15,
    letterSpacing:-1,
  },
  headerRow:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal:15,
    marginTop:20,
    marginBottom:15,
  },
  sectionHeader:{
    color:'#7C5CBF', 
    fontSize:14,
    fontWeight:'bold',
    textTransform:'uppercase',
    letterSpacing:1,
  },
  uploadTrigger:{
    position:'absolute',
    bottom:30,
    right:25,
    backgroundColor:'#fff',
    width:65,
    height:65,
    borderRadius:33,
    justifyContent:'center',
    alignItems:'center',
    elevation:10,
    shadowColor:'#7C5CBF',
    shadowOpacity:0.4,
    shadowRadius:10,
  }
});